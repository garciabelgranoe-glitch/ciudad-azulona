-- Bug: reclamar/comprar una carta rompía con "schema net does not exist".
-- notify_claim_by_email() (0048_finish_claim_email_notification.sql) llama
-- a net.http_post(...) para avisarle por email al vendedor cuando se crea
-- un ticket, pero la extensión pg_net nunca quedó habilitada en este
-- proyecto — la función asumía que ya estaba (viene instalada por default
-- en la mayoría de los proyectos de Supabase, pero no en este). El trigger
-- corre en cada insert de tickets, o sea en cada claim o compra.

create extension if not exists pg_net with schema extensions;
