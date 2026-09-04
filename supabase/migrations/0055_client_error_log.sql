-- Monitoreo en vivo: hasta ahora, si algo se rompía del lado del cliente
-- (un error de JS, una llamada a Supabase que falla), la única forma de
-- enterarse era que un usuario avisara — pasó varias veces esta semana
-- (el bug de pg_net en el claim, por ejemplo, hubiera aparecido acá de
-- entrada). Esta tabla guarda esos errores para verlos en vivo desde el
-- panel admin.

create table public.client_error_log (
  id bigint generated always as identity primary key,
  message text not null,
  stack text,
  view_name text,
  url text,
  user_id uuid references public.profiles (id) on delete set null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index client_error_log_created_at_idx on public.client_error_log (created_at desc);

alter table public.client_error_log enable row level security;

-- Mismo criterio que page_views: cualquiera (logueado o no) puede loguear
-- un error — es fire-and-forget, sin lectura pública.
create policy "anyone can log a client error"
  on public.client_error_log for insert
  with check (true);

create policy "only admins can read the client error log"
  on public.client_error_log for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Para que el panel admin pueda suscribirse en vivo (postgres_changes).
alter publication supabase_realtime add table public.client_error_log;
