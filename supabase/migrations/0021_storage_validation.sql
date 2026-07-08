-- El filtro de tipo de archivo hoy es solo del lado del navegador
-- (accept="image/*", fácil de saltear). Esto lo hace cumplir el propio
-- servidor de Storage: solo imágenes, hasta 10MB por foto.

update storage.buckets
set file_size_limit = 10485760, -- 10 MiB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'auction-photos';
