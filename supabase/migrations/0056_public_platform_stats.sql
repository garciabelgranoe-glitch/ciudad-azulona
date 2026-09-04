-- Números reales (no inventados) para mostrar en la landing pública.
-- Solo agregados sin PII — nada de filas individuales. tickets no es
-- público (solo comprador/vendedor pueden leer el suyo), así que hace
-- falta una función security definer para exponer el conteo total.

create or replace function public.public_platform_stats()
returns table (
  total_listings bigint,
  active_listings bigint,
  total_sales bigint,
  verified_sellers bigint,
  cities bigint
)
language sql
security definer
stable
as $$
  select
    (select count(*) from public.auctions),
    (select count(*) from public.auctions where status = 'live'),
    (select count(*) from public.tickets),
    (select count(*) from public.profiles where is_premium),
    (select count(distinct city) from public.profiles where city is not null and city <> '');
$$;

grant execute on function public.public_platform_stats() to anon, authenticated;
