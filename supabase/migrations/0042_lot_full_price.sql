-- Precio de lote completo: además del precio individual por carta
-- (ya existente), el vendedor puede poner un precio para llevarse todo
-- el lote de una — pero solo mientras ninguna carta suelta se haya
-- vendido todavía (evita tener que recalcular precios parciales).

alter table public.card_lots
  add column full_price numeric check (full_price is null or full_price > 0);

create or replace function public.buy_full_lot(p_lot_id uuid)
returns void
language plpgsql
security definer
as $function$
declare
  lot record;
  item record;
  new_code text;
begin
  if exists (select 1 from public.profiles where id = auth.uid() and is_suspended) then
    raise exception 'Tu cuenta está suspendida';
  end if;

  perform public.check_rate_limit('place_bid', 20, interval '1 minute');

  select * into lot from public.card_lots where id = p_lot_id for update;
  if lot.id is null then
    raise exception 'Lote inexistente';
  end if;
  if lot.full_price is null then
    raise exception 'Este lote no tiene precio de lote completo';
  end if;
  if lot.seller_id = auth.uid() then
    raise exception 'No podés comprar tu propio lote';
  end if;

  perform 1 from public.auctions where lot_id = p_lot_id for update;

  if exists (select 1 from public.auctions where lot_id = p_lot_id and status <> 'live') then
    raise exception 'Ya se vendió alguna carta del lote — no se puede comprar completo';
  end if;

  for item in select * from public.auctions where lot_id = p_lot_id loop
    loop
      new_code := public.generate_ticket_code();
      exit when not exists (select 1 from public.tickets where code = new_code);
    end loop;

    update public.auctions
    set status = 'closed', winner_id = auth.uid(), closes_at = now()
    where id = item.id;

    insert into public.tickets (auction_id, code) values (item.id, new_code);
  end loop;

  insert into public.notifications (user_id, kind, message, auction_id)
  values (
    lot.seller_id,
    'buy_now_sold',
    'Te claimearon el lote completo "' || lot.title || '" por $' || to_char(lot.full_price, 'FM999G999G999'),
    null
  );
end;
$function$;
