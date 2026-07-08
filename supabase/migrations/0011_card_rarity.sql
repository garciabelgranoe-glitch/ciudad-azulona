-- Rareza de la carta, como en el TCG físico: común (círculo), poco común
-- (rombo), rara (estrella) y rara doble (doble estrella).

alter table public.auctions add column rarity text check (rarity in ('comun', 'poco_comun', 'rara', 'rara_doble'));
