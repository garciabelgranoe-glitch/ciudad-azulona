-- Subastas destacadas. Por ahora el vendedor la marca gratis al publicar;
-- es la base para monetizarlo más adelante (cobrar por destacar).

alter table public.auctions add column is_featured boolean not null default false;
