-- Sorteos: foto del premio (para mostrar qué se sortea) y link directo al
-- grupo de la comunidad (los sorteos suelen exigir estar en el grupo para
-- participar, así que se lo dejamos a mano en vez de obligar a buscarlo).

alter table public.giveaways
  add column photo_url text,
  add column community_url text;
