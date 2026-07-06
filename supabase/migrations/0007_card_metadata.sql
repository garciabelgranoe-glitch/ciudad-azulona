-- Metadata de la carta que faltaba para que alguien pueda pujar con
-- confianza sin verla en persona: colección/edición, año, condición,
-- y si está gradeada.

alter table public.auctions
  add column set_name text,
  add column card_number text,
  add column year smallint,
  add column condition text check (
    condition in ('mint', 'near_mint', 'lightly_played', 'moderately_played', 'heavily_played', 'damaged')
  ),
  add column is_graded boolean not null default false,
  add column grading_company text check (grading_company in ('psa', 'bgs', 'cgc', 'otra')),
  add column grade numeric(3, 1);
