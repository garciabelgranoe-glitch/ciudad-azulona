-- PokeCool subastas — schema inicial
-- Entidades: profiles, auctions, bids, tickets, reports

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  alias text not null,
  sales_count integer not null default 0,
  purchases_count integer not null default 0,
  rating_avg numeric(3, 2) not null default 5.00,
  created_at timestamptz not null default now()
);

create table public.auctions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id),
  card_name text not null,
  photo_url text,
  base_price numeric(12, 2) not null check (base_price > 0),
  current_bid numeric(12, 2) not null,
  status text not null default 'live' check (status in ('live', 'closed', 'cancelled')),
  closes_at timestamptz not null,
  winner_id uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index auctions_status_closes_at_idx on public.auctions (status, closes_at);

create table public.bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  bidder_id uuid not null references public.profiles (id),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index bids_auction_id_idx on public.bids (auction_id);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null unique references public.auctions (id),
  code text not null unique,
  status text not null default 'pending' check (status in ('pending', 'redeemed')),
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.tickets (id),
  auction_id uuid references public.auctions (id),
  reporter_id uuid not null references public.profiles (id),
  reason text not null,
  status text not null default 'open' check (status in ('open')),
  created_at timestamptz not null default now(),
  constraint reports_target_check check (ticket_id is not null or auction_id is not null)
);

-- ---------------------------------------------
-- Código de ticket con dígito verificador
-- No es criptográfico: solo detecta typos/códigos inventados al azar.
-- La seguridad real es que el código se valida server-side y es de un solo uso.
-- ---------------------------------------------

create or replace function public.generate_ticket_code()
returns text
language plpgsql
as $$
declare
  alphabet text := '23456789ACDEFGHJKLMNPQRTUVWXY'; -- sin 0/O/1/I/B/S/Z para evitar confusión al leer en voz alta
  part1 text := '';
  part2 text := '';
  check_sum int := 0;
  check_digit int;
  i int;
  ch text;
begin
  for i in 1..4 loop
    ch := substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    part1 := part1 || ch;
    check_sum := check_sum + ascii(ch) * i;
  end loop;

  part2 := (floor(random() * 10))::int::text;
  check_sum := check_sum + (part2::int) * 5;
  check_digit := check_sum % 10;

  return part1 || '-' || part2 || check_digit::text;
end;
$$;

create or replace function public.ticket_code_is_valid(code text)
returns boolean
language plpgsql
as $$
declare
  part1 text;
  part2 text;
  given_check int;
  check_sum int := 0;
  i int;
begin
  if code !~ '^[A-Z0-9]{4}-[0-9]{2}$' then
    return false;
  end if;
  part1 := split_part(code, '-', 1);
  part2 := substr(split_part(code, '-', 2), 1, 1);
  given_check := substr(split_part(code, '-', 2), 2, 1)::int;

  for i in 1..4 loop
    check_sum := check_sum + ascii(substr(part1, i, 1)) * i;
  end loop;
  check_sum := check_sum + (part2::int) * 5;

  return (check_sum % 10) = given_check;
end;
$$;

-- ---------------------------------------------
-- Cierre automático de subastas + generación de ticket
-- Pensado para correr via pg_cron cada 1 minuto.
-- ---------------------------------------------

create or replace function public.close_expired_auctions()
returns void
language plpgsql
security definer
as $$
declare
  auc record;
  winner uuid;
  new_code text;
begin
  for auc in
    select * from public.auctions
    where status = 'live' and closes_at <= now()
  loop
    select bidder_id into winner
    from public.bids
    where auction_id = auc.id
    order by amount desc, created_at asc
    limit 1;

    update public.auctions
    set status = 'closed', winner_id = winner
    where id = auc.id;

    if winner is not null then
      loop
        new_code := public.generate_ticket_code();
        exit when not exists (select 1 from public.tickets where code = new_code);
      end loop;

      insert into public.tickets (auction_id, code)
      values (auc.id, new_code);
    end if;
  end loop;
end;
$$;

-- ---------------------------------------------
-- RLS
-- ---------------------------------------------

alter table public.profiles enable row level security;
alter table public.auctions enable row level security;
alter table public.bids enable row level security;
alter table public.tickets enable row level security;
alter table public.reports enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "auctions are publicly readable"
  on public.auctions for select
  using (true);

create policy "sellers can create their own auctions"
  on public.auctions for insert
  with check (auth.uid() = seller_id);

create policy "bids are publicly readable"
  on public.bids for select
  using (true);

create policy "users can only bid as themselves on live auctions"
  on public.bids for insert
  with check (
    auth.uid() = bidder_id
    and exists (
      select 1 from public.auctions
      where id = auction_id and status = 'live' and closes_at > now()
    )
  );

create policy "buyer and seller can read their ticket"
  on public.tickets for select
  using (
    exists (
      select 1 from public.auctions a
      where a.id = auction_id
      and (a.seller_id = auth.uid() or a.winner_id = auth.uid())
    )
  );

create policy "only the seller can redeem their ticket"
  on public.tickets for update
  using (
    exists (
      select 1 from public.auctions a
      where a.id = auction_id and a.seller_id = auth.uid()
    )
  )
  with check (status = 'redeemed');

create policy "authenticated users can create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "reporter can read their own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);
