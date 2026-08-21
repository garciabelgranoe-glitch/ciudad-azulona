import { useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { formatPrice } from "../lib/format";
import CardArt from "../components/ui/CardArt";
import SellerBadge from "../components/ui/SellerBadge";

// Lotes: varias cartas sueltas en una sola publicación (Premium).
export default function LotDetailView({ lot, items, onBack, onOpenUserProfile, onClaimItem, claimingItemId, claimError, onBuyFullLot, buyFullLotBusy, buyFullLotError }) {
  const photos = lot.photo_urls ?? [];
  const [activePhoto, setActivePhoto] = useState(0);
  const allItemsLive = items.length > 0 && items.every((it) => it.status === "live");
  const lotCurrency = items[0]?.currency ?? "ARS";

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">LOTE</p>
      </header>

      <div className="px-5 pt-5">
        {photos.length > 0 && (
          <>
            <div className="mx-auto block w-52 overflow-hidden rounded-lg border-2 border-ink shadow-card">
              <CardArt label={lot.title} photoUrl={photos[activePhoto]} />
            </div>
            {photos.length > 1 && (
              <div className="mx-auto mt-2 flex w-52 justify-center gap-1.5">
                {photos.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setActivePhoto(i)}
                    className={`h-2 w-2 rounded-full transition ${i === activePhoto ? "bg-forest-mid" : "bg-line"}`}
                    aria-label={`Foto ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <h2 className="mt-4 text-xl font-extrabold text-ink">{lot.title}</h2>
        <div className="mt-1">
          <SellerBadge
            name={lot.seller?.alias ?? "—"}
            rating={Number(lot.seller?.rating_avg ?? 5)}
            sales={lot.seller?.sales_count ?? 0}
            gender={lot.seller?.gender}
            isPremium={lot.seller?.is_premium}
            onClick={onOpenUserProfile && lot.seller?.id ? () => onOpenUserProfile(lot.seller.id) : undefined}
          />
        </div>
        {lot.description && <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{lot.description}</p>}

        {lot.full_price != null && (
          <>
            {allItemsLive && onBuyFullLot ? (
              <button
                onClick={() => onBuyFullLot(lot.id)}
                disabled={buyFullLotBusy}
                className="mt-4 w-full rounded-lg bg-plum py-3 text-[13px] font-extrabold text-cream shadow-[0_4px_0_rgba(76,29,87,1)] transition hover:brightness-110 active:translate-y-[3px] active:shadow-[0_1px_0_rgba(76,29,87,1)] disabled:opacity-40"
              >
                {buyFullLotBusy ? "Comprando..." : `Comprar el lote completo por ${formatPrice(lot.full_price, lotCurrency)}`}
              </button>
            ) : (
              <p className="mt-4 text-[11px] text-ink-soft">
                El precio de lote completo ({formatPrice(lot.full_price, lotCurrency)}) ya no está disponible — se vendió alguna carta suelta.
              </p>
            )}
            {buyFullLotError && <p className="mt-2 text-[12px] text-[#B9432C]">{buyFullLotError}</p>}
          </>
        )}

        <p className="mt-5 font-pixel text-[8px] tracking-wide text-gold-dark">CARTAS DEL LOTE ({items.length})</p>
        <div className="mt-2.5 flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-3 rounded-lg border-2 p-3 ${
                item.status === "live" ? "border-line bg-paper" : "border-line bg-paper opacity-60"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-ink">{item.card}</p>
                <p className="text-[13px] font-extrabold text-forest-deep">{formatPrice(item.currentBid, item.currency)}</p>
              </div>
              {item.status === "live" ? (
                <button
                  onClick={() => onClaimItem(item.id)}
                  disabled={claimingItemId === item.id}
                  className="shrink-0 rounded-lg bg-gold px-3 py-2 text-[12px] font-extrabold text-forest-deep shadow-[0_3px_0_rgba(185,134,47,1)] disabled:opacity-40"
                >
                  {claimingItemId === item.id ? "Claimeando..." : "Claim"}
                </button>
              ) : (
                <span className="shrink-0 text-[11px] font-bold text-ink-soft">Vendida</span>
              )}
            </div>
          ))}
        </div>
        {claimError && <p className="mt-2 text-[12px] text-[#B9432C]">{claimError}</p>}

        <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft">
          <ShieldCheck size={14} className="mt-0.5 shrink-0" />
          El pago se hace en persona en el stand del vendedor, igual que en las subastas.
        </p>
      </div>
    </div>
  );
}
