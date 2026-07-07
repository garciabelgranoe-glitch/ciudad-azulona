-- Medallas estilo gimnasio Pokémon: catálogo fijo + medallas otorgadas por
-- perfil. Se otorgan solas via trigger cuando cambian los contadores que
-- ya mantenemos (sales_count, rating_avg) — el cliente nunca las asigna.

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  icon text not null,
  kind text not null check (kind in ('sales', 'rating')),
  threshold numeric not null,
  min_ratings integer,
  sort_order integer not null default 0
);

alter table public.badges enable row level security;

create policy "badges are publicly readable"
  on public.badges for select
  using (true);

insert into public.badges (code, name, description, icon, kind, threshold, min_ratings, sort_order) values
  ('ventas_bronce', 'Medalla Bronce', 'Vendió su primera carta', '🥉', 'sales', 1, null, 1),
  ('ventas_plata', 'Medalla Plata', 'Vendió 5 cartas', '🥈', 'sales', 5, null, 2),
  ('ventas_oro', 'Medalla Oro', 'Vendió 15 cartas', '🥇', 'sales', 15, null, 3),
  ('ventas_platino', 'Medalla Platino', 'Vendió 30 cartas', '💎', 'sales', 30, null, 4),
  ('reputacion_alta', 'Coleccionista Confiable', 'Reputación de 4.8 o más con al menos 5 calificaciones', '⭐', 'rating', 4.8, 5, 5);

create table public.profile_badges (
  profile_id uuid not null references public.profiles (id),
  badge_id uuid not null references public.badges (id),
  awarded_at timestamptz not null default now(),
  primary key (profile_id, badge_id)
);

alter table public.profile_badges enable row level security;

create policy "profile badges are publicly readable"
  on public.profile_badges for select
  using (true);

-- Evalúa el catálogo contra el estado actual del perfil y otorga las
-- medallas que falten. Idempotente (on conflict do nothing) para poder
-- llamarla desde cualquier trigger sin preocuparse por duplicados.
create or replace function public.check_and_award_badges(p_profile_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  prof record;
  ratings_received integer;
begin
  select sales_count, rating_avg into prof from public.profiles where id = p_profile_id;
  if not found then
    return;
  end if;
  select count(*) into ratings_received from public.ratings where rated_user_id = p_profile_id;

  insert into public.profile_badges (profile_id, badge_id)
  select p_profile_id, b.id
  from public.badges b
  where (
    (b.kind = 'sales' and prof.sales_count >= b.threshold)
    or
    (b.kind = 'rating' and prof.rating_avg >= b.threshold and ratings_received >= coalesce(b.min_ratings, 0))
  )
  on conflict (profile_id, badge_id) do nothing;
end;
$$;

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
    perform public.check_and_award_badges(auc.seller_id);
  end if;
  return new;
end;
$$;

create or replace function public.on_rating_inserted()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.profiles
  set rating_avg = (select avg(score)::numeric(3,2) from public.ratings where rated_user_id = new.rated_user_id)
  where id = new.rated_user_id;
  perform public.check_and_award_badges(new.rated_user_id);
  return new;
end;
$$;

-- Backfill: perfiles que ya cumplían el umbral antes de que existiera el
-- sistema de medallas también las reciben.
do $$
declare
  p record;
begin
  for p in select id from public.profiles loop
    perform public.check_and_award_badges(p.id);
  end loop;
end $$;
