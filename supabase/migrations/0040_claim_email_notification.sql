-- Email al vendedor cuando le hacen claim a una carta (cualquier venta que
-- genera un ticket: claim inmediato, free claim ganado, o subasta cerrada
-- con ganador). Llama a la Edge Function notify-claim vía pg_net — no
-- bloquea el insert del ticket si el email falla.
--
-- IMPORTANTE: antes de correr esto hay que reemplazar los dos placeholders
-- de abajo (EDGE_FUNCTION_URL y FUNCTION_SECRET) con los valores reales
-- después de desplegar la función — ver instrucciones aparte.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_claim_by_email()
returns trigger
language plpgsql
security definer
as $function$
declare
  auc record;
  seller_email text;
  buyer_alias text;
begin
  select a.card_name, a.current_bid, a.currency, a.seller_id, a.winner_id
  into auc
  from public.auctions a
  where a.id = new.auction_id;

  select email into seller_email from auth.users where id = auc.seller_id;
  select alias into buyer_alias from public.profiles where id = auc.winner_id;

  if seller_email is not null then
    perform net.http_post(
      url := 'EDGE_FUNCTION_URL',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-function-secret', 'FUNCTION_SECRET'),
      body := jsonb_build_object(
        'sellerEmail', seller_email,
        'buyerAlias', coalesce(buyer_alias, 'Alguien'),
        'cardName', auc.card_name,
        'price', auc.current_bid,
        'currency', auc.currency,
        'ticketCode', new.code
      )
    );
  end if;

  return new;
end;
$function$;

create trigger tickets_notify_claim_email_trigger
  after insert on public.tickets
  for each row execute function public.notify_claim_by_email();
