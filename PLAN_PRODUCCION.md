# Plan de producción — Ciudad Azulona

Última actualización: 2026-07-10. Este documento es la guía para las tareas #37-#41
del roadmap (deploy real, backups, observabilidad, test de carga, lanzamiento).
Todo lo demás (features #1-#57) ya está terminado y probado en local.

Convención: cada paso dice **[VOS]** (necesita que Emiliano actúe — crear cuenta,
pagar, decidir) o **[YO]** (lo hace Claude en la sesión, una vez que el paso [VOS]
anterior esté resuelto).

**Decisión tomada el 2026-07-10: el login es por email con código (OTP), no por
teléfono.** Reemplaza la decisión anterior de usar Twilio + WhatsApp. Motivo:
- Email por Supabase es prácticamente gratis (built-in para volumen chico, o un
  proveedor SMTP tipo Resend con free tier generoso para volumen real) y evita
  todos los problemas de entrega de SMS a Argentina que habíamos investigado
  (sender ID random, costo por mensaje, espera de aprobación de Meta Business
  Manager para WhatsApp).
- El teléfono se sigue pidiendo en el alta, pero ahora es un dato de contacto
  (`profiles.phone`) para coordinar entregas — no el método de login.
- Ya implementado y probado en local: `AuthContext`/`Login.jsx` migrados a
  `signInWithOtp({ email })` + `verifyOtp({ email, token, type: "email" })`,
  columna `profiles.phone` (NOT NULL, con backfill para las cuentas de prueba
  viejas), y una plantilla de mail custom (`supabase/templates/magic_link.html`)
  que muestra el código en grande en vez de un link — mismo look & feel que
  tendría un SMS.
- **Nota técnica importante:** los cambios de plantilla de mail en `config.toml`
  necesitan un `supabase stop` + `supabase start` completo para aplicarse —
  un `docker restart` del contenedor de auth NO alcanza (no regenera las env
  vars que apuntan al archivo de plantilla).
- Nota de privacidad pendiente: `profiles.phone` y `profiles.contact_phone`
  quedan expuestos por la misma política RLS pública que el resto de `profiles`
  (`USING (true)`) — la app no los muestra en la UI a otros usuarios, pero
  técnicamente son legibles vía API por cualquier usuario logueado. Es un gap
  preexistente (ya aplicaba a `contact_phone` antes de este cambio), no crítico
  para una comunidad chica de confianza, pero vale la pena resolverlo antes del
  lanzamiento grande (Fase 6).
- Twilio/WhatsApp queda como alternativa de respaldo si la entrega por email
  resulta poco confiable en la práctica — no se descarta el trabajo de
  investigación ya hecho, solo se pospone.

**Arrancamos por la Fase 0** (prueba privada con 3-4 amigos) antes de la
producción completa. Con el pivot a email, la Fase 0 quedó mucho más simple: **ya
no hace falta Twilio para nada** — solo un proyecto de Supabase y hosting del
frontend, los dos gratis.

---

## Fase 0 — Prueba privada con 3-4 amigos (arrancamos por acá)

Objetivo: tener un link público real, con login por email funcionando, para que
un puñado de gente de confianza lo use antes de encarar el lanzamiento grande.
Nada de esto es trabajo perdido — es la base de la Fase 2 de más abajo, hecha en
versión gratis.

1. **[VOS]** Crear cuenta/proyecto gratis en [supabase.com](https://supabase.com),
   eligiendo la región más cercana a Argentina disponible.
2. **[VOS]** Pasarme `Project URL`, `anon public key` y `service_role key` del
   proyecto nuevo.
3. **[YO]** Aplicar las 30 migraciones a ese proyecto (`supabase link` + `supabase
   db push`), recrear el bucket de Storage, subir la plantilla de mail
   `magic_link.html`, y dejar RLS/cron/Realtime verificados.
4. **[YO]** Confirmar que el envío de email built-in de Supabase alcanza para 3-4
   personas (tiene rate limit bajo pero para este volumen sobra). Si no,
   conectar un SMTP gratis (Resend tiene free tier de sobra para esto).
5. **[VOS]** Crear cuenta gratis en Vercel o Netlify.
6. **[YO]** Dejar el frontend deployado ahí, con `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` del proyecto de este paso, y pasarte el link público.
7. **[VOS]** Avisarles a tus 3-4 amigos (con sus mails, ya no hace falta verificar
   números en ningún lado) y probarlo en vivo con ellos.

**Lo que NO hace falta para esta fase:** Twilio, Supabase Pro, Sentry, test de
carga. Eso queda para cuando decidamos ir a producción para el público en general.

---

## Fase 1 — Proyecto Supabase real (producción completa)

1. **[VOS]** Crear cuenta/proyecto en [supabase.com](https://supabase.com) — si ya
   existe el de la Fase 0, es el mismo, no hay que crear uno nuevo.
2. **[VOS]** Elegir región del proyecto — recomendado la más cercana a Argentina
   que ofrezca el plan (típicamente São Paulo si está disponible; si no, la de
   EE.UU. más cercana). Esto afecta la latencia de todos los usuarios.
3. **[VOS]** Pasarme (o cargarlos vos directamente si preferís no compartirlos):
   `Project URL`, `anon public key`, `service_role key` del proyecto.
4. **[YO]** `supabase link` al proyecto real y `supabase db push` para aplicar las
   30 migraciones existentes (`supabase/migrations/0001...` a
   `0030_email_auth.sql`) en orden, tal cual están probadas en local.
5. **[YO]** Verificar en el proyecto real: políticas RLS activas en todas las
   tablas, el cron job de `close_expired_auctions()` corriendo (pg_cron), y la
   publicación `supabase_realtime` con las tablas correctas (`auctions`,
   `notifications`).
6. **[YO]** Recrear el bucket de Storage `auction-photos` con el mismo
   `file_size_limit` / `allowed_mime_types` que en local.
7. **[YO]** Confirmar la plantilla de mail `magic_link.html` aplicada, y evaluar
   si para volumen de producción real conviene un SMTP propio (Resend/Postmark)
   en vez del envío built-in de Supabase, que tiene límites bajos pensados solo
   para desarrollo.
8. **[YO]** Actualizar `.env.local` (o las env vars del hosting elegido) con
   `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` del proyecto real.
9. **[VOS + YO]** Elegir hosting del frontend (Vercel o Netlify son las opciones
   más simples para un proyecto Vite) — **[VOS]** crea la cuenta, **[YO]** dejo el
   proyecto listo para deployar (build command, env vars documentadas).

## Fase 2 — Supabase Pro (backups)

1. **[VOS]** Decisión de pago: upgrade del proyecto a **Pro** (~US$25/mes) desde
   el dashboard de Supabase. Habilita backups diarios automáticos y sube los
   límites de Realtime/DB que vimos en la conversación sobre capacidad.
2. **[YO]** Verificar que los backups automáticos queden activos y entender cómo
   se restaura uno (dry-run mental, no hace falta probarlo en real).

## Fase 3 — Observabilidad (Sentry + analytics básico)

1. **[VOS]** Crear cuenta gratis en [sentry.io](https://sentry.io) y un proyecto
   tipo React.
2. **[VOS]** Pasarme el **DSN** del proyecto.
3. **[YO]** Instalar `@sentry/react`, inicializarlo en `src/main.jsx` (o donde
   corresponda), y capturar errores en los puntos más sensibles: fallos de RPC
   (`place_bid`, `buy_now_auction`, etc.), fallos de login/OTP, y errores no
   controlados de React (error boundary).
4. **[YO]** Analytics básico — evaluar si alcanza con algo simple tipo Plausible o
   Umami (liviano, sin cookies, apto para un proyecto chico) o si conviene
   esperar a tener tráfico real antes de sumar esta pieza. A decidir cuando
   lleguemos acá.

## Fase 4 — Test de carga

Requiere que la Fase 1 ya esté desplegada (no tiene sentido testear el ambiente
local).

1. **[YO]** Armar un script de carga (k6 o Artillery) que simule:
   - Logins concurrentes vía OTP por email.
   - Pujas concurrentes sobre la misma subasta, para validar el lock
     `select ... for update` de `place_bid` bajo contención real.
   - Creación de subastas en paralelo, respetando el rate limit ya existente.
2. **[YO]** Correrlo fuera de horario de uso real, avisando en el grupo de admin.
3. **[YO]** Medir y documentar: latencia de `place_bid` bajo carga, conexiones
   Realtime simultáneas antes de degradar, y que el rate limiting (20 pujas/min,
   5 publicaciones/10min) siga respondiendo bien.
4. **[YO]** Con los resultados, ajustar la estimación de capacidad (~100-150
   concurrentes en Free / ~300-400 en Pro) con números reales en vez de teóricos.

## Fase 5 — Lanzamiento gradual (soft launch)

1. **[VOS]** Definir el grupo inicial: cuántas personas, quiénes (por ejemplo, el
   círculo cercano de vendedores de confianza antes de abrir al grupo grande de
   WhatsApp).
2. **[VOS]** Elegir fecha de arranque.
3. **[YO]** Checklist técnico final antes de invitar gente: RLS revisado, backups
   activos, Sentry recibiendo eventos, entrega de email confiable (SMTP propio si
   hizo falta), datos de ejemplo (blog/recomendados/sorteos) reemplazados por
   contenido real o borrados, y revisar la exposición de `profiles.phone`/
   `contact_phone` mencionada arriba.
4. **[VOS]** Reemplazar los 3 links de ejemplo en "Comunidades de WhatsApp" por
   los grupos reales (quedaron cargados como placeholder para QA).

---

## Orden sugerido

**Ahora: Fase 0**, para tener el link de prueba con amigos cuanto antes. Lo único
que necesito de vos para poder avanzar es el **proyecto de Supabase creado**
(Fase 0, paso 1-2) — con eso ya puedo dejar todo migrado y el link de prueba
listo, sin depender de ninguna otra cuenta externa.

**Más adelante, cuando decidamos ir a producción para el público en general:**
gran parte de la Fase 1 ya va a estar hecha desde la Fase 0 (mismo proyecto,
solo hay que confirmar el SMTP para volumen real). Fase 2 y 3 son rápidas una vez
resuelta la 1. Fase 4 depende de que 1 esté desplegada. Fase 5 es la última,
cuando 1-4 estén cerradas.
