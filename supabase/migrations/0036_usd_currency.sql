-- Precio en dólares: el vendedor elige la moneda (ARS o USD) al publicar
-- una subasta, venta directa, free claim o carta de lote — se puja/compra
-- en esa moneda, mostrada con su símbolo correspondiente. No hay
-- conversión automática: cada publicación vive en la moneda que eligió
-- su vendedor.

alter table public.auctions
  add column currency text not null default 'ARS' check (currency in ('ARS', 'USD'));

-- ============================================================
-- Ranking: separar el total por moneda en vez de sumarlas — sumar ARS +
-- USD directamente daría un número sin sentido.
-- ============================================================

drop function if exists public.get_top_sellers();
drop function if exists public.get_top_buyers();

create or replace function public.get_top_sellers()
returns table (user_id uuid, alias text, gender text, total_ars numeric, total_usd numeric)
language sql
security definer
stable
as $function$
  select p.id, p.alias, p.gender,
    coalesce(sold_ars.total, 0) as total_ars,
    coalesce(sold_usd.total, 0) as total_usd
  from public.profiles p
  left join (
    select a.seller_id as uid, sum(a.current_bid) as total
    from public.auctions a
    join public.tickets t on t.auction_id = a.id
    where t.status = 'redeemed' and a.currency = 'ARS'
    group by a.seller_id
  ) sold_ars on sold_ars.uid = p.id
  left join (
    select a.seller_id as uid, sum(a.current_bid) as total
    from public.auctions a
    join public.tickets t on t.auction_id = a.id
    where t.status = 'redeemed' and a.currency = 'USD'
    group by a.seller_id
  ) sold_usd on sold_usd.uid = p.id
  where coalesce(sold_ars.total, 0) > 0 or coalesce(sold_usd.total, 0) > 0
  order by total_ars desc, total_usd desc
  limit 10;
$function$;

create or replace function public.get_top_buyers()
returns table (user_id uuid, alias text, gender text, total_ars numeric, total_usd numeric)
language sql
security definer
stable
as $function$
  select p.id, p.alias, p.gender,
    coalesce(bought_ars.total, 0) as total_ars,
    coalesce(bought_usd.total, 0) as total_usd
  from public.profiles p
  left join (
    select a.winner_id as uid, sum(a.current_bid) as total
    from public.auctions a
    join public.tickets t on t.auction_id = a.id
    where t.status = 'redeemed' and a.currency = 'ARS'
    group by a.winner_id
  ) bought_ars on bought_ars.uid = p.id
  left join (
    select a.winner_id as uid, sum(a.current_bid) as total
    from public.auctions a
    join public.tickets t on t.auction_id = a.id
    where t.status = 'redeemed' and a.currency = 'USD'
    group by a.winner_id
  ) bought_usd on bought_usd.uid = p.id
  where coalesce(bought_ars.total, 0) > 0 or coalesce(bought_usd.total, 0) > 0
  order by total_ars desc, total_usd desc
  limit 10;
$function$;

-- ============================================================
-- Estadísticas de perfil: montos mensuales separados por moneda (sumar
-- ARS + USD sería incorrecto). "Mejor compra/venta" queda limitado a ARS
-- por ahora para evitar comparar montos de distinta moneda entre sí;
-- el historial reciente sí lleva la moneda de cada operación.
-- ============================================================

create or replace function public.get_profile_stats(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $function$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'monthlySpent', jsonb_build_object(
      'ars', coalesce((
        select sum(a.current_bid)
        from public.tickets t
        join public.auctions a on a.id = t.auction_id
        where a.winner_id = p_user_id and t.created_at >= now() - interval '30 days' and a.currency = 'ARS'
      ), 0),
      'usd', coalesce((
        select sum(a.current_bid)
        from public.tickets t
        join public.auctions a on a.id = t.auction_id
        where a.winner_id = p_user_id and t.created_at >= now() - interval '30 days' and a.currency = 'USD'
      ), 0)
    ),
    'monthlyEarned', jsonb_build_object(
      'ars', coalesce((
        select sum(a.current_bid)
        from public.tickets t
        join public.auctions a on a.id = t.auction_id
        where a.seller_id = p_user_id and t.created_at >= now() - interval '30 days' and a.currency = 'ARS'
      ), 0),
      'usd', coalesce((
        select sum(a.current_bid)
        from public.tickets t
        join public.auctions a on a.id = t.auction_id
        where a.seller_id = p_user_id and t.created_at >= now() - interval '30 days' and a.currency = 'USD'
      ), 0)
    ),
    'bestPurchase', (
      select jsonb_build_object('cardName', a.card_name, 'amount', a.current_bid, 'currency', a.currency)
      from public.tickets t
      join public.auctions a on a.id = t.auction_id
      where a.winner_id = p_user_id and a.currency = 'ARS'
      order by a.current_bid desc
      limit 1
    ),
    'bestSale', (
      select jsonb_build_object('cardName', a.card_name, 'amount', a.current_bid, 'currency', a.currency)
      from public.tickets t
      join public.auctions a on a.id = t.auction_id
      where a.seller_id = p_user_id and a.currency = 'ARS'
      order by a.current_bid desc
      limit 1
    ),
    'recentPurchases', coalesce((
      select jsonb_agg(row_data)
      from (
        select
          jsonb_build_object('cardName', a.card_name, 'amount', a.current_bid, 'currency', a.currency, 'closedAt', t.created_at) as row_data,
          t.created_at
        from public.tickets t
        join public.auctions a on a.id = t.auction_id
        where a.winner_id = p_user_id
        order by t.created_at desc
        limit 5
      ) sub
    ), '[]'::jsonb),
    'recentSales', coalesce((
      select jsonb_agg(row_data)
      from (
        select
          jsonb_build_object('cardName', a.card_name, 'amount', a.current_bid, 'currency', a.currency, 'closedAt', t.created_at) as row_data,
          t.created_at
        from public.tickets t
        join public.auctions a on a.id = t.auction_id
        where a.seller_id = p_user_id
        order by t.created_at desc
        limit 5
      ) sub
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$function$;
