-- Blog/novedades: autoría simple de texto plano desde el panel admin
-- (sin editor de imágenes por ahora). Mismo patrón de RLS admin-only que
-- recommended_sellers.

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  author_id uuid references public.profiles (id),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

create policy "blog posts are publicly readable when published"
  on public.blog_posts for select
  using (
    is_published
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "only admins can insert blog posts"
  on public.blog_posts for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
    and auth.uid() = author_id
  );

create policy "only admins can update blog posts"
  on public.blog_posts for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "only admins can delete blog posts"
  on public.blog_posts for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
