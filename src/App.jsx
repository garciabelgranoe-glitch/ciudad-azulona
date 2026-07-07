import { useState, useEffect, useMemo, useRef } from "react";
import { Clock, Check, QrCode, ArrowLeft, Plus, ShieldCheck, Star, X, LogOut, Search } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import Login from "./components/Login";
import PokeballIcon from "./components/PokeballIcon";
import {
  listLiveAuctions,
  subscribeToLiveAuctions,
  placeBid,
  uploadAuctionPhoto,
  createAuction,
  auctionToVM,
  listMyTickets,
  ticketToVM,
  redeemTicket,
  submitRating,
  listMyGivenRatingTicketIds,
  getProfile,
  listRecentBids,
  CONDITION_OPTIONS,
  CONDITION_SHORT,
  CONDITION_COLORS,
  GRADING_COMPANY_OPTIONS,
} from "./lib/auctions";

// ---------------------------------------------
// Datos de ejemplo (mock) — reemplazar por backend real
// ---------------------------------------------
const SEED_AUCTIONS = [
  {
    id: "a1",
    card: "Charizard ex — Obsidian Flames #125",
    seller: "Fede_Cards",
    sellerRating: 4.9,
    sellerSales: 132,
    img: null,
    basePrice: 45000,
    currentBid: 62000,
    bids: 7,
    closesInSec: 42 * 60,
    status: "live",
  },
  {
    id: "a2",
    card: "Umbreon VMAX Alt Art — Evolving Skies",
    seller: "Lucia.tcg",
    sellerRating: 5.0,
    sellerSales: 89,
    img: null,
    basePrice: 180000,
    currentBid: 205000,
    bids: 12,
    closesInSec: 8 * 60,
    status: "live",
  },
  {
    id: "a3",
    card: "Pikachu Ilustrador (proxy oficial torneo)",
    seller: "Nico_Kanto",
    sellerRating: 4.7,
    sellerSales: 41,
    img: null,
    basePrice: 15000,
    currentBid: 15000,
    bids: 0,
    closesInSec: 120 * 60,
    status: "live",
  },
];

const SEED_TICKETS = [
  {
    id: "t1",
    card: "Blastoise ex — Paldean Fates #211",
    seller: "Fede_Cards",
    buyer: "vos",
    price: 38000,
    code: "8F2C-91",
    status: "pendiente", // pendiente | entregado
    closedAt: "hoy 14:02",
  },
];

function formatARS(n) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

