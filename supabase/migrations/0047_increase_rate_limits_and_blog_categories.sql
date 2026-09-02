-- Pedido del dueño: subir el límite de republicar/publicar de 5 a 15 cada
-- 10 minutos (antispam, no la venta en sí). El tope de 5 subastas EN VIVO
-- simultáneas para cuentas no premium (0025_premium.sql) queda como está a
-- propósito — es la palanca que empuja a upgradear a premium, no un límite
-- de repetición.

create or replace function public.enforce_auction_rate_limit()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.uid() is not null and new.lot_id is null then
    perform public.check_rate_limit('create_auction', 15, interval '10 minutes');
  end if;
  return new;
end;
$$;

create or replace function public.enforce_lot_rate_limit()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.uid() is not null then
    perform public.check_rate_limit('create_lot', 15, interval '10 minutes');
  end if;
  return new;
end;
$$;

-- Categorías para "Novedades" (blog), para poder filtrar por sub-menús de
-- tema. Nullable para no romper posts viejos — la app los trata como
-- "general" si no tienen categoría.
alter table public.blog_posts
  add column category text check (
    category in (
      'general',
      'novedades_plataforma',
      'nuevas_colecciones',
      'mercado_precios',
      'eventos_torneos',
      'tips_coleccionismo',
      'historias_comunidad'
    )
  );
