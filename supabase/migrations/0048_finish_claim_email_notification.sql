-- Completa 0040_claim_email_notification.sql: reemplaza los placeholders
-- por los valores reales ya que la Edge Function notify-claim está
-- deployada. El secreto compartido (FUNCTION_SECRET) es el mismo que se
-- configuró como secret de la función en Supabase.

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
      url := 'https://xdwmnneczcpdidvynvza.supabase.co/functions/v1/notify-claim',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-function-secret', 'ac4771f31b00e767b546a3ccf99e9e2364a797905fc27e29'),
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

-- 0040 nunca llegó a crear el trigger en producción (se revirtió antes de
-- reemplazar los placeholders) — lo creamos acá, ahora que la función ya
-- tiene los valores reales.
drop trigger if exists tickets_notify_claim_email_trigger on public.tickets;

create trigger tickets_notify_claim_email_trigger
  after insert on public.tickets
  for each row execute function public.notify_claim_by_email();
