import { Package } from "lucide-react";
import CardArt from "./CardArt";

export default function LotPreviewCard({ lot, onOpen }) {
  const photo = lot.photo_urls?.[0];
  const availableCount = lot.items?.filter((i) => i.status === "live").length ?? 0;

  return (
    <button
      onClick={() => onOpen(lot)}
      className="flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border-2 border-plum bg-paper text-left shadow-card transition hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div className="relative">
        <CardArt label={lot.title} photoUrl={photo} />
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-plum px-2 py-0.5 text-[9px] font-extrabold text-paper">
          <Package size={10} /> LOTE
        </div>
      </div>
      <div className="p-2.5">
        <p className="line-clamp-2 text-[12px] font-extrabold leading-snug text-ink">{lot.title}</p>
        <p className="mt-1 text-[10px] text-ink-soft">{availableCount} disponibles</p>
      </div>
    </button>
  );
}
