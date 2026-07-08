-- Género (para el ícono estilo entrenador) + info de retiro: o tenés un
-- stand fijo, o preferís coordinar día/horario y dejás un teléfono de
-- contacto. Todo opcional — se completa desde la edición de perfil.

alter table public.profiles add column gender text check (gender in ('masculino', 'femenino'));

alter table public.profiles add column has_stand boolean not null default false;
alter table public.profiles add column stand_number text;
alter table public.profiles add column pickup_day text;
alter table public.profiles add column pickup_time text;
alter table public.profiles add column contact_phone text;
