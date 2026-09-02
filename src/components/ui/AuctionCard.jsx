import { Heart, Package, Zap, MapPin } from "lucide-react";
import { RARITY_LABEL, RARITY_SYMBOL } from "../../lib/auctions";
import { formatPrice, formatCountdown } from "../../lib/format";
import CardArt from "./CardArt";
import ConditionBadge from "./ConditionBadge";
import Pill from "./Pill";
import SellerBadge from "./SellerBadge";

export default function AuctionCard({
  auction: a,
  onOpen,
  onOpenSellerProfile,
  showSeller = true,
  showMyBid = false,
  showStatusPill = false,
  isFavorite = false,
  onToggleFavorite,
}) {
  const clickable = a.status === "live" && !!onOpen;
  const typeAccent = a.isFreeClaim ? "bg-teal" : a.isSaleOnly ? "bg-gold" : "bg-transparent";

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onOpen(a) : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onOpen(a);
            }
          : undefined
      }
      className={`relative isolate flex h-full flex-col overflow-hidden rounded-xl border-2 bg-paper text-left shadow-card transition ${
        a.isFeatured ? "border-plum" : "border-ink"
      } ${clickable ? "cursor-pointer hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold" : "opacity-90"}`}
    >
      <span className={`absolute inset-y-0 left-0 z-10 w-1.5 ${typeAccent}`} aria-hidden="true" />
      <div className="relative">
        <CardArt label={a.card} photoUrl={a.photoUrl} />
        {a.isFeatured && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-plum px-2 py-0.5 text-[9px] font-extrabold text-paper">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> DESTACADA
          </div>
        )}
        {(a.condition || a.isGraded) && (
          <div className="absolute right-2 top-2 rounded-full bg-paper/90 p-0.5 backdrop-blur-sm">
            <ConditionBadge
              condition={a.condition}
              isGraded={a.isGraded}
              gradingCompany={a.gradingCompany}
              grade={a.grade}
            />
          </div>
        )}
        {a.rarity && (
          <div
            className="absolute bottom-2 left-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-paper/90 px-1 text-[11px] font-bold text-ink backdrop-blur-sm"
            title={RARITY_LABEL[a.rarity]}
          >
            {RARITY_SYMBOL[a.rarity]}
          </div>
        )}
        {showStatusPill && (
          <div className="absolute bottom-2 right-2">
            {a.status === "live" ? <Pill tone="live">En vivo</Pill> : <Pill>Cerrada</Pill>}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t-2 border-ink px-3.5 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-[13px] font-extrabold leading-snug text-ink">{a.card}</p>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(a.id);
              }}
              className="shrink-0 text-ink-soft transition hover:text-[#B9432C] focus:outline-none"
              aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
            >
              <Heart size={16} className={isFavorite ? "fill-[#B9432C] text-[#B9432C]" : ""} />
            </button>
          )}
        </div>
        {(a.isFreeClaim || a.buyNowPrice != null) && a.status === "live" && (
          <span
            className={`flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              a.isFreeClaim ? "bg-teal/20 text-teal" : "bg-gold/20 text-gold-dark"
            }`}
          >
            {a.isFreeClaim ? <Package size={11} /> : <Zap size={11} />}
            {a.isFreeClaim ? "Free claim — gratis" : a.isSaleOnly ? "Venta directa" : `Claim: ${formatPrice(a.buyNowPrice, a.currency)}`}
          </span>
        )}
        {(a.setName || a.cardNumber || a.year) && (
          <p className="line-clamp-1 text-[11px] text-ink-soft">
            {[a.setName, a.cardNumber, a.year].filter(Boolean).join(" · ")}
          </p>
        )}
        {a.sellerCity && (
          <p className="flex items-center gap-1 text-[10px] font-bold text-ink-soft">
            <MapPin size={10} /> {a.sellerCity}
          </p>
        )}
        {showSeller && (
          <SellerBadge
            name={a.seller}
            rating={a.sellerRating}
            sales={a.sellerSales}
            gender={a.sellerGender}
            isPremium={a.sellerIsPremium}
            onClick={onOpenSellerProfile && a.sellerId ? () => onOpenSellerProfile(a.sellerId) : undefined}
          />
        )}
        {showMyBid && a.myBid != null ? (
          <div className="mt-auto flex flex-col gap-0.5 pt-1.5">
            <span className="text-[16px] font-extrabold text-forest-deep">{formatPrice(a.currentBid, a.currency)}</span>
            <span className="text-[11px] font-bold text-ink-soft">Tu puja: {formatPrice(a.myBid, a.currency)}</span>
          </div>
        ) : (
          <div className="mt-auto flex items-center justify-between pt-1.5">
            <span className="text-[16px] font-extrabold text-forest-deep">
              {a.isFreeClaim ? "Gratis" : formatPrice(a.currentBid, a.currency)}
            </span>
            {a.status === "live" && (
              <span
                className={`font-pixel flex items-center gap-1 rounded px-1.5 py-1 text-[8.5px] ${
                  a.closesInSec <= 600 ? "bg-[#FBE6E0] text-[#B9432C]" : "bg-[#EFE6F5] text-plum"
                }`}
              >
                {formatCountdown(a.closesInSec)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
