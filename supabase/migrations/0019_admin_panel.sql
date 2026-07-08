-- Panel de administración: suspender usuarios problemáticos. Un usuario
-- suspendido no puede pujar ni publicar, pero puede seguir viendo la
-- app (retirar cartas ya ganadas, ver su perfil, etc).

alter table public.profiles add column is_suspended boolean not null default false;

create or replace function public.set_user_suspended(p_user_id uuid, p_suspended boolean)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'No autorizado';
  end if;
  update public.profiles set is_suspended = p_suspended where id = p_user_id;
end;
$$;

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

drop policy "sellers can create their own auctions" on public.auctions;

create policy "sellers can create their own auctions"
  on public.auctions for insert
  with check (
    auth.uid() = seller_id
    and not exists (select 1 from public.profiles where id = auth.uid() and is_suspended)
  );
