-- Sorteos con requisitos de elegibilidad opcionales (mínimo de cartas
-- publicadas y/o de ventas concretadas) para incentivar uso real de la
-- plataforma, no solo entrar a ganar. La verificación es automática: se
-- mueve la inscripción de un insert directo (gateado solo por RLS) a una
-- función security definer, mismo patrón que place_bid/buy_full_lot, así
-- se puede dar un mensaje de error específico ("te faltan X") en vez de
-- un genérico de violación de RLS.

alter table public.giveaways
  add column min_publications integer check (min_publications is null or min_publications >= 0),
  add column min_sales integer check (min_sales is null or min_sales >= 0);

create or replace function public.enter_giveaway(p_giveaway_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  g public.giveaways%rowtype;
  v_pub_count integer;
  v_sales_count integer;
begin
  if exists (select 1 from public.profiles where id = auth.uid() and is_suspended) then
    raise exception 'Tu cuenta está suspendida';
  end if;

  select * into g from public.giveaways where id = p_giveaway_id;
  if g.id is null then
    raise exception 'Sorteo inexistente';
  end if;
  if g.status <> 'open' or g.closes_at <= now() then
    raise exception 'Este sorteo ya cerró';
  end if;

  if exists (select 1 from public.giveaway_entries where giveaway_id = p_giveaway_id and user_id = auth.uid()) then
    raise exception 'Ya estás inscripto en este sorteo';
  end if;

  if g.min_publications is not null then
    select count(*) into v_pub_count from public.auctions where seller_id = auth.uid();
    if v_pub_count < g.min_publications then
      raise exception 'Necesitás haber publicado al menos % cartas para anotarte (llevás %).', g.min_publications, v_pub_count;
    end if;
  end if;

  if g.min_sales is not null then
    select sales_count into v_sales_count from public.profiles where id = auth.uid();
    if v_sales_count < g.min_sales then
      raise exception 'Necesitás al menos % ventas concretadas para anotarte (llevás %).', g.min_sales, v_sales_count;
    end if;
  end if;

  insert into public.giveaway_entries (giveaway_id, user_id) values (p_giveaway_id, auth.uid());
end;
$$;
