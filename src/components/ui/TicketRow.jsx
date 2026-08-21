import { formatPrice } from "../../lib/format";
import Pill from "./Pill";

export default function TicketRow({ ticket, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg border-2 border-line bg-paper p-3 text-left transition hover:-translate-y-0.5"
    >
      <div className="min-w-0">
        <p className="line-clamp-1 text-[13px] font-extrabold text-ink">{ticket.card}</p>
        <p className="text-[11px] text-ink-soft">
          {ticket.isSeller ? "Vos vendiste" : `Vendedor: ${ticket.seller}`} · {formatPrice(ticket.price, ticket.currency)}
        </p>
      </div>
      {ticket.status === "pendiente" ? (
        <Pill tone="gold">Pendiente</Pill>
      ) : (
        <Pill tone="live">Entregado</Pill>
      )}
    </button>
  );
}
