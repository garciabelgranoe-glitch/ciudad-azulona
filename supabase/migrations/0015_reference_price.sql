-- Precio de referencia opcional, cargado a mano por el vendedor (ej: lo
-- que vale la carta en PriceCharting u otra fuente). Alimenta el gráfico
-- de evolución de precio en el detalle de la subasta.

alter table public.auctions add column reference_price numeric(12,2);
