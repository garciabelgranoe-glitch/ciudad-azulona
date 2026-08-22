import Pill from "../../components/ui/Pill";
import { formatPrice } from "../../lib/format";

export default function AuctionsTabContent({ auctions }) {
  return (
    <div className="space-y-2">
      {auctions.map((a) => (
        <div key={a.id} className="rounded-lg border-2 border-line bg-paper p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-[13px] font-extrabold text-ink">{a.card}</p>
            <Pill tone={a.status === "live" ? "live" : "default"}>{a.status}</Pill>
          </div>
          <p className="text-[11px] text-ink-soft">Vendedor: {a.seller}</p>
          <p className="text-[11px] text-ink-soft">
            {a.isFreeClaim ? `Free claim · ${a.freeClaimCount} reclamos` : `${formatPrice(a.currentBid, a.currency)} · ${a.bids} pujas`}
          </p>
        </div>
      ))}
    </div>
  );
}
