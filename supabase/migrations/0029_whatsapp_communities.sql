-- Enlaces a comunidades de WhatsApp, mismo patrón admin-CRUD que
-- recommended_sellers y blog_posts.

create table public.whatsapp_communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  url text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.whatsapp_communities enable row level security;

create policy "whatsapp communities are publicly readable when active"
  on public.whatsapp_communities for select
  using (
    is_active
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "only admins can insert whatsapp communities"
  on public.whatsapp_communities for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "only admins can update whatsapp communities"
  on public.whatsapp_communities for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "only admins can delete whatsapp communities"
  on public.whatsapp_communities for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
