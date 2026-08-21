import { ArrowLeft } from "lucide-react";
import AuctionCard from "../components/ui/AuctionCard";

// Vista: Mis pujas / Mis publicaciones
export default function MyAuctionsView({
  title,
  emptyText,
  auctions,
  onBack,
  onOpen,
  onOpenSellerProfile,
  showMyBid = false,
  favoriteIds,
  onToggleFavorite,
}) {
  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">{title}</p>
      </header>

      {auctions.length === 0 ? (
        <p className="px-5 pt-10 text-center text-[13px] text-ink-soft">{emptyText}</p>
      ) : (
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-5 pt-5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {auctions.map((a) => (
            <AuctionCard
              key={a.id}
              auction={a}
              onOpen={onOpen}
              onOpenSellerProfile={onOpenSellerProfile}
              showSeller={showMyBid}
              showMyBid={showMyBid}
              showStatusPill
              isFavorite={favoriteIds?.has(a.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
