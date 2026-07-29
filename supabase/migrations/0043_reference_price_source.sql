-- Precio de referencia: además del monto, dejar que el vendedor aclare en
-- qué moneda está y de qué plataforma lo sacó (PriceCharting, eBay, etc.),
-- para que el comprador pueda juzgar qué tan confiable es la comparación.

alter table public.auctions
  add column reference_price_currency text,
  add column reference_price_source text;

-- update_own_auction: sumar los dos campos al final de la firma (create or
-- replace no permite reordenar/renombrar los existentes).
create or replace function public.update_own_auction(
  p_auction_id uuid,
  p_card_name text,
  p_base_price numeric,
  p_set_name text,
  p_card_number text,
  p_year smallint,
  p_condition text,
  p_is_graded boolean,
  p_grading_company text,
  p_grade numeric,
  p_rarity text,
  p_is_featured boolean,
  p_reference_price numeric,
  p_reserve_price numeric,
  p_buy_now_price numeric,
  p_language text,
  p_reference_price_currency text,
  p_reference_price_source text
)
returns auctions
language plpgsql
security definer
as $function$
declare
  result public.auctions;
begin
  update public.auctions
  set card_name = p_card_name,
      base_price = p_base_price,
      current_bid = p_base_price,
      set_name = p_set_name,
      card_number = p_card_number,
      year = p_year,
      condition = p_condition,
      is_graded = p_is_graded,
      grading_company = case when p_is_graded then p_grading_company else null end,
      grade = case when p_is_graded then p_grade else null end,
      rarity = p_rarity,
      is_featured = p_is_featured,
      reference_price = p_reference_price,
      reserve_price = p_reserve_price,
      buy_now_price = p_buy_now_price,
      language = p_language,
      reference_price_currency = case when p_reference_price is null then null else p_reference_price_currency end,
      reference_price_source = case when p_reference_price is null then null else p_reference_price_source end
  where id = p_auction_id
    and seller_id = auth.uid()
    and status = 'live'
    and bid_count = 0
  returning * into result;

  if result.id is null then
    raise exception 'No se puede editar esta subasta (no es tuya, ya tiene pujas, o ya cerró).';
  end if;

  return result;
end;
$function$;
