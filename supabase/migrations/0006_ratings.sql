-- Reputación: contadores de ventas/compras + rating simple 1-5.

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references public.tickets (id),
  rater_id uuid not null references public.profiles (id),
  rated_user_id uuid not null references public.profiles (id),
  score smallint not null check (score between 1 and 5),
  created_at timestamptz not null default now()
);

alter table public.ratings enable row level security;

create policy "ratings are publicly readable"
  on public.ratings for select
  using (true);

create policy "winner can rate the seller after the ticket is redeemed"
  on public.ratings for insert
  with check (
    auth.uid() = rater_id
    and exists (
      select 1 from public.tickets t
      join public.auctions a on a.id = t.auction_id
      where t.id = ticket_id
        and t.status = 'redeemed'
        and a.winner_id = auth.uid()
        and a.seller_id = rated_user_id
    )
  );

-- Contadores de sales_count/purchases_count se actualizan solos al
-- confirmarse la entrega — no dependen de que el cliente los mande bien.
create or replace function public.on_ticket_redeemed()
returns trigger
language plpgsql
security definer
as $$
declare
  auc record;
begin
  if new.status = 'redeemed' and old.status <> 'redeemed' then
    select seller_id, winner_id into auc from public.auctions where id = new.auction_id;
    update public.profiles set sales_count = sales_count + 1 where id = auc.seller_id;
    update public.profiles set purchases_count = purchases_count + 1 where id = auc.winner_id;
  end if;
  return new;
end;
$$;

create trigger tickets_after_redeemed
  after update on public.tickets
  for each row execute function public.on_ticket_redeemed();

-- rating_avg se recalcula solo cuando entra una calificación nueva.
create or replace function public.on_rating_inserted()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.profiles
  set rating_avg = (select avg(score)::numeric(3,2) from public.ratings where rated_user_id = new.rated_user_id)
  where id = new.rated_user_id;
  return new;
end;
$$;

create trigger ratings_after_insert
  after insert on public.ratings
  for each row execute function public.on_rating_inserted();
