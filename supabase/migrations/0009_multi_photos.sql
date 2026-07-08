-- Hasta 5 fotos por carta en vez de una sola. Se reemplaza photo_url por
-- un arreglo photo_urls (la portada es siempre la primera).

alter table public.auctions add column photo_urls text[] not null default '{}';

update public.auctions
set photo_urls = case when photo_url is not null then array[photo_url] else '{}' end;

alter table public.auctions drop column photo_url;

alter table public.auctions add constraint auctions_photo_urls_max_check check (array_length(photo_urls, 1) is null or array_length(photo_urls, 1) <= 5);
