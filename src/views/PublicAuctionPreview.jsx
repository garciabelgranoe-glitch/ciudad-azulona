import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import { getAuction, auctionToVM, RARITY_LABEL, RARITY_SYMBOL } from "../lib/auctions";
import { formatPrice, formatCountdown } from "../lib/format";
import ConditionBadge from "../components/ui/ConditionBadge";
import SellerBadge from "../components/ui/SellerBadge";
import Pill from "../components/ui/Pill";

// Vista pública, sin login: previsualización de una subasta para quien
// entra desde un link compartido (WhatsApp, etc.) sin cuenta todavía.
export default function PublicAuctionPreview({ auctionId, onGoToLogin, onBack }) {
  const [auction, setAuction] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getAuction(auctionId)
      .then((row) => {
        if (!cancelled) setAuction(auctionToVM(row));
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auctionId]);

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">CIUDAD AZULONA</p>
      </header>

      <div className="space-y-4 px-5 pt-6">
        {loading && (
          <div className="flex items-center gap-2 py-10 text-[13px] text-ink-soft">
            <Loader2 size={16} className="animate-spin" /> Cargando la subasta...
          </div>
        )}

        {!loading && notFound && (
          <div className="rounded-xl border-2 border-line bg-paper p-5 text-center">
            <p className="text-[14px] font-extrabold text-ink">No encontramos esta subasta</p>
            <p className="mt-1 text-[12px] text-ink-soft">Puede que ya haya sido eliminada o el link esté mal.</p>
            <button
              onClick={onGoToLogin}
              className="mt-4 w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)]"
            >
              Ver todas las subastas
            </button>
          </div>
        )}

        {!loading && auction && (
          <>
            <div className="overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-card">
              {auction.photoUrl ? (
                <img src={auction.photoUrl} alt={auction.card} className="h-64 w-full object-cover" />
              ) : (
                <div className="flex h-64 items-center justify-center bg-cream-dark text-[13px] text-ink-soft">
                  Sin foto
                </div>
              )}
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[17px] font-extrabold leading-snug text-ink">{auction.card}</p>
                  {auction.rarity && (
                    <span
                      className="shrink-0 text-[15px]"
                      title={RARITY_LABEL[auction.rarity]}
                    >
                      {RARITY_SYMBOL[auction.rarity]}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {auction.status !== "live" && <Pill>Cerrada</Pill>}
                  {(auction.condition || auction.isGraded) && (
                    <ConditionBadge
                      condition={auction.condition}
                      isGraded={auction.isGraded}
                      gradingCompany={auction.gradingCompany}
                      grade={auction.grade}
                    />
                  )}
                </div>
                {(auction.setName || auction.cardNumber || auction.year) && (
                  <p className="text-[11px] text-ink-soft">
                    {[auction.setName, auction.cardNumber, auction.year].filter(Boolean).join(" · ")}
                  </p>
                )}
                <SellerBadge
                  name={auction.seller}
                  rating={auction.sellerRating}
                  sales={auction.sellerSales}
                  gender={auction.sellerGender}
                  isPremium={auction.sellerIsPremium}
                />
                <div className="mt-2 flex items-center justify-between border-t-2 border-line pt-2.5">
                  <div>
                    <p className="text-[11px] font-bold text-ink-soft">
                      {auction.isFreeClaim ? "Free claim" : "Puja actual"}
                    </p>
                    <p className="text-[22px] font-extrabold text-forest-deep">
                      {auction.isFreeClaim ? "Gratis" : formatPrice(auction.currentBid, auction.currency)}
                    </p>
                  </div>
                  {auction.status === "live" && (
                    <span className="font-pixel flex items-center gap-1 rounded bg-[#EFE6F5] px-2 py-1 text-[9px] text-plum">
                      {formatCountdown(auction.closesInSec)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border-2 border-gold bg-gold/10 p-4 text-center">
              <Lock size={20} className="mx-auto text-gold-dark" />
              <p className="mt-2 text-[14px] font-extrabold text-ink">Necesitás una cuenta gratis para pujar</p>
              <p className="mt-1 text-[12px] text-ink-soft">
                Es gratis y te toma un minuto — solo pedimos tu email, sin contraseñas.
              </p>
              <button
                onClick={onGoToLogin}
                className="mt-3 w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)]"
              >
                Crear cuenta / Ingresar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
