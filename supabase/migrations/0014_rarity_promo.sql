-- Agrega "promo" como rareza para cartas que vinieron en packs/eventos
-- promocionales (no tienen el símbolo círculo/rombo/estrella del set base).

alter table public.auctions drop constraint auctions_rarity_check;
alter table public.auctions add constraint auctions_rarity_check
  check (rarity = any (array['comun', 'poco_comun', 'rara', 'rara_doble', 'promo']));
