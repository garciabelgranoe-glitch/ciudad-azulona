-- Cierra subastas vencidas y genera tickets cada 1 minuto.
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'close-expired-auctions',
  '* * * * *',
  $$select public.close_expired_auctions();$$
);
