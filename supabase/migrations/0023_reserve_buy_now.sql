-- Precio mínimo (reserva) y precio fijo (compra inmediata) para subastas.

alter table public.auctions
  add column reserve_price numeric(12,2),
  add column buy_now_price numeric(12,2);

alter table public.auctions
  add constraint auctions_reserve_price_check check (reserve_price is null or reserve_price >= base_price),
  add constraint auctions_buy_now_price_check check (buy_now_price is null or buy_now_price > base_price),
  add constraint auctions_buy_now_over_reserve_check
    check (buy_now_price is null or reserve_price is null or buy_now_price > reserve_price);

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications
  add constraint notifications_kind_check
  check (kind = any (array['outbid', 'reserve_not_met', 'buy_now_sold', 'buy_now_lost']));

-- Al cerrar: si hay precio de reserva y la puja más alta no lo alcanza, la
-- subasta cierra sin ganador (no se genera ticket) y se avisa al vendedor.
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

-- place_bid: si hay precio de compra inmediata, las pujas normales tienen
-- que quedar por debajo (para ese monto se usa buy_now_auction).
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

-- Compra inmediata: cierra la subasta al instante a favor de quien la usa.
create or replace function public.buy_now_auction(p_auction_id uuid)
returns auctions
language plpgsql
security definer
as $function$
declare
  auc public.auctions%rowtype;
  v_previous_bidder uuid;
  new_code text;
  result public.auctions%rowtype;
begin
  if exists (select 1 from public.profiles where id = auth.uid() and is_suspended) then
    raise exception 'Tu cuenta está suspendida';
  end if;

  perform public.check_rate_limit('place_bid', 20, interval '1 minute');

  select * into auc from public.auctions where id = p_auction_id for update;

  if auc.id is null then
    raise exception 'Subasta inexistente';
  end if;
  if auc.status <> 'live' or auc.closes_at <= now() then
    raise exception 'La subasta ya cerró';
  end if;
  if auc.seller_id = auth.uid() then
    raise exception 'No podés comprar tu propia subasta';
  end if;
  if auc.buy_now_price is null then
    raise exception 'Esta subasta no tiene precio de compra inmediata';
  end if;

  select bidder_id into v_previous_bidder
  from public.bids
  where auction_id = p_auction_id
  order by amount desc, created_at desc
  limit 1;

  insert into public.bids (auction_id, bidder_id, amount)
  values (p_auction_id, auth.uid(), auc.buy_now_price);

  loop
    new_code := public.generate_ticket_code();
    exit when not exists (select 1 from public.tickets where code = new_code);
  end loop;

  update public.auctions
  set current_bid = auc.buy_now_price,
      bid_count = bid_count + 1,
      status = 'closed',
      winner_id = auth.uid(),
      closes_at = now()
  where id = p_auction_id
  returning * into result;

  insert into public.tickets (auction_id, code) values (p_auction_id, new_code);

  insert into public.notifications (user_id, kind, message, auction_id)
  values (
    auc.seller_id,
    'buy_now_sold',
    'Vendiste "' || auc.card_name || '" al instante por $' || to_char(auc.buy_now_price, 'FM999G999G999'),
    p_auction_id
  );

  if v_previous_bidder is not null and v_previous_bidder <> auth.uid() then
    insert into public.notifications (user_id, kind, message, auction_id)
    values (
      v_previous_bidder,
      'buy_now_lost',
      'Alguien compró "' || auc.card_name || '" al instante antes de que termine la subasta.',
      p_auction_id
    );
  end if;

  return result;
end;
$function$;

-- update_own_auction: sumar reserva y compra inmediata a los campos editables.
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
  p_buy_now_price numeric
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
      buy_now_price = p_buy_now_price
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
