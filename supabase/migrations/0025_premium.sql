-- Perfil premium: estructura base sin cobro todavía. Un admin lo activa a
-- mano por ahora (no hay pasarela de pago). Regla real de negocio ya
-- activa: cuentas no premium no pueden tener más de 5 subastas en vivo al
-- mismo tiempo.

alter table public.profiles add column is_premium boolean not null default false;

create or replace function public.set_user_premium(p_user_id uuid, p_premium boolean)
returns void
language plpgsql
security definer
as $function$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'No autorizado';
  end if;
  update public.profiles set is_premium = p_premium where id = p_user_id;
end;
$function$;

create or replace function public.enforce_publish_limit()
returns trigger
language plpgsql
security definer
as $function$
declare
  v_is_premium boolean;
  v_live_count int;
begin
  select is_premium into v_is_premium from public.profiles where id = new.seller_id;

  if not coalesce(v_is_premium, false) then
    select count(*) into v_live_count
    from public.auctions
    where seller_id = new.seller_id and status = 'live';

    if v_live_count >= 5 then
      raise exception 'Llegaste al máximo de 5 subastas activas al mismo tiempo. Las cuentas premium no tienen este límite.';
    end if;
  end if;

  return new;
end;
$function$;

create trigger auctions_publish_limit_trigger
  before insert on public.auctions
  for each row execute function public.enforce_publish_limit();
