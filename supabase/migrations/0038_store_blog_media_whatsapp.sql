-- Imagen de contexto para comercios recomendados y novedades del blog, y
-- un link directo de WhatsApp para los comercios (en vez de solo mostrar
-- el contacto como texto plano). recommended_sellers.photo_url ya existía
-- pero nunca se expuso en la UI; whatsapp_url es nuevo.

alter table public.recommended_sellers
  add column whatsapp_url text;

alter table public.blog_posts
  add column photo_url text;
