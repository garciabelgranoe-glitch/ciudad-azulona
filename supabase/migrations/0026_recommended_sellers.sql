-- Sección "Vendedores recomendados": comercios que van a pagar por
-- aparecer acá más adelante. Por ahora, sin cobro automático, un admin
-- los carga a mano desde el panel cuando hay un acuerdo real.

create table public.recommended_sellers (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  description text,
  contact_info text,
  photo_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.recommended_sellers enable row level security;

create policy "recommended sellers are publicly readable when active"
  on public.recommended_sellers for select
  using (
    is_active
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "only admins can insert recommended sellers"
  on public.recommended_sellers for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "only admins can update recommended sellers"
  on public.recommended_sellers for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "only admins can delete recommended sellers"
  on public.recommended_sellers for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
