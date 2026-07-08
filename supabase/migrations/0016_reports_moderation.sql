-- Habilita la moderación real de denuncias: un rol de admin simple
-- (profiles.is_admin) que puede ver todas las denuncias y resolverlas,
-- además de los estados que le faltaban a reports.

alter table public.profiles add column is_admin boolean not null default false;

alter table public.reports drop constraint reports_status_check;
alter table public.reports add constraint reports_status_check
  check (status = any (array['open', 'resolved', 'dismissed']));

drop policy "reporter can read their own reports" on public.reports;

create policy "reporter can read their own reports, admins read all"
  on public.reports for select
  using (
    auth.uid() = reporter_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "only admins can update report status"
  on public.reports for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
