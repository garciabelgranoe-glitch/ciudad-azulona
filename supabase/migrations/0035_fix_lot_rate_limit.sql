-- Bug: cada carta de un lote se inserta como una fila de auctions, y el
-- trigger de rate limit (create_auction, 5 cada 10 min) contaba cada carta
-- por separado. Un lote de más de 5 cartas (o menos si ya se había
-- publicado algo antes) rompía el límite solo, bloqueando el uso legítimo
-- del feature. Los ítems de un lote ya tienen su propio tope (10 cartas
-- por lote, check_lot_item_limit) — se sacan del rate limit por-ítem y se
-- agrega uno propio sobre la creación del lote en sí.

create or replace function public.enforce_auction_rate_limit()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.uid() is not null and new.lot_id is null then
    perform public.check_rate_limit('create_auction', 5, interval '10 minutes');
  end if;
  return new;
end;
$$;

create or replace function public.enforce_lot_rate_limit()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.uid() is not null then
    perform public.check_rate_limit('create_lot', 5, interval '10 minutes');
  end if;
  return new;
end;
$$;

create trigger card_lots_rate_limit_trigger
  before insert on public.card_lots
  for each row execute function public.enforce_lot_rate_limit();
