-- Métricas de crecimiento para el panel admin: altas de usuarios,
-- publicaciones y ventas (con GMV) por día. Se arma en una sola función
-- en vez de reusar los loaders de admin existentes porque
-- listAllAuctionsForAdmin está capado a 200 filas (insuficiente para una
-- serie histórica) y no existe ninguna fuente de "ventas" a nivel admin
-- (tickets está restringido por RLS al propio comprador/vendedor).
--
-- Un ticket se crea exactamente cuando algo se vende (claim inmediato,
-- free claim ganado, o subasta cerrada con ganador), así que es la fuente
-- más confiable de "evento de venta" — mejor que inferir de
-- auctions.status. El monto de la venta es auctions.current_bid al
-- momento del join, en la moneda de auctions.currency.

create or replace function public.admin_metrics_daily(p_days integer default 30)
returns table (
  day date,
  new_users bigint,
  new_listings bigint,
  sales_count bigint,
  gmv_ars numeric,
  gmv_usd numeric
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
  )
  select d.day,
         coalesce(u.new_users, 0),
         coalesce(l.new_listings, 0),
         coalesce(s.sales_count, 0),
         coalesce(s.gmv_ars, 0),
         coalesce(s.gmv_usd, 0)
  from days d
  left join users u on u.day = d.day
  left join listings l on l.day = d.day
  left join sales s on s.day = d.day
  order by d.day;
end;
$$;
