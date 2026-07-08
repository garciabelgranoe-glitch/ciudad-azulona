-- Estadísticas de perfil estilo gamer: últimas compras/ventas, gasto y
-- venta del último mes, mejor compra y mejor venta. Los tickets son
-- privados por RLS (solo comprador/vendedor los ven), así que se agregan
-- acá vía SECURITY DEFINER para poder mostrarlos en cualquier perfil
-- público, igual que ya se muestra sales_count/purchases_count.
create or replace function public.get_profile_stats(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $function$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'monthlySpent', coalesce((
      select sum(a.current_bid)
      from public.tickets t
      join public.auctions a on a.id = t.auction_id
      where a.winner_id = p_user_id and t.created_at >= now() - interval '30 days'
    ), 0),
    'monthlyEarned', coalesce((
      select sum(a.current_bid)
      from public.tickets t
      join public.auctions a on a.id = t.auction_id
      where a.seller_id = p_user_id and t.created_at >= now() - interval '30 days'
    ), 0),
    'bestPurchase', (
      select jsonb_build_object('cardName', a.card_name, 'amount', a.current_bid)
      from public.tickets t
      join public.auctions a on a.id = t.auction_id
      where a.winner_id = p_user_id
      order by a.current_bid desc
      limit 1
    ),
    'bestSale', (
      select jsonb_build_object('cardName', a.card_name, 'amount', a.current_bid)
      from public.tickets t
      join public.auctions a on a.id = t.auction_id
      where a.seller_id = p_user_id
      order by a.current_bid desc
      limit 1
    ),
    'recentPurchases', coalesce((
      select jsonb_agg(row_data)
      from (
        select
          jsonb_build_object('cardName', a.card_name, 'amount', a.current_bid, 'closedAt', t.created_at) as row_data,
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
          jsonb_build_object('cardName', a.card_name, 'amount', a.current_bid, 'closedAt', t.created_at) as row_data,
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
