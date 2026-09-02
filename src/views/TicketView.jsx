import { useState } from "react";
import { ArrowLeft, Check, QrCode, Star, MessageCircle } from "lucide-react";
import GenderIcon from "../components/GenderIcon";
import { formatPrice } from "../lib/format";
import Pill from "../components/ui/Pill";
import PickupInfoText from "../components/ui/PickupInfoText";

// Normaliza a como espera wa.me: solo dígitos, con 549 adelante si todavía
// no lo tiene (mismo formato que ya se usa en el resto de la app).
function buildWhatsappLink(phone, message) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("54") ? digits : `549${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

// Vista: Ticket de retiro (signature element)
export default function TicketView({ ticket, onBack, onMarkDelivered, busy = false, showRatingPrompt = false, onSubmitRating, ratingBusy = false, onOpenUserProfile }) {
  const delivered = ticket.status === "entregado";
  const [score, setScore] = useState(0);
  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">COMPROBANTE DE RETIRO</p>
      </header>

      <div className="px-5 pt-6">
        {/* Ticket con borde perforado */}
        <div className="relative mx-auto max-w-sm">
          <div className="rounded-t-2xl border-2 border-b-0 border-ink bg-paper p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-soft">
                {ticket.isSeller ? "Vendiste esta carta" : "Ganaste esta carta"}
              </p>
              {delivered ? <Pill tone="live"><Check size={11} /> Entregado</Pill> : <Pill tone="gold">Pendiente de retiro</Pill>}
            </div>
            <h3 className="mt-3 text-lg font-extrabold text-ink">{ticket.card}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-soft">
              Vendedor:
              <GenderIcon gender={ticket.sellerGender} size={13} />
              {onOpenUserProfile && ticket.sellerId ? (
                <button
                  onClick={() => onOpenUserProfile(ticket.sellerId)}
                  className="font-bold text-ink underline decoration-line decoration-dotted underline-offset-2 hover:text-forest-deep"
                >
                  {ticket.seller}
                </button>
              ) : (
                <span className="font-bold text-ink">{ticket.seller}</span>
              )}
            </p>
            {ticket.isSeller && (
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-soft">
                Comprador:
                <GenderIcon gender={ticket.buyerGender} size={13} />
                {onOpenUserProfile && ticket.buyerId ? (
                  <button
                    onClick={() => onOpenUserProfile(ticket.buyerId)}
                    className="font-bold text-ink underline decoration-line decoration-dotted underline-offset-2 hover:text-forest-deep"
                  >
                    {ticket.buyer}
                  </button>
                ) : (
                  <span className="font-bold text-ink">{ticket.buyer}</span>
                )}
              </p>
            )}
            <p className="text-[13px] text-ink-soft">Precio final: <span className="font-bold text-forest-deep">{formatPrice(ticket.price, ticket.currency)}</span></p>
            <p className="mt-1 text-[11px] text-ink-soft">Cerrado {ticket.closedAt}</p>
          </div>

          {/* Perforación */}
          <div className="relative h-0 border-t-2 border-dashed border-line">
            <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-cream" />
            <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-cream" />
          </div>

          <div className="flex flex-col items-center rounded-b-2xl border-2 border-t-0 border-ink bg-paper p-6 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-soft">Código de retiro</p>
            <p className="font-pixel mt-3 text-2xl tracking-[0.1em] text-ink">{ticket.code}</p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-soft">
              <QrCode size={13} /> Mostrá este código en el stand del vendedor
            </div>
          </div>
        </div>

        {!delivered && ticket.isSeller === false && (
          <div className="mx-auto mt-6 max-w-sm rounded-lg border-2 border-line bg-paper p-3 text-[12px] leading-relaxed text-ink-soft">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Cómo coordinar el retiro</p>
            <PickupInfoText
              profile={{
                has_stand: ticket.sellerHasStand,
                stand_number: ticket.sellerStandNumber,
                pickup_day: ticket.sellerPickupDay,
                pickup_time: ticket.sellerPickupTime,
                contact_phone: ticket.sellerContactPhone,
                city: ticket.sellerCity,
                pickup_point: ticket.sellerPickupPointName ? { name: ticket.sellerPickupPointName } : null,
              }}
            />
          </div>
        )}

        {!delivered && ticket.isSeller && (
          <div className="mx-auto mt-6 max-w-sm rounded-lg border-2 border-line bg-paper p-3 text-[12px] leading-relaxed text-ink-soft">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Cómo contactar al comprador</p>
            {ticket.buyerContactPhone ? (
              <a
                href={buildWhatsappLink(
                  ticket.buyerContactPhone,
                  `Hola ${ticket.buyer}! Te contacto por la compra de "${ticket.card}" en Ciudad Azulona para coordinar la entrega.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-forest-deep underline decoration-line decoration-dotted underline-offset-2 hover:text-forest-mid"
              >
                <MessageCircle size={14} /> {ticket.buyerContactPhone}
              </a>
            ) : (
              <>Todavía no cargó un teléfono de contacto — podés escribirle desde su perfil o coordinar con el código al retirar.</>
            )}
          </div>
        )}

        {!delivered && (ticket.isSeller || ticket.isSeller === undefined) && (
          <button
            onClick={onMarkDelivered}
            disabled={busy}
            className="mx-auto mt-6 block rounded-lg bg-gold px-5 py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
          >
            {busy ? "Confirmando..." : "Vendedor: confirmar entrega"}
          </button>
        )}
        {!delivered && ticket.isSeller === false && (
          <p className="mx-auto mt-6 max-w-sm text-center text-[12px] text-ink-soft">
            Mostrale este código al vendedor cuando vayas a retirar la carta.
          </p>
        )}

        {delivered && showRatingPrompt && (
          <div className="mx-auto mt-6 max-w-sm rounded-xl border-2 border-line bg-paper p-4 text-center">
            <p className="text-[12px] text-ink-soft">¿Cómo te fue con {ticket.seller}?</p>
            <div className="mt-2 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setScore(n)} className="p-1">
                  <Star
                    size={22}
                    fill={n <= score ? "currentColor" : "none"}
                    className={n <= score ? "text-gold-dark" : "text-line"}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={() => onSubmitRating(score)}
              disabled={!score || ratingBusy}
              className="mt-3 rounded-lg bg-gold px-4 py-2 text-[12px] font-extrabold text-forest-deep shadow-[0_3px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[2px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
            >
              {ratingBusy ? "Enviando..." : "Calificar"}
            </button>
          </div>
        )}

        <p className="mx-auto mt-5 max-w-sm text-center text-[12px] leading-relaxed text-ink-soft">
          Este código es único y de un solo uso. No lo compartas hasta estar frente al vendedor.
        </p>
      </div>
    </div>
  );
}
