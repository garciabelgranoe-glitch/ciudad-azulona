-- ============================================================
-- Favoritos: guardar publicaciones para verlas después.
-- ============================================================

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, auction_id)
);

alter table public.favorites enable row level security;

create policy "users manage their own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Reacciones discretas (manito arriba/abajo) por publicación.
-- ============================================================

create table public.auction_reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  reaction text not null check (reaction in ('up', 'down')),
  created_at timestamptz not null default now(),
  unique (user_id, auction_id)
);

alter table public.auction_reactions enable row level security;

create policy "reactions are publicly readable"
  on public.auction_reactions for select
  using (true);

create policy "users manage their own reactions"
  on public.auction_reactions for insert
  with check (auth.uid() = user_id);

create policy "users can update their own reaction"
  on public.auction_reactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can remove their own reaction"
  on public.auction_reactions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Lotes: una publicación con varias cartas sueltas adentro (hasta
-- 10), cada una con su propia descripción y precio. Cada carta del
-- lote es en el fondo una fila de auctions (is_sale_only, ligada al
-- lote vía lot_id) — así se reutiliza el mecanismo de claim inmediato
-- ya probado (buy_now_auction) sin escribir un flujo de compra nuevo.
-- Reservado a vendedores Premium.
-- ============================================================

create table public.card_lots (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id),
  title text not null,
  description text,
  photo_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.card_lots enable row level security;

create policy "card lots are publicly readable"
  on public.card_lots for select
  using (true);

create policy "only premium sellers can create lots"
  on public.card_lots for insert
  with check (
    seller_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_premium)
    and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_suspended)
  );

alter table public.auctions add column lot_id uuid references public.card_lots (id) on delete cascade;
create index auctions_lot_id_idx on public.auctions (lot_id);

-- Tope de 10 cartas por lote, reforzado en el server (el cliente ya
-- lo limita, pero esto cubre inserts directos).
create or replace function public.check_lot_item_limit()
returns trigger
language plpgsql
as $function$
begin
  if not exists (select 1 from public.card_lots l where l.id = new.lot_id and l.seller_id = new.seller_id) then
    raise exception 'El lote no existe o no te pertenece';
  end if;
  if (select count(*) from public.auctions where lot_id = new.lot_id) >= 10 then
    raise exception 'Un lote puede tener hasta 10 cartas';
  end if;
  return new;
end;
$function$;

create trigger auctions_lot_item_limit
  before insert on public.auctions
  for each row
  when (new.lot_id is not null)
  execute function public.check_lot_item_limit();
