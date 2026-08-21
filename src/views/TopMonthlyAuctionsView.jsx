import { ArrowLeft } from "lucide-react";
import GuaranteedSellersBanner from "../components/ui/GuaranteedSellersBanner";
import AuctionCard from "../components/ui/AuctionCard";

// Vista: Destacadas del mes (ranking real por pujas, no manual)
export default function TopMonthlyAuctionsView({ auctions, onBack, onOpen, onOpenSellerProfile, recommendedSellers, onOpenRecommended }) {
  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">DESTACADAS DEL MES</p>
      </header>

      <div className="px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Las subastas con más pujas de este mes — ranking automático, no elegido a mano.
        </p>

        <div className="mt-4">
          <GuaranteedSellersBanner sellers={recommendedSellers} onOpenAll={onOpenRecommended} />
        </div>

        {auctions.length === 0 ? (
          <p className="mt-4 text-[12px] text-ink-soft">Todavía no hay pujas este mes.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {auctions.map((a, i) => (
              <div key={a.id} className="relative">
                <span className="font-pixel absolute -left-1.5 -top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-gold text-[10px] text-forest-deep shadow-card">
                  #{i + 1}
                </span>
                <AuctionCard auction={a} onOpen={onOpen} onOpenSellerProfile={onOpenSellerProfile} showStatusPill />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
