-- Pivot de login: de teléfono por SMS/WhatsApp a email por OTP (mismo
-- flujo sin contraseña, pero por mail — evita el costo y los problemas de
-- entrega de SMS a Argentina). El teléfono se sigue pidiendo en el alta,
-- pero ahora es un dato de contacto en profiles, no el método de login.

alter table public.profiles add column phone text;

-- Backfill para las cuentas de prueba que ya existían con login por
-- teléfono, así no quedan con phone nulo.
update public.profiles p
set phone = u.phone
from auth.users u
where u.id = p.id and p.phone is null and u.phone is not null;

alter table public.profiles alter column phone set not null;