function formatCountdown(totalSeconds) {
  if (totalSeconds <= 0) return "Cerrada";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

// ---------------------------------------------
// Componentes pequeños
// ---------------------------------------------

function Pill({ children, tone = "default" }) {
  const tones = {
    default: "bg-paper text-ink-soft border-line",
    live: "bg-forest-mid/15 text-forest-deep border-forest-mid/40",
    urgent: "bg-[#FBE6E0] text-[#B9432C] border-[#B9432C]/30",
    gold: "bg-gold/15 text-gold-dark border-gold/40",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

function SellerBadge({ name, rating, sales }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-ink-soft">
      <span className="whitespace-nowrap font-bold text-ink">{name}</span>
      <span className="flex items-center gap-0.5 whitespace-nowrap text-gold-dark">
        <Star size={11} fill="currentColor" strokeWidth={0} />
        {rating.toFixed(1)}
      </span>
      <span className="whitespace-nowrap">· {sales} ventas</span>
    </div>
  );
}

function CardArt({ label, photoUrl }) {
  if (photoUrl) {
    return (
      <div className="relative aspect-[5/7] w-full overflow-hidden border-b-2 border-ink bg-cream-dark">
        <img src={photoUrl} alt={label} className="h-full w-full object-cover" />
      </div>
    );
  }
  // Placeholder visual con proporción de carta TCG (aprox 2.5:3.5)
  return (
    <div className="relative aspect-[5/7] w-full overflow-hidden border-b-2 border-ink bg-cream-dark">
      <div className="absolute inset-0 opacity-60" style={{
        backgroundImage: "repeating-linear-gradient(45deg, rgba(217,164,65,0.12) 0px, rgba(217,164,65,0.12) 10px, transparent 10px, transparent 20px)"
      }} />
      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
        <span className="font-pixel text-[9px] uppercase leading-relaxed text-ink-soft">{label}</span>
      </div>
    </div>
  );
}

function ConditionBadge({ condition, isGraded, gradingCompany, grade }) {
  if (isGraded) {
    return (
      <Pill tone="gold">
        {gradingCompany?.toUpperCase() ?? "GRADEADA"} {grade ?? ""}
      </Pill>
    );
  }
  if (!condition) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${
        CONDITION_COLORS[condition] ?? "border-line bg-paper text-ink-soft"
      }`}
    >
      {CONDITION_SHORT[condition] ?? condition}
    </span>
  );
}

// ---------------------------------------------
// Vista: Lista de subastas
// ---------------------------------------------
function AuctionList({
  auctions,
  onOpen,
  onCreate,
  profile,
  onSignOut,
  onOpenProfile,
  searchTerm,
  onSearchChange,
  pendingCount = 0,
  onOpenPendingTicket,
}) {
  const filtered = searchTerm
    ? auctions.filter((a) => a.card.toLowerCase().includes(searchTerm.toLowerCase()))
    : auctions;

  return (
    <div className="min-h-screen bg-cream pb-24">
      <header className="sticky top-0 z-10 border-b-4 border-forest-mid bg-forest-deep px-5 pb-4 pt-4">
        <div className="mx-auto max-w-5xl">
          {profile && (
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PokeballIcon size={16} />
                <span className="font-pixel text-[9px] tracking-wide text-gold">CIUDAD AZULONA</span>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-cream/80">
                <button onClick={onOpenProfile} className="font-bold hover:text-paper">{profile.alias}</button>
                <button onClick={onSignOut} className="flex items-center gap-1 hover:text-paper">
                  <LogOut size={13} /> Salir
                </button>
              </div>
            </div>
          )}

          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-pixel text-[9px] tracking-wide text-gold">SUBASTAS EN VIVO</p>
              <h1 className="mt-2 text-2xl font-extrabold text-paper">Mesa del evento</h1>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-light/40 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-cream">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-light" /> {auctions.length} activas
            </span>
          </div>

          {onSearchChange && (
            <div className="relative mt-3 sm:max-w-sm">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cream/50" />
              <input
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar carta o set..."
                className="w-full rounded-lg border border-white/20 bg-white/10 py-2 pl-9 pr-3 text-[13px] font-medium text-cream placeholder:text-cream/50 focus:outline-none focus-visible:border-gold"
              />
            </div>
          )}
        </div>
      </header>

      {pendingCount > 0 && (
        <div className="mx-auto max-w-5xl px-5 pt-4">
          <button
            onClick={onOpenPendingTicket}
            className="flex w-full items-center justify-between rounded-lg border-2 border-[#B9432C]/25 bg-[#FBE6E0] px-4 py-2.5 text-left"
          >
            <span className="text-[12px] font-bold text-[#B9432C]">
              Tenés {pendingCount} carta(s) pendiente(s) de retiro
            </span>
            <span className="text-[12px] font-bold text-[#B9432C]">Ver →</span>
          </button>
        </div>
      )}

      {searchTerm && filtered.length === 0 && (
        <div className="mx-auto max-w-5xl px-5 pt-10 text-center text-[13px] text-ink-soft">
          No encontramos cartas con "{searchTerm}".
        </div>
      )}
      {!searchTerm && auctions.length === 0 && (
        <div className="mx-auto max-w-5xl px-5 pt-10 text-center text-[13px] text-ink-soft">
          Todavía no hay subastas activas. ¡Sé el primero en publicar una carta!
        </div>
      )}

      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-5 pt-5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {filtered.map((a) => (
          <button
            key={a.id}
            onClick={() => onOpen(a)}
            className="group flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-paper text-left shadow-card transition hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <div className="relative">
              <CardArt label={a.card} photoUrl={a.photoUrl} />
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
            </div>
            <div className="flex flex-1 flex-col gap-1.5 border-t-2 border-ink px-3.5 py-3.5">
              <p className="line-clamp-2 text-[13px] font-extrabold leading-snug text-ink">{a.card}</p>
              {(a.setName || a.cardNumber || a.year) && (
                <p className="line-clamp-1 text-[11px] text-ink-soft">
                  {[a.setName, a.cardNumber, a.year].filter(Boolean).join(" · ")}
                </p>
              )}
              <SellerBadge name={a.seller} rating={a.sellerRating} sales={a.sellerSales} />
              <div className="mt-auto flex items-center justify-between pt-1.5">
                <span className="text-[16px] font-extrabold text-forest-deep">{formatARS(a.currentBid)}</span>
                <span
                  className={`font-pixel flex items-center gap-1 rounded px-1.5 py-1 text-[8.5px] ${
                    a.closesInSec <= 600 ? "bg-[#FBE6E0] text-[#B9432C]" : "bg-[#EFE6F5] text-plum"
                  }`}
                >
                  {formatCountdown(a.closesInSec)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onCreate}
        className="fixed bottom-6 right-5 flex items-center gap-2 rounded-full bg-gold px-5 py-3.5 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-deep"
      >
        <Plus size={16} strokeWidth={2.5} /> Publicar carta
      </button>
    </div>
  );
}

// ---------------------------------------------
// Vista: Detalle de subasta + pujar
// ---------------------------------------------
function AuctionDetail({ auction, onBack, onWin, onBid, bidError, bidBusy, isMine, bidHistory = [] }) {
  const [bid, setBid] = useState(auction.currentBid + 1000);
  const [placed, setPlaced] = useState(false);
  const [confirmedBid, setConfirmedBid] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const minBid = auction.currentBid + 1000;

  useEffect(() => {
    if (!placed) setBid(auction.currentBid + 1000);
  }, [auction.currentBid, placed]);

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

  return (
    <div className="min-h-screen bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">DETALLE DE SUBASTA</p>
      </header>

      <div className="px-5 pt-5">
        <button
          onClick={() => auction.photoUrl && setLightboxOpen(true)}
          className="mx-auto block w-40 overflow-hidden rounded-lg border-2 border-ink shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <CardArt label={auction.card} photoUrl={auction.photoUrl} />
        </button>
        {auction.photoUrl && (
          <p className="mt-1.5 text-center text-[11px] text-ink-soft">Tocá la foto para agrandarla</p>
        )}

        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-paper p-2 text-ink"
            >
              <X size={18} />
            </button>
            <img
              src={auction.photoUrl}
              alt={auction.card}
              className="max-h-full max-w-full rounded-lg object-contain shadow-card"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        <h2 className="mt-4 text-xl font-extrabold text-ink">{auction.card}</h2>
        <div className="mt-1"><SellerBadge name={auction.seller} rating={auction.sellerRating} sales={auction.sellerSales} /></div>

        {(auction.setName || auction.cardNumber || auction.year || auction.condition || auction.isGraded) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {(auction.setName || auction.cardNumber || auction.year) && (
              <span className="text-[12px] text-ink-soft">
                {[auction.setName, auction.cardNumber, auction.year].filter(Boolean).join(" · ")}
              </span>
            )}
            <ConditionBadge
              condition={auction.condition}
              isGraded={auction.isGraded}
              gradingCompany={auction.gradingCompany}
              grade={auction.grade}
            />
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-6">
          <div>
            <span className="block text-[10px] text-ink-soft">PUJA ACTUAL</span>
            <span className="text-lg font-extrabold text-forest-deep">{formatARS(auction.currentBid)}</span>
          </div>
          <div>
            <span className="block text-[10px] text-ink-soft">TERMINA EN</span>
            <span className={`text-lg font-extrabold ${auction.closesInSec <= 600 ? "text-[#B9432C]" : "text-ink"}`}>
              {formatCountdown(auction.closesInSec)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-ink-soft">PUJAS</span>
            <span className="text-lg font-extrabold text-ink">{auction.bids}</span>
          </div>
        </div>

        {isMine ? (
          <p className="mt-6 rounded-xl border-2 border-line bg-paper p-4 text-[12px] text-ink-soft">
            Esta es tu publicación — no podés pujar en tu propia carta.
          </p>
        ) : !placed ? (
          <div className="mt-6 rounded-xl border-2 border-ink bg-paper p-4">
            <p className="text-[12px] text-ink-soft">Tu puja (mínimo {formatARS(minBid)})</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={bid}
                min={minBid}
                step={1000}
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
            {bidError && <p className="mt-2 text-[12px] text-[#B9432C]">{bidError}</p>}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border-2 border-forest-mid bg-forest-mid/10 p-4">
            <p className="flex items-center gap-2 text-[13px] font-bold text-forest-deep">
              <Check size={15} /> Pujaste {formatARS(confirmedBid)}
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

        {bidHistory.length > 0 && (
          <div className="mt-6">
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Historial de pujas</h4>
            <ul className="mt-2 flex flex-col gap-1.5">
              {bidHistory.map((b) => (
                <li key={b.id} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2 text-[13px]">
                  <span className="text-ink-soft">{b.bidder?.alias ?? "—"}</span>
                  <span className="font-bold text-forest-deep">{formatARS(Number(b.amount))}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft">
          <ShieldCheck size={14} className="mt-0.5 shrink-0" />
          El pago se hace en persona en el stand del vendedor. La plataforma no procesa dinero — solo confirma la identidad de la entrega con un código único.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Ticket de retiro (signature element)
// ---------------------------------------------
function TicketView({ ticket, onBack, onMarkDelivered, busy = false, showRatingPrompt = false, onSubmitRating, ratingBusy = false }) {
  const delivered = ticket.status === "entregado";
  const [score, setScore] = useState(0);
  return (
    <div className="min-h-screen bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">COMPROBANTE DE RETIRO</p>
      </header>

      <div className="px-5 pt-6">
        {/* Ticket con borde perforado */}
        <div className="relative mx-auto max-w-sm">
          <div className="rounded-t-2xl border-2 border-b-0 border-ink bg-paper p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-soft">
                {ticket.isSeller ? "Vendiste esta carta" : "Ganaste esta carta"}
              </p>
              {delivered ? <Pill tone="live"><Check size={11} /> Entregado</Pill> : <Pill tone="gold">Pendiente de retiro</Pill>}
            </div>
            <h3 className="mt-3 text-lg font-extrabold text-ink">{ticket.card}</h3>
            <p className="mt-1 text-[13px] text-ink-soft">Vendedor: <span className="font-bold text-ink">{ticket.seller}</span></p>
            <p className="text-[13px] text-ink-soft">Precio final: <span className="font-bold text-forest-deep">{formatARS(ticket.price)}</span></p>
            <p className="mt-1 text-[11px] text-ink-soft">Cerrado {ticket.closedAt}</p>
          </div>

          {/* Perforación */}
          <div className="relative h-0 border-t-2 border-dashed border-line">
            <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-cream" />
            <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-cream" />
          </div>

          <div className="flex flex-col items-center rounded-b-2xl border-2 border-t-0 border-ink bg-paper p-6 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-soft">Código de retiro</p>
            <p className="font-pixel mt-3 text-2xl tracking-[0.1em] text-ink">{ticket.code}</p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-soft">
              <QrCode size={13} /> Mostrá este código en el stand del vendedor
            </div>
          </div>
        </div>

        {!delivered && (ticket.isSeller || ticket.isSeller === undefined) && (
          <button
            onClick={onMarkDelivered}
            disabled={busy}
            className="mx-auto mt-6 block rounded-lg bg-gold px-5 py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
          >
            {busy ? "Confirmando..." : "Vendedor: confirmar entrega"}
          </button>
        )}
        {!delivered && ticket.isSeller === false && (
          <p className="mx-auto mt-6 max-w-sm text-center text-[12px] text-ink-soft">
            Mostrale este código al vendedor cuando vayas a retirar la carta.
          </p>
        )}

        {delivered && showRatingPrompt && (
          <div className="mx-auto mt-6 max-w-sm rounded-xl border-2 border-line bg-paper p-4 text-center">
            <p className="text-[12px] text-ink-soft">¿Cómo te fue con {ticket.seller}?</p>
            <div className="mt-2 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setScore(n)} className="p-1">
                  <Star
                    size={22}
                    fill={n <= score ? "currentColor" : "none"}
                    className={n <= score ? "text-gold-dark" : "text-line"}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={() => onSubmitRating(score)}
              disabled={!score || ratingBusy}
              className="mt-3 rounded-lg bg-gold px-4 py-2 text-[12px] font-extrabold text-forest-deep shadow-[0_3px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[2px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
            >
              {ratingBusy ? "Enviando..." : "Calificar"}
            </button>
          </div>
        )}

        <p className="mx-auto mt-5 max-w-sm text-center text-[12px] leading-relaxed text-ink-soft">
          Este código es único y de un solo uso. No lo compartas hasta estar frente al vendedor.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Crear subasta
// ---------------------------------------------
const DURATION_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hora", value: 60 },
  { label: "3 horas", value: 180 },
];

function CreateAuction({ onBack, onCreate, showDuration = false, busy = false, error = "" }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState(60);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [setName_, setSetName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [year, setYear] = useState("");
  const [condition, setCondition] = useState("near_mint");
  const [isGraded, setIsGraded] = useState(false);
  const [gradingCompany, setGradingCompany] = useState("psa");
  const [grade, setGrade] = useState("");
  const [photoConverting, setPhotoConverting] = useState(false);
  const [photoError, setPhotoError] = useState("");

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0] ?? null;
    setPhotoError("");
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      /\.heic$|\.heif$/i.test(file.name);

    if (!isHeic) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      return;
    }

    setPhotoConverting(true);
    try {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
      const jpegFile = new File([converted], "foto.jpg", { type: "image/jpeg" });
      setPhotoFile(jpegFile);
      setPhotoPreview(URL.createObjectURL(jpegFile));
    } catch {
      setPhotoError("No pudimos convertir esta foto. Probá sacándola de nuevo o elegí otra.");
      setPhotoFile(null);
      setPhotoPreview(null);
    } finally {
      setPhotoConverting(false);
    }
  }

  const photoRequired = showDuration;
  const canPublish = name && price && (!photoRequired || photoFile) && !busy && !photoConverting;

  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[12px] font-bold text-ink-soft";

  return (
    <div className="min-h-screen bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">NUEVA PUBLICACION</p>
      </header>

      <div className="space-y-4 px-5 pt-6">
        {showDuration && (
          <div>
            <label className={labelClass}>Foto de la carta (obligatoria)</label>
            <label className="mt-1.5 flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-line bg-paper text-center text-[11px] text-ink-soft">
              {photoConverting ? (
                "Convirtiendo..."
              ) : photoPreview ? (
                <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
              ) : (
                "Sacar o elegir foto"
              )}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
            {photoError && <p className="mt-1.5 text-[11px] text-[#B9432C]">{photoError}</p>}
          </div>
        )}
        <div>
          <label className={labelClass}>Nombre de la carta</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Gengar VMAX Alt Art"
            className={inputClass}
          />
        </div>

        {showDuration && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Colección / set</label>
                <input
                  value={setName_}
                  onChange={(e) => setSetName(e.target.value)}
                  placeholder="Ej: Obsidian Flames"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Número</label>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Ej: 125/197"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Año</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Ej: 2023"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Condición</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
                  {CONDITION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-[13px] font-medium text-ink">
              <input
                type="checkbox"
                checked={isGraded}
                onChange={(e) => setIsGraded(e.target.checked)}
                className="h-4 w-4 accent-gold"
              />
              ¿Está gradeada?
            </label>

            {isGraded && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Empresa</label>
                  <select value={gradingCompany} onChange={(e) => setGradingCompany(e.target.value)} className={inputClass}>
                    {GRADING_COMPANY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Grado</label>
                  <input
                    type="number"
                    step="0.5"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Ej: 9.5"
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div>
          <label className={labelClass}>Precio base</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </div>
        {showDuration && (
          <div>
            <label className={labelClass}>Dura</label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={`rounded-lg border-2 py-2 text-[12px] font-bold transition ${
                    duration === opt.value
                      ? "border-gold bg-gold/15 text-gold-dark"
                      : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {error && <p className="text-[12px] text-[#B9432C]">{error}</p>}
        <button
          disabled={!canPublish}
          onClick={() =>
            onCreate({
              name,
              price: Number(price),
              durationMinutes: duration,
              photoFile,
              setName: setName_,
              cardNumber,
              year: year ? Number(year) : null,
              condition,
              isGraded,
              gradingCompany,
              grade: grade ? Number(grade) : null,
            })
          }
          className="w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          {busy ? "Publicando..." : "Publicar subasta"}
        </button>
        {photoRequired && !photoFile && (
          <p className="text-center text-[11px] text-ink-soft">Necesitás sacarle una foto antes de publicar.</p>
        )}
        <p className="text-center text-[12px] text-ink-soft">
          Compartí el link en tu grupo de WhatsApp. La subasta corre acá; la entrega sigue siendo en el stand.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Notificaciones flotantes (ej: "te superaron")
// ---------------------------------------------
function ToastStack({ toasts }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto max-w-sm rounded-lg border-2 border-[#B9432C]/30 bg-[#FBE6E0] px-4 py-2.5 text-center text-[13px] font-bold text-[#B9432C] shadow-card"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------
// Vista: Perfil
// ---------------------------------------------
function ProfileView({ profile, onBack }) {
  return (
    <div className="min-h-screen bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">TU PERFIL</p>
      </header>

      <div className="px-5 pt-6">
        <h2 className="text-2xl font-extrabold text-ink">{profile.alias}</h2>
        <div className="mt-1 flex items-center gap-1 text-gold-dark">
          <Star size={14} fill="currentColor" strokeWidth={0} />
          <span className="text-[14px] font-bold">{Number(profile.rating_avg).toFixed(1)}</span>
          <span className="text-[12px] font-medium text-ink-soft">de reputación</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg border-2 border-ink bg-paper p-4 shadow-card">
            <p className="text-[11px] font-bold text-ink-soft">Ventas completadas</p>
            <p className="mt-1 text-2xl font-extrabold text-forest-deep">{profile.sales_count}</p>
          </div>
          <div className="rounded-lg border-2 border-ink bg-paper p-4 shadow-card">
            <p className="text-[11px] font-bold text-ink-soft">Compras completadas</p>
            <p className="mt-1 text-2xl font-extrabold text-forest-deep">{profile.purchases_count}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------
// App raíz
// ---------------------------------------------
export default function App() {
  const auth = useAuth();
  const [view, setView] = useState({ name: "list" });
  const [auctions, setAuctions] = useState(SEED_AUCTIONS);
  const [tickets, setTickets] = useState(SEED_TICKETS);
  const [realRows, setRealRows] = useState([]);
  const [auctionsLoading, setAuctionsLoading] = useState(isSupabaseConfigured);
  const [searchTerm, setSearchTerm] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidBusy, setBidBusy] = useState(false);
  const [realTickets, setRealTickets] = useState([]);
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [ratedTicketIds, setRatedTicketIds] = useState(new Set());
  const [ratingBusy, setRatingBusy] = useState(false);
  const [viewedProfile, setViewedProfile] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [, setClockTick] = useState(0);
  const [toasts, setToasts] = useState([]);
  const myBidAmountsRef = useRef({});

  const ready = isSupabaseConfigured && auth.session && auth.profile;

  function pushToast(text) {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }

  useEffect(() => {
    const id = setInterval(() => setClockTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    listLiveAuctions()
      .then((rows) => !cancelled && setRealRows(rows))
      .finally(() => !cancelled && setAuctionsLoading(false));
    const unsubscribe = subscribeToLiveAuctions((updatedRow) => {
      setRealRows((rows) => rows.map((r) => (r.id === updatedRow.id ? { ...r, ...updatedRow } : r)));
      const myAmount = myBidAmountsRef.current[updatedRow.id];
      if (myAmount != null && Number(updatedRow.current_bid) > myAmount) {
        pushToast(`Te superaron en "${updatedRow.card_name}" — nueva puja ${formatARS(Number(updatedRow.current_bid))}`);
        delete myBidAmountsRef.current[updatedRow.id];
      }
    });
    listMyTickets().then((rows) => !cancelled && setRealTickets(rows));
    listMyGivenRatingTicketIds().then((ids) => !cancelled && setRatedTicketIds(ids));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [ready]);

  useEffect(() => {
    if (!isSupabaseConfigured || view.name !== "detail") {
      setBidHistory([]);
      return;
    }
    let cancelled = false;
    listRecentBids(view.auctionId).then((rows) => !cancelled && setBidHistory(rows));
    return () => {
      cancelled = true;
    };
  }, [view.name, view.auctionId]);

  if (isSupabaseConfigured && auth.loading) {
    return <div className="min-h-screen bg-cream" />;
  }

  if (isSupabaseConfigured && (!auth.session || !auth.profile)) {
    return <Login />;
  }

  const displayAuctions = isSupabaseConfigured ? realRows.map(auctionToVM) : auctions;

  function handleWin(auction) {
    const code = Math.random().toString(16).slice(2, 6).toUpperCase() + "-" + Math.floor(10 + Math.random() * 90);
    const newTicket = {
      id: "t" + Date.now(),
      card: auction.card,
      seller: auction.seller,
      buyer: "vos",
      price: auction.currentBid,
      code,
      status: "pendiente",
      closedAt: "recién",
    };
    setTickets((t) => [newTicket, ...t]);
    setView({ name: "ticket", ticket: newTicket });
  }

  function handleCreate({ name, price }) {
    const newAuction = {
      id: "a" + Date.now(),
      card: name,
      seller: "vos",
      sellerRating: 5.0,
      sellerSales: 0,
      img: null,
      basePrice: price,
      currentBid: price,
      bids: 0,
      closesInSec: 60 * 60,
      status: "live",
    };
    setAuctions((a) => [newAuction, ...a]);
    setView({ name: "list" });
  }

  async function handleRealCreate({
    name,
    price,
    durationMinutes,
    photoFile,
    setName,
    cardNumber,
    year,
    condition,
    isGraded,
    gradingCompany,
    grade,
  }) {
    setCreateBusy(true);
    setCreateError("");
    try {
      const photoUrl = photoFile ? await uploadAuctionPhoto(photoFile) : null;
      const row = await createAuction({
        sellerId: auth.session.user.id,
        cardName: name,
        basePrice: price,
        durationMinutes,
        photoUrl,
        setName,
        cardNumber,
        year,
        condition,
        isGraded,
        gradingCompany,
        grade,
      });
      setRealRows((rows) => [row, ...rows]);
      setView({ name: "list" });
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreateBusy(false);
    }
  }

  async function handleRealBid(auctionId, amount) {
    setBidBusy(true);
    setBidError("");
    try {
      await placeBid(auctionId, amount);
      myBidAmountsRef.current[auctionId] = amount;
      setRealRows((rows) =>
        rows.map((r) => (r.id === auctionId ? { ...r, current_bid: amount, bid_count: r.bid_count + 1 } : r))
      );
      listRecentBids(auctionId).then(setBidHistory);
      return true;
    } catch (e) {
      setBidError(e.message);
      return false;
    } finally {
      setBidBusy(false);
    }
  }

  async function handleRedeem(ticketId) {
    setRedeemBusy(true);
    try {
      await redeemTicket(ticketId);
      setRealTickets((rows) =>
        rows.map((r) => (r.id === ticketId ? { ...r, status: "redeemed", redeemed_at: new Date().toISOString() } : r))
      );
    } finally {
      setRedeemBusy(false);
    }
  }

  async function handleSubmitRating(ticketId, sellerId, score) {
    setRatingBusy(true);
    try {
      await submitRating(ticketId, auth.session.user.id, sellerId, score);
      setRatedTicketIds((ids) => new Set(ids).add(ticketId));
    } finally {
      setRatingBusy(false);
    }
  }

  async function openProfile() {
    const p = await getProfile(auth.session.user.id);
    setViewedProfile(p);
    setView({ name: "profile" });
  }

  const activeAuction =
    view.name === "detail" ? displayAuctions.find((a) => a.id === view.auctionId) : null;
  const displayTickets = isSupabaseConfigured
    ? realTickets.map((t) => ticketToVM(t, auth.session?.user.id))
    : tickets;

  return (
    <div className="min-h-screen bg-cream font-sans text-ink" style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <style>{`
        input:focus { outline: none; }
      `}</style>

      <ToastStack toasts={toasts} />

      {!isSupabaseConfigured && (
        <div className="flex items-center justify-between bg-[#B9432C]/15 px-5 py-2 text-[11px] font-bold text-[#B9432C]">
          <span>Modo demo — sin backend conectado (datos de ejemplo, no se guarda nada)</span>
        </div>
      )}

      {view.name === "list" && isSupabaseConfigured && auctionsLoading && (
        <p className="bg-cream px-5 pt-10 text-center text-[12px] text-ink-soft">Cargando subastas...</p>
      )}

      {view.name === "list" && !(isSupabaseConfigured && auctionsLoading) && (
        <AuctionList
          auctions={displayAuctions}
          onOpen={(a) => setView({ name: "detail", auctionId: a.id })}
          onCreate={() => setView({ name: "create" })}
          profile={isSupabaseConfigured ? auth.profile : null}
          onSignOut={auth.signOut}
          onOpenProfile={openProfile}
          searchTerm={searchTerm}
          onSearchChange={isSupabaseConfigured ? setSearchTerm : undefined}
          pendingCount={displayTickets.filter((t) => t.status === "pendiente").length}
          onOpenPendingTicket={() =>
            setView({ name: "ticket", ticket: displayTickets.find((t) => t.status === "pendiente") })
          }
        />
      )}

      {view.name === "detail" && activeAuction && (
        <AuctionDetail
          auction={activeAuction}
          onBack={() => setView({ name: "list" })}
          onWin={handleWin}
          onBid={isSupabaseConfigured ? handleRealBid : undefined}
          bidError={bidError}
          bidBusy={bidBusy}
          isMine={isSupabaseConfigured && activeAuction.sellerId === auth.session?.user.id}
          bidHistory={bidHistory}
        />
      )}

      {view.name === "ticket" && (
        <TicketView
          ticket={view.ticket}
          busy={redeemBusy}
          onBack={() => setView({ name: "list" })}
          onMarkDelivered={async () => {
            if (isSupabaseConfigured) {
              await handleRedeem(view.ticket.id);
              setView({ name: "ticket", ticket: { ...view.ticket, status: "entregado" } });
            } else {
              setTickets((ts) => ts.map((t) => (t.id === view.ticket.id ? { ...t, status: "entregado" } : t)));
              setView({ name: "ticket", ticket: { ...view.ticket, status: "entregado" } });
            }
          }}
          showRatingPrompt={
            isSupabaseConfigured && view.ticket.isSeller === false && !ratedTicketIds.has(view.ticket.id)
          }
          ratingBusy={ratingBusy}
          onSubmitRating={async (score) => {
            await handleSubmitRating(view.ticket.id, view.ticket.sellerId, score);
          }}
        />
      )}

      {view.name === "profile" && viewedProfile && (
        <ProfileView profile={viewedProfile} onBack={() => setView({ name: "list" })} />
      )}

      {view.name === "create" && (
        <CreateAuction
          onBack={() => setView({ name: "list" })}
          onCreate={isSupabaseConfigured ? handleRealCreate : handleCreate}
          showDuration={isSupabaseConfigured}
          busy={createBusy}
          error={createError}
        />
      )}
    </div>
  );
}
