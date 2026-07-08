-- Rate limiting en las dos acciones más fáciles de abusar con un
-- script: pujar y publicar. El auth de Supabase ya limita OTP/login,
-- pero nada frenaba spam de pujas o de subastas una vez logueado.

create table public.rate_limit_events (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  action text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_events_user_action_created_idx
  on public.rate_limit_events (user_id, action, created_at desc);

alter table public.rate_limit_events enable row level security;
-- Sin políticas: nadie accede directo, solo funciones security definer.

create or replace function public.check_rate_limit(p_action text, p_max_count integer, p_window interval)
returns void
language plpgsql
security definer
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.rate_limit_events
  where user_id = auth.uid() and action = p_action and created_at > now() - p_window;

  if v_count >= p_max_count then
    raise exception 'Estás haciendo esta acción demasiado seguido. Esperá un momento e intentá de nuevo.';
  end if;

  insert into public.rate_limit_events (user_id, action) values (auth.uid(), p_action);
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

create or replace function public.enforce_auction_rate_limit()
returns trigger
language plpgsql
security definer
as $$
begin
  -- auth.uid() es null en inserts administrativos/directos (service_role,
  -- scripts, seeds) — esos no son un usuario real pujando/publicando desde
  -- la app, así que no tiene sentido limitarlos.
  if auth.uid() is not null then
    perform public.check_rate_limit('create_auction', 5, interval '10 minutes');
  end if;
  return new;
end;
$$;

create trigger auctions_rate_limit_trigger
  before insert on public.auctions
  for each row execute function public.enforce_auction_rate_limit();
