# Ciudad Azulona

Plataforma de subastas y venta de cartas Pokémon TCG para la comunidad
argentina — publicás una carta (o un lote), la comunidad puja o la compra,
y coordinan la entrega en persona. Frontend en React/Vite, backend 100%
en Supabase (Postgres + Auth + Storage + Realtime + Edge Functions).

**En producción:** https://www.ciudadazulona.com

> **Estado del repositorio:** hoy este código vive solo en esta máquina —
> no hay ningún remoto (GitHub u otro) configurado. Eso significa cero
> backup del historial y ninguna forma de compartir el repo sin copiar la
> carpeta a mano. Es de las primeras cosas a resolver.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS. `src/App.jsx` (~4.850
  líneas, bajando de a poco — ver "Deuda técnica conocida" más abajo)
  todavía tiene el componente raíz y las pantallas de admin, pero las 17
  pantallas públicas ya están separadas en `src/views/`, y los componentes
  chicos reutilizables en `src/components/ui/`.
- **Backend:** Supabase — Postgres con Row Level Security, Auth por OTP de
  email, Storage para fotos, Realtime para pujas/notificaciones en vivo, y
  Edge Functions (Deno) para lo que necesita un secret del lado del
  servidor.
- **Hosting:** Vercel (build estático de Vite).
- **Otros servicios:** ver [`docs/SERVICIOS.md`](docs/SERVICIOS.md) — qué
  hace cada uno y dónde vive cada credencial.

## Estructura

```
src/
  App.jsx              # componente raíz + pantallas de admin (pendiente de terminar de partir)
  views/                # las 17 pantallas públicas, una por archivo
  lib/
    auctions.js         # toda la capa de acceso a Supabase (queries + RPCs)
    supabaseClient.js   # cliente de Supabase
    pokemonSets.js       # catálogo local de sets para el autocompletado
    format.js            # formatPrice/formatARS/formatCountdown
    giveaways.js          # helpers de sorteos (texto de requisitos, compartir)
  components/
    ui/                  # componentes chicos reutilizables (uno por archivo)
    (iconos, Login, Landing, etc. — ya estaban acá)
  context/
    AuthContext.jsx     # sesión + perfil del usuario logueado
supabase/
  migrations/           # historial completo de la base, en orden (0001...)
  functions/             # Edge Functions (Deno)
    notify-claim/         # email al vendedor cuando le hacen claim a una carta
    scan-card/             # reconocimiento de carta por foto (Gemini)
```

## Requisitos

- Node 18+
- Acceso al proyecto de Supabase (pedilo si no lo tenés)
- [Supabase CLI](https://supabase.com/docs/guides/cli) si vas a tocar la base

## Levantar el proyecto en local

```bash
npm install
cp .env.example .env.local   # completar con las credenciales reales (ver abajo)
npm run dev
```

### Variables de entorno (`.env.local`)

| Variable | De dónde sale |
|---|---|
| `VITE_SUPABASE_URL` | Dashboard de Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Mismo lugar, la key "anon public" |

Ambas son públicas por diseño (terminan en el bundle del cliente) — la
seguridad real la da Row Level Security en Postgres, no estas keys.

## Base de datos y migraciones

Cada cambio de esquema es un archivo nuevo en `supabase/migrations/`,
numerado en orden. **Hoy el proceso para aplicar una migración a
producción es manual:** se pega el SQL directo en el SQL Editor del
dashboard de Supabase. La CLI ya está vinculada al proyecto
(`supabase link`), así que de acá en adelante las migraciones nuevas se
pueden aplicar con `supabase db push` en vez de pegar SQL a mano — ver
`docs/SERVICIOS.md`.

## Edge Functions

Viven en `supabase/functions/` y se deployan a mano (dashboard o CLI, no
hay CI todavía). Cada una necesita sus propios secrets cargados en
Supabase (Project Settings → Edge Functions → Secrets) — el detalle de
cuáles, en `docs/SERVICIOS.md`.

## Deploy del frontend

También manual, hoy:

```bash
npx vercel@latest --prod
```

(requiere estar logueado con `vercel login`, o pasar `--token`).

## Deuda técnica conocida

Para que quien lea esto no se sorprenda:

- **`App.jsx` todavía tiene el componente raíz, el panel admin, y las 5
  pantallas más grandes/críticas** (~4.850 líneas, bajando — ya se
  sacaron los componentes chicos a `components/ui/`, los helpers a
  `lib/format.js`/`lib/giveaways.js`, y 17 pantallas públicas a
  `src/views/`). Falta mover `AuctionList`, `AuctionDetail`,
  `CreateAuction`, `CreateLotView` y `EditAuction` (se dejaron para el
  final por ser las más grandes y las que más tráfico real reciben — se
  quiso hacerlas con más cuidado, no apuradas al cierre de una sesión de
  refactor), las ~11 sub-vistas del panel admin, y después achicar el
  componente raíz `App` (que hoy junta ~1.000 líneas de estado y handlers
  antes de su JSX) a custom hooks.
- **No hay tests automatizados** — toda verificación hoy es manual.
- **No hay CI/CD ni ambiente de staging** — se deploya directo a
  producción a mano.
- **No hay monitoreo de errores** (Sentry o similar) todavía.

Nada de esto es urgente para seguir operando, pero es lo primero que
conviene resolver antes de sumar a alguien nuevo al proyecto — un
desarrollador, un socio, o un comprador.

## Licencia / propiedad

Proyecto privado, todos los derechos reservados.
