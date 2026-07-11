-- ============================================================
-- Free claim: publicación gratuita donde el vendedor define un número
-- ganador (0 a 50) y el reclamo que caiga en esa posición se lleva la
-- carta gratis. Reutiliza el flujo de ticket/retiro de las subastas
-- normales, pero con su propia tabla de reclamos (no es una puja).
-- ============================================================

alter table public.auctions
  add column is_free_claim boolean not null default false,
  add column free_claim_winning_number int,
  add column free_claim_count int not null default 0;

alter table public.auctions drop constraint auctions_base_price_check;
alter table public.auctions
  add constraint auctions_base_price_check check (is_free_claim or base_price > 0);

alter table public.auctions
  add constraint auctions_free_claim_winning_number_check
  check (free_claim_winning_number is null or (free_claim_winning_number >= 0 and free_claim_winning_number <= 50));

create table public.free_claim_entries (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  position int not null,
  created_at timestamptz not null default now(),
  unique (auction_id, user_id)
);

alter table public.free_claim_entries enable row level security;

create policy "users can read their own free claim entries"
  on public.free_claim_entries for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.auctions a where a.id = auction_id and a.seller_id = auth.uid())
  );

-- Los reclamos se insertan únicamente vía claim_free_item (security definer),
-- no directo por el cliente.
create policy "no direct inserts on free claim entries"
  on public.free_claim_entries for insert
  with check (false);

create or replace function public.claim_free_item(p_auction_id uuid)
returns table (claim_position int, won boolean)
language plpgsql
security definer
as $function$
declare
  auc public.auctions%rowtype;
  new_position int;
  new_code text;
  did_win boolean;
begin
  if exists (select 1 from public.profiles where id = auth.uid() and is_suspended) then
    raise exception 'Tu cuenta está suspendida';
  end if;

  perform public.check_rate_limit('claim_free_item', 20, interval '1 minute');

  select * into auc from public.auctions where id = p_auction_id for update;

  if auc.id is null then
    raise exception 'Publicación inexistente';
  end if;
  if not auc.is_free_claim then
    raise exception 'Esta publicación no es un free claim';
  end if;
  if auc.status <> 'live' or auc.closes_at <= now() then
    raise exception 'Este free claim ya cerró';
  end if;
  if auc.seller_id = auth.uid() then
    raise exception 'No podés reclamar tu propia publicación';
  end if;
  if exists (select 1 from public.free_claim_entries where auction_id = p_auction_id and user_id = auth.uid()) then
    raise exception 'Ya reclamaste tu turno en este free claim';
  end if;

  new_position := auc.free_claim_count;
  did_win := (new_position = auc.free_claim_winning_number);

  insert into public.free_claim_entries (auction_id, user_id, position)
  values (p_auction_id, auth.uid(), new_position);

  update public.auctions
  set free_claim_count = free_claim_count + 1,
      status = case when did_win then 'closed' else status end,
      winner_id = case when did_win then auth.uid() else winner_id end
  where id = p_auction_id;

  if did_win then
    loop
      new_code := public.generate_ticket_code();
      exit when not exists (select 1 from public.tickets where code = new_code);
    end loop;
    insert into public.tickets (auction_id, code) values (p_auction_id, new_code);

    insert into public.notifications (user_id, kind, message, auction_id)
    values (
      auc.seller_id,
      'free_claim_won',
      'Tu free claim "' || auc.card_name || '" lo ganó el reclamo #' || new_position || '.',
      p_auction_id
    );
  end if;

  return query select new_position, did_win;
end;
$function$;

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications
  add constraint notifications_kind_check
  check (kind = any (array['outbid', 'reserve_not_met', 'buy_now_sold', 'buy_now_lost', 'sale_expired', 'free_claim_won', 'free_claim_expired']));

-- Al cerrar: si un free claim expira sin llegar al número ganador, avisamos
-- al vendedor (mismo patrón que sale_expired).
create or replace function public.close_expired_auctions()
returns void
language plpgsql
security definer
as $function$
declare
  auc record;
  winner uuid;
  winner_amount numeric;
  new_code text;
begin
  for auc in
    select * from public.auctions
    where status = 'live' and closes_at <= now()
  loop
    if auc.is_free_claim then
      update public.auctions set status = 'closed' where id = auc.id;
      insert into public.notifications (user_id, kind, message, auction_id)
      values (
        auc.seller_id,
        'free_claim_expired',
        'Tu free claim "' || auc.card_name || '" venció sin llegar al número ganador.',
        auc.id
      );
      continue;
    end if;

    select bidder_id, amount into winner, winner_amount
    from public.bids
    where auction_id = auc.id
    order by amount desc, created_at asc
    limit 1;

    if winner is not null and auc.reserve_price is not null and winner_amount < auc.reserve_price then
      winner := null;
    end if;

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
    elsif auc.is_sale_only then
      insert into public.notifications (user_id, kind, message, auction_id)
      values (
        auc.seller_id,
        'sale_expired',
        'Tu publicación "' || auc.card_name || '" venció sin comprador.',
        auc.id
      );
    elsif auc.reserve_price is not null and winner_amount is not null and winner_amount < auc.reserve_price then
      insert into public.notifications (user_id, kind, message, auction_id)
      values (
        auc.seller_id,
        'reserve_not_met',
        'Tu subasta "' || auc.card_name || '" cerró sin alcanzar el precio mínimo — no se generó ganador.',
        auc.id
      );
    end if;
  end loop;
