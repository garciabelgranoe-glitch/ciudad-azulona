-- Privilegios de tabla para anon/authenticated.
-- RLS ya restringe qué filas puede ver/tocar cada usuario; esto solo habilita
-- el acceso a nivel de tabla que Postgres exige antes de siquiera evaluar RLS.

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public
  grant execute on functions to anon, authenticated;
