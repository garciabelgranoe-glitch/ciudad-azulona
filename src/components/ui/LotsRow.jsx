import { Package } from "lucide-react";
import LotPreviewCard from "./LotPreviewCard";

export default function LotsRow({ lots, onOpen }) {
  const active = lots.filter((l) => l.items?.some((i) => i.status === "live"));
  if (active.length === 0) return null;

  return (
    <div className="mx-auto max-w-5xl px-5 pt-4">
      <p className="mb-2 flex items-center gap-1.5 font-pixel text-[9px] tracking-wide text-plum">
        <Package size={12} /> LOTES DISPONIBLES
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {active.map((lot) => (
          <LotPreviewCard key={lot.id} lot={lot} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}
