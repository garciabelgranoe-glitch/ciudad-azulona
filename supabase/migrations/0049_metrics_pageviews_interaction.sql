-- Ampliación del panel de métricas admin: vistas de página (nueva tabla,
-- se loguea desde el frontend en cada cambio de pantalla) e interacción
-- (pujas, reacciones y favoritos por día — ya existían como datos, solo
-- faltaba sumarlos a la serie diaria).

create table public.page_views (
  id bigint generated always as identity primary key,
  view_name text not null,
  user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index page_views_created_at_idx on public.page_views (created_at);

alter table public.page_views enable row level security;

-- Cualquiera (logueado o no) puede loguear una vista — es un insert
-- anónimo tipo analytics, sin lectura pública (solo la función de admin
-- de abajo, que es security definer, puede leerla).
create policy "anyone can log a page view"
  on public.page_views for insert
  with check (true);

-- Cambia el tipo de retorno (columnas nuevas) — hay que dropearla antes.
drop function if exists public.admin_metrics_daily(integer);

create or replace function public.admin_metrics_daily(p_days integer default 30)
returns table (
  day date,
  new_users bigint,
  new_listings bigint,
  sales_count bigint,
  gmv_ars numeric,
  gmv_usd numeric,
  bids_count bigint,
  reactions_count bigint,
  favorites_count bigint,
  page_views_count bigint
)
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'No autorizado';
  end if;

  return query
  with days as (
    select generate_series(current_date - (p_days - 1), current_date, interval '1 day')::date as day
  ),
  users as (
    select created_at::date as day, count(*) as new_users
    from public.profiles
    where created_at >= current_date - (p_days - 1)
    group by 1
  ),
  listings as (
    select created_at::date as day, count(*) as new_listings
    from public.auctions
    where created_at >= current_date - (p_days - 1)
    group by 1
  ),
  sales as (
    select t.created_at::date as day,
           count(*) as sales_count,
           sum(a.current_bid) filter (where a.currency = 'ARS') as gmv_ars,
           sum(a.current_bid) filter (where a.currency = 'USD') as gmv_usd
    from public.tickets t
    join public.auctions a on a.id = t.auction_id
    where t.created_at >= current_date - (p_days - 1)
    group by 1
  ),
  bids_agg as (
    select created_at::date as day, count(*) as bids_count
    from public.bids
    where created_at >= current_date - (p_days - 1)
    group by 1
  ),
  reactions_agg as (
    select created_at::date as day, count(*) as reactions_count
    from public.auction_reactions
    where created_at >= current_date - (p_days - 1)
    group by 1
  ),
  favorites_agg as (
    select created_at::date as day, count(*) as favorites_count
    from public.favorites
    where created_at >= current_date - (p_days - 1)
    group by 1
  ),
  views_agg as (
    select created_at::date as day, count(*) as page_views_count
    from public.page_views
    where created_at >= current_date - (p_days - 1)
    group by 1
  )
  select d.day,
         coalesce(u.new_users, 0),
         coalesce(l.new_listings, 0),
         coalesce(s.sales_count, 0),
         coalesce(s.gmv_ars, 0),
         coalesce(s.gmv_usd, 0),
         coalesce(b.bids_count, 0),
         coalesce(r.reactions_count, 0),
         coalesce(f.favorites_count, 0),
         coalesce(v.page_views_count, 0)
  from days d
  left join users u on u.day = d.day
  left join listings l on l.day = d.day
  left join sales s on s.day = d.day
  left join bids_agg b on b.day = d.day
  left join reactions_agg r on r.day = d.day
  left join favorites_agg f on f.day = d.day
  left join views_agg v on v.day = d.day
  order by d.day;
end;
$$;
