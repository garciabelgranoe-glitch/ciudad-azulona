import { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";

// Vista: Preguntas frecuentes
export default function FaqView({ onBack }) {
  const [openId, setOpenId] = useState(null);

  const faqs = [
    {
      id: "pago",
      q: "¿Cómo pago o cobro una carta?",
      a: "Ciudad Azulona no procesa pagos ni maneja dinero. El precio que ves es el que se pactó pujando o al hacer claim; cómo y cuándo se paga (efectivo, transferencia, etc.) lo acuerdan vendedor y comprador directamente, por fuera de la plataforma, al coordinar la entrega.",
    },
    {
      id: "retiro",
      q: "¿Cómo retiro una carta que gané o claimeé?",
      a: "Cuando ganás una subasta, hacés claim o ganás un free claim, se genera un ticket con un código único en \"Mis tickets\". Mostrale ese código al vendedor al momento de retirar — es la forma de confirmar que la entrega es la correcta. El vendedor lo marca como entregado desde su lado.",
    },
    {
      id: "contacto",
      q: "¿Cómo me contacto con el comprador o vendedor?",
      a: "Al cerrarse una venta (claim, free claim o subasta ganada), comprador y vendedor pueden verse el alias y el teléfono de contacto entre sí (si lo cargaron en su perfil) desde el detalle del ticket, para coordinar día y lugar de entrega.",
    },
    {
      id: "modos",
      q: "¿Cuál es la diferencia entre Subasta, Venta directa y Free claim?",
      a: "Subasta: se puja y gana la oferta más alta al cerrar el tiempo. Venta directa (Claim): precio fijo, se la lleva quien la claimee primero, sin pujas. Free claim: es gratis — el vendedor define un número ganador oculto (0 a 50) y quien reclame justo en esa posición se la lleva sin pagar.",
    },
    {
      id: "lotes",
      q: "¿Qué son los lotes?",
      a: "Una publicación con varias cartas sueltas (hasta 10) agrupadas, cada una con su propio precio — quien quiera una la claimea directo, sin pujas. Es una opción para vendedores Premium con muchas cartas para publicar de una sola vez.",
    },
    {
      id: "ciudad",
      q: "¿Para qué sirve cargar mi ciudad?",
      a: "Se usa para que los compradores puedan filtrar la grilla por ciudad y encuentren vendedores cerca suyo. Se configura en Mi perfil → Retiro de la carta → Editar. Si tu ciudad ya tiene puntos de retiro cargados por el equipo, también podés elegir uno específico.",
    },
    {
      id: "premium",
      q: "¿Qué diferencia tiene una cuenta Premium?",
      a: "Las cuentas Premium tienen una insignia distintiva en su perfil y publicaciones, y pueden publicar lotes de hasta 10 cartas en una sola publicación.",
    },
    {
      id: "editar",
      q: "¿Puedo editar o cancelar una publicación?",
      a: "Sí, mientras siga en vivo y todavía no tenga pujas (o reclamos, en el caso de free claim). Lo encontrás en el detalle de tu propia publicación.",
    },
    {
      id: "republicar",
      q: "¿Puedo republicar una carta que no se vendió?",
      a: "Sí. Entrá al detalle de una publicación tuya ya cerrada y usá \"Republicar esta carta\" — reutiliza la misma foto y ficha, solo te pide precio y duración nuevos.",
    },
    {
      id: "denuncia",
      q: "¿Qué hago si veo una publicación sospechosa?",
      a: "Podés denunciarla desde el detalle de la subasta (\"Denunciar esta subasta\"). El equipo revisa las denuncias y puede suspender cuentas que incumplan las reglas de la comunidad.",
    },
    {
      id: "ranking",
      q: "¿Cómo funciona el Ranking?",
      a: "Muestra el top 10 de vendedores y el top 10 de compradores por volumen acumulado en entregas ya confirmadas (no cuenta lo que todavía está pendiente de retiro).",
    },
    {
      id: "moneda",
      q: "¿Puedo publicar en dólares?",
      a: "Sí, al crear una publicación elegís si el precio es en pesos o en dólares — se puja o se claimea en esa misma moneda.",
    },
  ];

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">PREGUNTAS FRECUENTES</p>
      </header>

      <div className="px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Las dudas más comunes sobre cómo se usa la plataforma. Si te queda algo sin resolver, mandanos una sugerencia o escribinos por WhatsApp.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {faqs.map((f) => (
            <div key={f.id} className="overflow-hidden rounded-lg border-2 border-line bg-paper">
              <button
                onClick={() => setOpenId((id) => (id === f.id ? null : f.id))}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
              >
                <span className="text-[13px] font-bold text-ink">{f.q}</span>
                <ChevronDown size={16} className={`shrink-0 text-ink-soft transition ${openId === f.id ? "rotate-180" : ""}`} />
              </button>
              {openId === f.id && (
                <p className="px-4 pb-3.5 text-[12.5px] leading-relaxed text-ink-soft">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
