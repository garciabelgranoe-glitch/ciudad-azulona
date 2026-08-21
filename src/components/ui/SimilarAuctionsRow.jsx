import { useMemo } from "react";
import AuctionCard from "./AuctionCard";

export default function SimilarAuctionsRow({ auctions, currentAuction, onOpen, onOpenSellerProfile }) {
  const similar = useMemo(() => {
    const others = (auctions ?? []).filter((a) => a.id !== currentAuction.id && a.status === "live" && !a.lotId);
    const bySet = currentAuction.setName ? others.filter((a) => a.setName === currentAuction.setName) : [];
    const bySetIds = new Set(bySet.map((a) => a.id));
    const byRarity = currentAuction.rarity
      ? others.filter((a) => a.rarity === currentAuction.rarity && !bySetIds.has(a.id))
      : [];
    const byRarityIds = new Set(byRarity.map((a) => a.id));
    const rest = others.filter((a) => !bySetIds.has(a.id) && !byRarityIds.has(a.id));
    return [...bySet, ...byRarity, ...rest].slice(0, 10);
  }, [auctions, currentAuction]);

  if (similar.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Subastas parecidas</h4>
      <div className="mt-2 flex gap-3 overflow-x-auto pb-2">
        {similar.map((a) => (
          <div key={a.id} className="w-36 shrink-0">
            <AuctionCard auction={a} onOpen={onOpen} onOpenSellerProfile={onOpenSellerProfile} showSeller={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
