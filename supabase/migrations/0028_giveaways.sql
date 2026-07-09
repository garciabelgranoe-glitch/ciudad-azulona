-- Sorteos para la comunidad: solo el admin los crea, cualquiera se
-- inscribe una vez y el admin elige un ganador entre los inscriptos.

create table public.giveaways (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  prize_description text,
  closes_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  winner_id uuid references public.profiles (id),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.giveaways enable row level security;

create policy "giveaways are publicly readable"
  on public.giveaways for select
  using (true);

create policy "only admins can insert giveaways"
  on public.giveaways for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
    and created_by = auth.uid()
  );

create policy "only admins can update giveaways"
  on public.giveaways for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "only admins can delete giveaways"
  on public.giveaways for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create table public.giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  giveaway_id uuid not null references public.giveaways (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (giveaway_id, user_id)
);

alter table public.giveaway_entries enable row level security;

create policy "users can read their own giveaway entries"
  on public.giveaway_entries for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "users can enter open giveaways for themselves"
  on public.giveaway_entries for insert
  with check (
    auth.uid() = user_id
    and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_suspended)
    and exists (
      select 1 from public.giveaways g
      where g.id = giveaway_id and g.status = 'open' and g.closes_at > now()
    )
  );

-- Los inscriptos de un sorteo son privados por RLS; esta función le da al
-- admin la lista completa para poder elegir un ganador.
create or replace function public.list_giveaway_entrants(p_giveaway_id uuid)
returns table (user_id uuid, alias text, created_at timestamptz)
language plpgsql
security definer
as $function$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'No autorizado';
  end if;

  return query
    select ge.user_id, p.alias, ge.created_at
    from public.giveaway_entries ge
    join public.profiles p on p.id = ge.user_id
    where ge.giveaway_id = p_giveaway_id
    order by ge.created_at asc;
end;
$function$;
