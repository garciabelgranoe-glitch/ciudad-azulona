-- Bug de seguridad: la policy de UPDATE en profiles solo valida
-- "auth.uid() = id" pero no restringe qué columnas se pueden tocar, y por
-- default Supabase le da GRANT de todas las columnas a "anon"/"authenticated"
-- confiando solo en RLS. Como RLS controla FILAS, no COLUMNAS, cualquier
-- usuario logueado podía pegarle directo a la REST API de Supabase (sin
-- pasar por la app) y setear is_admin=true, is_premium=true,
-- is_suspended=false, sales_count, purchases_count o rating_avg en su
-- propia fila. Así se autoelevó la cuenta "josesillo" (creada y borrada el
-- 2026-09-03, sin datos asociados).
--
-- Fix: restringir a nivel de columna qué puede escribir "authenticated" —
-- PostgREST respeta los GRANT de columna además de la RLS. Los triggers/
-- funciones que sí necesitan tocar estas columnas (sales_count,
-- purchases_count, rating_avg vía triggers de 0006_ratings.sql; is_premium
-- vía la función admin_set_premium de 0025_premium.sql, que ya valida
-- is_admin) corren como dueño de la tabla / security definer, así que no
-- se ven afectados por este REVOKE. "anon" no necesita nada acá: crear o
-- editar el perfil siempre pasa con sesión autenticada.

revoke update, insert on public.profiles from anon, authenticated;

grant update (
  alias, gender, phone, city, contact_phone,
  has_stand, stand_number, pickup_day, pickup_time, pickup_point_id
) on public.profiles to authenticated;

grant insert (
  id, alias, gender, phone
) on public.profiles to authenticated;
