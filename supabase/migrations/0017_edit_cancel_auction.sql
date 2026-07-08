-- Permite al vendedor corregir datos de su subasta o cancelarla, pero
-- solo mientras siga en vivo y todavía no tenga ninguna puja (para no
-- romper la integridad de una puja ya en curso). Se implementa como
-- funciones angostas en vez de una política RLS de UPDATE abierta, para
-- no exponer columnas sensibles (current_bid, bid_count, winner_id,
-- status) a una actualización arbitraria desde el cliente.

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
  p_reference_price numeric
)
returns public.auctions
language plpgsql
security definer
as $$
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
      reference_price = p_reference_price
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
$$;

create or replace function public.cancel_own_auction(p_auction_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.auctions
  set status = 'cancelled'
  where id = p_auction_id
    and seller_id = auth.uid()
    and status = 'live'
    and bid_count = 0;

  if not found then
    raise exception 'No se puede cancelar esta subasta (no es tuya, ya tiene pujas, o ya cerró).';
  end if;
end;
$$;
