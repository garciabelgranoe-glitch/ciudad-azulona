-- ============================================================
-- Ranking dividido: top 10 vendedores y top 10 compradores por
-- separado. get_top_traders() sumaba volumen vendido + volumen
-- comprado en un único score, mezclando ambos roles en un solo
-- ranking. Se reemplaza por dos funciones independientes.
-- ============================================================

drop function if exists public.get_top_traders();

create or replace function public.get_top_sellers()
returns table (user_id uuid, alias text, gender text, total_volume numeric)
language sql
security definer
stable
as $function$
  select p.id, p.alias, p.gender, sold.total as total_volume
  from public.profiles p
  join (
    select a.seller_id as uid, sum(a.current_bid) as total
    from public.auctions a
    join public.tickets t on t.auction_id = a.id
    where t.status = 'redeemed'
    group by a.seller_id
  ) sold on sold.uid = p.id
  order by total_volume desc
  limit 10;
$function$;

create or replace function public.get_top_buyers()
returns table (user_id uuid, alias text, gender text, total_volume numeric)
language sql
security definer
stable
as $function$
  select p.id, p.alias, p.gender, bought.total as total_volume
  from public.profiles p
  join (
    select a.winner_id as uid, sum(a.current_bid) as total
    from public.auctions a
    join public.tickets t on t.auction_id = a.id
    where t.status = 'redeemed'
    group by a.winner_id
  ) bought on bought.uid = p.id
  order by total_volume desc
  limit 10;
$function$;