end;
$function$;

-- Lenguaje "claim" en vez de "comprar" para los mensajes de compra
-- inmediata, siguiendo la jerga de la comunidad.
create or replace function public.buy_now_auction(p_auction_id uuid)
returns auctions
language plpgsql
security definer
as $function$
declare
  auc public.auctions%rowtype;
  v_previous_bidder uuid;
  new_code text;
  result public.auctions%rowtype;
begin
  if exists (select 1 from public.profiles where id = auth.uid() and is_suspended) then
    raise exception 'Tu cuenta está suspendida';
  end if;

  perform public.check_rate_limit('place_bid', 20, interval '1 minute');

  select * into auc from public.auctions where id = p_auction_id for update;

  if auc.id is null then
    raise exception 'Subasta inexistente';
  end if;
  if auc.status <> 'live' or auc.closes_at <= now() then
    raise exception 'La subasta ya cerró';
  end if;
  if auc.seller_id = auth.uid() then
    raise exception 'No podés claimear tu propia publicación';
  end if;
  if auc.buy_now_price is null then
    raise exception 'Esta publicación no tiene claim inmediato';
  end if;

  select bidder_id into v_previous_bidder
  from public.bids
  where auction_id = p_auction_id
  order by amount desc, created_at desc
  limit 1;

  insert into public.bids (auction_id, bidder_id, amount)
  values (p_auction_id, auth.uid(), auc.buy_now_price);

  loop
    new_code := public.generate_ticket_code();
    exit when not exists (select 1 from public.tickets where code = new_code);
  end loop;

  update public.auctions
  set current_bid = auc.buy_now_price,
      bid_count = bid_count + 1,
      status = 'closed',
      winner_id = auth.uid(),
      closes_at = now()
  where id = p_auction_id
  returning * into result;

  insert into public.tickets (auction_id, code) values (p_auction_id, new_code);

  insert into public.notifications (user_id, kind, message, auction_id)
  values (
    auc.seller_id,
    'buy_now_sold',
    'Te claimearon "' || auc.card_name || '" al instante por $' || to_char(auc.buy_now_price, 'FM999G999G999'),
    p_auction_id
  );

  if v_previous_bidder is not null and v_previous_bidder <> auth.uid() then
    insert into public.notifications (user_id, kind, message, auction_id)
    values (
      v_previous_bidder,
      'buy_now_lost',
      'Alguien claimeó "' || auc.card_name || '" al instante antes de que termine la subasta.',
      p_auction_id
    );
  end if;

  return result;
end;
$function$;

-- ============================================================
-- Sugerencias de la comunidad: cualquier usuario logueado puede mandar
-- una, solo el admin las lee/gestiona desde el panel.
-- ============================================================

create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  message text not null,
  status text not null default 'new' check (status in ('new', 'reviewed')),
  created_at timestamptz not null default now()
);

alter table public.suggestions enable row level security;

create policy "users can read their own suggestions, admins read all"
  on public.suggestions for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "users can send suggestions for themselves"
  on public.suggestions for insert
  with check (
    auth.uid() = user_id
    and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_suspended)
  );

create policy "only admins can update suggestions"
  on public.suggestions for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ============================================================
-- Ranking: top 10 usuarios por volumen acumulado (compra + venta),
-- contando solo tickets ya entregados (mismo criterio que sales_count/
-- purchases_count). security definer porque agrega datos de la tabla
-- privada de tickets, pero solo expone alias + monto total.
-- ============================================================

create or replace function public.get_top_traders()
returns table (user_id uuid, alias text, gender text, total_volume numeric)
language sql
security definer
stable
as $function$
  select p.id, p.alias, p.gender, (coalesce(sold.total, 0) + coalesce(bought.total, 0)) as total_volume
  from public.profiles p
  left join (
    select a.seller_id as uid, sum(a.current_bid) as total
    from public.auctions a
    join public.tickets t on t.auction_id = a.id
    where t.status = 'redeemed'
    group by a.seller_id
  ) sold on sold.uid = p.id
  left join (
    select a.winner_id as uid, sum(a.current_bid) as total
    from public.auctions a
    join public.tickets t on t.auction_id = a.id
    where t.status = 'redeemed'
    group by a.winner_id
  ) bought on bought.uid = p.id
  where coalesce(sold.total, 0) + coalesce(bought.total, 0) > 0
  order by total_volume desc
  limit 10;
$function$;
