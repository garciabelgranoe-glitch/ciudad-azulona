-- Retiro por ciudad: el vendedor define en qué ciudad vende y, opcionalmente,
-- un punto de retiro curado por el admin dentro de esa ciudad (mismo patrón
-- que "vendedores recomendados" — el admin carga lugares reales a mano).
-- La ciudad queda disponible como filtro en la grilla principal.

create table public.pickup_points (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  name text not null,
  details text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.pickup_points enable row level security;

create policy "pickup points are publicly readable when active"
  on public.pickup_points for select
  using (
    is_active
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "only admins can insert pickup points"
  on public.pickup_points for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "only admins can update pickup points"
  on public.pickup_points for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "only admins can delete pickup points"
  on public.pickup_points for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

alter table public.profiles
  add column city text,
  add column pickup_point_id uuid references public.pickup_points (id) on delete set null;
