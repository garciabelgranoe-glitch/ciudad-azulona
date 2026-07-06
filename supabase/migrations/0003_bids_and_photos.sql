-- Contador de pujas denormalizado (evita un count() por tarjeta en la lista)
alter table public.auctions add column bid_count integer not null default 0;

-- Todas las pujas tienen que pasar por place_bid() (más abajo), que valida
-- el monto y actualiza current_bid/bid_count de forma atómica. Si dejáramos
-- la política de insert directo, cualquiera podría insertar una fila en
-- `bids` sin que current_bid se entere.
drop policy "users can only bid as themselves on live auctions" on public.bids;

-- Pujar es una operación que valida + inserta + actualiza current_bid/bid_count
-- de forma atómica. No se puede resolver solo con políticas RLS sobre `bids`
-- porque también hay que tocar `auctions`, y no queremos que cualquier
-- bidder pueda escribir libremente esa fila.
create or replace function public.place_bid(p_auction_id uuid, p_amount numeric)
returns public.bids
language plpgsql
security definer
as $$
declare
  auc public.auctions%rowtype;
  new_bid public.bids%rowtype;
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

  insert into public.bids (auction_id, bidder_id, amount)
  values (p_auction_id, auth.uid(), p_amount)
  returning * into new_bid;

  update public.auctions
  set current_bid = p_amount, bid_count = bid_count + 1
  where id = p_auction_id;

  return new_bid;
end;
$$;

grant execute on function public.place_bid(uuid, numeric) to authenticated;

-- ---------------------------------------------
-- Storage: fotos de cartas
-- ---------------------------------------------

insert into storage.buckets (id, name, public)
values ('auction-photos', 'auction-photos', true)
on conflict (id) do nothing;

create policy "auction photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'auction-photos');

create policy "authenticated users can upload auction photos"
  on storage.objects for insert
  with check (bucket_id = 'auction-photos' and auth.role() = 'authenticated');
