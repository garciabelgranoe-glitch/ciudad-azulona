-- Mismo bug de fondo que 0050, encontrado al auditar el resto del esquema
-- después del incidente de "profiles": varias policies de UPDATE/INSERT
-- validan la FILA correctamente (auth.uid() = ...) pero como Supabase da
-- por default GRANT de todas las columnas a "authenticated", nada impedía
-- tocar columnas que la app nunca pensó exponer, pegándole directo a la
-- REST API en vez de pasar por la app:
--
--   * tickets: la policy de "el vendedor redime su propio ticket" solo
--     revisa que el nuevo status sea 'redeemed', pero dejaba reescribir
--     también `code` (el código secreto de retiro) y `auction_id`.
--   * notifications: "marcar como leída" dejaba reescribir también
--     `message`, `kind` y `auction_id` de tus propias notificaciones.
--   * auction_reactions: dejaba reescribir `auction_id`, no solo `reaction`.
--   * reports / suggestions: el INSERT dejaba mandar `status` de arranque
--     (los dos arrancan con default 'open'/'new'), evitando el default.
--
-- Ninguno de estos es tan grave como el de is_admin/is_premium (no hay
-- forma de tocar la fila de OTRO usuario), pero es la misma familia de
-- bug y vale la pena cerrarla en el mismo pase.

revoke update on public.tickets from anon, authenticated;
grant update (status, redeemed_at) on public.tickets to authenticated;

revoke update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

revoke update, insert on public.auction_reactions from anon, authenticated;
grant update (reaction) on public.auction_reactions to authenticated;
grant insert (user_id, auction_id, reaction) on public.auction_reactions to authenticated;

revoke insert on public.reports from anon, authenticated;
grant insert (auction_id, reporter_id, reason) on public.reports to authenticated;

revoke insert on public.suggestions from anon, authenticated;
grant insert (user_id, message) on public.suggestions to authenticated;
