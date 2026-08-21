import { ArrowLeft } from "lucide-react";
import TicketRow from "../components/ui/TicketRow";

// Vista: Mis tickets (todos, no solo el primero pendiente)
export default function MyTicketsView({ tickets, onBack, onOpenTicket }) {
  const toPickup = tickets.filter((t) => !t.isSeller && t.status === "pendiente");
  const toDeliver = tickets.filter((t) => t.isSeller && t.status === "pendiente");
  const delivered = tickets.filter((t) => t.status === "entregado");

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">MIS TICKETS</p>
      </header>

      <div className="space-y-5 px-5 pt-6">
        {tickets.length === 0 && <p className="text-[13px] text-ink-soft">Todavía no tenés tickets.</p>}

        {toPickup.length > 0 && (
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              Para retirar ({toPickup.length})
            </h3>
            <div className="flex flex-col gap-2">
              {toPickup.map((t) => (
                <TicketRow key={t.id} ticket={t} onClick={() => onOpenTicket(t)} />
              ))}
            </div>
          </div>
        )}

        {toDeliver.length > 0 && (
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              Para entregar ({toDeliver.length})
            </h3>
            <div className="flex flex-col gap-2">
              {toDeliver.map((t) => (
                <TicketRow key={t.id} ticket={t} onClick={() => onOpenTicket(t)} />
              ))}
            </div>
          </div>
        )}

        {delivered.length > 0 && (
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              Entregados ({delivered.length})
            </h3>
            <div className="flex flex-col gap-2 opacity-70">
              {delivered.map((t) => (
                <TicketRow key={t.id} ticket={t} onClick={() => onOpenTicket(t)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
