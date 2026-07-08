-- Índices que faltaban en columnas que ya se consultan seguido. Sin
-- esto, "Mis pujas", "Mis publicaciones" y el recálculo de reputación
-- van a hacer table scans a medida que crezcan las tablas.

create index if not exists bids_bidder_id_idx on public.bids (bidder_id);
create index if not exists ratings_rated_user_id_idx on public.ratings (rated_user_id);
create index if not exists auctions_seller_id_idx on public.auctions (seller_id);
