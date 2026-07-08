import { useState, useEffect, useMemo, useRef } from "react";
import { Clock, Check, QrCode, ArrowLeft, Plus, ShieldCheck, Star, X, LogOut, Search, ChevronDown } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import Login from "./components/Login";
import Landing from "./components/Landing";
import GenderIcon from "./components/GenderIcon";
import BadgeIcon from "./components/BadgeIcon";
import PriceChart from "./components/PriceChart";
import PokeballIcon from "./components/PokeballIcon";
import {
  listLiveAuctions,
  subscribeToLiveAuctions,
  placeBid,
  uploadAuctionPhotos,
  createAuction,
  auctionToVM,
  listMyTickets,
  ticketToVM,
  redeemTicket,
  submitRating,
  listMyGivenRatingTicketIds,
  getProfile,
  getProfileBadges,
  updateProfile,
  listRecentBids,
  listMyPublications,
  listMyBidAuctions,
  createReport,
  listAllReports,
  updateReportStatus,
  CONDITION_OPTIONS,
  CONDITION_SHORT,
  CONDITION_COLORS,
  GRADING_COMPANY_OPTIONS,
  RARITY_OPTIONS,
  RARITY_SYMBOL,
  RARITY_LABEL,
  MAX_PHOTOS,
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

function SellerBadge({ name, rating, sales, onClick, gender }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-ink-soft">
      <GenderIcon gender={gender} size={14} />
      {onClick ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="whitespace-nowrap font-bold text-ink underline decoration-line decoration-dotted underline-offset-2 hover:text-forest-deep"
        >
          {name}
        </button>
      ) : (
        <span className="whitespace-nowrap font-bold text-ink">{name}</span>
      )}
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

function AccountMenu({ alias, gender, isAdmin, onOpenProfile, onOpenMyBids, onOpenMyPublications, onOpenReports }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 font-bold text-cream/80 hover:text-paper"
      >
        <GenderIcon gender={gender} size={14} />
        {alias} <ChevronDown size={12} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-lg border-2 border-ink bg-paper text-ink shadow-card">
            <button
              onClick={() => {
                setOpen(false);
                onOpenProfile();
              }}
              className="block w-full px-4 py-2.5 text-left text-[12px] font-bold hover:bg-cream"
            >
              Mi perfil
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onOpenMyBids();
              }}
              className="block w-full border-t border-line px-4 py-2.5 text-left text-[12px] font-bold hover:bg-cream"
            >
              Mis pujas
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onOpenMyPublications();
              }}
              className="block w-full border-t border-line px-4 py-2.5 text-left text-[12px] font-bold hover:bg-cream"
            >
              Mis publicaciones
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  setOpen(false);
                  onOpenReports();
                }}
                className="block w-full border-t border-line px-4 py-2.5 text-left text-[12px] font-bold text-[#B9432C] hover:bg-cream"
              >
                Denuncias
              </button>
            )}
          </div>
        </>
      )}
    </div>
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
  onOpenSellerProfile,
  onOpenMyBids,
  onOpenMyPublications,
  onOpenReports,
  searchTerm,
  onSearchChange,
  pendingCount = 0,
  onOpenPendingTicket,
}) {
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const bySearch = searchTerm
    ? auctions.filter((a) => a.card.toLowerCase().includes(searchTerm.toLowerCase()))
    : auctions;
  const filtered = featuredOnly ? bySearch.filter((a) => a.isFeatured) : bySearch;

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
                <AccountMenu
                  alias={profile.alias}
                  gender={profile.gender}
                  isAdmin={profile.is_admin}
                  onOpenProfile={onOpenProfile}
                  onOpenMyBids={onOpenMyBids}
                  onOpenMyPublications={onOpenMyPublications}
                  onOpenReports={onOpenReports}
                />
                <button onClick={onSignOut} className="flex items-center gap-1 hover:text-paper">
                  <LogOut size={13} /> Salir
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-y-2">
            <div>
              <p className="font-pixel text-[9px] tracking-wide text-gold">SUBASTAS EN VIVO</p>
              <h1 className="mt-2 text-2xl font-extrabold text-paper">Mesa del evento</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-light/40 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-cream">
                <span className="h-1.5 w-1.5 rounded-full bg-forest-light" /> {auctions.length} activas
              </span>
              <button
                onClick={() => setFeaturedOnly((f) => !f)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                  featuredOnly ? "border-plum bg-plum/30 text-cream" : "border-forest-light/40 bg-white/10 text-cream/80"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-plum" /> Destacadas
              </button>
            </div>
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
          <div
            key={a.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(a)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onOpen(a);
            }}
            className={`group flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 bg-paper text-left shadow-card transition hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              a.isFeatured ? "border-plum" : "border-ink"
            }`}
          >
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
            </div>
            <div className="flex flex-1 flex-col gap-1.5 border-t-2 border-ink px-3.5 py-3.5">
              <p className="line-clamp-2 text-[13px] font-extrabold leading-snug text-ink">{a.card}</p>
              {(a.setName || a.cardNumber || a.year) && (
                <p className="line-clamp-1 text-[11px] text-ink-soft">
                  {[a.setName, a.cardNumber, a.year].filter(Boolean).join(" · ")}
                </p>
              )}
              <SellerBadge
                name={a.seller}
                rating={a.sellerRating}
                sales={a.sellerSales}
                gender={a.sellerGender}
                onClick={onOpenSellerProfile && a.sellerId ? () => onOpenSellerProfile(a.sellerId) : undefined}
              />
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
          </div>
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
// Vista: Mis pujas / Mis publicaciones
// ---------------------------------------------
function MyAuctionsView({ title, emptyText, auctions, onBack, onOpen, showMyBid = false }) {
  return (
    <div className="min-h-screen bg-cream pb-10">
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
          {auctions.map((a) => {
            const clickable = a.status === "live" && !!onOpen;
            return (
              <div
                key={a.id}
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
                className={`flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-paper text-left shadow-card ${
                  clickable ? "cursor-pointer transition hover:-translate-y-1" : "opacity-90"
                }`}
              >
                <div className="relative">
                  <CardArt label={a.card} photoUrl={a.photoUrl} />
                  <div className="absolute right-2 top-2">
                    {a.status === "live" ? <Pill tone="live">En vivo</Pill> : <Pill>Cerrada</Pill>}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 border-t-2 border-ink px-3.5 py-3.5">
                  <p className="line-clamp-2 text-[13px] font-extrabold leading-snug text-ink">{a.card}</p>
                  {(a.setName || a.cardNumber || a.year) && (
                    <p className="line-clamp-1 text-[11px] text-ink-soft">
                      {[a.setName, a.cardNumber, a.year].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {showMyBid && a.myBid != null ? (
                    <div className="mt-auto flex flex-col gap-0.5 pt-1.5">
                      <span className="text-[16px] font-extrabold text-forest-deep">{formatARS(a.currentBid)}</span>
                      <span className="text-[11px] font-bold text-ink-soft">Tu puja: {formatARS(a.myBid)}</span>
                    </div>
                  ) : (
                    <div className="mt-auto flex items-center justify-between pt-1.5">
                      <span className="text-[16px] font-extrabold text-forest-deep">{formatARS(a.currentBid)}</span>
                      {a.status === "live" && (
                        <span className="font-pixel flex items-center gap-1 rounded bg-[#EFE6F5] px-1.5 py-1 text-[8.5px] text-plum">
                          {formatCountdown(a.closesInSec)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------
// Vista: Denuncias (admin)
// ---------------------------------------------
function AdminReportsView({ reports, onBack, onResolve, busyId }) {
  const open = reports.filter((r) => r.status === "open");
  const resolved = reports.filter((r) => r.status !== "open");

  return (
    <div className="min-h-screen bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">DENUNCIAS</p>
      </header>

      <div className="space-y-3 px-5 pt-6">
        <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
          Abiertas ({open.length})
        </h3>
        {open.length === 0 && <p className="text-[12px] text-ink-soft">No hay denuncias pendientes.</p>}
        {open.map((r) => (
          <div key={r.id} className="rounded-lg border-2 border-[#B9432C]/30 bg-[#FBE6E0] p-3">
            <p className="text-[13px] font-extrabold text-ink">{r.auction?.card_name ?? "Subasta eliminada"}</p>
            <p className="text-[11px] text-ink-soft">Vendedor: {r.auction?.seller?.alias ?? "—"}</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink">{r.reason}</p>
            <p className="mt-1 text-[10px] text-ink-soft">
              Denunciado por {r.reporter?.alias ?? "—"} · {new Date(r.created_at).toLocaleString("es-AR")}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => onResolve(r.id, "resolved")}
                disabled={busyId === r.id}
                className="rounded-lg bg-forest-mid px-3 py-1.5 text-[11px] font-bold text-paper disabled:opacity-40"
              >
                Marcar resuelta
              </button>
              <button
                onClick={() => onResolve(r.id, "dismissed")}
                disabled={busyId === r.id}
                className="rounded-lg border-2 border-line px-3 py-1.5 text-[11px] font-bold text-ink-soft disabled:opacity-40"
              >
                Descartar
              </button>
            </div>
          </div>
        ))}

        {resolved.length > 0 && (
          <>
            <h3 className="mt-4 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Resueltas</h3>
            {resolved.map((r) => (
              <div key={r.id} className="rounded-lg border-2 border-line bg-paper p-3 opacity-70">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-extrabold text-ink">{r.auction?.card_name ?? "Subasta eliminada"}</p>
                  <Pill tone={r.status === "resolved" ? "live" : "default"}>
                    {r.status === "resolved" ? "Resuelta" : "Descartada"}
                  </Pill>
                </div>
                <p className="mt-1 text-[12px] text-ink-soft">{r.reason}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Detalle de subasta + pujar
// ---------------------------------------------
function AuctionDetail({
  auction,
  onBack,
  onWin,
  onBid,
  bidError,
  bidBusy,
  isMine,
  bidHistory = [],
  onOpenUserProfile,
  onReport,
  reportBusy,
  reportError,
}) {
  const [bid, setBid] = useState(auction.currentBid + 1000);
  const [placed, setPlaced] = useState(false);
  const [confirmedBid, setConfirmedBid] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const photos = auction.photoUrls?.length ? auction.photoUrls : auction.photoUrl ? [auction.photoUrl] : [];
  const minBid = auction.currentBid + 1000;

  async function handleReport() {
    const ok = await onReport(auction.id, reportReason);
    if (ok) {
      setReportSent(true);
      setReportOpen(false);
    }
  }

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
          onClick={() => photos.length > 0 && setLightboxOpen(true)}
          className="mx-auto block w-40 overflow-hidden rounded-lg border-2 border-ink shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-paper p-2 text-ink"
            >
              <X size={18} />
            </button>
            {photos.length > 1 && (
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
              className="max-h-full max-w-full rounded-lg object-contain shadow-card"
              onClick={(e) => e.stopPropagation()}
            />
            {photos.length > 1 && (
              <span className="absolute bottom-6 rounded-full bg-ink/60 px-2.5 py-1 text-[11px] font-bold text-paper">
                {activePhoto + 1} / {photos.length}
              </span>
            )}
          </div>
        )}

        <h2 className="mt-4 text-xl font-extrabold text-ink">{auction.card}</h2>
        <div className="mt-1">
          <SellerBadge
            name={auction.seller}
            rating={auction.sellerRating}
            sales={auction.sellerSales}
            gender={auction.sellerGender}
            onClick={onOpenUserProfile && auction.sellerId ? () => onOpenUserProfile(auction.sellerId) : undefined}
          />
        </div>

        {(auction.setName || auction.cardNumber || auction.year || auction.condition || auction.isGraded || auction.rarity) && (
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
            {auction.rarity && (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2 py-1 text-[12px] font-bold text-ink"
                title={RARITY_LABEL[auction.rarity]}
              >
                {RARITY_SYMBOL[auction.rarity]} {RARITY_LABEL[auction.rarity]}
              </span>
            )}
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
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Evolución del precio</h4>
              {auction.referencePrice != null && (
                <span className="text-[11px] font-bold text-plum">
                  Referencia: {formatARS(auction.referencePrice)}
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
                <li key={b.id} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2 text-[13px]">
                  <span className="flex items-center gap-1.5">
                    <GenderIcon gender={b.bidder?.gender} size={13} />
                    {onOpenUserProfile && b.bidder?.id ? (
                      <button
                        onClick={() => onOpenUserProfile(b.bidder.id)}
                        className="text-ink-soft underline decoration-line decoration-dotted underline-offset-2 hover:text-forest-deep"
                      >
                        {b.bidder?.alias ?? "—"}
                      </button>
                    ) : (
                      <span className="text-ink-soft">{b.bidder?.alias ?? "—"}</span>
                    )}
                  </span>
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
  );
}

// ---------------------------------------------
// Vista: Ticket de retiro (signature element)
// ---------------------------------------------
function TicketView({ ticket, onBack, onMarkDelivered, busy = false, showRatingPrompt = false, onSubmitRating, ratingBusy = false, onOpenUserProfile }) {
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
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-soft">
              Vendedor:
              <GenderIcon gender={ticket.sellerGender} size={13} />
              {onOpenUserProfile && ticket.sellerId ? (
                <button
                  onClick={() => onOpenUserProfile(ticket.sellerId)}
                  className="font-bold text-ink underline decoration-line decoration-dotted underline-offset-2 hover:text-forest-deep"
                >
                  {ticket.seller}
                </button>
              ) : (
                <span className="font-bold text-ink">{ticket.seller}</span>
              )}
            </p>
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

        {!delivered && ticket.isSeller === false && (
          <div className="mx-auto mt-6 max-w-sm rounded-lg border-2 border-line bg-paper p-3 text-[12px] leading-relaxed text-ink-soft">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Cómo coordinar el retiro</p>
            <PickupInfoText
              profile={{
                has_stand: ticket.sellerHasStand,
                stand_number: ticket.sellerStandNumber,
                pickup_day: ticket.sellerPickupDay,
                pickup_time: ticket.sellerPickupTime,
                contact_phone: ticket.sellerContactPhone,
              }}
            />
          </div>
        )}

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
  const [referencePrice, setReferencePrice] = useState("");
  const [duration, setDuration] = useState(60);
  const [photos, setPhotos] = useState([]); // [{ file, preview }]
  const [setName_, setSetName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [year, setYear] = useState("");
  const [condition, setCondition] = useState("near_mint");
  const [isGraded, setIsGraded] = useState(false);
  const [gradingCompany, setGradingCompany] = useState("psa");
  const [grade, setGrade] = useState("");
  const [rarity, setRarity] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [photoConverting, setPhotoConverting] = useState(false);
  const [photoError, setPhotoError] = useState("");

  async function handlePhotoChange(e) {
    const files = [...(e.target.files ?? [])];
    e.target.value = "";
    setPhotoError("");
    if (files.length === 0) return;

    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      setPhotoError(`Ya tenés el máximo de ${MAX_PHOTOS} fotos.`);
      return;
    }
    const toAdd = files.slice(0, room);

    setPhotoConverting(true);
    try {
      const converted = await Promise.all(
        toAdd.map(async (file) => {
          const isHeic =
            file.type === "image/heic" || file.type === "image/heif" || /\.heic$|\.heif$/i.test(file.name);
          if (!isHeic) return file;
          const heic2any = (await import("heic2any")).default;
          const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
          return new File([blob], "foto.jpg", { type: "image/jpeg" });
        })
      );
      setPhotos((prev) => [...prev, ...converted.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    } catch {
      setPhotoError("No pudimos convertir alguna foto. Probá sacándola de nuevo o elegí otra.");
    } finally {
      setPhotoConverting(false);
    }
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  const photoRequired = showDuration;
  const canPublish = name && price && (!photoRequired || photos.length > 0) && !busy && !photoConverting;

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
            <label className={labelClass}>
              Fotos de la carta (obligatoria, hasta {MAX_PHOTOS} — la primera es la portada)
            </label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-ink">
                  <img src={p.preview} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-0 top-0 bg-gold px-1 py-0.5 text-[8px] font-extrabold text-forest-deep">
                      PORTADA
                    </span>
                  )}
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-paper"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-line bg-paper text-center text-[11px] text-ink-soft">
                  {photoConverting ? "Convirtiendo..." : "Sacar o elegir foto"}
                  <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>
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

            <div>
              <label className={labelClass}>Rareza</label>
              <select value={rarity} onChange={(e) => setRarity(e.target.value)} className={inputClass}>
                <option value="">Sin especificar</option>
                {RARITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.symbol} {opt.label}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-[13px] font-medium text-ink">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 accent-plum"
              />
              Destacar esta subasta <span className="text-plum">●</span>
            </label>

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
            <label className={labelClass}>Precio de referencia (opcional)</label>
            <input
              type="number"
              value={referencePrice}
              onChange={(e) => setReferencePrice(e.target.value)}
              placeholder="Ej: lo que vale en PriceCharting u otra fuente"
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-ink-soft">
              Se usa para el gráfico de precio — mostramos qué tan cerca está la puja de este valor.
            </p>
          </div>
        )}

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
              photoFiles: photos.map((p) => p.file),
              setName: setName_,
              cardNumber,
              year: year ? Number(year) : null,
              condition,
              isGraded,
              gradingCompany,
              grade: grade ? Number(grade) : null,
              rarity,
              isFeatured,
              referencePrice: referencePrice ? Number(referencePrice) : null,
            })
          }
          className="w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          {busy ? "Publicando..." : "Publicar subasta"}
        </button>
        {photoRequired && photos.length === 0 && (
          <p className="text-center text-[11px] text-ink-soft">Necesitás sacarle al menos una foto antes de publicar.</p>
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
function PickupInfoText({ profile }) {
  if (profile.has_stand) {
    return profile.stand_number ? (
      <>Tiene stand fijo: <span className="font-bold text-ink">{profile.stand_number}</span></>
    ) : (
      <>Tiene stand fijo en el evento.</>
    );
  }
  if (profile.pickup_day || profile.pickup_time || profile.contact_phone) {
    return (
      <>
        Prefiere coordinar el retiro
        {profile.pickup_day && (
          <>
            {" "}— <span className="font-bold text-ink">{profile.pickup_day}</span>
          </>
        )}
        {profile.pickup_time && (
          <>
            {" "}a las <span className="font-bold text-ink">{profile.pickup_time}</span>
          </>
        )}
        {profile.contact_phone && (
          <>
            <br />
            Contacto: <span className="font-bold text-ink">{profile.contact_phone}</span>
          </>
        )}
      </>
    );
  }
  return "Todavía no cargó cómo prefiere coordinar el retiro.";
}

function ProfileView({ profile, onBack, isOwn = true, badges = [], onEditPickup }) {
  return (
    <div className="min-h-screen bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">{isOwn ? "TU PERFIL" : "PERFIL"}</p>
      </header>

      <div className="px-5 pt-6">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
          <GenderIcon gender={profile.gender} size={22} />
          {profile.alias}
        </h2>
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

        <div className="mt-6">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Medallas</h3>
          {badges.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2">
              {badges.map((b) => (
                <div
                  key={b.code}
                  className="flex items-center gap-3 rounded-lg border-2 border-line bg-paper p-2.5 shadow-card"
                >
                  <div className="h-11 w-11 shrink-0">
                    <BadgeIcon icon={b.icon} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold text-ink">{b.name}</p>
                    <p className="text-[11px] leading-tight text-ink-soft">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[12px] text-ink-soft">
              {isOwn ? "Todavía no ganaste medallas." : "Todavía no ganó medallas."}
            </p>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Retiro de la carta</h3>
            {isOwn && (
              <button
                onClick={onEditPickup}
                className="text-[11px] font-bold text-forest-deep underline underline-offset-2"
              >
                Editar
              </button>
            )}
          </div>
          <div className="mt-2 rounded-lg border-2 border-line bg-paper p-3 text-[12px] leading-relaxed text-ink-soft">
            <PickupInfoText profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Editar info de retiro
// ---------------------------------------------
function EditPickupInfo({ profile, onBack, onSave, busy = false, error = "" }) {
  const [hasStand, setHasStand] = useState(profile.has_stand ?? false);
  const [standNumber, setStandNumber] = useState(profile.stand_number ?? "");
  const [pickupDay, setPickupDay] = useState(profile.pickup_day ?? "");
  const [pickupTime, setPickupTime] = useState(profile.pickup_time ?? "");
  const [contactPhone, setContactPhone] = useState(profile.contact_phone ?? "");

  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[12px] font-bold text-ink-soft";

  return (
    <div className="min-h-screen bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">INFO DE RETIRO</p>
      </header>

      <div className="space-y-4 px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Contale a quien te gane la subasta cómo coordinar el retiro de la carta.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setHasStand(true)}
            className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
              hasStand ? "border-gold bg-gold/15 text-gold-dark" : "border-line bg-paper text-ink-soft"
            }`}
          >
            Tengo stand fijo
          </button>
          <button
            onClick={() => setHasStand(false)}
            className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
              !hasStand ? "border-gold bg-gold/15 text-gold-dark" : "border-line bg-paper text-ink-soft"
            }`}
          >
            Prefiero coordinar
          </button>
        </div>

        {hasStand ? (
          <div>
            <label className={labelClass}>Número o nombre del stand</label>
            <input
              value={standNumber}
              onChange={(e) => setStandNumber(e.target.value)}
              placeholder="Ej: Stand 14"
              className={inputClass}
            />
          </div>
        ) : (
          <>
            <div>
              <label className={labelClass}>Día de la semana</label>
              <input
                value={pickupDay}
                onChange={(e) => setPickupDay(e.target.value)}
                placeholder="Ej: Sábados"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Horario preferido</label>
              <input
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                placeholder="Ej: 15 a 18hs"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Teléfono de contacto</label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Ej: 1122334455"
                className={inputClass}
              />
            </div>
          </>
        )}

        {error && <p className="text-[12px] text-[#B9432C]">{error}</p>}

        <button
          disabled={busy}
          onClick={() => onSave({ hasStand, standNumber, pickupDay, pickupTime, contactPhone })}
          className="w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          {busy ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------
// App raíz
// ---------------------------------------------
export default function App() {
  const auth = useAuth();
  const [enteredLanding, setEnteredLanding] = useState(false);
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
  const [viewedBadges, setViewedBadges] = useState([]);
  const [pickupBusy, setPickupBusy] = useState(false);
  const [pickupError, setPickupError] = useState("");
  const [bidHistory, setBidHistory] = useState([]);
  const [myPublications, setMyPublications] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState("");
  const [allReports, setAllReports] = useState([]);
  const [resolveReportBusyId, setResolveReportBusyId] = useState(null);
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

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    if (view.name === "myPublications") {
      listMyPublications(auth.session.user.id).then((rows) => !cancelled && setMyPublications(rows.map(auctionToVM)));
    } else if (view.name === "myBids") {
      listMyBidAuctions(auth.session.user.id).then(
        (rows) => !cancelled && setMyBids(rows.map((r) => ({ ...auctionToVM(r), myBid: r.myBid })))
      );
    } else if (view.name === "reports") {
      listAllReports().then((rows) => !cancelled && setAllReports(rows));
    }
    return () => {
      cancelled = true;
    };
  }, [view.name, ready]);

  if (isSupabaseConfigured && auth.loading) {
    return <div className="min-h-screen bg-cream" />;
  }

  if (!enteredLanding && (!isSupabaseConfigured || !auth.session || !auth.profile)) {
    return <Landing onEnter={() => setEnteredLanding(true)} />;
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
    photoFiles,
    setName,
    cardNumber,
    year,
    condition,
    isGraded,
    gradingCompany,
    grade,
    rarity,
    isFeatured,
    referencePrice,
  }) {
    setCreateBusy(true);
    setCreateError("");
    try {
      const photoUrls = photoFiles?.length ? await uploadAuctionPhotos(photoFiles) : [];
      const row = await createAuction({
        sellerId: auth.session.user.id,
        cardName: name,
        basePrice: price,
        durationMinutes,
        photoUrls,
        setName,
        cardNumber,
        year,
        condition,
        isGraded,
        gradingCompany,
        grade,
        rarity,
        isFeatured,
        referencePrice,
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

  async function openProfile(userId) {
    const targetId = userId ?? auth.session.user.id;
    const [p, badges] = await Promise.all([getProfile(targetId), getProfileBadges(targetId)]);
    setViewedProfile(p);
    setViewedBadges(badges);
    setView({ name: "profile", userId: targetId, back: view });
  }

  async function handleSavePickup(fields) {
    setPickupBusy(true);
    setPickupError("");
    try {
      const updated = await updateProfile(auth.session.user.id, fields);
      setViewedProfile(updated);
      setView({ name: "profile", userId: auth.session.user.id, back: { name: "list" } });
    } catch (e) {
      setPickupError(e.message);
    } finally {
      setPickupBusy(false);
    }
  }

  async function handleReport(auctionId, reason) {
    setReportBusy(true);
    setReportError("");
    try {
      await createReport({ auctionId, reporterId: auth.session.user.id, reason });
      return true;
    } catch (e) {
      setReportError(e.message);
      return false;
    } finally {
      setReportBusy(false);
    }
  }

  async function handleResolveReport(reportId, status) {
    setResolveReportBusyId(reportId);
    try {
      await updateReportStatus(reportId, status);
      setAllReports((rows) => rows.map((r) => (r.id === reportId ? { ...r, status } : r)));
    } finally {
      setResolveReportBusyId(null);
    }
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
          onOpen={(a) => setView({ name: "detail", auctionId: a.id, back: view })}
          onCreate={() => setView({ name: "create" })}
          profile={isSupabaseConfigured ? auth.profile : null}
          onSignOut={auth.signOut}
          onOpenProfile={() => openProfile()}
          onOpenSellerProfile={isSupabaseConfigured ? openProfile : undefined}
          onOpenMyBids={() => setView({ name: "myBids" })}
          onOpenMyPublications={() => setView({ name: "myPublications" })}
          onOpenReports={() => setView({ name: "reports" })}
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
          onBack={() => setView(view.back ?? { name: "list" })}
          onWin={handleWin}
          onBid={isSupabaseConfigured ? handleRealBid : undefined}
          bidError={bidError}
          bidBusy={bidBusy}
          isMine={isSupabaseConfigured && activeAuction.sellerId === auth.session?.user.id}
          bidHistory={bidHistory}
          onOpenUserProfile={isSupabaseConfigured ? openProfile : undefined}
          onReport={isSupabaseConfigured ? handleReport : undefined}
          reportBusy={reportBusy}
          reportError={reportError}
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
          onOpenUserProfile={isSupabaseConfigured ? openProfile : undefined}
        />
      )}

      {view.name === "profile" && viewedProfile && (
        <ProfileView
          profile={viewedProfile}
          badges={viewedBadges}
          isOwn={view.userId === auth.session?.user.id}
          onBack={() => setView(view.back ?? { name: "list" })}
          onEditPickup={() => setView({ name: "editPickup", back: view })}
        />
      )}

      {view.name === "editPickup" && (
        <EditPickupInfo
          profile={viewedProfile}
          busy={pickupBusy}
          error={pickupError}
          onBack={() => setView(view.back ?? { name: "profile", userId: auth.session?.user.id })}
          onSave={handleSavePickup}
        />
      )}

      {view.name === "myBids" && (
        <MyAuctionsView
          title="MIS PUJAS"
          emptyText="Todavía no pujaste en ninguna subasta."
          auctions={myBids}
          showMyBid
          onBack={() => setView({ name: "list" })}
          onOpen={(a) => setView({ name: "detail", auctionId: a.id, back: view })}
        />
      )}

      {view.name === "myPublications" && (
        <MyAuctionsView
          title="MIS PUBLICACIONES"
          emptyText="Todavía no publicaste ninguna carta."
          auctions={myPublications}
          onBack={() => setView({ name: "list" })}
          onOpen={(a) => setView({ name: "detail", auctionId: a.id, back: view })}
        />
      )}

      {view.name === "reports" && (
        <AdminReportsView
          reports={allReports}
          busyId={resolveReportBusyId}
          onBack={() => setView({ name: "list" })}
          onResolve={handleResolveReport}
        />
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
