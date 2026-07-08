-- Bandeja de notificaciones persistente. Hoy el aviso de "te superaron"
-- es un toast efímero que solo se ve con la pestaña abierta; esto lo
-- guarda en la base para que el usuario lo vea la próxima vez que entre,
-- y es la base para notificaciones push más adelante.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  kind text not null check (kind in ('outbid')),
  message text not null,
  auction_id uuid references public.auctions (id),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_created_at_idx on public.notifications (user_id, created_at desc);

alter publication supabase_realtime add table public.notifications;

alter table public.notifications enable row level security;

create policy "users can read their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "users can mark their own notifications as read"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Sin política de insert: solo las crea place_bid (security definer),
-- nunca el cliente directamente.

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
