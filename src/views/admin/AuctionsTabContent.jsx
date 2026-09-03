import Pill from "../../components/ui/Pill";
import { formatPrice } from "../../lib/format";

export default function AuctionsTabContent({ auctions, onCancel, onToggleFeatured, busyId }) {
  return (
    <div className="space-y-2">
      {auctions.map((a) => (
        <div key={a.id} className="rounded-lg border-2 border-line bg-paper p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-[13px] font-extrabold text-ink">{a.card}</p>
            <div className="flex shrink-0 items-center gap-1.5">
              {a.isFeatured && <Pill tone="live">Destacada</Pill>}
              <Pill tone={a.status === "live" ? "live" : "default"}>{a.status}</Pill>
            </div>
          </div>
          <p className="text-[11px] text-ink-soft">Vendedor: {a.seller}</p>
          <p className="text-[11px] text-ink-soft">
            {a.isFreeClaim ? `Free claim · ${a.freeClaimCount} reclamos` : `${formatPrice(a.currentBid, a.currency)} · ${a.bids} pujas`}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onToggleFeatured(a.id, !a.isFeatured)}
              disabled={busyId === a.id}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-40 ${
                a.isFeatured ? "border-2 border-line text-ink-soft" : "border-2 border-gold/50 text-gold-dark"
              }`}
            >
              {a.isFeatured ? "Quitar destacado" : "Destacar"}
            </button>
            {a.status === "live" && (
              <button
                onClick={() => onCancel(a.id)}
                disabled={busyId === a.id}
                className="rounded-lg border-2 border-[#B9432C]/40 px-2.5 py-1 text-[11px] font-bold text-[#B9432C] disabled:opacity-40"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
