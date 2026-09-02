# Inventario de servicios externos

De qué depende Ciudad Azulona para funcionar, quién tiene la cuenta, y
dónde vive cada credencial. Pensado para que un desarrollador nuevo (o un
comprador haciendo due diligence) entienda el mapa completo sin tener que
preguntar todo por WhatsApp.

**Nota:** ningún valor real de credencial va en este archivo — solo el
*nombre* de la variable/secret y dónde se configura. Los valores viven
únicamente en Supabase (Edge Function secrets) o en Vercel (env vars).

---

## Supabase — base de datos, auth, storage, funciones

- **Qué hace:** todo el backend. Postgres (con Row Level Security en
  cada tabla), autenticación por OTP de email, Storage para las fotos de
  cartas, Realtime para pujas/notificaciones en vivo, Edge Functions para
  lo que necesita un secret server-side, y `pg_cron` para cerrar subastas
  vencidas automáticamente.
- **Proyecto:** `xdwmnneczcpdidvynvza`, región `us-east-1`.
- **Cuenta:** _completar — quién es el dueño de la cuenta de Supabase._
- **Plan:** _completar — Free o Pro. Si es Free, no hay backups diarios
  automáticos (ver Fase 2 de `PLAN_PRODUCCION.md`)._
- **Credenciales relevantes:**
  - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — públicas, en `.env.local` y en las env vars de Vercel.
  - `service_role key` — **secreta**, no debería estar en ningún `.env` ni en el repo. Solo hace falta para scripts administrativos puntuales.
- **Dónde se administra:** [supabase.com/dashboard](https://supabase.com/dashboard)

## Vercel — hosting del frontend

- **Qué hace:** sirve el build estático de Vite en `www.ciudadazulona.com`.
- **Cuenta:** _completar — quién es el dueño._
- **Deploy:** manual, `npx vercel@latest --prod` desde una terminal con un
  token de acceso. **Ese token hoy necesita rotarse** (quedó expuesto
  durante trabajo de desarrollo — ver el checklist de venta).
- **Dónde se administra:** [vercel.com/dashboard](https://vercel.com/dashboard)

## Resend — envío de emails

- **Qué hace:** SMTP para dos cosas: (1) los códigos de login (OTP) que
  manda Supabase Auth, y (2) el email al vendedor cuando le hacen claim a
  una carta (`supabase/functions/notify-claim`).
- **Cuenta:** la del dueño del proyecto — ya tiene dominio propio
  verificado (se confirmó al probar el envío del email de claim).
- **Credenciales:** `RESEND_API_KEY` — cargada como secret de la Edge
  Function `notify-claim` en Supabase (2026-09-02), y configurada
  también como SMTP custom en Supabase Auth para los códigos de login.
- **Estado del dominio de envío:** verificado — el remitente
  `notificaciones@ciudadazulona.com` entrega a cualquier casilla, no
  depende del remitente compartido `onboarding@resend.dev`.
- **Dónde se administra:** [resend.com](https://resend.com)

## Google AI Studio (Gemini) — reconocimiento de carta por foto

- **Qué hace:** la Edge Function `scan-card` le manda la foto de portada
  al modelo Gemini para autocompletar nombre/set/número/año/rareza/idioma
  en el formulario de publicación.
- **Cuenta:** _completar._
- **Credenciales:** `GEMINI_API_KEY` — secret de la Edge Function
  `scan-card` en Supabase.
- **Costo:** capa gratuita disponible; en plan pago, fracciones de
  centavo por escaneo (ver el historial de esta conversación para el
  detalle de precios investigado).
- **Dónde se administra:** [aistudio.google.com](https://aistudio.google.com/apikey)

## Mercado Pago — cobro de Cuenta Pro y Tienda destacada

- **Qué hace:** tres links de checkout (Pro mensual, Pro anual, Tienda
  anual) a los que se redirige desde la sección "Hazte Pro" de la app.
- **Cuenta:** la cuenta de Mercado Pago del dueño actual — los planes de
  suscripción están atados a esa cuenta/CBU.
- **Activación post-pago:** **manual.** No hay webhook conectado todavía,
  así que cuando alguien paga, hay que ir al panel admin y marcarlo Premium
  (pestaña Usuarios) o sumarlo a Vendedores garantizados (pestaña
  Recomendados) a mano.
- **Importante para una venta:** estos links no se transfieren — un nuevo
  dueño necesita su propia cuenta de Mercado Pago y hay que recrear los
  planes ahí.

## Ximilar — ya no se usa

- Se probó primero para el reconocimiento de cartas, pero el plan Free no
  incluía esa función específica (solo "AI Card Grading"). Se reemplazó
  por Gemini. Un token de esta cuenta se compartió por error durante las
  pruebas — confirmar que esté revocado (ver checklist de venta, Fase 0).

## Twilio — investigado, no implementado

Se evaluó para login por SMS/WhatsApp, pero se descartó en favor de OTP
por email (más simple, sin costos de entrega a Argentina, sin esperar
aprobación de Meta para WhatsApp Business). No hay ninguna cuenta ni
credencial activa hoy. Ver la decisión completa en `PLAN_PRODUCCION.md`.

## Dominio — ciudadazulona.com

- **Registrador:** _completar._
- **DNS:** apuntando a Vercel.

---

## Cómo actualizar este documento

Cada vez que se suma un servicio nuevo (otra API, otro proveedor de
pagos, etc.), agregarlo acá con la misma estructura: qué hace, quién es
dueño de la cuenta, qué variable/secret usa, y dónde se administra.
