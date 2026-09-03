-- Bloqueo de emails específicos para que no puedan ni siquiera crear cuenta.
-- Motivo: josemariasllego@gmail.com creó 3 cuentas seguidas (josesillo,
-- mani, fedecards) probando explotar el bug de columnas privilegiadas de
-- profiles (cerrado en 0050/0051). El bug ya está cerrado, pero nada le
-- impedía seguir creando cuentas nuevas — esto lo corta en la raíz, en el
-- signup mismo.
--
-- signInWithOtp() de Supabase Auth inserta la fila en auth.users al
-- verificar el OTP por primera vez. Un trigger BEFORE INSERT en auth.users
-- corre igual sea cual sea el servicio que hizo el insert (GoTrue incluido),
-- así que es el lugar correcto para cortar esto — no se puede hacer vía RLS
-- porque auth.users no pasa por PostgREST.

create table public.blocked_emails (
  email text primary key,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.blocked_emails enable row level security;

create policy "only admins can manage blocked emails"
  on public.blocked_emails for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create or replace function public.block_signup_from_blocked_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.blocked_emails where email = lower(new.email)) then
    raise exception 'Este email no puede registrarse.';
  end if;
  return new;
end;
$$;

create trigger block_signup_from_blocked_email
  before insert on auth.users
  for each row execute function public.block_signup_from_blocked_email();

insert into public.blocked_emails (email, reason)
values ('josemariasllego@gmail.com', 'Explotó (y siguió reintentando después del fix) el bug de auto-elevación a admin/premium en profiles — 2026-09-03.');
