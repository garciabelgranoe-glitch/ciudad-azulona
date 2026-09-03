-- Panel admin: log de auditoría + moderación de subastas (cancelar/destacar).
-- Motivo: durante el incidente de seguridad de hoy (auto-elevación a admin/
-- premium en profiles) quedó claro que no hay ningún registro de qué
-- acciones se hicieron desde el panel admin ni quién las hizo. Esto agrega
-- un log genérico y lo conecta a las acciones sensibles existentes
-- (suspender/dar premium/resolver denuncia) y a dos nuevas (cancelar y
-- destacar una subasta desde el panel, sin tener que tocar la base a mano).

create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

create policy "only admins can read the audit log"
  on public.admin_audit_log for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Helper interno: valida que quien llama sea admin y guarda la entrada.
-- No se expone para insert directo del cliente (ninguna policy de insert),
-- así que solo se puede escribir desde funciones security definer como esta.
create or replace function public.log_admin_action(p_action text, p_target_type text, p_target_id text, p_details jsonb default null)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'No autorizado';
  end if;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), p_action, p_target_type, p_target_id, p_details);
end;
$$;

-- Se re-crean con el agregado de logging (misma lógica de antes).
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
  perform public.log_admin_action(
    case when p_suspended then 'suspender_usuario' else 'reactivar_usuario' end,
    'profile', p_user_id::text, null
  );
end;
$$;

create or replace function public.set_user_premium(p_user_id uuid, p_premium boolean)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'No autorizado';
  end if;
  update public.profiles set is_premium = p_premium where id = p_user_id;
  perform public.log_admin_action(
    case when p_premium then 'dar_premium' else 'quitar_premium' end,
    'profile', p_user_id::text, null
  );
end;
$$;

-- Antes esto era un update directo del cliente (RLS ya lo restringía a
-- admins, pero sin quedar registrado). Se convierte a función para poder
-- loguearlo de forma atómica.
create or replace function public.admin_resolve_report(p_report_id uuid, p_status text)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'No autorizado';
  end if;
  if p_status not in ('resolved', 'dismissed') then
    raise exception 'Estado inválido';
  end if;
  update public.reports set status = p_status where id = p_report_id;
  perform public.log_admin_action('resolver_denuncia', 'report', p_report_id::text, jsonb_build_object('status', p_status));
end;
$$;

-- Nuevo: cancelar cualquier subasta en vivo desde el panel (a diferencia de
-- cancel_own_auction, no exige que sea el dueño ni que no tenga pujas — es
-- una acción de moderación).
create or replace function public.admin_cancel_auction(p_auction_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'No autorizado';
  end if;
  update public.auctions set status = 'cancelled' where id = p_auction_id and status = 'live';
  if not found then
    raise exception 'La subasta no existe o ya no está en vivo.';
  end if;
  perform public.log_admin_action('cancelar_subasta', 'auction', p_auction_id::text, null);
end;
$$;

-- Nuevo: destacar/quitar destacado de cualquier subasta desde el panel.
create or replace function public.admin_set_auction_featured(p_auction_id uuid, p_is_featured boolean)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'No autorizado';
  end if;
  update public.auctions set is_featured = p_is_featured where id = p_auction_id;
  perform public.log_admin_action(
    case when p_is_featured then 'destacar_subasta' else 'quitar_destacado_subasta' end,
    'auction', p_auction_id::text, null
  );
end;
$$;
