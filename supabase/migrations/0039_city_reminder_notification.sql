-- Recordatorio de ciudad: si un vendedor publica una carta y todavía no
-- cargó su ciudad, le mandamos una notificación una única vez (se
-- reconoce chequeando si ya existe una notificación de este tipo para
-- ese usuario, sin agregar una columna nueva a profiles).

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications
  add constraint notifications_kind_check
  check (kind = any (array['outbid', 'reserve_not_met', 'buy_now_sold', 'buy_now_lost', 'sale_expired', 'free_claim_won', 'free_claim_expired', 'city_reminder']));

create or replace function public.remind_city_if_missing()
returns trigger
language plpgsql
security definer
as $function$
declare
  seller_city text;
begin
  select city into seller_city from public.profiles where id = new.seller_id;

  if seller_city is null and not exists (
    select 1 from public.notifications where user_id = new.seller_id and kind = 'city_reminder'
  ) then
    insert into public.notifications (user_id, kind, message)
    values (
      new.seller_id,
      'city_reminder',
      'Todavía no cargaste tu ciudad — configurala en tu perfil para que los compradores te encuentren por ubicación.'
    );
  end if;

  return new;
end;
$function$;

create trigger auctions_city_reminder_trigger
  after insert on public.auctions
  for each row execute function public.remind_city_if_missing();
