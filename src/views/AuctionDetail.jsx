import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Users,
  X,
  Share2,
  Heart,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Check,
  ShieldCheck,
  Clock,
} from "lucide-react";
import {
  CONDITION_COLORS,
  CONDITION_SHORT,
  RARITY_LABEL,
  RARITY_SYMBOL,
  REFERENCE_PRICE_SOURCE_LABEL,
  DURATION_OPTIONS,
} from "../lib/auctions";
import { formatPrice, formatCountdown } from "../lib/format";
import GenderIcon from "../components/GenderIcon";
import PriceChart from "../components/PriceChart";
import CardArt from "../components/ui/CardArt";
import SellerBadge from "../components/ui/SellerBadge";
import SimilarAuctionsRow from "../components/ui/SimilarAuctionsRow";
import GuaranteedSellersBanner from "../components/ui/GuaranteedSellersBanner";

function getTouchDist(touches) {
  const [a, b] = touches;
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

// Vista: Detalle de subasta + pujar
export default function AuctionDetail({
  auction,
  onBack,
  onWin,
  onBid,
  bidError,
  bidBusy,
  onBuyNow,
  buyNowBusy,
  buyNowError,
  onClaimFree,
  claimBusy,
  claimError,
  claimResult,
  onGoToMyTickets,
  isMine,
  bidHistory = [],
  onOpenUserProfile,
  onEdit,
  onReport,
  reportBusy,
  reportError,
  recommendedSellers,
  onOpenRecommended,
  isFavorite,
  onToggleFavorite,
  reactions,
  myReaction,
  onSetReaction,
  viewerCount,
  onRepublish,
  republishBusy,
  republishError,
  allAuctions,
  onOpenAuction,
}) {
  const [republishOpen, setRepublishOpen] = useState(false);
  const [republishPrice, setRepublishPrice] = useState(String(auction.basePrice));
  const [republishDuration, setRepublishDuration] = useState(60);
  const bidIncrement = auction.currency === "USD" ? 1 : 1000;
  const [bid, setBid] = useState(auction.currentBid + bidIncrement);
  const [placed, setPlaced] = useState(false);
  const [confirmedBid, setConfirmedBid] = useState(null);
  const [bought, setBought] = useState(false);
  const reserveMet = auction.reservePrice == null || auction.currentBid >= auction.reservePrice;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const pinchStartDist = useRef(null);
  const pinchStartScale = useRef(1);
  const lastTapRef = useRef(0);
  const actionRef = useRef(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const photos = auction.photoUrls?.length ? auction.photoUrls : auction.photoUrl ? [auction.photoUrl] : [];
  const minBid = auction.currentBid + bidIncrement;
  const upCount = reactions?.filter((r) => r.reaction === "up").length ?? 0;
  const downCount = reactions?.filter((r) => r.reaction === "down").length ?? 0;
  const urgent = auction.status === "live" && auction.closesInSec <= 600;
  const showStickyBar =
    !isMine && auction.status === "live" && !placed && !bought && !claimResult;

  async function handleShare() {
    const url = `${window.location.origin}/subasta/${auction.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: auction.card, url });
      } catch {
        // el usuario canceló el share sheet, no hacemos nada
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleReport() {
    const ok = await onReport(auction.id, reportReason);
    if (ok) {
      setReportSent(true);
      setReportOpen(false);
    }
  }

  useEffect(() => {
    if (!placed) setBid(auction.currentBid + bidIncrement);
  }, [auction.currentBid, placed]);

  useEffect(() => {
    if (!lightboxOpen) setZoomScale(1);
  }, [lightboxOpen]);

  useEffect(() => {
    setZoomScale(1);
  }, [activePhoto]);

  function handlePinchStart(e) {
    if (e.touches.length === 2) {
      pinchStartDist.current = getTouchDist(e.touches);
      pinchStartScale.current = zoomScale;
    }
  }

  function handlePinchMove(e) {
    if (e.touches.length === 2 && pinchStartDist.current) {
      e.preventDefault();
      const dist = getTouchDist(e.touches);
      const nextScale = Math.min(4, Math.max(1, pinchStartScale.current * (dist / pinchStartDist.current)));
      setZoomScale(nextScale);
    }
  }

  function handlePinchEnd(e) {
    if (e.touches.length < 2) pinchStartDist.current = null;
  }

  function handleImageTap(e) {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setZoomScale((s) => (s > 1 ? 1 : 2));
    }
    lastTapRef.current = now;
  }

  async function handleBid() {
    if (onBid) {
      const ok = await onBid(auction.id, bid);
      if (ok) {
        setConfirmedBid(bid);
        setPlaced(true);
      }
    } else {
      setConfirmedBid(bid);
      setPlaced(true);
    }
  }

  async function handleBuyNow() {
    if (!onBuyNow) return;
    const ok = await onBuyNow(auction.id);
    if (ok) setBought(true);
  }

  async function handleClaimFree() {
    if (!onClaimFree) return;
    await onClaimFree(auction.id);
  }

  return (
    <div className={`min-h-dvh bg-cream ${showStickyBar ? "pb-28 md:pb-10" : "pb-10"}`}>
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">DETALLE DE SUBASTA</p>
      </header>

      <div className="px-5 pt-5 md:mx-auto md:flex md:max-w-4xl md:items-start md:gap-8 md:px-8">
        <div className="md:w-96 md:shrink-0">
        <button
          onClick={() => photos.length > 0 && setLightboxOpen(true)}
          className="mx-auto block w-64 overflow-hidden rounded-lg border-2 border-ink shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-gold md:w-full"
        >
          <CardArt label={auction.card} photoUrl={photos[activePhoto]} />
        </button>
        {photos.length > 0 && (
          <p className="mt-1.5 text-center text-[11px] text-ink-soft">Tocá la foto para agrandarla</p>
        )}

        {photos.length > 1 && (
          <div className="mx-auto mt-2 flex w-40 justify-center gap-1.5">
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

        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-ink/90 p-6"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-paper p-2 text-ink"
            >
              <X size={18} />
            </button>
            {photos.length > 1 && zoomScale === 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhoto((i) => (i - 1 + photos.length) % photos.length);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-paper p-2 text-ink"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhoto((i) => (i + 1) % photos.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-paper p-2 text-ink"
                >
                  <ArrowLeft size={18} className="rotate-180" />
                </button>
              </>
            )}
            <img
              src={photos[activePhoto]}
              alt={auction.card}
              className="max-h-full max-w-full touch-none rounded-lg object-contain shadow-card transition-transform duration-100"
              style={{ transform: `scale(${zoomScale})` }}
              onClick={handleImageTap}
              onTouchStart={handlePinchStart}
              onTouchMove={handlePinchMove}
              onTouchEnd={handlePinchEnd}
            />
            {photos.length > 1 && (
              <span className="absolute bottom-6 rounded-full bg-ink/60 px-2.5 py-1 text-[11px] font-bold text-paper">
                {activePhoto + 1} / {photos.length}
              </span>
            )}
            {zoomScale === 1 && (
              <span className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-[10px] text-paper/70 sm:block">
                Pellizcá para hacer zoom, o doble tap
              </span>
            )}
          </div>
        )}
        </div>

        <div className="md:min-w-0 md:flex-1">
        <h2 className="mt-4 break-words text-xl font-extrabold text-ink md:mt-0">{auction.card}</h2>
        <div className="mt-1 flex items-center justify-between gap-2">
          <SellerBadge
            name={auction.seller}
            rating={auction.sellerRating}
            sales={auction.sellerSales}
            gender={auction.sellerGender}
            isPremium={auction.sellerIsPremium}
            onClick={onOpenUserProfile && auction.sellerId ? () => onOpenUserProfile(auction.sellerId) : undefined}
          />
          {onSetReaction && (
            <div className="flex shrink-0 items-center gap-2 text-[11px] text-ink-soft">
              <button
                onClick={() => onSetReaction(myReaction === "up" ? null : "up")}
                className={`flex items-center gap-0.5 transition hover:text-forest-deep ${myReaction === "up" ? "text-forest-deep" : ""}`}
                aria-label="Me gusta esta publicación"
              >
                <ThumbsUp size={13} className={myReaction === "up" ? "fill-forest-deep" : ""} /> {upCount}
              </button>
              <button
                onClick={() => onSetReaction(myReaction === "down" ? null : "down")}
                className={`flex items-center gap-0.5 transition hover:text-[#B9432C] ${myReaction === "down" ? "text-[#B9432C]" : ""}`}
                aria-label="No me gusta esta publicación"
              >
                <ThumbsDown size={13} className={myReaction === "down" ? "fill-[#B9432C]" : ""} /> {downCount}
              </button>
            </div>
          )}
        </div>

        {/* Precio, tiempo restante y prueba social — lo primero que hace
            falta para decidir si quedarse, arriba de todo lo secundario. */}
        <div className="mt-4 rounded-xl border-2 border-ink bg-paper p-4 shadow-card">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                {auction.isSaleOnly || auction.isFreeClaim ? "Precio" : "Puja actual"}
              </span>
              <span className="text-[28px] font-extrabold leading-none text-forest-deep">
                {auction.isFreeClaim ? "Gratis" : formatPrice(auction.currentBid, auction.currency)}
              </span>
            </div>
            {auction.status === "live" ? (
              <div
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 font-pixel text-[11px] ${
                  urgent ? "animate-pulse bg-[#FBE6E0] text-[#B9432C]" : "bg-[#EFE6F5] text-plum"
                }`}
              >
                <Clock size={13} />
                {formatCountdown(auction.closesInSec)}
              </div>
            ) : (
              <span className="shrink-0 rounded-lg border-2 border-line px-3 py-2 text-[11px] font-bold text-ink-soft">
                Cerrada
              </span>
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t-2 border-line pt-2.5 text-[11px]">
            {viewerCount > 1 && auction.status === "live" && (
              <span className="flex items-center gap-1 font-bold text-forest-deep">
                <Users size={13} /> {viewerCount} viendo ahora
              </span>
            )}
            {auction.isFreeClaim ? (
              <span className="text-ink-soft">{auction.freeClaimCount} reclamos</span>
            ) : (
              !auction.isSaleOnly && <span className="text-ink-soft">{auction.bids} pujas</span>
            )}
            {auction.status === "live" && auction.reservePrice != null && (
              <span className={`font-bold ${reserveMet ? "text-forest-deep" : "text-[#B9432C]"}`}>
                {reserveMet ? "Reserva alcanzada" : "No alcanzó la reserva todavía"}
                {isMine && ` (${formatPrice(auction.reservePrice, auction.currency)})`}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gold bg-gold text-forest-deep px-4 py-3 text-[13px] font-extrabold shadow-[0_3px_0_rgba(185,134,47,0.7)] transition hover:bg-gold-glow active:translate-y-[2px] active:shadow-none"
          >
            <Share2 size={17} />
            {copied ? "¡Link copiado!" : "Compartir esta subasta"}
          </button>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(auction.id)}
              className="flex shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-paper px-4 text-ink shadow-[0_3px_0_rgba(32,41,28,0.5)] transition hover:bg-cream active:translate-y-[2px] active:shadow-none"
              aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
            >
              <Heart size={18} className={isFavorite ? "fill-[#B9432C] text-[#B9432C]" : ""} />
            </button>
          )}
        </div>

        {(auction.setName || auction.cardNumber || auction.year || auction.condition || auction.isGraded || auction.rarity) && (
          <div className="mt-4 rounded-xl border-2 border-ink bg-paper p-4 shadow-card">
            <p className="font-pixel text-[8px] tracking-wide text-gold-dark">FICHA DE LA CARTA</p>
            {(auction.setName || auction.cardNumber || auction.year) && (
              <div className="mt-3 flex flex-wrap gap-5">
                {auction.setName && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-ink-soft">Colección</span>
                    <span className="text-[14px] font-extrabold text-ink">{auction.setName}</span>
                  </div>
                )}
                {auction.cardNumber && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-ink-soft">Número</span>
                    <span className="text-[14px] font-extrabold text-ink">{auction.cardNumber}</span>
                  </div>
                )}
                {auction.year && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-ink-soft">Año</span>
                    <span className="text-[14px] font-extrabold text-ink">{auction.year}</span>
                  </div>
                )}
              </div>
            )}
            {(auction.condition || auction.isGraded || auction.rarity) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {(auction.condition || auction.isGraded) && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-[15px] font-extrabold tracking-wide ${
                      auction.isGraded
                        ? "border-[3px] border-double border-gold bg-gold/15 text-gold-dark"
                        : `border-2 ${CONDITION_COLORS[auction.condition] ?? "border-line bg-cream text-ink-soft"}`
                    }`}
                  >
                    {auction.isGraded
                      ? `${auction.gradingCompany?.toUpperCase() ?? "GRADEADA"} ${auction.grade ?? ""}`
                      : (CONDITION_SHORT[auction.condition] ?? auction.condition)}
                  </span>
                )}
                {auction.rarity && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-lg border-2 border-gold bg-gold/15 px-3.5 py-2 text-[15px] font-extrabold text-gold-dark"
                    title={RARITY_LABEL[auction.rarity]}
                  >
                    {RARITY_SYMBOL[auction.rarity]} {RARITY_LABEL[auction.rarity]}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div ref={actionRef}>
        {isMine ? (
          <div className="mt-6 rounded-xl border-2 border-line bg-paper p-4 text-[12px] text-ink-soft">
            <p>
              {auction.isFreeClaim
                ? `Esta es tu free claim — no acepta pujas. Gana quien sea el reclamo número ${auction.freeClaimWinningNumber} (van ${auction.freeClaimCount} hasta ahora).`
                : auction.isSaleOnly
                ? "Esta es tu publicación de venta directa — no acepta pujas, se vende al precio de lista."
                : "Esta es tu publicación — no podés pujar en tu propia carta."}
            </p>
            {!auction.isSaleOnly && !auction.isFreeClaim && auction.buyNowPrice != null && (
              <p className="mt-1">Claim inmediato en: <span className="font-bold text-ink">{formatPrice(auction.buyNowPrice, auction.currency)}</span></p>
            )}
            {auction.status === "live" && (auction.isFreeClaim ? auction.freeClaimCount === 0 : auction.bids === 0) && onEdit && (
              <button
                onClick={onEdit}
                className="mt-2 font-bold text-forest-deep underline underline-offset-2"
              >
                Editar o cancelar esta subasta
              </button>
            )}
            {auction.status !== "live" && !auction.isFreeClaim && !auction.lotId && onRepublish && (
              <div className="mt-3 border-t-2 border-line pt-3">
                {!republishOpen ? (
                  <button
                    onClick={() => setRepublishOpen(true)}
                    className="flex items-center gap-1.5 font-bold text-forest-deep underline underline-offset-2"
                  >
                    <RefreshCw size={13} /> Republicar esta carta
                  </button>
                ) : (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                      Republicar — misma foto y ficha, nueva subasta ({auction.currency === "USD" ? "en U$S" : "en $"})
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        value={republishPrice}
                        onChange={(e) => setRepublishPrice(e.target.value)}
                        className="w-28 rounded-lg border-2 border-line bg-white px-2.5 py-2 text-[13px] font-bold text-ink focus:outline-none focus-visible:border-forest-mid"
                      />
                      <select
                        value={republishDuration}
                        onChange={(e) => setRepublishDuration(Number(e.target.value))}
                        className="rounded-lg border-2 border-line bg-white px-2 py-2 text-[12px] font-bold text-ink"
                      >
                        {DURATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {republishError && <p className="mt-2 text-[12px] text-[#B9432C]">{republishError}</p>}
                    <button
                      onClick={() =>
                        onRepublish(auction, { price: Number(republishPrice), durationMinutes: republishDuration })
                      }
                      disabled={republishBusy || !republishPrice}
                      className="mt-2 rounded-lg bg-gold px-4 py-2 text-[12px] font-extrabold text-forest-deep shadow-[0_3px_0_rgba(185,134,47,1)] disabled:opacity-40"
                    >
                      {republishBusy ? "Publicando..." : "Publicar de nuevo"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : claimResult?.won ? (
          <div className="mt-6 rounded-xl border-2 border-gold bg-gold/10 p-4">
            <p className="flex items-center gap-2 text-[13px] font-bold text-gold-dark">
              <Check size={15} /> ¡Ganaste el free claim!
            </p>
            <p className="mt-1 text-[12px] text-ink-soft">
              Fuiste el reclamo #{claimResult.claim_position}. Encontrás el código de retiro en Mis tickets.
            </p>
            {onGoToMyTickets && (
              <button
                onClick={onGoToMyTickets}
                className="mt-3 text-[12px] font-bold text-gold-dark underline underline-offset-2"
              >
                Ver Mis tickets →
              </button>
            )}
          </div>
        ) : bought ? (
          <div className="mt-6 rounded-xl border-2 border-gold bg-gold/10 p-4">
            <p className="flex items-center gap-2 text-[13px] font-bold text-gold-dark">
              <Check size={15} /> ¡Claimeada al instante!
            </p>
            <p className="mt-1 text-[12px] text-ink-soft">
              La subasta cerró a tu favor. Encontrás el código de retiro en Mis tickets.
            </p>
            {onGoToMyTickets && (
              <button
                onClick={onGoToMyTickets}
                className="mt-3 text-[12px] font-bold text-gold-dark underline underline-offset-2"
              >
                Ver Mis tickets →
              </button>
            )}
          </div>
        ) : auction.isFreeClaim ? (
          <div className="mt-6 rounded-xl border-2 border-ink bg-paper p-4">
            {claimResult && !claimResult.won ? (
              <>
                <p className="text-[13px] font-bold text-ink">Reclamaste tu turno — sos el número {claimResult.claim_position}.</p>
                <p className="mt-1 text-[12px] text-ink-soft">
                  El ganador se define automático cuando algún reclamo cae justo en el número que eligió el vendedor. Seguí atento a tus notificaciones.
                </p>
              </>
            ) : (
              <>
                {onClaimFree && (
                  <button
                    onClick={handleClaimFree}
                    disabled={claimBusy}
                    className="w-full rounded-lg bg-gold px-4 py-2.5 text-[13px] font-extrabold text-forest-deep shadow-[0_3px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[2px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
                  >
                    {claimBusy ? "Reclamando..." : "¡Reclamar mi turno gratis!"}
                  </button>
                )}
                <p className="mt-1.5 text-center text-[11px] text-ink-soft">
                  Gratis — el reclamo que caiga en el número secreto del vendedor se la lleva.
                </p>
                {claimError && <p className="mt-2 text-center text-[12px] text-[#B9432C]">{claimError}</p>}
              </>
            )}
          </div>
        ) : !placed && auction.isSaleOnly ? (
          <div className="mt-6 rounded-xl border-2 border-ink bg-paper p-4">
            {onBuyNow && (
              <>
                <button
                  onClick={handleBuyNow}
                  disabled={buyNowBusy}
                  className="w-full rounded-lg bg-gold px-4 py-2.5 text-[13px] font-extrabold text-forest-deep shadow-[0_3px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[2px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
                >
                  {buyNowBusy ? "Claimeando..." : `Claim ahora por ${formatPrice(auction.buyNowPrice, auction.currency)}`}
                </button>
                <p className="mt-1.5 text-center text-[11px] text-ink-soft">Venta directa, sin pujas — se la lleva quien la compre primero.</p>
                {buyNowError && <p className="mt-2 text-center text-[12px] text-[#B9432C]">{buyNowError}</p>}
              </>
            )}
          </div>
        ) : !placed ? (
          <div className="mt-6 rounded-xl border-2 border-ink bg-paper p-4">
            <p className="text-[12px] text-ink-soft">Tu puja (mínimo {formatPrice(minBid, auction.currency)})</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={bid}
                min={minBid}
                step={bidIncrement}
                onChange={(e) => setBid(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[15px] font-bold text-ink focus:outline-none focus-visible:border-forest-mid"
              />
              <button
                onClick={handleBid}
                disabled={bid < minBid || bidBusy}
                className="shrink-0 rounded-lg bg-forest-deep px-4 py-2.5 text-[13px] font-extrabold text-cream shadow-[0_3px_0_rgba(62,122,82,1)] transition hover:bg-[#204f37] active:translate-y-[2px] active:shadow-[0_1px_0_rgba(62,122,82,1)] disabled:opacity-40"
              >
                Pujar
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[0, 4, 9].map((extra) => {
                const value = minBid + extra * bidIncrement;
                return (
                  <button
                    key={extra}
                    type="button"
                    onClick={() => setBid(value)}
                    className={`rounded-lg border-2 px-3 py-1.5 text-[12px] font-bold transition ${
                      bid === value
                        ? "border-gold bg-gold/15 text-gold-dark"
                        : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                    }`}
                  >
                    {extra === 0 ? "Mínimo" : `+${formatPrice(extra * bidIncrement, auction.currency)}`}
                  </button>
                );
              })}
            </div>
            {bidError && <p className="mt-2 text-[12px] text-[#B9432C]">{bidError}</p>}

            {auction.buyNowPrice != null && onBuyNow && (
              <div className="mt-3 border-t-2 border-line pt-3">
                <button
                  onClick={handleBuyNow}
                  disabled={buyNowBusy}
                  className="w-full rounded-lg bg-gold px-4 py-2.5 text-[13px] font-extrabold text-forest-deep shadow-[0_3px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[2px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
                >
                  {buyNowBusy ? "Claimeando..." : `Claim ya por ${formatPrice(auction.buyNowPrice, auction.currency)}`}
                </button>
                <p className="mt-1.5 text-center text-[11px] text-ink-soft">Cierra la subasta al instante a tu favor.</p>
                {buyNowError && <p className="mt-2 text-center text-[12px] text-[#B9432C]">{buyNowError}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border-2 border-forest-mid bg-forest-mid/10 p-4">
            <p className="flex items-center gap-2 text-[13px] font-bold text-forest-deep">
              <Check size={15} /> Pujaste {formatPrice(confirmedBid, auction.currency)}
            </p>
            <p className="mt-1 text-[12px] text-ink-soft">Te avisamos si te superan o si ganás cuando cierre.</p>
            {!onBid && (
              <button
                onClick={() => onWin({ ...auction, currentBid: confirmedBid })}
                className="mt-3 text-[12px] font-bold text-gold-dark underline underline-offset-2"
              >
                (Demo) Simular cierre — gané la subasta →
              </button>
            )}
          </div>
        )}
        </div>

        {bidHistory.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Evolución del precio</h4>
              {auction.referencePrice != null && (
                <span className="text-[11px] font-bold text-plum">
                  Referencia: {formatPrice(auction.referencePrice, auction.referencePriceCurrency || auction.currency)}
                  {auction.referencePriceSource && ` (${REFERENCE_PRICE_SOURCE_LABEL[auction.referencePriceSource] ?? auction.referencePriceSource})`}
                </span>
              )}
            </div>
            <PriceChart
              points={[auction.basePrice, ...[...bidHistory].reverse().map((b) => Number(b.amount))]}
              referencePrice={auction.referencePrice}
            />
          </div>
        )}

        {bidHistory.length > 0 && (
          <div className="mt-6">
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Historial de pujas</h4>
            <ul className="mt-2 flex flex-col gap-1.5">
              {bidHistory.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-2 rounded-lg bg-paper px-3 py-2 text-[13px]">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <GenderIcon gender={b.bidder?.gender} size={13} />
                    {onOpenUserProfile && b.bidder?.id ? (
                      <button
                        onClick={() => onOpenUserProfile(b.bidder.id)}
                        className="truncate text-ink-soft underline decoration-line decoration-dotted underline-offset-2 hover:text-forest-deep"
                      >
                        {b.bidder?.alias ?? "—"}
                      </button>
                    ) : (
                      <span className="truncate text-ink-soft">{b.bidder?.alias ?? "—"}</span>
                    )}
                  </span>
                  <span className="shrink-0 font-bold text-forest-deep">{formatPrice(Number(b.amount), auction.currency)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <SimilarAuctionsRow
          auctions={allAuctions}
          currentAuction={auction}
          onOpen={onOpenAuction}
          onOpenSellerProfile={onOpenUserProfile}
        />

        <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft">
          <ShieldCheck size={14} className="mt-0.5 shrink-0" />
          El pago se hace en persona en el stand del vendedor. La plataforma no procesa dinero — solo confirma la identidad de la entrega con un código único.
        </p>

        <div className="mt-4">
          <GuaranteedSellersBanner sellers={recommendedSellers} onOpenAll={onOpenRecommended} />
        </div>

        {!isMine && onReport && (
          <div className="mt-4">
            {reportSent ? (
              <p className="text-center text-[12px] text-ink-soft">Gracias, recibimos tu denuncia.</p>
            ) : reportOpen ? (
              <div className="rounded-lg border-2 border-line bg-paper p-3">
                <label className="text-[12px] font-bold text-ink-soft">Contanos qué pasó</label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={3}
                  placeholder="Ej: la publicación no parece una carta real, el vendedor no responde, etc."
                  className="mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid"
                />
                {reportError && <p className="mt-1 text-[11px] text-[#B9432C]">{reportError}</p>}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleReport}
                    disabled={!reportReason || reportBusy}
                    className="rounded-lg bg-[#B9432C] px-3 py-2 text-[12px] font-bold text-paper disabled:opacity-40"
                  >
                    {reportBusy ? "Enviando..." : "Enviar denuncia"}
                  </button>
                  <button
                    onClick={() => setReportOpen(false)}
                    className="rounded-lg border-2 border-line px-3 py-2 text-[12px] font-bold text-ink-soft"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setReportOpen(true)}
                className="text-[11px] font-bold text-ink-soft underline underline-offset-2"
              >
                Denunciar esta subasta
              </button>
            )}
          </div>
        )}
        </div>
      </div>

      {showStickyBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper/95 px-4 py-3 shadow-[0_-4px_12px_rgba(32,41,28,0.15)] backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                {auction.isSaleOnly || auction.isFreeClaim ? "Precio" : "Puja actual"}
              </span>
              <span className="text-[17px] font-extrabold leading-none text-forest-deep">
                {auction.isFreeClaim ? "Gratis" : formatPrice(auction.currentBid, auction.currency)}
              </span>
            </div>
            <span
              className={`shrink-0 rounded-lg px-2.5 py-1.5 font-pixel text-[9px] ${
                urgent ? "animate-pulse bg-[#FBE6E0] text-[#B9432C]" : "bg-[#EFE6F5] text-plum"
              }`}
            >
              {formatCountdown(auction.closesInSec)}
            </span>
            <button
              onClick={() => actionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="shrink-0 rounded-lg bg-gold px-4 py-2.5 text-[12px] font-extrabold text-forest-deep shadow-[0_3px_0_rgba(185,134,47,1)] transition active:translate-y-[2px] active:shadow-none"
            >
              {auction.isFreeClaim ? "Reclamar" : auction.isSaleOnly ? "Comprar" : "Pujar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
