-- Sin esto, postgres_changes en el cliente nunca recibe eventos:
-- la tabla tiene que estar agregada a la publicación de Realtime.
alter publication supabase_realtime add table public.auctions;
