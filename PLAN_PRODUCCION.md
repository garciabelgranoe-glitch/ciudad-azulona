# Plan de producción — Ciudad Azulona

Última actualización: 2026-07-09. Este documento es la guía para las tareas #37-#41
del roadmap (deploy real, backups, observabilidad, test de carga, lanzamiento).
Todo lo demás (features #1-#57) ya está terminado y probado en local.

Convención: cada paso dice **[VOS]** (necesita que Emiliano actúe — crear cuenta,
pagar, decidir) o **[YO]** (lo hace Claude en la sesión, una vez que el paso [VOS]
anterior esté resuelto).

Decisión ya tomada la sesión pasada: el canal de OTP va a ser **Twilio + WhatsApp**
(no SMS puro), porque:
- SMS a Argentina por Twilio no preserva el sender ID (llega de un número random) y
  cuesta ~US$0,10 por mensaje.
- WhatsApp vía Twilio cuesta ~US$0,008 por mensaje (~12x más barato) y Supabase Auth
  lo soporta nativamente cuando el proveedor es Twilio — no requiere código custom,
  es un toggle en la config del provider de Auth.
- Riesgo conocido: activar el WhatsApp Sender real (no sandbox) requiere verificación
  de Meta Business Manager, que puede tardar días. Mientras se aprueba, se puede
  probar todo con el WhatsApp Sandbox de Twilio (número compartido de test).

---

## Fase 1 — Cuenta de Twilio + canal WhatsApp

1. **[VOS]** Crear cuenta en [twilio.com](https://www.twilio.com). Vas a necesitar
   verificar tu identidad y cargar un método de pago (cobra por uso, no hay plan fijo).
2. **[VOS]** Dentro de la consola de Twilio: ir a **Messaging → Try it out → Send a
   WhatsApp message** para activar el **Sandbox de WhatsApp** — esto da acceso
   inmediato para testing sin esperar aprobación.
3. **[VOS]** En paralelo, iniciar el trámite del **WhatsApp Sender productivo**
   (Messaging → Senders → WhatsApp senders → Create new Sender). Pide verificar un
   Meta Business Manager — si no tenés uno para Ciudad Azulona, hay que crearlo en
   business.facebook.com primero. Puede tardar de días a semanas; no bloquea el resto
   del plan porque se puede lanzar con el Sandbox y migrar al Sender real después.
4. **[VOS]** Conseguir y guardar (no compartir en texto plano fuera de un gestor de
   secretos): **Account SID**, **Auth Token**, y el **número/Messaging Service SID**
   habilitado para WhatsApp.
5. **[YO]** Una vez que exista el proyecto Supabase real (Fase 2), configurar el
   provider de Auth: Dashboard → Authentication → Providers → Phone → habilitar,
   elegir **Twilio** como proveedor, canal **WhatsApp**, y cargar las credenciales
   del paso 4.
6. **[YO]** Probar el login end-to-end contra el sandbox/sender real antes de dar por
   cerrada la fase.

## Fase 2 — Proyecto Supabase real

1. **[VOS]** Crear cuenta/proyecto en [supabase.com](https://supabase.com).
2. **[VOS]** Elegir región del proyecto — recomendado la más cercana a Argentina que
   ofrezca el plan (típicamente São Paulo si está disponible; si no, la de EE.UU. más
   cercana). Esto afecta la latencia de todos los usuarios.
3. **[VOS]** Pasarme (o cargarlos vos directamente si preferís no compartirlos):
   `Project URL`, `anon public key`, `service_role key` del proyecto nuevo.
4. **[YO]** `supabase link` al proyecto real y `supabase db push` para aplicar las 29
   migraciones existentes (`supabase/migrations/0001...` a `0029_whatsapp_communities.sql`)
   en orden, tal cual están probadas en local.
5. **[YO]** Verificar en el proyecto real: políticas RLS activas en todas las tablas,
   el cron job de `close_expired_auctions()` corriendo (pg_cron), y la publicación
   `supabase_realtime` con las tablas correctas (`auctions`, `notifications`).
6. **[YO]** Recrear el bucket de Storage `auction-photos` con el mismo
   `file_size_limit` / `allowed_mime_types` que en local.
7. **[YO]** Configurar el provider de Twilio/WhatsApp en Auth (ver Fase 1, paso 5).
8. **[YO]** Actualizar `.env.local` (o las env vars del hosting elegido) con
   `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` del proyecto real.
9. **[VOS + YO]** Elegir hosting del frontend (Vercel o Netlify son las opciones más
   simples para un proyecto Vite) — **[VOS]** crea la cuenta, **[YO]** dejo el proyecto
   listo para deployar (build command, env vars documentadas).

## Fase 3 — Supabase Pro (backups)

1. **[VOS]** Decisión de pago: upgrade del proyecto a **Pro** (~US$25/mes) desde el
   dashboard de Supabase. Habilita backups diarios automáticos y sube los límites de
   Realtime/DB que vimos en la conversación sobre capacidad.
2. **[YO]** Verificar que los backups automáticos queden activos y entender cómo se
   restaura uno (dry-run mental, no hace falta probarlo en real).

## Fase 4 — Observabilidad (Sentry + analytics básico)

1. **[VOS]** Crear cuenta gratis en [sentry.io](https://sentry.io) y un proyecto tipo
   React.
2. **[VOS]** Pasarme el **DSN** del proyecto.
3. **[YO]** Instalar `@sentry/react`, inicializarlo en `src/main.jsx` (o donde
   corresponda), y capturar errores en los puntos más sensibles: fallos de RPC
   (`place_bid`, `buy_now_auction`, etc.), fallos de login/OTP, y errores no
   controlados de React (error boundary).
4. **[YO]** Analytics básico — evaluar si alcanza con algo simple tipo Plausible o
   Umami (liviano, sin cookies, apto para un proyecto chico) o si conviene esperar a
   tener tráfico real antes de sumar esta pieza. A decidir cuando lleguemos acá.

## Fase 5 — Test de carga

Requiere que la Fase 2 ya esté desplegada (no tiene sentido testear el ambiente local).

1. **[YO]** Armar un script de carga (k6 o Artillery) que simule:
   - Logins concurrentes vía OTP (ojo: cada uno gasta un mensaje de WhatsApp real —
     avisar antes de correrlo en volumen).
   - Pujas concurrentes sobre la misma subasta, para validar el lock
     `select ... for update` de `place_bid` bajo contención real.
   - Creación de subastas en paralelo, respetando el rate limit ya existente.
2. **[YO]** Correrlo fuera de horario de uso real, avisando en el grupo de admin.
3. **[YO]** Medir y documentar: latencia de `place_bid` bajo carga, conexiones
   Realtime simultáneas antes de degradar, y que el rate limiting (20 pujas/min,
   5 publicaciones/10min) siga respondiendo bien.
4. **[YO]** Con los resultados, ajustar la estimación de capacidad (~100-150
   concurrentes en Free / ~300-400 en Pro) con números reales en vez de teóricos.

## Fase 6 — Lanzamiento gradual (soft launch)

1. **[VOS]** Definir el grupo inicial: cuántas personas, quiénes (por ejemplo, el
   círculo cercano de vendedores de confianza antes de abrir al grupo grande de
   WhatsApp).
2. **[VOS]** Elegir fecha de arranque.
3. **[YO]** Checklist técnico final antes de invitar gente: RLS revisado, backups
   activos, Sentry recibiendo eventos, WhatsApp Sender aprobado (o sandbox
   funcionando como fallback), datos de ejemplo (blog/recomendados/sorteos)
   reemplazados por contenido real o borrados.
4. **[VOS]** Reemplazar los 3 links de ejemplo en "Comunidades de WhatsApp" por los
   grupos reales (quedaron cargados como placeholder para QA).

---

## Orden sugerido para la próxima sesión

Fase 1 y Fase 2 pueden arrancar en paralelo (vos gestionando cuentas en las dos
plataformas mientras yo dejo todo listo del lado de código). Fase 3 y 4 son rápidas
una vez que existe el proyecto real. Fase 5 depende de que 1-2 estén desplegadas.
Fase 6 es la última, cuando 1-5 estén cerradas.

Si arrancamos la próxima sesión, lo primero que necesito de vos para poder avanzar
en paralelo es: **cuenta de Twilio creada** (Fase 1, paso 1-2) y **proyecto de
Supabase creado** (Fase 2, paso 1-3) — con esas dos cosas ya puedo empezar a trabajar
mientras vos seguís con la verificación de Meta Business Manager en el fondo.
