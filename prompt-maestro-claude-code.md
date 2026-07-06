# Prompt maestro — Plataforma de subastas para comunidad TCG Pokémon

Copiá todo este documento y pegalo como primer mensaje a Claude Code en un proyecto nuevo.

---

## Contexto

Estoy construyendo una web app para una comunidad de coleccionistas y jugadores de TCG Pokémon en Argentina. Hoy esta comunidad organiza subastas y ventas de cartas a través de varios grupos de WhatsApp. El proceso funciona pero es caótico: las subastas se pierden en el scroll de mensajes, no hay forma clara de saber quién ganó qué, y la entrega en persona (en eventos presenciales) se valida pidiendo "los últimos 4 dígitos del teléfono", lo cual es inseguro porque cualquiera que vio el chat puede verlos.

**No quiero competir con WhatsApp ni reemplazarlo.** La comunidad ya confía en esos grupos y no se va a ir. Quiero construir una herramienta que viva *al lado*: la gente sigue charlando y avisando por WhatsApp, pero comparte un link a esta plataforma para que la subasta en sí (pujas, cierre, ganador) quede ordenada, y para generar un código de retiro único y no falsificable que reemplace los "4 dígitos del teléfono".

**No voy a manejar pagos dentro de la plataforma en esta etapa.** El dinero se sigue intercambiando en persona (efectivo o transferencia) en el momento de la entrega. La plataforma solo coordina y da prueba de identidad/transacción — cero responsabilidad regulatoria de pagos por ahora.

## Objetivo del MVP (en este orden de prioridad)

1. **Crear y publicar una subasta**: nombre de la carta, foto, precio base, duración/hora de cierre.
2. **Pujar en una subasta activa**: ver puja actual, pujar por encima del mínimo, ver countdown.
3. **Cierre automático y generación de ticket**: al cerrar, se determina el ganador y se genera un código de retiro único (tipo ticket con QR o código alfanumérico corto, fácil de leer en voz alta en un ambiente ruidoso).
4. **Confirmación de entrega**: el vendedor "canjea" el código cuando entrega la carta en persona. Una vez canjeado, no se puede volver a usar.
5. **Perfil básico con reputación**: nombre/alias, cantidad de ventas/compras completadas, rating simple. Esto es la base de confianza que hoy no existe.

Explícitamente **fuera de alcance para el MVP** (no lo construyas todavía, aunque se te ocurran ideas relacionadas):
- Procesamiento de pagos o escrow.
- Chat interno (seguimos usando WhatsApp para eso).
- App nativa — es web responsive, mobile-first.
- Sistema de disputas complejo — por ahora, solo un estado "reportar problema" que quede registrado, sin resolución automática.
- Catálogo/marketplace de precio fijo — arrancamos solo con subastas.

## Usuarios y su contexto real de uso

- La gente va a usar esto **desde el celular, muchas veces con mala señal, en un evento con mucho ruido y poco tiempo**. Prioriza velocidad de carga, poco texto, tap targets grandes, y que el código de retiro se pueda leer/mostrar en 2 segundos sin scrollear.
- La identidad de login debería apoyarse en lo que ya usan: número de WhatsApp (con OTP) es preferible a email/contraseña.
- Muchos vendedores van a publicar varias subastas seguidas desde el mismo stand — el flujo de "crear subasta" tiene que ser rapidísimo (sacar foto, poner precio, publicar).

## Stack sugerido (podés proponer alternativas si tenés una razón concreta)

- Frontend: React + Vite, Tailwind para estilos.
- Backend/datos: Supabase (Postgres + Auth + Storage para fotos + Realtime para ver pujas en vivo) — elegido para no tener que mantener infraestructura propia en esta etapa temprana.
- Hosting: Vercel o Netlify.
- Sin app nativa; PWA instalable como mejora posterior, no como requisito inicial.

## Ya tengo un prototipo visual de referencia

Adjunto un archivo `tcg-subastas-prototipo.jsx` con el diseño visual y los 3 flujos principales (lista de subastas, detalle + pujar, ticket de retiro) ya pensados: paleta oscura, tipografía display + sans, tarjetas con proporción de carta TCG real, y el ticket de retiro con estética de comprobante perforado. Usalo como referencia de dirección visual y de estructura de componentes, pero sentite libre de mejorarlo técnicamente (estado real, conexión a backend, validaciones) en vez de copiarlo literal.

## Cómo quiero que trabajes

1. Antes de escribir código, proponeme el modelo de datos (tablas/entidades) en base a lo de arriba y esperá mi confirmación o ajustes.
2. Construí en este orden: modelo de datos → auth básica → crear subasta → ver y pujar → cierre y generación de ticket → confirmación de entrega → perfil/reputación.
3. Después de cada bloque funcional, mostrame cómo probarlo antes de seguir al siguiente — no avances múltiples features sin que yo pueda ver algo andando.
4. Si en el camino ves un problema de seguridad relevante (por ejemplo: alguien podría pujar como otra persona, o falsificar un ticket), avisame antes de resolverlo con una solución compleja — prefiero soluciones simples que alcancen para un MVP de comunidad real, no arquitectura de nivel enterprise.
5. Preguntame si algo del alcance no está claro, en vez de asumir y construir de más.

## Cómo pienso monetizar (para que tengas el contexto, no para que lo construyas ahora)

Fase 1 gratis para construir adopción y confianza. Fase 2, si hay tracción: comisión chica (3-5%) opcional sobre transacciones cerradas en la plataforma. Fase 3: destacar publicaciones o suscripción para vendedores frecuentes. No hace falta construir nada de esto en el MVP — es solo para que entiendas hacia dónde va el producto y no cierres puertas de diseño que lo compliquen después (por ejemplo, dejar el modelo de transacción con un campo de estado que después pueda soportar una comisión, sin necesidad de rediseñar).
