-- Modo "venta directa": el vendedor puede anular el modo subasta y publicar
-- la carta a precio fijo, sin pujas. Reutiliza la mecánica de "comprar ya"
-- existente (el cliente manda buy_now_price = base_price en este modo), así
-- que solo hace falta: la columna para distinguirlo, relajar el check que
-- exigía buy_now_price > base_price (acá son iguales), y bloquear pujas por
-- las dudas si alguien pega directo al RPC.

alter table public.auctions
  add column is_sale_only boolean not null default false;

alter table public.auctions drop constraint auctions_buy_now_price_check;
alter table public.auctions
  add constraint auctions_buy_now_price_check check (buy_now_price is null or buy_now_price >= base_price);

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications
  add constraint notifications_kind_check
  check (kind = any (array['outbid', 'reserve_not_met', 'buy_now_sold', 'buy_now_lost', 'sale_expired']));

create or replace function public.place_bid(p_auction_id uuid, p_amount numeric)
returns bids
language plpgsql
security definer
as $function$
declare
  auc public.auctions%rowtype;
  new_bid public.bids%rowtype;
  v_previous_bidder uuid;
begin
  if exists (select 1 from public.profiles where id = auth.uid() and is_suspended) then
    raise exception 'Tu cuenta está suspendida';
  end if;

  perform public.check_rate_limit('place_bid', 20, interval '1 minute');

  select * into auc from public.auctions where id = p_auction_id for update;

  if auc.id is null then
    raise exception 'Subasta inexistente';
  end if;
  if auc.is_sale_only then
    raise exception 'Esta publicación es de venta directa, no acepta pujas';
  end if;
  if auc.status <> 'live' or auc.closes_at <= now() then
    raise exception 'La subasta ya cerró';
  end if;
  if auc.seller_id = auth.uid() then
    raise exception 'No podés pujar en tu propia subasta';
  end if;
  if p_amount <= auc.current_bid then
    raise exception 'La puja tiene que superar la puja actual';
  end if;
  if auc.buy_now_price is not null and p_amount >= auc.buy_now_price then
    raise exception 'Para ese monto usá la opción de compra inmediata';
  end if;

  select bidder_id into v_previous_bidder
  from public.bids
  where auction_id = p_auction_id
  order by amount desc, created_at desc
  limit 1;

  insert into public.bids (auction_id, bidder_id, amount)
  values (p_auction_id, auth.uid(), p_amount)
  returning * into new_bid;

  update public.auctions
  set current_bid = p_amount, bid_count = bid_count + 1
  where id = p_auction_id;

  if v_previous_bidder is not null and v_previous_bidder <> auth.uid() then
    insert into public.notifications (user_id, kind, message, auction_id)
    values (
      v_previous_bidder,
      'outbid',
      'Te superaron en "' || auc.card_name || '" — nueva puja $' || to_char(p_amount, 'FM999G999G999'),
      p_auction_id
    );
  end if;

  return new_bid;
end;
$function$;

-- Al cerrar: si una publicación de venta directa expira sin comprador, no
-- hay reserva que evaluar (no aplica el camino de reserve_not_met) — avisamos
-- al vendedor con un mensaje propio.
create or replace function public.close_expired_auctions()
returns void
language plpgsql
security definer
as $function$
declare
  auc record;
  winner uuid;
  winner_amount numeric;
  new_code text;
begin
  for auc in
    select * from public.auctions
    where status = 'live' and closes_at <= now()
  loop
    select bidder_id, amount into winner, winner_amount
    from public.bids
    where auction_id = auc.id
    order by amount desc, created_at asc
    limit 1;

    if winner is not null and auc.reserve_price is not null and winner_amount < auc.reserve_price then
      winner := null;
    end if;

    update public.auctions
    set status = 'closed', winner_id = winner
    where id = auc.id;

    if winner is not null then
      loop
        new_code := public.generate_ticket_code();
        exit when not exists (select 1 from public.tickets where code = new_code);
      end loop;

      insert into public.tickets (auction_id, code)
      values (auc.id, new_code);
    elsif auc.is_sale_only then
      insert into public.notifications (user_id, kind, message, auction_id)
      values (
        auc.seller_id,
        'sale_expired',
        'Tu publicación "' || auc.card_name || '" venció sin comprador.',
        auc.id
      );
    elsif auc.reserve_price is not null and winner_amount is not null and winner_amount < auc.reserve_price then
      insert into public.notifications (user_id, kind, message, auction_id)
      values (
        auc.seller_id,
        'reserve_not_met',
        'Tu subasta "' || auc.card_name || '" cerró sin alcanzar el precio mínimo — no se generó ganador.',
        auc.id
      );
    end if;
  end loop;
end;
$function$;
