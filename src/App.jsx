import { useState, useEffect, useMemo, useRef } from "react";
import { Clock, Check, QrCode, ArrowLeft, Plus, ShieldCheck, Star, X, LogOut, Search, ChevronDown, SlidersHorizontal, Bell, Trophy, TrendingUp, TrendingDown, Loader2, Share2, Heart, ThumbsUp, ThumbsDown, Users, RefreshCw, Package, Zap, MapPin, MessageCircle, Image as ImageIcon } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import Login from "./components/Login";
import Landing from "./components/Landing";
import GenderIcon from "./components/GenderIcon";
import BadgeIcon from "./components/BadgeIcon";
import PriceChart from "./components/PriceChart";
import PokeballIcon from "./components/PokeballIcon";
import PokedexIcon from "./components/PokedexIcon";
import {
  listLiveAuctions,
  getAuction,
  subscribeToLiveAuctions,
  placeBid,
  buyNowAuction,
  claimFreeItem,
  uploadAuctionPhotos,
  uploadAuctionPhoto,
  createAuction,
  auctionToVM,
  listMyTickets,
  ticketToVM,
  redeemTicket,
  submitRating,
  listMyGivenRatingTicketIds,
  getProfile,
  getProfileBadges,
  getProfileStats,
  updateProfile,
  listRecentBids,
  listMyPublications,
  listMyBidAuctions,
  createReport,
  listAllReports,
  updateReportStatus,
  updateOwnAuction,
  cancelOwnAuction,
  updateGender,
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToMyNotifications,
  listAllProfilesForAdmin,
  setUserSuspended,
  setUserPremium,
  listAllAuctionsForAdmin,
  listRecommendedSellers,
  listTopAuctionsThisMonth,
  listBlogPosts,
  createBlogPost,
  setBlogPostPublished,
  deleteBlogPost,
  listWhatsappCommunities,
  createWhatsappCommunity,
  setWhatsappCommunityActive,
  deleteWhatsappCommunity,
  listGiveaways,
  createGiveaway,
  closeGiveaway,
  deleteGiveaway,
  enterGiveaway,
  listMyGiveawayEntryIds,
  listGiveawayEntrantsForAdmin,
  createRecommendedSeller,
  setRecommendedSellerActive,
  deleteRecommendedSeller,
  listPickupPoints,
  createPickupPoint,
  setPickupPointActive,
  deletePickupPoint,
  createSuggestion,
  listSuggestionsForAdmin,
  setSuggestionStatus,
  getTopSellers,
  getTopBuyers,
  listMyFavoriteIds,
  listMyFavoriteAuctions,
  addFavorite,
  removeFavorite,
  listAuctionReactions,
  setMyReaction as apiSetMyReaction,
  removeMyReaction,
  subscribeToAuctionPresence,
  createCardLot,
  listLiveLots,
  getCardLot,
  listLotItems,
  CONDITION_OPTIONS,
  CONDITION_SHORT,
  CONDITION_COLORS,
  GRADING_COMPANY_OPTIONS,
  RARITY_OPTIONS,
  RARITY_SYMBOL,
  RARITY_LABEL,
  LANGUAGE_OPTIONS,
  MAX_PHOTOS,
  buyFullLot,
  scanCardPhoto,
} from "./lib/auctions";
import { POKEMON_SET_ERAS } from "./lib/pokemonSets";

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

function formatPrice(n, currency = "ARS") {
  if (currency === "USD") {
    return `U$S ${Number(n).toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
  }
  return formatARS(n);
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

function SellerBadge({ name, rating, sales, onClick, gender, isPremium = false }) {
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
      {isPremium && (
        <span
          className="flex items-center gap-0.5 whitespace-nowrap rounded-full border border-gold bg-gold px-1.5 py-0.5 text-[9px] font-extrabold text-forest-deep"
          title="Vendedor verificado"
        >
          <Trophy size={9} /> VERIFICADO
        </span>
      )}
      <span className="flex items-center gap-0.5 whitespace-nowrap text-gold-dark">
        <Star size={11} fill="currentColor" strokeWidth={0} />
        {rating.toFixed(1)}
      </span>
      <span className="whitespace-nowrap font-bold text-ink">· {sales} ventas</span>
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

function AccountMenu({
  alias,
  gender,
  isAdmin,
  onOpenProfile,
  onOpenMyBids,
  onOpenMyPublications,
  onOpenMyTickets,
  onOpenFavorites,
  onOpenRecommended,
  onOpenTopMonthly,
  onOpenBlog,
  onOpenGiveaways,
  onOpenCommunities,
  onOpenRanking,
  onOpenSuggestions,
  onOpenFaq,
  onOpenAdmin,
}) {
  const [open, setOpen] = useState(false);

  function MenuGroup({ label, children }) {
    return (
      <div className="border-t border-line first:border-t-0">
        <p className="px-4 pt-2.5 text-[9px] font-bold uppercase tracking-wide text-ink-soft/70">{label}</p>
        {children}
      </div>
    );
  }

  function MenuItem({ onClick, danger, children }) {
    return (
      <button
        onClick={() => {
          setOpen(false);
          onClick();
        }}
        className={`block w-full px-4 py-2 text-left text-[12px] font-bold hover:bg-cream ${danger ? "text-[#B9432C]" : ""}`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-bold text-cream/80 transition hover:bg-white/10 hover:text-paper md:border md:border-white/20"
      >
        <GenderIcon gender={gender} size={14} />
        {alias} <ChevronDown size={12} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 max-h-[80vh] w-56 overflow-y-auto rounded-lg border-2 border-ink bg-paper text-ink shadow-card">
            <MenuGroup label="Mi cuenta">
              <MenuItem onClick={onOpenProfile}>Mi perfil</MenuItem>
              <MenuItem onClick={onOpenMyBids}>Mis pujas</MenuItem>
              <MenuItem onClick={onOpenMyPublications}>Mis publicaciones</MenuItem>
              <MenuItem onClick={onOpenMyTickets}>Mis tickets</MenuItem>
              <MenuItem onClick={onOpenFavorites}>Mis favoritos</MenuItem>
            </MenuGroup>
            <MenuGroup label="Comunidad">
              <MenuItem onClick={onOpenRecommended}>Vendedores garantizados</MenuItem>
              <MenuItem onClick={onOpenTopMonthly}>Destacadas del mes</MenuItem>
              <MenuItem onClick={onOpenBlog}>Novedades</MenuItem>
              <MenuItem onClick={onOpenGiveaways}>Sorteos</MenuItem>
              <MenuItem onClick={onOpenCommunities}>Comunidades de WhatsApp</MenuItem>
              <MenuItem onClick={onOpenRanking}>Ranking</MenuItem>
            </MenuGroup>
            <MenuGroup label="Ayuda">
              <MenuItem onClick={onOpenSuggestions}>Sugerencias</MenuItem>
              <MenuItem onClick={onOpenFaq}>Preguntas frecuentes</MenuItem>
            </MenuGroup>
            {isAdmin && (
              <MenuGroup label="Admin">
                <MenuItem onClick={onOpenAdmin} danger>Panel admin</MenuItem>
              </MenuGroup>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------
// Banner rotativo: vendedores garantizados (recomendados por la plataforma)
// ---------------------------------------------
function GuaranteedSellersBanner({ sellers, onOpenAll }) {
  const active = (sellers ?? []).filter((s) => s.is_active);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (active.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % active.length), 4500);
    return () => clearInterval(id);
  }, [active.length]);

  if (active.length === 0 || !onOpenAll) return null;
  const current = active[index % active.length];

  return (
    <button
      onClick={onOpenAll}
      className="flex w-full items-center gap-2.5 rounded-lg border-2 border-gold/50 bg-gold/10 px-3.5 py-2 text-left transition hover:bg-gold/15"
    >
      <Trophy size={14} className="shrink-0 text-gold-dark" />
      <span className="min-w-0 flex-1 text-[11.5px] font-medium text-ink">
        <span className="block text-[9.5px] font-bold uppercase tracking-wide text-gold-dark/80">
          Vendedores garantizados de productos oficiales
        </span>
        <span className="block truncate">
          {current.business_name}
          {current.description ? ` — ${current.description}` : ""}
        </span>
      </span>
      <span className="hidden shrink-0 text-[11px] font-bold text-gold-dark underline underline-offset-2 sm:inline">
        Ver todos →
      </span>
      {active.length > 1 && (
        <span className="hidden shrink-0 items-center gap-1 sm:flex">
          {active.map((s, i) => (
            <span key={s.id} className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-gold-dark" : "bg-gold/30"}`} />
          ))}
        </span>
      )}
    </button>
  );
}

function WhatsappCommunityBanner({ communities, onOpenAll }) {
  const active = (communities ?? []).filter((c) => c.is_active);
  if (active.length === 0 || !onOpenAll) return null;

  return (
    <button
      onClick={onOpenAll}
      className="flex w-full items-center gap-2.5 rounded-lg border-2 border-[#25D366]/50 bg-[#25D366]/10 px-3.5 py-2.5 text-left transition hover:bg-[#25D366]/15"
    >
      <MessageCircle size={16} className="shrink-0 text-[#128C4A]" />
      <span className="min-w-0 flex-1 text-[11.5px] font-bold text-ink">
        Sumate a la comunidad de WhatsApp de Ciudad Azulona
      </span>
      <span className="shrink-0 text-[11px] font-bold text-[#128C4A] underline underline-offset-2">
        Unirme →
      </span>
    </button>
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
  onOpenAdmin,
  onOpenNotifications,
  unreadNotifCount = 0,
  searchTerm,
  onSearchChange,
  pendingCount = 0,
  onOpenMyTickets,
  onOpenFavorites,
  onOpenRecommended,
  onOpenTopMonthly,
  onOpenBlog,
  onOpenGiveaways,
  onOpenCommunities,
  onOpenRanking,
  onOpenSuggestions,
  onOpenFaq,
  recommendedSellers,
  whatsappCommunities,
  favoriteIds,
  onToggleFavorite,
  onOpenCreateLot,
  liveLots,
  onOpenLot,
}) {
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterSet, setFilterSet] = useState("");
  const [filterRarity, setFilterRarity] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const availableSets = useMemo(
    () => [...new Set(auctions.map((a) => a.setName).filter(Boolean))].sort(),
    [auctions]
  );
  const availableCities = useMemo(
    () => [...new Set(auctions.map((a) => a.sellerCity).filter(Boolean))].sort(),
    [auctions]
  );

  const bySearch = searchTerm
    ? auctions.filter((a) => a.card.toLowerCase().includes(searchTerm.toLowerCase()))
    : auctions;
  let filtered = featuredOnly ? bySearch.filter((a) => a.isFeatured) : bySearch;
  if (filterSet) filtered = filtered.filter((a) => a.setName === filterSet);
  if (filterRarity) filtered = filtered.filter((a) => a.rarity === filterRarity);
  if (filterCondition) filtered = filtered.filter((a) => a.condition === filterCondition);
  if (filterCity) filtered = filtered.filter((a) => a.sellerCity === filterCity);
  if (filterLanguage) filtered = filtered.filter((a) => a.language === filterLanguage);
  if (minPrice) filtered = filtered.filter((a) => a.currentBid >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter((a) => a.currentBid <= Number(maxPrice));

  const activeFilterCount = [filterSet, filterRarity, filterCondition, filterCity, filterLanguage, minPrice, maxPrice].filter(Boolean).length;

  function clearFilters() {
    setFilterSet("");
    setFilterRarity("");
    setFilterCondition("");
    setFilterCity("");
    setFilterLanguage("");
    setMinPrice("");
    setMaxPrice("");
  }

  return (
    <div className="min-h-dvh bg-cream pb-24">
      <header className="sticky top-0 z-10 border-b-4 border-forest-mid bg-forest-deep px-5 pb-4 pt-4">
        <div className="mx-auto max-w-5xl">
          {profile && (
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PokeballIcon size={16} />
                <span className="font-pixel text-[9px] tracking-wide text-gold">CIUDAD AZULONA</span>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-cream/80">
                <nav className="hidden items-center gap-4 md:flex">
                  <button onClick={onOpenBlog} className="font-bold transition hover:text-paper">Novedades</button>
                  <button onClick={onOpenRanking} className="font-bold transition hover:text-paper">Ranking</button>
                  <button onClick={onOpenCommunities} className="font-bold transition hover:text-paper">Comunidades</button>
                  <button onClick={onOpenFaq} className="font-bold transition hover:text-paper">FAQ</button>
                </nav>
                <AccountMenu
                  alias={profile.alias}
                  gender={profile.gender}
                  isAdmin={profile.is_admin}
                  onOpenProfile={onOpenProfile}
                  onOpenMyBids={onOpenMyBids}
                  onOpenMyPublications={onOpenMyPublications}
                  onOpenMyTickets={onOpenMyTickets}
                  onOpenFavorites={onOpenFavorites}
                  onOpenRecommended={onOpenRecommended}
                  onOpenTopMonthly={onOpenTopMonthly}
                  onOpenBlog={onOpenBlog}
                  onOpenGiveaways={onOpenGiveaways}
                  onOpenCommunities={onOpenCommunities}
                  onOpenRanking={onOpenRanking}
                  onOpenSuggestions={onOpenSuggestions}
                  onOpenFaq={onOpenFaq}
                  onOpenAdmin={onOpenAdmin}
                />
                <button onClick={onOpenNotifications} className="relative flex items-center hover:text-paper">
                  <Bell size={15} />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B9432C] px-1 text-[9px] font-bold text-paper">
                      {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                    </span>
                  )}
                </button>
                <button onClick={onSignOut} className="flex items-center gap-1 hover:text-paper">
                  <LogOut size={13} /> Salir
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-y-2">
            <div>
              <p className="font-pixel text-[9px] tracking-wide text-gold">SUBASTAS EN VIVO</p>
              <h1 className="mt-2 text-2xl font-extrabold text-paper">Plaza Azulona</h1>
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
            <div className="mt-3 flex items-center gap-2 sm:max-w-lg">
              <div className="relative flex-1">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cream/50" />
                <input
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar carta o set..."
                  className="w-full rounded-lg border border-white/20 bg-white/10 py-2 pl-9 pr-3 text-[13px] font-medium text-cream placeholder:text-cream/50 focus:outline-none focus-visible:border-gold"
                />
              </div>
              <button
                onClick={() => setShowFilters((f) => !f)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-bold transition ${
                  showFilters || activeFilterCount > 0
                    ? "border-gold bg-gold/20 text-gold"
                    : "border-white/20 bg-white/10 text-cream/80"
                }`}
              >
                <SlidersHorizontal size={14} />
                Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </button>
            </div>
          )}

          {showFilters && (
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-white/15 bg-white/5 p-3 sm:max-w-lg sm:grid-cols-4">
              <select
                value={filterSet}
                onChange={(e) => setFilterSet(e.target.value)}
                className="rounded-lg border border-white/20 bg-forest-deep px-2 py-1.5 text-[12px] font-medium text-cream"
              >
                <option value="">Cualquier set</option>
                {availableSets.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="rounded-lg border border-white/20 bg-forest-deep px-2 py-1.5 text-[12px] font-medium text-cream"
              >
                <option value="">Cualquier rareza</option>
                {RARITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.symbol} {opt.label}</option>
                ))}
              </select>
              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                className="rounded-lg border border-white/20 bg-forest-deep px-2 py-1.5 text-[12px] font-medium text-cream"
              >
                <option value="">Cualquier condición</option>
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{CONDITION_SHORT[opt.value]} — {opt.label}</option>
                ))}
              </select>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="rounded-lg border border-white/20 bg-forest-deep px-2 py-1.5 text-[12px] font-medium text-cream"
              >
                <option value="">Cualquier ciudad</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="rounded-lg border border-white/20 bg-forest-deep px-2 py-1.5 text-[12px] font-medium text-cream"
              >
                <option value="">Cualquier idioma</option>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min $"
                  className="w-full rounded-lg border border-white/20 bg-forest-deep px-2 py-1.5 text-[12px] font-medium text-cream placeholder:text-cream/50"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max $"
                  className="w-full rounded-lg border border-white/20 bg-forest-deep px-2 py-1.5 text-[12px] font-medium text-cream placeholder:text-cream/50"
                />
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="col-span-2 text-left text-[11px] font-bold text-gold underline underline-offset-2 sm:col-span-4"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {pendingCount > 0 && (
        <div className="mx-auto max-w-5xl px-5 pt-4">
          <button
            onClick={onOpenMyTickets}
            className="flex w-full items-center justify-between rounded-lg border-2 border-[#B9432C]/25 bg-[#FBE6E0] px-4 py-2.5 text-left"
          >
            <span className="text-[12px] font-bold text-[#B9432C]">
              Tenés {pendingCount} ticket(s) pendiente(s)
            </span>
            <span className="text-[12px] font-bold text-[#B9432C]">Ver →</span>
          </button>
        </div>
      )}

      <div className="mx-auto max-w-5xl space-y-2 px-5 pt-4">
        <WhatsappCommunityBanner communities={whatsappCommunities} onOpenAll={onOpenCommunities} />
        <GuaranteedSellersBanner sellers={recommendedSellers} onOpenAll={onOpenRecommended} />
      </div>

      {liveLots && <LotsRow lots={liveLots} onOpen={onOpenLot} />}

      {auctions.length > 0 && filtered.length === 0 && (
        <div className="mx-auto max-w-5xl px-5 pt-10 text-center text-[13px] text-ink-soft">
          No encontramos cartas con esos criterios.
        </div>
      )}
      {auctions.length === 0 && (
        <div className="mx-auto max-w-5xl px-5 pt-10 text-center text-[13px] text-ink-soft">
          Todavía no hay subastas activas. ¡Sé el primero en publicar una carta!
        </div>
      )}

      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-5 pt-5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {filtered.map((a) => (
          <AuctionCard
            key={a.id}
            auction={a}
            onOpen={onOpen}
            onOpenSellerProfile={onOpenSellerProfile}
            isFavorite={favoriteIds?.has(a.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {profile?.is_premium && (
        <button
          onClick={onOpenCreateLot}
          className="fixed bottom-24 right-5 flex items-center gap-2 rounded-full bg-plum px-5 py-3.5 text-[13px] font-extrabold text-cream shadow-[0_4px_0_rgba(76,29,87,1)] transition hover:brightness-110 active:translate-y-[3px] active:shadow-[0_1px_0_rgba(76,29,87,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-deep"
        >
          <Package size={16} strokeWidth={2.5} /> Publicar lote
        </button>
      )}

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
function MyAuctionsView({
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

// ---------------------------------------------
// Card de subasta — compartida entre la mesa del evento y
// Mis pujas/Mis publicaciones, para que luzcan siempre igual.
// ---------------------------------------------
function AuctionCard({
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
      className={`relative isolate flex flex-col overflow-hidden rounded-xl border-2 bg-paper text-left shadow-card transition ${
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

// ---------------------------------------------
// Vista: Notificaciones
// ---------------------------------------------
function NotificationsView({ notifications, onBack, onOpenNotification, onMarkAllRead }) {
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">NOTIFICACIONES</p>
      </header>

      <div className="px-5 pt-6">
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="mb-3 text-[11px] font-bold text-forest-deep underline underline-offset-2"
          >
            Marcar todas como leídas
          </button>
        )}

        {notifications.length === 0 && (
          <p className="text-[12px] text-ink-soft">Todavía no tenés notificaciones.</p>
        )}

        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => onOpenNotification(n)}
              className={`rounded-lg border-2 p-3 text-left transition ${
                n.read_at ? "border-line bg-paper" : "border-[#B9432C]/30 bg-[#FBE6E0]"
              }`}
            >
              <p className={`text-[13px] leading-relaxed ${n.read_at ? "text-ink-soft" : "font-bold text-[#B9432C]"}`}>
                {n.message}
              </p>
              <p className="mt-1 text-[10px] text-ink-soft">
                {new Date(n.created_at).toLocaleString("es-AR")}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Panel de administración (usuarios, subastas, denuncias)
// ---------------------------------------------
function ReportsTabContent({ reports, onResolve, busyId }) {
  const open = reports.filter((r) => r.status === "open");
  const resolved = reports.filter((r) => r.status !== "open");

  return (
    <div className="space-y-3">
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
  );
}

function SuggestionsTabContent({ suggestions, onSetStatus, busyId }) {
  const fresh = suggestions.filter((s) => s.status === "new");
  const reviewed = suggestions.filter((s) => s.status !== "new");

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Nuevas ({fresh.length})</h3>
      {fresh.length === 0 && <p className="text-[12px] text-ink-soft">No hay sugerencias nuevas.</p>}
      {fresh.map((s) => (
        <div key={s.id} className="rounded-lg border-2 border-gold/40 bg-gold/10 p-3">
          <p className="text-[12px] leading-relaxed text-ink">{s.message}</p>
          <p className="mt-1.5 text-[10px] text-ink-soft">
            {s.user?.alias ?? "—"} · {new Date(s.created_at).toLocaleString("es-AR")}
          </p>
          <button
            onClick={() => onSetStatus(s.id, "reviewed")}
            disabled={busyId === s.id}
            className="mt-2 rounded-lg bg-forest-mid px-3 py-1.5 text-[11px] font-bold text-paper disabled:opacity-40"
          >
            Marcar leída
          </button>
        </div>
      ))}

      {reviewed.length > 0 && (
        <>
          <h3 className="mt-4 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Leídas</h3>
          {reviewed.map((s) => (
            <div key={s.id} className="rounded-lg border-2 border-line bg-paper p-3 opacity-70">
              <p className="text-[12px] text-ink">{s.message}</p>
              <p className="mt-1 text-[10px] text-ink-soft">
                {s.user?.alias ?? "—"} · {new Date(s.created_at).toLocaleString("es-AR")}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function UsersTabContent({ profiles, onSuspend, busyId, onSetPremium, premiumBusyId }) {
  return (
    <div className="space-y-2">
      {profiles.map((p) => (
        <div
          key={p.id}
          className={`flex items-center justify-between gap-2 rounded-lg border-2 p-3 ${
            p.is_suspended ? "border-[#B9432C]/30 bg-[#FBE6E0]" : "border-line bg-paper"
          }`}
        >
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-extrabold text-ink">
              {p.alias}
              {p.is_admin && <span className="text-[9px] font-bold text-gold-dark">ADMIN</span>}
              {p.is_premium && <span className="text-[9px] font-bold text-gold-dark">PREMIUM</span>}
              {p.is_suspended && <span className="text-[9px] font-bold text-[#B9432C]">SUSPENDIDO</span>}
            </p>
            <p className="text-[11px] text-ink-soft">
              {p.sales_count} ventas · {p.purchases_count} compras · {Number(p.rating_avg).toFixed(1)}★
            </p>
          </div>
          {!p.is_admin && (
            <div className="flex shrink-0 flex-col gap-1.5">
              <button
                onClick={() => onSetPremium(p.id, !p.is_premium)}
                disabled={premiumBusyId === p.id}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold disabled:opacity-40 ${
                  p.is_premium ? "bg-gold text-forest-deep" : "border-2 border-gold/50 text-gold-dark"
                }`}
              >
                {p.is_premium ? "Quitar premium" : "Hacer premium"}
              </button>
              <button
                onClick={() => onSuspend(p.id, !p.is_suspended)}
                disabled={busyId === p.id}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold disabled:opacity-40 ${
                  p.is_suspended ? "bg-forest-mid text-paper" : "border-2 border-[#B9432C]/40 text-[#B9432C]"
                }`}
              >
                {p.is_suspended ? "Reactivar" : "Suspender"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AuctionsTabContent({ auctions }) {
  return (
    <div className="space-y-2">
      {auctions.map((a) => (
        <div key={a.id} className="rounded-lg border-2 border-line bg-paper p-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-extrabold text-ink">{a.card}</p>
            <Pill tone={a.status === "live" ? "live" : "default"}>{a.status}</Pill>
          </div>
          <p className="text-[11px] text-ink-soft">Vendedor: {a.seller}</p>
          <p className="text-[11px] text-ink-soft">
            {a.isFreeClaim ? `Free claim · ${a.freeClaimCount} reclamos` : `${formatPrice(a.currentBid, a.currency)} · ${a.bids} pujas`}
          </p>
        </div>
      ))}
    </div>
  );
}

function WhatsappCommunitiesTabContent({ communities, onCreate, createBusy, createError, onToggleActive, onDelete, busyId }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[11px] font-bold text-ink-soft";

  async function handleCreate() {
    const ok = await onCreate({ name, description, url });
    if (ok) {
      setName("");
      setDescription("");
      setUrl("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-line bg-paper p-3">
        <p className="text-[12px] font-extrabold text-ink">Agregar comunidad</p>
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Grupo general de la comunidad"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Link de invitación (chat.whatsapp.com/...)</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} />
          </div>
          {createError && <p className="text-[11px] text-[#B9432C]">{createError}</p>}
          <button
            onClick={handleCreate}
            disabled={!name || !url || createBusy}
            className="w-full rounded-lg bg-gold py-2 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
          >
            {createBusy ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {communities.map((c) => (
          <div key={c.id} className={`rounded-lg border-2 p-3 ${c.is_active ? "border-line bg-paper" : "border-line bg-cream-dark/40 opacity-70"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold text-ink">{c.name}</p>
                {c.description && <p className="text-[11px] text-ink-soft">{c.description}</p>}
                <p className="line-clamp-1 text-[11px] font-bold text-forest-deep">{c.url}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  onClick={() => onToggleActive(c.id, !c.is_active)}
                  disabled={busyId === c.id}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-40 ${
                    c.is_active ? "border-2 border-line text-ink-soft" : "bg-forest-mid text-paper"
                  }`}
                >
                  {c.is_active ? "Ocultar" : "Activar"}
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  disabled={busyId === c.id}
                  className="rounded-lg border-2 border-[#B9432C]/40 px-2.5 py-1 text-[11px] font-bold text-[#B9432C] disabled:opacity-40"
                >
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
        {communities.length === 0 && <p className="text-[12px] text-ink-soft">Todavía no cargaste ninguna comunidad.</p>}
      </div>
    </div>
  );
}

function RecommendedSellersTabContent({ sellers, onCreate, createBusy, createError, onToggleActive, onDelete, busyId }) {
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[11px] font-bold text-ink-soft";

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleCreate() {
    setPhotoError("");
    let photoUrl = null;
    if (photoFile) {
      setUploadingPhoto(true);
      try {
        photoUrl = await uploadAuctionPhoto(photoFile);
      } catch (e) {
        setPhotoError(e.message);
        setUploadingPhoto(false);
        return;
      }
      setUploadingPhoto(false);
    }
    const ok = await onCreate({ businessName, description, contactInfo, whatsappUrl, photoUrl });
    if (ok) {
      setBusinessName("");
      setDescription("");
      setContactInfo("");
      setWhatsappUrl("");
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-line bg-paper p-3">
        <p className="text-[12px] font-extrabold text-ink">Agregar comercio recomendado</p>
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Nombre del comercio</label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Packs y colecciones originales, envíos a todo el país"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Link directo de WhatsApp (opcional)</label>
            <input
              value={whatsappUrl}
              onChange={(e) => setWhatsappUrl(e.target.value)}
              placeholder="Ej: https://wa.me/5491122334455"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Otro contacto (Instagram, etc. — opcional)</label>
            <input value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Imagen (opcional)</label>
            <div className="mt-1.5 flex items-center gap-2">
              {photoPreview && (
                <img src={photoPreview} alt="" className="h-14 w-14 rounded-lg border-2 border-line object-cover" />
              )}
              <label className="flex h-14 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-line bg-white text-[12px] text-ink-soft">
                <ImageIcon size={14} /> {photoFile ? "Cambiar imagen" : "Elegir imagen"}
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
          </div>
          {(createError || photoError) && <p className="text-[11px] text-[#B9432C]">{createError || photoError}</p>}
          <button
            onClick={handleCreate}
            disabled={!businessName || createBusy || uploadingPhoto}
            className="w-full rounded-lg bg-gold py-2 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
          >
            {uploadingPhoto ? "Subiendo imagen..." : createBusy ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sellers.map((s) => (
          <div key={s.id} className={`rounded-lg border-2 p-3 ${s.is_active ? "border-line bg-paper" : "border-line bg-cream-dark/40 opacity-70"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 gap-2.5">
                {s.photo_url && (
                  <img src={s.photo_url} alt="" className="h-12 w-12 shrink-0 rounded-lg border-2 border-line object-cover" />
                )}
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-ink">{s.business_name}</p>
                  {s.description && <p className="text-[11px] text-ink-soft">{s.description}</p>}
                  {s.whatsapp_url && <p className="text-[11px] font-bold text-[#128C4A]">{s.whatsapp_url}</p>}
                  {s.contact_info && <p className="text-[11px] font-bold text-forest-deep">{s.contact_info}</p>}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  onClick={() => onToggleActive(s.id, !s.is_active)}
                  disabled={busyId === s.id}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-40 ${
                    s.is_active ? "border-2 border-line text-ink-soft" : "bg-forest-mid text-paper"
                  }`}
                >
                  {s.is_active ? "Ocultar" : "Activar"}
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  disabled={busyId === s.id}
                  className="rounded-lg border-2 border-[#B9432C]/40 px-2.5 py-1 text-[11px] font-bold text-[#B9432C] disabled:opacity-40"
                >
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
        {sellers.length === 0 && <p className="text-[12px] text-ink-soft">Todavía no cargaste ningún comercio.</p>}
      </div>
    </div>
  );
}

function PickupPointsTabContent({ points, onCreate, createBusy, createError, onToggleActive, onDelete, busyId }) {
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[11px] font-bold text-ink-soft";

  async function handleCreate() {
    const ok = await onCreate({ city, name, details });
    if (ok) {
      setCity("");
      setName("");
      setDetails("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-line bg-paper p-3">
        <p className="text-[12px] font-extrabold text-ink">Agregar punto de retiro</p>
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Ciudad</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej: Córdoba" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Nombre del punto</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Plaza San Martín" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Detalle (opcional)</label>
            <input
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Ej: sábados de tarde, esquina con Rivadavia"
              className={inputClass}
            />
          </div>
          {createError && <p className="text-[11px] text-[#B9432C]">{createError}</p>}
          <button
            onClick={handleCreate}
            disabled={!city || !name || createBusy}
            className="w-full rounded-lg bg-gold py-2 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
          >
            {createBusy ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {points.map((p) => (
          <div key={p.id} className={`rounded-lg border-2 p-3 ${p.is_active ? "border-line bg-paper" : "border-line bg-cream-dark/40 opacity-70"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-plum">{p.city}</p>
                <p className="text-[13px] font-extrabold text-ink">{p.name}</p>
                {p.details && <p className="text-[11px] text-ink-soft">{p.details}</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  onClick={() => onToggleActive(p.id, !p.is_active)}
                  disabled={busyId === p.id}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-40 ${
                    p.is_active ? "border-2 border-line text-ink-soft" : "bg-forest-mid text-paper"
                  }`}
                >
                  {p.is_active ? "Ocultar" : "Activar"}
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  disabled={busyId === p.id}
                  className="rounded-lg border-2 border-[#B9432C]/40 px-2.5 py-1 text-[11px] font-bold text-[#B9432C] disabled:opacity-40"
                >
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
        {points.length === 0 && <p className="text-[12px] text-ink-soft">Todavía no cargaste ningún punto de retiro.</p>}
      </div>
    </div>
  );
}

function BlogTabContent({ posts, onCreate, createBusy, createError, onTogglePublished, onDelete, busyId }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[11px] font-bold text-ink-soft";

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleCreate() {
    setPhotoError("");
    let photoUrl = null;
    if (photoFile) {
      setUploadingPhoto(true);
      try {
        photoUrl = await uploadAuctionPhoto(photoFile);
      } catch (e) {
        setPhotoError(e.message);
        setUploadingPhoto(false);
        return;
      }
      setUploadingPhoto(false);
    }
    const ok = await onCreate({ title, body, photoUrl });
    if (ok) {
      setTitle("");
      setBody("");
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-line bg-paper p-3">
        <p className="text-[12px] font-extrabold text-ink">Nueva novedad</p>
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Texto</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Imagen (opcional)</label>
            <div className="mt-1.5 flex items-center gap-2">
              {photoPreview && (
                <img src={photoPreview} alt="" className="h-14 w-14 rounded-lg border-2 border-line object-cover" />
              )}
              <label className="flex h-14 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-line bg-white text-[12px] text-ink-soft">
                <ImageIcon size={14} /> {photoFile ? "Cambiar imagen" : "Elegir imagen"}
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
          </div>
          {(createError || photoError) && <p className="text-[11px] text-[#B9432C]">{createError || photoError}</p>}
          <button
            onClick={handleCreate}
            disabled={!title || !body || createBusy || uploadingPhoto}
            className="w-full rounded-lg bg-gold py-2 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
          >
            {uploadingPhoto ? "Subiendo imagen..." : createBusy ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p.id} className={`rounded-lg border-2 p-3 ${p.is_published ? "border-line bg-paper" : "border-line bg-cream-dark/40 opacity-70"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 gap-2.5">
                {p.photo_url && (
                  <img src={p.photo_url} alt="" className="h-12 w-12 shrink-0 rounded-lg border-2 border-line object-cover" />
                )}
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-ink">{p.title}</p>
                  <p className="line-clamp-2 text-[11px] text-ink-soft">{p.body}</p>
                  <p className="mt-1 text-[10px] text-ink-soft">
                    {new Date(p.created_at).toLocaleDateString("es-AR")}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  onClick={() => onTogglePublished(p.id, !p.is_published)}
                  disabled={busyId === p.id}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-40 ${
                    p.is_published ? "border-2 border-line text-ink-soft" : "bg-forest-mid text-paper"
                  }`}
                >
                  {p.is_published ? "Ocultar" : "Publicar"}
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  disabled={busyId === p.id}
                  className="rounded-lg border-2 border-[#B9432C]/40 px-2.5 py-1 text-[11px] font-bold text-[#B9432C] disabled:opacity-40"
                >
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-[12px] text-ink-soft">Todavía no publicaste ninguna novedad.</p>}
      </div>
    </div>
  );
}

const GIVEAWAY_DURATION_OPTIONS = [
  { value: 3, label: "3 días" },
  { value: 7, label: "7 días" },
  { value: 14, label: "14 días" },
  { value: 30, label: "30 días" },
];

function GiveawayEntrantsPicker({ giveawayId, onLoadEntrants, onPickWinner, closeBusy }) {
  const [entrants, setEntrants] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    setLoading(true);
    try {
      const rows = await onLoadEntrants(giveawayId);
      setEntrants(rows);
    } finally {
      setLoading(false);
    }
  }

  if (entrants === null) {
    return (
      <button
        onClick={handleOpen}
        disabled={loading}
        className="rounded-lg bg-gold px-2.5 py-1 text-[11px] font-bold text-forest-deep disabled:opacity-40"
      >
        {loading ? "Cargando..." : "Elegir ganador"}
      </button>
    );
  }

  if (entrants.length === 0) {
    return <p className="text-[11px] text-ink-soft">Todavía no hay inscriptos.</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {entrants.map((e) => (
        <button
          key={e.user_id}
          onClick={() => onPickWinner(giveawayId, e.user_id)}
          disabled={closeBusy}
          className="rounded-lg border-2 border-gold/50 px-2.5 py-1 text-left text-[11px] font-bold text-gold-dark disabled:opacity-40"
        >
          {e.alias} →
        </button>
      ))}
    </div>
  );
}

function GiveawaysTabContent({ giveaways, onCreate, createBusy, createError, onLoadEntrants, onClose, closeBusyId, onDelete, deleteBusyId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prizeDescription, setPrizeDescription] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[11px] font-bold text-ink-soft";

  async function handleCreate() {
    const ok = await onCreate({ title, description, prizeDescription, durationDays });
    if (ok) {
      setTitle("");
      setDescription("");
      setPrizeDescription("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-line bg-paper p-3">
        <p className="text-[12px] font-extrabold text-ink">Nuevo sorteo</p>
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Premio</label>
            <input
              value={prizeDescription}
              onChange={(e) => setPrizeDescription(e.target.value)}
              placeholder="Ej: 1 booster box Scarlet & Violet"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Dura</label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {GIVEAWAY_DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDurationDays(opt.value)}
                  className={`rounded-lg border-2 py-1.5 text-[11px] font-bold transition ${
                    durationDays === opt.value ? "border-gold bg-gold/15 text-gold-dark" : "border-line bg-paper text-ink-soft"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {createError && <p className="text-[11px] text-[#B9432C]">{createError}</p>}
          <button
            onClick={handleCreate}
            disabled={!title || createBusy}
            className="w-full rounded-lg bg-gold py-2 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
          >
            {createBusy ? "Creando..." : "Crear sorteo"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {giveaways.map((g) => (
          <div key={g.id} className="rounded-lg border-2 border-line bg-paper p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-ink">
                  {g.title}
                  <Pill tone={g.status === "open" ? "live" : "default"}>{g.status === "open" ? "Abierto" : "Cerrado"}</Pill>
                </p>
                {g.prize_description && <p className="text-[11px] text-ink-soft">Premio: {g.prize_description}</p>}
                <p className="text-[10px] text-ink-soft">
                  Cierra: {new Date(g.closes_at).toLocaleDateString("es-AR")}
                </p>
                {g.status === "closed" && (
                  <p className="mt-1 text-[11px] font-bold text-gold-dark">Ganador: {g.winner?.alias ?? "—"}</p>
                )}
              </div>
              <button
                onClick={() => onDelete(g.id)}
                disabled={deleteBusyId === g.id}
                className="shrink-0 rounded-lg border-2 border-[#B9432C]/40 px-2.5 py-1 text-[11px] font-bold text-[#B9432C] disabled:opacity-40"
              >
                Borrar
              </button>
            </div>
            {g.status === "open" && (
              <div className="mt-2">
                <GiveawayEntrantsPicker
                  giveawayId={g.id}
                  onLoadEntrants={onLoadEntrants}
                  onPickWinner={onClose}
                  closeBusy={closeBusyId === g.id}
                />
              </div>
            )}
          </div>
        ))}
        {giveaways.length === 0 && <p className="text-[12px] text-ink-soft">Todavía no creaste ningún sorteo.</p>}
      </div>
    </div>
  );
}

function AdminPanel({
  profiles,
  auctions,
  reports,
  recommendedSellers,
  blogPosts,
  onBack,
  onSuspend,
  suspendBusyId,
  onSetPremium,
  premiumBusyId,
  onResolveReport,
  resolveBusyId,
  onCreateRecommendedSeller,
  createRecommendedBusy,
  createRecommendedError,
  onToggleRecommendedActive,
  onDeleteRecommendedSeller,
  recommendedBusyId,
  onCreateBlogPost,
  createBlogBusy,
  createBlogError,
  onToggleBlogPublished,
  onDeleteBlogPost,
  blogBusyId,
  giveaways,
  onCreateGiveaway,
  createGiveawayBusy,
  createGiveawayError,
  onLoadGiveawayEntrants,
  onCloseGiveaway,
  closeGiveawayBusyId,
  onDeleteGiveaway,
  deleteGiveawayBusyId,
  whatsappCommunities,
  onCreateWhatsappCommunity,
  createWhatsappCommunityBusy,
  createWhatsappCommunityError,
  onToggleWhatsappCommunityActive,
  onDeleteWhatsappCommunity,
  whatsappCommunityBusyId,
  suggestions,
  onSetSuggestionStatus,
  suggestionStatusBusyId,
  pickupPoints,
  onCreatePickupPoint,
  createPickupPointBusy,
  createPickupPointError,
  onTogglePickupPointActive,
  onDeletePickupPoint,
  pickupPointBusyId,
}) {
  const [tab, setTab] = useState("usuarios");
  const tabs = [
    { value: "usuarios", label: "Usuarios" },
    { value: "subastas", label: "Subastas" },
    { value: "denuncias", label: "Denuncias" },
    { value: "retiro", label: "Puntos de retiro" },
    { value: "recomendados", label: "Recomendados" },
    { value: "blog", label: "Blog" },
    { value: "sorteos", label: "Sorteos" },
    { value: "comunidades", label: "Comunidades" },
    { value: "sugerencias", label: "Sugerencias" },
  ];

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">PANEL ADMIN</p>
      </header>

      <div className="flex gap-2 overflow-x-auto px-5 pt-4 pb-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`shrink-0 rounded-lg border-2 px-3 py-1.5 text-[12px] font-bold transition ${
              tab === t.value ? "border-gold bg-gold/15 text-gold-dark" : "border-line bg-paper text-ink-soft"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-5 pt-4">
        {tab === "usuarios" && (
          <UsersTabContent
            profiles={profiles}
            onSuspend={onSuspend}
            busyId={suspendBusyId}
            onSetPremium={onSetPremium}
            premiumBusyId={premiumBusyId}
          />
        )}
        {tab === "subastas" && <AuctionsTabContent auctions={auctions} />}
        {tab === "denuncias" && (
          <ReportsTabContent reports={reports} onResolve={onResolveReport} busyId={resolveBusyId} />
        )}
        {tab === "retiro" && (
          <PickupPointsTabContent
            points={pickupPoints}
            onCreate={onCreatePickupPoint}
            createBusy={createPickupPointBusy}
            createError={createPickupPointError}
            onToggleActive={onTogglePickupPointActive}
            onDelete={onDeletePickupPoint}
            busyId={pickupPointBusyId}
          />
        )}
        {tab === "recomendados" && (
          <RecommendedSellersTabContent
            sellers={recommendedSellers}
            onCreate={onCreateRecommendedSeller}
            createBusy={createRecommendedBusy}
            createError={createRecommendedError}
            onToggleActive={onToggleRecommendedActive}
            onDelete={onDeleteRecommendedSeller}
            busyId={recommendedBusyId}
          />
        )}
        {tab === "blog" && (
          <BlogTabContent
            posts={blogPosts}
            onCreate={onCreateBlogPost}
            createBusy={createBlogBusy}
            createError={createBlogError}
            onTogglePublished={onToggleBlogPublished}
            onDelete={onDeleteBlogPost}
            busyId={blogBusyId}
          />
        )}
        {tab === "sorteos" && (
          <GiveawaysTabContent
            giveaways={giveaways}
            onCreate={onCreateGiveaway}
            createBusy={createGiveawayBusy}
            createError={createGiveawayError}
            onLoadEntrants={onLoadGiveawayEntrants}
            onClose={onCloseGiveaway}
            closeBusyId={closeGiveawayBusyId}
            onDelete={onDeleteGiveaway}
            deleteBusyId={deleteGiveawayBusyId}
          />
        )}
        {tab === "comunidades" && (
          <WhatsappCommunitiesTabContent
            communities={whatsappCommunities}
            onCreate={onCreateWhatsappCommunity}
            createBusy={createWhatsappCommunityBusy}
            createError={createWhatsappCommunityError}
            onToggleActive={onToggleWhatsappCommunityActive}
            onDelete={onDeleteWhatsappCommunity}
            busyId={whatsappCommunityBusyId}
          />
        )}
        {tab === "sugerencias" && (
          <SuggestionsTabContent
            suggestions={suggestions}
            onSetStatus={onSetSuggestionStatus}
            busyId={suggestionStatusBusyId}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Novedades / blog (pública)
// ---------------------------------------------
function BlogView({ posts, onBack }) {
  const published = posts.filter((p) => p.is_published);
  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">NOVEDADES</p>
      </header>

      <div className="px-5 pt-6">
        {published.length === 0 ? (
          <p className="text-[12px] text-ink-soft">Todavía no hay novedades publicadas.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {published.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-lg border-2 border-line bg-paper">
                {p.photo_url && <img src={p.photo_url} alt="" className="h-40 w-full object-cover" />}
                <div className="p-3.5">
                  <p className="text-[10px] font-bold text-ink-soft">
                    {new Date(p.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                    {p.author?.alias ? ` · ${p.author.alias}` : ""}
                  </p>
                  <p className="mt-1 text-[15px] font-extrabold text-ink">{p.title}</p>
                  <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Sorteos para la comunidad (pública)
// ---------------------------------------------
function GiveawaysView({ giveaways, myEntryIds, onBack, onEnter, enterBusyId }) {
  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">SORTEOS</p>
      </header>

      <div className="px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Sorteos para la comunidad — los organiza el equipo de Ciudad Azulona, inscribite y esperá el resultado.
        </p>

        {giveaways.length === 0 ? (
          <p className="mt-4 text-[12px] text-ink-soft">Todavía no hay sorteos activos.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {giveaways.map((g) => {
              const entered = myEntryIds.has(g.id);
              const open = g.status === "open" && new Date(g.closes_at) > new Date();
              return (
                <div key={g.id} className="rounded-lg border-2 border-line bg-paper p-3.5">
                  <p className="flex items-center gap-1.5 text-[14px] font-extrabold text-ink">
                    <Trophy size={13} className="text-gold-dark" /> {g.title}
                  </p>
                  {g.description && <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{g.description}</p>}
                  {g.prize_description && (
                    <p className="mt-1.5 text-[12px] font-bold text-forest-deep">Premio: {g.prize_description}</p>
                  )}
                  {g.status === "closed" ? (
                    <p className="mt-2 text-[12px] font-bold text-gold-dark">Ganador: {g.winner?.alias ?? "—"}</p>
                  ) : (
                    <>
                      <p className="mt-1 text-[11px] text-ink-soft">
                        Cierra el {new Date(g.closes_at).toLocaleDateString("es-AR")}
                      </p>
                      {entered ? (
                        <p className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-forest-deep">
                          <Check size={13} /> Ya estás inscripto
                        </p>
                      ) : open ? (
                        <button
                          onClick={() => onEnter(g.id)}
                          disabled={enterBusyId === g.id}
                          className="mt-2 rounded-lg bg-gold px-3 py-1.5 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
                        >
                          {enterBusyId === g.id ? "Inscribiendo..." : "Inscribirme"}
                        </button>
                      ) : (
                        <p className="mt-2 text-[11px] text-ink-soft">Cerrado, esperando resultado.</p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Comunidades de WhatsApp (pública)
// ---------------------------------------------
function WhatsappCommunitiesView({ communities, onBack }) {
  const active = communities.filter((c) => c.is_active);
  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">COMUNIDADES</p>
      </header>

      <div className="px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Sumate a los grupos de WhatsApp de la comunidad para coordinar entregas, avisos y charla general.
        </p>

        {active.length === 0 ? (
          <p className="mt-4 text-[12px] text-ink-soft">Todavía no hay comunidades cargadas.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {active.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border-2 border-forest-mid/40 bg-forest-mid/10 p-3.5 transition hover:border-forest-mid"
              >
                <p className="text-[14px] font-extrabold text-ink">{c.name}</p>
                {c.description && <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{c.description}</p>}
                <p className="mt-1.5 text-[11px] font-bold text-forest-deep underline underline-offset-2">Unirme →</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Ranking (top 10 vendedores y top 10 compradores, por separado)
// ---------------------------------------------
function RankingView({ topSellers, topBuyers, onBack, onOpenUserProfile }) {
  const [tab, setTab] = useState("vendedores");
  const traders = tab === "vendedores" ? topSellers : topBuyers;

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">RANKING</p>
      </header>

      <div className="flex gap-2 px-5 pt-4">
        <button
          onClick={() => setTab("vendedores")}
          className={`flex-1 rounded-lg border-2 px-3 py-1.5 text-[12px] font-bold transition ${
            tab === "vendedores" ? "border-gold bg-gold/15 text-gold-dark" : "border-line bg-paper text-ink-soft"
          }`}
        >
          Vendedores
        </button>
        <button
          onClick={() => setTab("compradores")}
          className={`flex-1 rounded-lg border-2 px-3 py-1.5 text-[12px] font-bold transition ${
            tab === "compradores" ? "border-gold bg-gold/15 text-gold-dark" : "border-line bg-paper text-ink-soft"
          }`}
        >
          Compradores
        </button>
      </div>

      <div className="px-5 pt-4">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          {tab === "vendedores"
            ? "Los 10 usuarios con más volumen vendido (ventas confirmadas) en toda la plataforma."
            : "Los 10 usuarios con más volumen comprado (compras confirmadas) en toda la plataforma."}
        </p>

        {traders.length === 0 ? (
          <p className="mt-4 text-[12px] text-ink-soft">Todavía no hay entregas confirmadas para armar el ranking.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {traders.map((t, i) => (
              <button
                key={t.user_id}
                onClick={onOpenUserProfile ? () => onOpenUserProfile(t.user_id) : undefined}
                className="flex items-center gap-3 rounded-lg border-2 border-line bg-paper p-3 text-left transition hover:border-forest-mid"
              >
                <span
                  className={`font-pixel flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] ${
                    i < 3 ? "bg-gold text-forest-deep" : "bg-cream text-ink-soft"
                  }`}
                >
                  #{i + 1}
                </span>
                <GenderIcon gender={t.gender} size={18} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-ink">{t.alias}</span>
                <span className="shrink-0 text-right text-[13px] font-extrabold text-forest-deep">
                  {t.total_ars > 0 && <div>{formatARS(t.total_ars)}</div>}
                  {t.total_usd > 0 && <div className="text-[11px] text-plum">{formatPrice(t.total_usd, "USD")}</div>}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Sugerencias (cualquier usuario puede mandar una)
// ---------------------------------------------
function SuggestionsView({ onBack, onSubmit, busy = false, error = "" }) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    const ok = await onSubmit(message);
    if (ok) {
      setSent(true);
      setMessage("");
    }
  }

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">SUGERENCIAS</p>
      </header>

      <div className="px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          ¿Qué mejorarías de Ciudad Azulona? Tu mensaje lo lee directo el admin de la plataforma.
        </p>

        {sent ? (
          <div className="mt-4 rounded-xl border-2 border-forest-mid bg-forest-mid/10 p-4">
            <p className="flex items-center gap-2 text-[13px] font-bold text-forest-deep">
              <Check size={15} /> ¡Gracias! Ya la recibimos.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-3 text-[12px] font-bold text-forest-deep underline underline-offset-2"
            >
              Mandar otra
            </button>
          </div>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ej: estaría bueno poder filtrar por precio de referencia..."
              rows={5}
              className="mt-4 w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid"
            />
            {error && <p className="mt-2 text-[12px] text-[#B9432C]">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || busy}
              className="mt-3 w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
            >
              {busy ? "Enviando..." : "Enviar sugerencia"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------
// Lotes: varias cartas sueltas en una sola publicación (Premium).
// ---------------------------------------------
function LotPreviewCard({ lot, onOpen }) {
  const photo = lot.photo_urls?.[0];
  const availableCount = lot.items?.filter((i) => i.status === "live").length ?? 0;

  return (
    <button
      onClick={() => onOpen(lot)}
      className="flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border-2 border-plum bg-paper text-left shadow-card transition hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div className="relative">
        <CardArt label={lot.title} photoUrl={photo} />
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-plum px-2 py-0.5 text-[9px] font-extrabold text-paper">
          <Package size={10} /> LOTE
        </div>
      </div>
      <div className="p-2.5">
        <p className="line-clamp-2 text-[12px] font-extrabold leading-snug text-ink">{lot.title}</p>
        <p className="mt-1 text-[10px] text-ink-soft">{availableCount} disponibles</p>
      </div>
    </button>
  );
}

function LotsRow({ lots, onOpen }) {
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

function LotDetailView({ lot, items, onBack, onOpenUserProfile, onClaimItem, claimingItemId, claimError, onBuyFullLot, buyFullLotBusy, buyFullLotError }) {
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

// ---------------------------------------------
// Vista: Vendedores recomendados (pública)
// ---------------------------------------------
function RecommendedSellersView({ sellers, onBack }) {
  const active = sellers.filter((s) => s.is_active);
  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">VENDEDORES GARANTIZADOS</p>
      </header>

      <div className="px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Vendedores garantizados de productos oficiales: comercios de confianza para comprar packs y colecciones originales, sellados y verificados, fuera de las subastas de la comunidad.
        </p>

        {active.length === 0 ? (
          <p className="mt-4 text-[12px] text-ink-soft">Todavía no hay comercios recomendados cargados.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {active.map((s) => (
              <div key={s.id} className="flex gap-3 rounded-lg border-2 border-gold/50 bg-gold/10 p-3.5">
                {s.photo_url && (
                  <img src={s.photo_url} alt="" className="h-16 w-16 shrink-0 rounded-lg border-2 border-gold/40 object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[14px] font-extrabold text-ink">
                    <Trophy size={13} className="shrink-0 text-gold-dark" /> {s.business_name}
                  </p>
                  {s.description && <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{s.description}</p>}
                  {s.contact_info && <p className="mt-1.5 text-[12px] font-bold text-forest-deep">{s.contact_info}</p>}
                  {s.whatsapp_url && (
                    <a
                      href={s.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold text-[#128C4A] underline underline-offset-2"
                    >
                      <MessageCircle size={12} /> Escribir por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Destacadas del mes (ranking real por pujas, no manual)
// ---------------------------------------------
function TopMonthlyAuctionsView({ auctions, onBack, onOpen, onOpenSellerProfile, recommendedSellers, onOpenRecommended }) {
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

// ---------------------------------------------
// Slide de subastas parecidas, para navegar sin volver a la grilla.
// Prioriza mismo set, después misma rareza, después cualquier otra en vivo.
// ---------------------------------------------
function SimilarAuctionsRow({ auctions, currentAuction, onOpen, onOpenSellerProfile }) {
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
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const photos = auction.photoUrls?.length ? auction.photoUrls : auction.photoUrl ? [auction.photoUrl] : [];
  const minBid = auction.currentBid + bidIncrement;
  const upCount = reactions?.filter((r) => r.reaction === "up").length ?? 0;
  const downCount = reactions?.filter((r) => r.reaction === "down").length ?? 0;

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
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">DETALLE DE SUBASTA</p>
        {viewerCount > 1 && auction.status === "live" && (
          <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-cream/70">
            <Users size={13} /> {viewerCount} viendo ahora
          </span>
        )}
      </header>

      <div className="px-5 pt-5 md:mx-auto md:flex md:max-w-4xl md:items-start md:gap-8 md:px-8">
        <div className="md:sticky md:top-20 md:w-72 md:shrink-0">
        <button
          onClick={() => photos.length > 0 && setLightboxOpen(true)}
          className="mx-auto block w-52 overflow-hidden rounded-lg border-2 border-ink shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
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
        </div>

        <div className="md:min-w-0 md:flex-1">
        <h2 className="mt-4 text-xl font-extrabold text-ink md:mt-0">{auction.card}</h2>
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

        <div className="mt-5 flex flex-wrap gap-6">
          <div>
            <span className="block text-[10px] text-ink-soft">{auction.isSaleOnly || auction.isFreeClaim ? "PRECIO" : "PUJA ACTUAL"}</span>
            <span className="text-lg font-extrabold text-forest-deep">
              {auction.isFreeClaim ? "GRATIS" : formatPrice(auction.currentBid, auction.currency)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-ink-soft">TERMINA EN</span>
            <span className={`text-lg font-extrabold ${auction.closesInSec <= 600 ? "text-[#B9432C]" : "text-ink"}`}>
              {formatCountdown(auction.closesInSec)}
            </span>
          </div>
          {auction.isFreeClaim ? (
            <div>
              <span className="block text-[10px] text-ink-soft">RECLAMOS</span>
              <span className="text-lg font-extrabold text-ink">{auction.freeClaimCount}</span>
            </div>
          ) : (
            !auction.isSaleOnly && (
              <div>
                <span className="block text-[10px] text-ink-soft">PUJAS</span>
                <span className="text-lg font-extrabold text-ink">{auction.bids}</span>
              </div>
            )
          )}
        </div>

        {auction.status === "live" && auction.reservePrice != null && (
          <p className={`mt-2 text-[11px] font-bold ${reserveMet ? "text-forest-deep" : "text-[#B9432C]"}`}>
            {reserveMet ? "Reserva alcanzada" : "Todavía no se alcanzó el precio mínimo del vendedor"}
            {isMine && ` (${formatPrice(auction.reservePrice, auction.currency)})`}
          </p>
        )}

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

        {bidHistory.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Evolución del precio</h4>
              {auction.referencePrice != null && (
                <span className="text-[11px] font-bold text-plum">
                  Referencia: {formatPrice(auction.referencePrice, auction.currency)}
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
                  <span className="font-bold text-forest-deep">{formatPrice(Number(b.amount), auction.currency)}</span>
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
    </div>
  );
}

// ---------------------------------------------
// Vista: Mis tickets (todos, no solo el primero pendiente)
// ---------------------------------------------
function TicketRow({ ticket, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg border-2 border-line bg-paper p-3 text-left transition hover:-translate-y-0.5"
    >
      <div className="min-w-0">
        <p className="line-clamp-1 text-[13px] font-extrabold text-ink">{ticket.card}</p>
        <p className="text-[11px] text-ink-soft">
          {ticket.isSeller ? "Vos vendiste" : `Vendedor: ${ticket.seller}`} · {formatPrice(ticket.price, ticket.currency)}
        </p>
      </div>
      {ticket.status === "pendiente" ? (
        <Pill tone="gold">Pendiente</Pill>
      ) : (
        <Pill tone="live">Entregado</Pill>
      )}
    </button>
  );
}

function MyTicketsView({ tickets, onBack, onOpenTicket }) {
  const toPickup = tickets.filter((t) => !t.isSeller && t.status === "pendiente");
  const toDeliver = tickets.filter((t) => t.isSeller && t.status === "pendiente");
  const delivered = tickets.filter((t) => t.status === "entregado");

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">MIS TICKETS</p>
      </header>

      <div className="space-y-5 px-5 pt-6">
        {tickets.length === 0 && <p className="text-[13px] text-ink-soft">Todavía no tenés tickets.</p>}

        {toPickup.length > 0 && (
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              Para retirar ({toPickup.length})
            </h3>
            <div className="flex flex-col gap-2">
              {toPickup.map((t) => (
                <TicketRow key={t.id} ticket={t} onClick={() => onOpenTicket(t)} />
              ))}
            </div>
          </div>
        )}

        {toDeliver.length > 0 && (
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              Para entregar ({toDeliver.length})
            </h3>
            <div className="flex flex-col gap-2">
              {toDeliver.map((t) => (
                <TicketRow key={t.id} ticket={t} onClick={() => onOpenTicket(t)} />
              ))}
            </div>
          </div>
        )}

        {delivered.length > 0 && (
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              Entregados ({delivered.length})
            </h3>
            <div className="flex flex-col gap-2 opacity-70">
              {delivered.map((t) => (
                <TicketRow key={t.id} ticket={t} onClick={() => onOpenTicket(t)} />
              ))}
            </div>
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
    <div className="min-h-dvh bg-cream pb-10">
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
            {ticket.isSeller && (
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-soft">
                Comprador:
                <GenderIcon gender={ticket.buyerGender} size={13} />
                {onOpenUserProfile && ticket.buyerId ? (
                  <button
                    onClick={() => onOpenUserProfile(ticket.buyerId)}
                    className="font-bold text-ink underline decoration-line decoration-dotted underline-offset-2 hover:text-forest-deep"
                  >
                    {ticket.buyer}
                  </button>
                ) : (
                  <span className="font-bold text-ink">{ticket.buyer}</span>
                )}
              </p>
            )}
            <p className="text-[13px] text-ink-soft">Precio final: <span className="font-bold text-forest-deep">{formatPrice(ticket.price, ticket.currency)}</span></p>
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
                city: ticket.sellerCity,
                pickup_point: ticket.sellerPickupPointName ? { name: ticket.sellerPickupPointName } : null,
              }}
            />
          </div>
        )}

        {!delivered && ticket.isSeller && (
          <div className="mx-auto mt-6 max-w-sm rounded-lg border-2 border-line bg-paper p-3 text-[12px] leading-relaxed text-ink-soft">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Cómo contactar al comprador</p>
            {ticket.buyerContactPhone ? (
              <>Teléfono: <span className="font-bold text-ink">{ticket.buyerContactPhone}</span></>
            ) : (
              <>Todavía no cargó un teléfono de contacto — podés escribirle desde su perfil o coordinar con el código al retirar.</>
            )}
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
  { label: "12 horas", value: 720 },
  { label: "24 horas", value: 1440 },
  { label: "3 días", value: 4320 },
  { label: "1 semana", value: 10080 },
];

// Sugerencias de sets reales para el campo "Colección / set" — sigue
// siendo texto libre, esto solo autocompleta los nombres más comunes.
function PokemonSetDatalist() {
  return (
    <datalist id="pokemon-set-options">
      {POKEMON_SET_ERAS.flatMap((era) => era.sets).map((set) => (
        <option key={set} value={set} />
      ))}
    </datalist>
  );
}

function CreateAuction({ onBack, onCreate, showDuration = false, busy = false, busyText = "", error = "" }) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [price, setPrice] = useState("");
  const [referencePrice, setReferencePrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [isSaleOnly, setIsSaleOnly] = useState(false);
  const [isFreeClaim, setIsFreeClaim] = useState(false);
  const [freeClaimWinningNumber, setFreeClaimWinningNumber] = useState("");
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
  const [language, setLanguage] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [photoConverting, setPhotoConverting] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanApplied, setScanApplied] = useState(false);
  const [scanAttempted, setScanAttempted] = useState(false);

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

  async function handleScanCard() {
    if (photos.length === 0 || scanning) return;
    setScanning(true);
    setScanError("");
    setScanApplied(false);
    try {
      const fields = await scanCardPhoto(photos[0].file);
      if (!fields) {
        setScanError("No pudimos reconocer la carta — completá los datos a mano.");
        return;
      }
      if (fields.name && !name) setName(fields.name);
      if (fields.setName && !setName_) setSetName(fields.setName);
      if (fields.cardNumber && !cardNumber) setCardNumber(fields.cardNumber);
      if (fields.year && !year) setYear(String(fields.year));
      if (!rarity && RARITY_OPTIONS.some((o) => o.value === fields.rarity)) setRarity(fields.rarity);
      if (!language && LANGUAGE_OPTIONS.some((o) => o.value === fields.language)) setLanguage(fields.language);
      setScanApplied(true);
    } catch {
      setScanError("No pudimos escanear la foto. Probá de nuevo en un momento.");
    } finally {
      setScanning(false);
      setScanAttempted(true);
    }
  }

  const photoRequired = showDuration;
  const reserveInvalid = !isSaleOnly && !isFreeClaim && reservePrice !== "" && Number(reservePrice) < Number(price || 0);
  const buyNowInvalid =
    !isSaleOnly &&
    !isFreeClaim &&
    buyNowPrice !== "" &&
    (Number(buyNowPrice) <= Number(price || 0) ||
      (reservePrice !== "" && Number(buyNowPrice) <= Number(reservePrice)));
  const freeClaimNumberInvalid =
    isFreeClaim && (freeClaimWinningNumber === "" || Number(freeClaimWinningNumber) < 0 || Number(freeClaimWinningNumber) > 50);
  const canPublish =
    name &&
    (isFreeClaim || price) &&
    (!isFreeClaim || !freeClaimNumberInvalid) &&
    (!photoRequired || photos.length > 0) &&
    !busy &&
    !photoConverting &&
    !reserveInvalid &&
    !buyNowInvalid;

  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[12px] font-bold text-ink-soft";

  // Después de escanear una foto, marcamos con un borde fino verde/rojo
  // los campos que la IA completa, para orientar qué falta cargar a mano.
  function scannedInputClass(filled) {
    if (!scanAttempted) return inputClass;
    return inputClass.replace("border-line", filled ? "border-forest-mid" : "border-[#B9432C]");
  }

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <PokemonSetDatalist />
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
            {photos.length > 0 && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleScanCard}
                  disabled={scanning || photoConverting}
                  className="flex items-center gap-1.5 rounded-lg border-2 border-plum bg-plum/10 px-3 py-2 text-[12px] font-bold text-plum disabled:opacity-60"
                >
                  {scanning ? <Loader2 size={14} className="animate-spin" /> : <PokedexIcon size={15} />}
                  {scanning ? "Reconociendo carta..." : "Autocompletar con la foto"}
                </button>
                {scanApplied && !scanError && (
                  <p className="mt-1.5 text-[11px] text-plum">Autocompletado con IA — revisá los datos antes de publicar.</p>
                )}
                {scanError && <p className="mt-1.5 text-[11px] text-[#B9432C]">{scanError}</p>}
              </div>
            )}
          </div>
        )}
        <div>
          <label className={labelClass}>Nombre de la carta</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Gengar VMAX Alt Art"
            className={scannedInputClass(!!name)}
          />
        </div>

        {!isFreeClaim && (
          <div>
            <label className={labelClass}>Moneda</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCurrency("ARS")}
                className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
                  currency === "ARS"
                    ? "border-gold bg-gold/15 text-gold-dark"
                    : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                }`}
              >
                Pesos ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
                  currency === "USD"
                    ? "border-gold bg-gold/15 text-gold-dark"
                    : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                }`}
              >
                Dólares (U$S)
              </button>
            </div>
          </div>
        )}

        {showDuration && (
          <div>
            <label className={labelClass}>Modo de publicación</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSaleOnly(false);
                  setIsFreeClaim(false);
                }}
                className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
                  !isSaleOnly && !isFreeClaim
                    ? "border-gold bg-gold/15 text-gold-dark"
                    : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                }`}
              >
                Subasta
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSaleOnly(true);
                  setIsFreeClaim(false);
                }}
                className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
                  isSaleOnly
                    ? "border-gold bg-gold/15 text-gold-dark"
                    : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                }`}
              >
                Venta directa
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSaleOnly(false);
                  setIsFreeClaim(true);
                }}
                className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
                  isFreeClaim
                    ? "border-gold bg-gold/15 text-gold-dark"
                    : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                }`}
              >
                Free claim
              </button>
            </div>
            <p className="mt-1 text-[11px] text-ink-soft">
              {isFreeClaim
                ? "Gratis: elegís un número de 0 a 50 y quien sea el reclamo con ese número se la lleva sin pagar."
                : isSaleOnly
                ? "Sin pujas: se vende al precio que pongas abajo, a quien la claimee primero."
                : "La carta se subasta y gana quien más ofrezca (podés sumar reserva y claim inmediato)."}
            </p>
            {isFreeClaim && (
              <div className="mt-3">
                <label className={labelClass}>Número ganador (0 a 50)</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={freeClaimWinningNumber}
                  onChange={(e) => setFreeClaimWinningNumber(e.target.value)}
                  placeholder="Ej: 12"
                  className={inputClass}
                />
                {freeClaimNumberInvalid && freeClaimWinningNumber !== "" && (
                  <p className="mt-1 text-[11px] text-[#B9432C]">Tiene que ser un número entre 0 y 50.</p>
                )}
                <p className="mt-1 text-[11px] text-ink-soft">
                  No se lo mostramos a nadie más — el reclamo que caiga justo en ese número gana automáticamente.
                </p>
              </div>
            )}
          </div>
        )}

        {showDuration && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Colección / set</label>
                <input
                  value={setName_}
                  onChange={(e) => setSetName(e.target.value)}
                  placeholder="Ej: Obsidian Flames"
                  list="pokemon-set-options"
                  className={scannedInputClass(!!setName_)}
                />
              </div>
              <div>
                <label className={labelClass}>Número</label>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Ej: 125/197"
                  className={scannedInputClass(!!cardNumber)}
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
                  className={scannedInputClass(!!year)}
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Rareza</label>
                <select value={rarity} onChange={(e) => setRarity(e.target.value)} className={scannedInputClass(!!rarity)}>
                  <option value="">Sin especificar</option>
                  {RARITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.symbol} {opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Idioma</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className={scannedInputClass(!!language)}>
                  <option value="">Sin especificar</option>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
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

        {!isFreeClaim && (
          <div>
            <label className={labelClass}>{isSaleOnly ? "Precio de venta" : "Precio base"}</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
        )}

        {showDuration && !isFreeClaim && (
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

        {showDuration && !isSaleOnly && !isFreeClaim && (
          <div>
            <label className={labelClass}>Precio mínimo / reserva (opcional)</label>
            <input
              type="number"
              value={reservePrice}
              onChange={(e) => setReservePrice(e.target.value)}
              placeholder="Ej: no vender por menos de este monto"
              className={inputClass}
            />
            {reserveInvalid && (
              <p className="mt-1 text-[11px] text-[#B9432C]">Tiene que ser mayor o igual al precio base.</p>
            )}
            <p className="mt-1 text-[11px] text-ink-soft">
              Si al cerrar la subasta la puja más alta no lo alcanza, no se genera ganador. No se lo mostramos al público, solo si se alcanzó o no.
            </p>
          </div>
        )}

        {showDuration && !isSaleOnly && !isFreeClaim && (
          <div>
            <label className={labelClass}>Precio de claim inmediato (opcional)</label>
            <input
              type="number"
              value={buyNowPrice}
              onChange={(e) => setBuyNowPrice(e.target.value)}
              placeholder="Ej: quien pague esto se lleva la carta ya"
              className={inputClass}
            />
            {buyNowInvalid && (
              <p className="mt-1 text-[11px] text-[#B9432C]">Tiene que ser mayor al precio base{reservePrice ? " y a la reserva" : ""}.</p>
            )}
            <p className="mt-1 text-[11px] text-ink-soft">
              Si alguien paga este precio antes de que termine el tiempo, la subasta cierra al instante a su favor.
            </p>
          </div>
        )}

        {showDuration && (
          <div>
            <label className={labelClass}>Dura</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
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
              currency,
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
              language,
              isFeatured,
              referencePrice: referencePrice ? Number(referencePrice) : null,
              reservePrice: isSaleOnly || isFreeClaim ? null : reservePrice ? Number(reservePrice) : null,
              buyNowPrice: isFreeClaim ? null : isSaleOnly ? Number(price) : buyNowPrice ? Number(buyNowPrice) : null,
              isSaleOnly,
              isFreeClaim,
              freeClaimWinningNumber: isFreeClaim ? Number(freeClaimWinningNumber) : null,
            })
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          {busy && <Loader2 size={15} className="animate-spin" />}
          {busy
            ? busyText || "Publicando..."
            : isFreeClaim
            ? "Publicar free claim"
            : isSaleOnly
            ? "Publicar venta directa"
            : "Publicar subasta"}
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
// Vista: Publicar lote (Premium) — varias cartas sueltas, cada una
// con su propia descripción y precio, en una sola publicación.
// ---------------------------------------------
function CreateLotView({ onBack, onCreate, busy = false, busyText = "", error = "" }) {
  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [duration, setDuration] = useState(1440);
  const [items, setItems] = useState([{ description: "", price: "" }, { description: "", price: "" }]);
  const [fullPrice, setFullPrice] = useState("");
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

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => (prev.length >= 10 ? prev : [...prev, { description: "", price: "" }]));
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const validItems = items.filter((it) => it.description.trim() && Number(it.price) > 0);
  const canPublish = title.trim() && photos.length > 0 && validItems.length >= 2 && !busy && !photoConverting;

  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[12px] font-bold text-ink-soft";

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">PUBLICAR LOTE</p>
      </header>

      <div className="space-y-4 px-5 pt-6">
        <p className="rounded-lg border-2 border-gold/40 bg-gold/10 px-3 py-2.5 text-[12px] leading-relaxed text-ink-soft">
          Cada carta que cargues abajo se publica con su propio precio — quien la quiera la claimea directo, sin pujas.
        </p>

        <div>
          <label className={labelClass}>Título del lote</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Lote de sueltas Base Set — 8 cartas"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Moneda (aplica a todas las cartas del lote)</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCurrency("ARS")}
              className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
                currency === "ARS"
                  ? "border-gold bg-gold/15 text-gold-dark"
                  : "border-line bg-paper text-ink-soft hover:border-forest-mid"
              }`}
            >
              Pesos ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
                currency === "USD"
                  ? "border-gold bg-gold/15 text-gold-dark"
                  : "border-line bg-paper text-ink-soft hover:border-forest-mid"
              }`}
            >
              Dólares (U$S)
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Descripción general (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Contexto del lote: estado general, de dónde salieron, etc."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Fotos del panorama general (obligatoria, hasta {MAX_PHOTOS})</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-ink">
                <img src={p.preview} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
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

        <div>
          <label className={labelClass}>Cartas incluidas (mínimo 2, hasta 10)</label>
          <div className="mt-1.5 flex flex-col gap-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={item.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  placeholder={`Ej: Charizard NM, alt art, 2023`}
                  className="min-w-0 flex-1 rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(i, "price", e.target.value)}
                  placeholder={currency === "USD" ? "U$S" : "$"}
                  className="w-24 shrink-0 rounded-lg border-2 border-line bg-white px-2.5 py-2.5 text-[13px] font-bold text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid"
                />
                {items.length > 2 && (
                  <button onClick={() => removeItem(i)} className="shrink-0 text-ink-soft hover:text-[#B9432C]">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {items.length < 10 && (
            <button
              onClick={addItem}
              className="mt-2 flex items-center gap-1 text-[12px] font-bold text-forest-deep underline underline-offset-2"
            >
              <Plus size={13} /> Agregar otra carta
            </button>
          )}
        </div>

        <div>
          <label className={labelClass}>Precio por el lote completo (opcional)</label>
          <input
            type="number"
            value={fullPrice}
            onChange={(e) => setFullPrice(e.target.value)}
            placeholder={currency === "USD" ? "Ej: U$S 50 por todo el lote" : "Ej: $50.000 por todo el lote"}
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-ink-soft">
            Si lo cargás, además de vender cada carta suelta alguien va a poder llevarse el lote entero por
            este precio — pero solo mientras esté 100% completo (ninguna carta vendida todavía).
          </p>
        </div>

        <div>
          <label className={labelClass}>Dura</label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
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

        {error && <p className="text-[12px] text-[#B9432C]">{error}</p>}
        <button
          disabled={!canPublish}
          onClick={() =>
            onCreate({
              title: title.trim(),
              currency,
              description: description.trim(),
              photoFiles: photos.map((p) => p.file),
              durationMinutes: duration,
              items: validItems.map((it) => ({ description: it.description.trim(), price: Number(it.price) })),
              fullPrice: fullPrice ? Number(fullPrice) : null,
            })
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          {busy && <Loader2 size={15} className="animate-spin" />}
          {busy ? busyText || "Publicando..." : "Publicar lote"}
        </button>
        {validItems.length < 2 && (
          <p className="text-center text-[11px] text-ink-soft">Cargá al menos 2 cartas con descripción y precio.</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Editar subasta propia (sin pujas todavía)
// ---------------------------------------------
function EditAuction({ auction, onBack, onSave, onCancelAuction, busy = false, cancelBusy = false, error = "" }) {
  const [name, setName] = useState(auction.card);
  const [price, setPrice] = useState(String(auction.basePrice));
  const [referencePrice, setReferencePrice] = useState(auction.referencePrice ? String(auction.referencePrice) : "");
  const [reservePrice, setReservePrice] = useState(auction.reservePrice ? String(auction.reservePrice) : "");
  const [buyNowPrice, setBuyNowPrice] = useState(auction.buyNowPrice ? String(auction.buyNowPrice) : "");
  const [setName_, setSetName] = useState(auction.setName ?? "");
  const [cardNumber, setCardNumber] = useState(auction.cardNumber ?? "");
  const [year, setYear] = useState(auction.year ? String(auction.year) : "");
  const [condition, setCondition] = useState(auction.condition ?? "near_mint");
  const [isGraded, setIsGraded] = useState(!!auction.isGraded);
  const [gradingCompany, setGradingCompany] = useState(auction.gradingCompany ?? "psa");
  const [grade, setGrade] = useState(auction.grade ? String(auction.grade) : "");
  const [rarity, setRarity] = useState(auction.rarity ?? "");
  const [isFeatured, setIsFeatured] = useState(!!auction.isFeatured);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[12px] font-bold text-ink-soft";
  const reserveInvalid = !auction.isSaleOnly && reservePrice !== "" && Number(reservePrice) < Number(price || 0);
  const buyNowInvalid =
    !auction.isSaleOnly &&
    buyNowPrice !== "" &&
    (Number(buyNowPrice) <= Number(price || 0) ||
      (reservePrice !== "" && Number(buyNowPrice) <= Number(reservePrice)));
  const canSave = name && price && !reserveInvalid && !buyNowInvalid;

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <PokemonSetDatalist />
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">EDITAR PUBLICACION</p>
      </header>

      <div className="space-y-4 px-5 pt-6">
        <p className="rounded-lg border-2 border-line bg-paper p-3 text-[12px] leading-relaxed text-ink-soft">
          Podés corregir estos datos porque todavía no tiene pujas. Las fotos no se pueden cambiar acá.
        </p>

        <div>
          <label className={labelClass}>Nombre de la carta</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Colección / set</label>
            <input value={setName_} onChange={(e) => setSetName(e.target.value)} list="pokemon-set-options" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Número</label>
            <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Año</label>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
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
              <input type="number" step="0.5" value={grade} onChange={(e) => setGrade(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>{auction.isSaleOnly ? "Precio de venta" : "Precio base"}</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Precio de referencia (opcional)</label>
          <input
            type="number"
            value={referencePrice}
            onChange={(e) => setReferencePrice(e.target.value)}
            className={inputClass}
          />
        </div>

        {!auction.isSaleOnly && (
          <div>
            <label className={labelClass}>Precio mínimo / reserva (opcional)</label>
            <input
              type="number"
              value={reservePrice}
              onChange={(e) => setReservePrice(e.target.value)}
              className={inputClass}
            />
            {reserveInvalid && (
              <p className="mt-1 text-[11px] text-[#B9432C]">Tiene que ser mayor o igual al precio base.</p>
            )}
          </div>
        )}

        {!auction.isSaleOnly && (
          <div>
            <label className={labelClass}>Precio de claim inmediato (opcional)</label>
            <input
              type="number"
              value={buyNowPrice}
              onChange={(e) => setBuyNowPrice(e.target.value)}
              className={inputClass}
            />
            {buyNowInvalid && (
              <p className="mt-1 text-[11px] text-[#B9432C]">Tiene que ser mayor al precio base{reservePrice ? " y a la reserva" : ""}.</p>
            )}
          </div>
        )}

        {error && <p className="text-[12px] text-[#B9432C]">{error}</p>}

        <button
          disabled={!canSave || busy}
          onClick={() =>
            onSave({
              name,
              price: Number(price),
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
              reservePrice: auction.isSaleOnly ? null : reservePrice ? Number(reservePrice) : null,
              buyNowPrice: auction.isSaleOnly ? Number(price) : buyNowPrice ? Number(buyNowPrice) : null,
            })
          }
          className="w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          {busy ? "Guardando..." : "Guardar cambios"}
        </button>

        <div className="border-t-2 border-line pt-4">
          {confirmCancel ? (
            <div className="rounded-lg border-2 border-[#B9432C]/30 bg-[#FBE6E0] p-3">
              <p className="text-[12px] font-bold text-[#B9432C]">
                ¿Seguro que querés cancelar esta subasta? No se puede deshacer.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={onCancelAuction}
                  disabled={cancelBusy}
                  className="rounded-lg bg-[#B9432C] px-3 py-2 text-[12px] font-bold text-paper disabled:opacity-40"
                >
                  {cancelBusy ? "Cancelando..." : "Sí, cancelar"}
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="rounded-lg border-2 border-line px-3 py-2 text-[12px] font-bold text-ink-soft"
                >
                  Volver
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmCancel(true)}
              className="text-[12px] font-bold text-[#B9432C] underline underline-offset-2"
            >
              Cancelar esta subasta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Términos de uso y privacidad
// ---------------------------------------------
function LegalView({ onBack }) {
  const Section = ({ title, children }) => (
    <div className="mt-5">
      <h3 className="text-[13px] font-extrabold text-ink">{title}</h3>
      <div className="mt-1.5 space-y-2 text-[12.5px] leading-relaxed text-ink-soft">{children}</div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">TERMINOS Y PRIVACIDAD</p>
      </header>

      <div className="px-5 pt-6">
        <p className="text-[11px] text-ink-soft">Última actualización: julio de 2026.</p>

        <Section title="Qué es Ciudad Azulona">
          <p>
            Ciudad Azulona es un espacio para coordinar subastas de cartas Pokémon TCG entre coleccionistas.
            Complementa la coordinación por WhatsApp, no la reemplaza: la plataforma organiza la puja y genera
            un código de retiro, pero el intercambio de la carta y del dinero pasa siempre en persona, entre
            vendedor y comprador.
          </p>
        </Section>

        <Section title="Pagos y entregas">
          <p>
            Ciudad Azulona no procesa pagos ni maneja dinero. El precio que se ve en la app es el que se pactó
            en la puja; cómo y cuándo se paga lo acuerdan vendedor y comprador directamente, fuera de la
            plataforma. El código de retiro solo confirma la identidad de la entrega, no reemplaza tu propio
            criterio: revisá la carta antes de confirmar el retiro.
          </p>
        </Section>

        <Section title="Qué datos guardamos">
          <p>
            Guardamos tu email (para identificarte por código, sin contraseñas), tu teléfono de contacto
            (para coordinar la entrega), el alias que elegís, las fotos que subís de tus cartas, y el
            historial de subastas, pujas y calificaciones en las que participás. No compartimos tu email con
            otros usuarios. Tu teléfono de contacto sí se lo mostramos a la otra parte únicamente cuando se
            concreta una venta con vos (comprador y vendedor se ven el teléfono entre sí para coordinar la
            entrega) — el resto de la comunidad solo ve tu alias, tu reputación y las fotos de tus
            publicaciones.
          </p>
        </Section>

        <Section title="Tu responsabilidad como usuario">
          <p>
            Sos responsable de que la información que publicás sobre una carta (estado, autenticidad, fotos)
            sea precisa. Publicar información falsa o engañosa, no presentarte a una entrega acordada, o
            manipular pujas, puede derivar en la suspensión de tu cuenta.
          </p>
        </Section>

        <Section title="Moderación">
          <p>
            Cualquier usuario puede denunciar una subasta que le parezca sospechosa. El equipo de Ciudad
            Azulona puede suspender cuentas que incumplan estas condiciones; una cuenta suspendida no puede
            pujar ni publicar, pero conserva acceso para retirar cartas ya ganadas.
          </p>
        </Section>

        <Section title="Cambios a estos términos">
          <p>
            Podemos actualizar este texto a medida que la plataforma crece. Los cambios importantes se van a
            avisar dentro de la app.
          </p>
        </Section>

        <Section title="Contacto">
          <p>Para dudas, reclamos o para ejercer tus derechos sobre tus datos, escribinos por WhatsApp al grupo de la comunidad.</p>
        </Section>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Preguntas frecuentes
// ---------------------------------------------
function FaqView({ onBack }) {
  const [openId, setOpenId] = useState(null);

  const faqs = [
    {
      id: "pago",
      q: "¿Cómo pago o cobro una carta?",
      a: "Ciudad Azulona no procesa pagos ni maneja dinero. El precio que ves es el que se pactó pujando o al hacer claim; cómo y cuándo se paga (efectivo, transferencia, etc.) lo acuerdan vendedor y comprador directamente, por fuera de la plataforma, al coordinar la entrega.",
    },
    {
      id: "retiro",
      q: "¿Cómo retiro una carta que gané o claimeé?",
      a: "Cuando ganás una subasta, hacés claim o ganás un free claim, se genera un ticket con un código único en \"Mis tickets\". Mostrale ese código al vendedor al momento de retirar — es la forma de confirmar que la entrega es la correcta. El vendedor lo marca como entregado desde su lado.",
    },
    {
      id: "contacto",
      q: "¿Cómo me contacto con el comprador o vendedor?",
      a: "Al cerrarse una venta (claim, free claim o subasta ganada), comprador y vendedor pueden verse el alias y el teléfono de contacto entre sí (si lo cargaron en su perfil) desde el detalle del ticket, para coordinar día y lugar de entrega.",
    },
    {
      id: "modos",
      q: "¿Cuál es la diferencia entre Subasta, Venta directa y Free claim?",
      a: "Subasta: se puja y gana la oferta más alta al cerrar el tiempo. Venta directa (Claim): precio fijo, se la lleva quien la claimee primero, sin pujas. Free claim: es gratis — el vendedor define un número ganador oculto (0 a 50) y quien reclame justo en esa posición se la lleva sin pagar.",
    },
    {
      id: "lotes",
      q: "¿Qué son los lotes?",
      a: "Una publicación con varias cartas sueltas (hasta 10) agrupadas, cada una con su propio precio — quien quiera una la claimea directo, sin pujas. Es una opción para vendedores Premium con muchas cartas para publicar de una sola vez.",
    },
    {
      id: "ciudad",
      q: "¿Para qué sirve cargar mi ciudad?",
      a: "Se usa para que los compradores puedan filtrar la grilla por ciudad y encuentren vendedores cerca suyo. Se configura en Mi perfil → Retiro de la carta → Editar. Si tu ciudad ya tiene puntos de retiro cargados por el equipo, también podés elegir uno específico.",
    },
    {
      id: "premium",
      q: "¿Qué diferencia tiene una cuenta Premium?",
      a: "Las cuentas Premium tienen una insignia distintiva en su perfil y publicaciones, y pueden publicar lotes de hasta 10 cartas en una sola publicación.",
    },
    {
      id: "editar",
      q: "¿Puedo editar o cancelar una publicación?",
      a: "Sí, mientras siga en vivo y todavía no tenga pujas (o reclamos, en el caso de free claim). Lo encontrás en el detalle de tu propia publicación.",
    },
    {
      id: "republicar",
      q: "¿Puedo republicar una carta que no se vendió?",
      a: "Sí. Entrá al detalle de una publicación tuya ya cerrada y usá \"Republicar esta carta\" — reutiliza la misma foto y ficha, solo te pide precio y duración nuevos.",
    },
    {
      id: "denuncia",
      q: "¿Qué hago si veo una publicación sospechosa?",
      a: "Podés denunciarla desde el detalle de la subasta (\"Denunciar esta subasta\"). El equipo revisa las denuncias y puede suspender cuentas que incumplan las reglas de la comunidad.",
    },
    {
      id: "ranking",
      q: "¿Cómo funciona el Ranking?",
      a: "Muestra el top 10 de vendedores y el top 10 de compradores por volumen acumulado en entregas ya confirmadas (no cuenta lo que todavía está pendiente de retiro).",
    },
    {
      id: "moneda",
      q: "¿Puedo publicar en dólares?",
      a: "Sí, al crear una publicación elegís si el precio es en pesos o en dólares — se puja o se claimea en esa misma moneda.",
    },
  ];

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">PREGUNTAS FRECUENTES</p>
      </header>

      <div className="px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Las dudas más comunes sobre cómo se usa la plataforma. Si te queda algo sin resolver, mandanos una sugerencia o escribinos por WhatsApp.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {faqs.map((f) => (
            <div key={f.id} className="overflow-hidden rounded-lg border-2 border-line bg-paper">
              <button
                onClick={() => setOpenId((id) => (id === f.id ? null : f.id))}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
              >
                <span className="text-[13px] font-bold text-ink">{f.q}</span>
                <ChevronDown size={16} className={`shrink-0 text-ink-soft transition ${openId === f.id ? "rotate-180" : ""}`} />
              </button>
              {openId === f.id && (
                <p className="px-4 pb-3.5 text-[12.5px] leading-relaxed text-ink-soft">{f.a}</p>
              )}
            </div>
          ))}
        </div>
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
  const cityLine = profile.city ? (
    <>
      Retira en <span className="font-bold text-ink">{profile.city}</span>
      {profile.pickup_point?.name && (
        <>
          {" "}— <span className="font-bold text-ink">{profile.pickup_point.name}</span>
        </>
      )}
      <br />
    </>
  ) : null;

  if (profile.has_stand) {
    return (
      <>
        {cityLine}
        {profile.stand_number ? (
          <>Tiene stand fijo: <span className="font-bold text-ink">{profile.stand_number}</span></>
        ) : (
          <>Tiene stand fijo en el evento.</>
        )}
      </>
    );
  }
  if (profile.pickup_day || profile.pickup_time || profile.contact_phone) {
    return (
      <>
        {cityLine}
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
  if (cityLine) return cityLine;
  return "Todavía no cargó cómo prefiere coordinar el retiro.";
}

function StatHistoryList({ title, icon, items = [], emptyText }) {
  return (
    <div className="mt-4">
      <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
        {icon} {title}
      </h4>
      {items.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2 text-[13px]">
              <span className="line-clamp-1 text-ink-soft">{it.cardName}</span>
              <span className="shrink-0 font-bold text-forest-deep">{formatPrice(Number(it.amount), it.currency)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-[12px] text-ink-soft">{emptyText}</p>
      )}
    </div>
  );
}

function ProfileView({ profile, onBack, isOwn = true, badges = [], stats, onEditPickup, onOpenLegal, onUpdateGender }) {
  const [editingGender, setEditingGender] = useState(false);
  const [savingGender, setSavingGender] = useState(false);

  async function handlePickGender(g) {
    if (g === profile.gender) {
      setEditingGender(false);
      return;
    }
    setSavingGender(true);
    try {
      await onUpdateGender(g);
    } finally {
      setSavingGender(false);
      setEditingGender(false);
    }
  }

  return (
    <div className="min-h-dvh bg-cream pb-10">
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
          {profile.is_premium && (
            <span className="flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-extrabold text-gold-dark">
              <Trophy size={11} /> VENDEDOR VERIFICADO
            </span>
          )}
          {isOwn && onUpdateGender && !editingGender && (
            <button
              onClick={() => setEditingGender(true)}
              className="text-[11px] font-bold text-forest-deep underline underline-offset-2"
            >
              Editar ícono
            </button>
          )}
        </h2>

        {editingGender && (
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border-2 border-line bg-paper p-2.5">
            {[
              { value: "masculino", label: "Entrenador" },
              { value: "femenino", label: "Entrenadora" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={savingGender}
                onClick={() => handlePickGender(opt.value)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border-2 py-2.5 transition disabled:opacity-50 ${
                  profile.gender === opt.value ? "border-forest-mid bg-forest-mid/10" : "border-line bg-white"
                }`}
              >
                <GenderIcon gender={opt.value} size={24} />
                <span className="text-[10px] font-bold text-ink">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

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

        {stats && (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg border-2 border-line bg-paper p-3">
                <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                  <TrendingDown size={12} /> Gastó este mes
                </p>
                <p className="mt-1 text-[15px] font-extrabold text-ink">{formatARS(stats.monthlySpent?.ars ?? 0)}</p>
                {stats.monthlySpent?.usd > 0 && (
                  <p className="text-[12px] font-bold text-plum">{formatPrice(stats.monthlySpent.usd, "USD")}</p>
                )}
              </div>
              <div className="rounded-lg border-2 border-line bg-paper p-3">
                <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                  <TrendingUp size={12} /> Vendió este mes
                </p>
                <p className="mt-1 text-[15px] font-extrabold text-ink">{formatARS(stats.monthlyEarned?.ars ?? 0)}</p>
                {stats.monthlyEarned?.usd > 0 && (
                  <p className="text-[12px] font-bold text-plum">{formatPrice(stats.monthlyEarned.usd, "USD")}</p>
                )}
              </div>
            </div>

            {(stats.bestPurchase || stats.bestSale) && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {stats.bestPurchase && (
                  <div className="rounded-lg border-2 border-gold/50 bg-gold/10 p-3">
                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-gold-dark">
                      <Trophy size={12} /> Mejor compra
                    </p>
                    <p className="mt-1 line-clamp-1 text-[12px] font-bold text-ink">{stats.bestPurchase.cardName}</p>
                    <p className="text-[13px] font-extrabold text-forest-deep">{formatARS(stats.bestPurchase.amount)}</p>
                  </div>
                )}
                {stats.bestSale && (
                  <div className="rounded-lg border-2 border-gold/50 bg-gold/10 p-3">
                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-gold-dark">
                      <Trophy size={12} /> Mejor venta
                    </p>
                    <p className="mt-1 line-clamp-1 text-[12px] font-bold text-ink">{stats.bestSale.cardName}</p>
                    <p className="text-[13px] font-extrabold text-forest-deep">{formatARS(stats.bestSale.amount)}</p>
                  </div>
                )}
              </div>
            )}

            <StatHistoryList
              title="Últimas compras"
              icon={<TrendingDown size={12} />}
              items={stats.recentPurchases}
              emptyText={isOwn ? "Todavía no compraste ninguna carta." : "Todavía no compró ninguna carta."}
            />
            <StatHistoryList
              title="Últimas ventas"
              icon={<TrendingUp size={12} />}
              items={stats.recentSales}
              emptyText={isOwn ? "Todavía no vendiste ninguna carta." : "Todavía no vendió ninguna carta."}
            />
          </>
        )}

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

        {isOwn && onOpenLegal && (
          <button
            onClick={onOpenLegal}
            className="mt-8 text-[11px] font-medium text-ink-soft underline underline-offset-2"
          >
            Términos de uso y privacidad
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Editar info de retiro
// ---------------------------------------------
function EditPickupInfo({ profile, onBack, onSave, busy = false, error = "", pickupPoints = [] }) {
  const [hasStand, setHasStand] = useState(profile.has_stand ?? false);
  const [standNumber, setStandNumber] = useState(profile.stand_number ?? "");
  const [pickupDay, setPickupDay] = useState(profile.pickup_day ?? "");
  const [pickupTime, setPickupTime] = useState(profile.pickup_time ?? "");
  const [contactPhone, setContactPhone] = useState(profile.contact_phone ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [pickupPointId, setPickupPointId] = useState(profile.pickup_point_id ?? "");

  const matchingPoints = pickupPoints.filter(
    (p) => p.is_active && p.city.trim().toLowerCase() === city.trim().toLowerCase()
  );

  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[12px] font-bold text-ink-soft";

  return (
    <div className="min-h-dvh bg-cream pb-10">
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

        <div>
          <label className={labelClass}>Ciudad</label>
          <input
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPickupPointId("");
            }}
            placeholder="Ej: Buenos Aires, Mendoza, Córdoba"
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-ink-soft">
            Se usa para que los compradores puedan filtrar por ciudad en la grilla.
          </p>
        </div>

        {matchingPoints.length > 0 && (
          <div>
            <label className={labelClass}>Punto de retiro (opcional)</label>
            <select value={pickupPointId} onChange={(e) => setPickupPointId(e.target.value)} className={inputClass}>
              <option value="">Sin punto específico</option>
              {matchingPoints.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

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
          onClick={() => onSave({ hasStand, standNumber, pickupDay, pickupTime, contactPhone, city, pickupPointId })}
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
// Si se entra directo por un link compartido (/subasta/:id), arrancamos
// ahí en vez de en la lista — y saltando la landing, ver parseInitialView.
function parseInitialView() {
  const m = window.location.pathname.match(/^\/subasta\/([^/]+)\/?$/);
  if (m) return { name: "detail", auctionId: m[1], back: { name: "list" } };
  return { name: "list" };
}

function urlForView(view) {
  if (view.name === "detail" && view.auctionId) return `/subasta/${view.auctionId}`;
  return "/";
}

export default function App() {
  const auth = useAuth();
  const [view, setView] = useState(parseInitialView);
  const [enteredLanding, setEnteredLanding] = useState(() => parseInitialView().name !== "list");
  const [showLegal, setShowLegal] = useState(false);
  const isPoppingRef = useRef(false);
  const isFirstHistoryRender = useRef(true);

  // Sincroniza todo lo que decide "qué pantalla se ve" (view, y también
  // enteredLanding/showLegal que viven fuera del view state machine) con
  // el historial del navegador: cada cambio pushea una entrada, y "atrás"
  // del navegador vuelve a la pantalla anterior en vez de no hacer nada.
  useEffect(() => {
    if (isPoppingRef.current) {
      isPoppingRef.current = false;
      return;
    }
    const historyState = { view, enteredLanding, showLegal };
    const url = urlForView(view);
    if (isFirstHistoryRender.current) {
      isFirstHistoryRender.current = false;
      window.history.replaceState(historyState, "", url);
    } else {
      window.history.pushState(historyState, "", url);
    }
  }, [view, enteredLanding, showLegal]);

  useEffect(() => {
    function onPopState(e) {
      if (e.state) {
        isPoppingRef.current = true;
        setView(e.state.view);
        setEnteredLanding(e.state.enteredLanding);
        setShowLegal(e.state.showLegal);
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const [auctions, setAuctions] = useState(SEED_AUCTIONS);
  const [tickets, setTickets] = useState(SEED_TICKETS);
  const [realRows, setRealRows] = useState([]);
  const [auctionsLoading, setAuctionsLoading] = useState(isSupabaseConfigured);
  const [searchTerm, setSearchTerm] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [createPhase, setCreatePhase] = useState("");
  const [createError, setCreateError] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidBusy, setBidBusy] = useState(false);
  const [buyNowError, setBuyNowError] = useState("");
  const [buyNowBusy, setBuyNowBusy] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [republishBusy, setRepublishBusy] = useState(false);
  const [republishError, setRepublishError] = useState("");
  const [liveLots, setLiveLots] = useState([]);
  const [activeLotItems, setActiveLotItems] = useState([]);
  const [activeLotData, setActiveLotData] = useState(null);
  const [createLotBusy, setCreateLotBusy] = useState(false);
  const [createLotError, setCreateLotError] = useState("");
  const [claimingLotItemId, setClaimingLotItemId] = useState(null);
  const [claimLotItemError, setClaimLotItemError] = useState("");
  const [buyFullLotBusy, setBuyFullLotBusy] = useState(false);
  const [buyFullLotError, setBuyFullLotError] = useState("");
  const [realTickets, setRealTickets] = useState([]);
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [ratedTicketIds, setRatedTicketIds] = useState(new Set());
  const [ratingBusy, setRatingBusy] = useState(false);
  const [viewedProfile, setViewedProfile] = useState(null);
  const [viewedBadges, setViewedBadges] = useState([]);
  const [viewedStats, setViewedStats] = useState(null);
  const [pickupBusy, setPickupBusy] = useState(false);
  const [pickupError, setPickupError] = useState("");
  const [bidHistory, setBidHistory] = useState([]);
  const [directAuction, setDirectAuction] = useState(null);
  const [myPublications, setMyPublications] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState("");
  const [allReports, setAllReports] = useState([]);
  const [resolveReportBusyId, setResolveReportBusyId] = useState(null);
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [adminAuctions, setAdminAuctions] = useState([]);
  const [suspendBusyId, setSuspendBusyId] = useState(null);
  const [premiumBusyId, setPremiumBusyId] = useState(null);
  const [recommendedSellers, setRecommendedSellers] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [createPickupPointBusy, setCreatePickupPointBusy] = useState(false);
  const [createPickupPointError, setCreatePickupPointError] = useState("");
  const [pickupPointBusyId, setPickupPointBusyId] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [myFavoriteAuctions, setMyFavoriteAuctions] = useState([]);
  const [topMonthlyAuctions, setTopMonthlyAuctions] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [createBlogBusy, setCreateBlogBusy] = useState(false);
  const [createBlogError, setCreateBlogError] = useState("");
  const [blogBusyId, setBlogBusyId] = useState(null);
  const [giveaways, setGiveaways] = useState([]);
  const [myGiveawayEntryIds, setMyGiveawayEntryIds] = useState(new Set());
  const [createGiveawayBusy, setCreateGiveawayBusy] = useState(false);
  const [createGiveawayError, setCreateGiveawayError] = useState("");
  const [closeGiveawayBusyId, setCloseGiveawayBusyId] = useState(null);
  const [deleteGiveawayBusyId, setDeleteGiveawayBusyId] = useState(null);
  const [enterGiveawayBusyId, setEnterGiveawayBusyId] = useState(null);
  const [whatsappCommunities, setWhatsappCommunities] = useState([]);
  const [createWhatsappCommunityBusy, setCreateWhatsappCommunityBusy] = useState(false);
  const [createWhatsappCommunityError, setCreateWhatsappCommunityError] = useState("");
  const [whatsappCommunityBusyId, setWhatsappCommunityBusyId] = useState(null);
  const [createRecommendedBusy, setCreateRecommendedBusy] = useState(false);
  const [createRecommendedError, setCreateRecommendedError] = useState("");
  const [recommendedBusyId, setRecommendedBusyId] = useState(null);
  const [topSellers, setTopSellers] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [adminSuggestions, setAdminSuggestions] = useState([]);
  const [suggestionBusy, setSuggestionBusy] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");
  const [suggestionStatusBusyId, setSuggestionStatusBusyId] = useState(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");
  const [cancelAuctionBusy, setCancelAuctionBusy] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [, setClockTick] = useState(0);
  const [toasts, setToasts] = useState([]);
  const myBidAmountsRef = useRef({});
  const anonPresenceIdRef = useRef(crypto.randomUUID());
  const [auctionReactions, setAuctionReactions] = useState([]);
  const [myReaction, setMyReaction] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);

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
        pushToast(`Te superaron en "${updatedRow.card_name}" — nueva puja ${formatPrice(Number(updatedRow.current_bid), updatedRow.currency)}`);
        navigator.vibrate?.(200);
        delete myBidAmountsRef.current[updatedRow.id];
      }
    });
    listMyTickets().then((rows) => !cancelled && setRealTickets(rows));
    listMyGivenRatingTicketIds().then((ids) => !cancelled && setRatedTicketIds(ids));
    listMyNotifications().then((rows) => !cancelled && setNotifications(rows));
    listRecommendedSellers().then((rows) => !cancelled && setRecommendedSellers(rows));
    listPickupPoints().then((rows) => !cancelled && setPickupPoints(rows));
    listWhatsappCommunities().then((rows) => !cancelled && setWhatsappCommunities(rows));
    listMyFavoriteIds().then((ids) => !cancelled && setFavoriteIds(ids));
    listLiveLots().then((rows) => !cancelled && setLiveLots(rows));
    const unsubscribeNotifications = subscribeToMyNotifications(auth.session.user.id, (newNotif) => {
      setNotifications((rows) => [newNotif, ...rows]);
    });
    return () => {
      cancelled = true;
      unsubscribe();
      unsubscribeNotifications();
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
    setClaimResult(null);
    setClaimError("");
  }, [view.auctionId]);

  useEffect(() => {
    if (!isSupabaseConfigured || view.name !== "detail") {
      setAuctionReactions([]);
      setMyReaction(null);
      return;
    }
    let cancelled = false;
    listAuctionReactions(view.auctionId).then((rows) => {
      if (cancelled) return;
      setAuctionReactions(rows);
      setMyReaction(rows.find((r) => r.user_id === auth.session?.user.id)?.reaction ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [view.name, view.auctionId]);

  useEffect(() => {
    if (!isSupabaseConfigured || view.name !== "detail") {
      setViewerCount(0);
      return;
    }
    const presenceKey = auth.session?.user.id ?? anonPresenceIdRef.current;
    return subscribeToAuctionPresence(view.auctionId, presenceKey, setViewerCount);
  }, [view.name, view.auctionId]);

  // Si llegamos directo a /subasta/:id (link compartido) y esa subasta no
  // está en ninguna lista ya cargada (por ejemplo, ya cerró y no aparece en
  // listLiveAuctions), la buscamos aparte en vez de mostrar la pantalla vacía.
  useEffect(() => {
    if (!isSupabaseConfigured || view.name !== "detail") {
      setDirectAuction(null);
      return;
    }
    const alreadyLoaded =
      realRows.some((r) => r.id === view.auctionId) ||
      topMonthlyAuctions.some((a) => a.id === view.auctionId) ||
      myPublications.some((a) => a.id === view.auctionId) ||
      myBids.some((a) => a.id === view.auctionId);
    if (alreadyLoaded) {
      setDirectAuction(null);
      return;
    }
    let cancelled = false;
    getAuction(view.auctionId)
      .then((row) => !cancelled && setDirectAuction(auctionToVM(row)))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [view.name, view.auctionId, realRows, topMonthlyAuctions, myPublications, myBids]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    if (view.name === "myPublications") {
      listMyPublications(auth.session.user.id).then((rows) => !cancelled && setMyPublications(rows.map(auctionToVM)));
    } else if (view.name === "myBids") {
      listMyBidAuctions(auth.session.user.id).then(
        (rows) => !cancelled && setMyBids(rows.map((r) => ({ ...auctionToVM(r), myBid: r.myBid })))
      );
    } else if (view.name === "admin") {
      listAllReports().then((rows) => !cancelled && setAllReports(rows));
      listAllProfilesForAdmin().then((rows) => !cancelled && setAdminProfiles(rows));
      listAllAuctionsForAdmin().then((rows) => !cancelled && setAdminAuctions(rows.map(auctionToVM)));
      listRecommendedSellers().then((rows) => !cancelled && setRecommendedSellers(rows));
      listBlogPosts().then((rows) => !cancelled && setBlogPosts(rows));
      listGiveaways().then((rows) => !cancelled && setGiveaways(rows));
      listWhatsappCommunities().then((rows) => !cancelled && setWhatsappCommunities(rows));
      listSuggestionsForAdmin().then((rows) => !cancelled && setAdminSuggestions(rows));
    } else if (view.name === "recommended") {
      listRecommendedSellers().then((rows) => !cancelled && setRecommendedSellers(rows));
    } else if (view.name === "topMonthly") {
      listTopAuctionsThisMonth().then((rows) => !cancelled && setTopMonthlyAuctions(rows.map(auctionToVM)));
    } else if (view.name === "blog") {
      listBlogPosts().then((rows) => !cancelled && setBlogPosts(rows));
    } else if (view.name === "giveaways") {
      listGiveaways().then((rows) => !cancelled && setGiveaways(rows));
      listMyGiveawayEntryIds().then((ids) => !cancelled && setMyGiveawayEntryIds(ids));
    } else if (view.name === "communities") {
      listWhatsappCommunities().then((rows) => !cancelled && setWhatsappCommunities(rows));
    } else if (view.name === "ranking") {
      getTopSellers().then((rows) => !cancelled && setTopSellers(rows));
      getTopBuyers().then((rows) => !cancelled && setTopBuyers(rows));
    } else if (view.name === "favorites") {
      listMyFavoriteAuctions().then((rows) => !cancelled && setMyFavoriteAuctions(rows.map(auctionToVM)));
    } else if (view.name === "lotDetail") {
      getCardLot(view.lotId).then((row) => !cancelled && setActiveLotData(row));
      listLotItems(view.lotId).then((rows) => !cancelled && setActiveLotItems(rows.map(auctionToVM)));
    }
    return () => {
      cancelled = true;
    };
  }, [view.name, ready]);

  if (showLegal) {
    return <LegalView onBack={() => setShowLegal(false)} />;
  }

  if (isSupabaseConfigured && auth.loading) {
    return <div className="min-h-dvh bg-cream" />;
  }

  if (!enteredLanding && (!isSupabaseConfigured || !auth.session || !auth.profile)) {
    return <Landing onEnter={() => setEnteredLanding(true)} onOpenLegal={() => setShowLegal(true)} />;
  }

  if (isSupabaseConfigured && (!auth.session || !auth.profile)) {
    return <Login onOpenLegal={() => setShowLegal(true)} />;
  }

  const displayAuctions = isSupabaseConfigured ? realRows.map(auctionToVM) : auctions;
  const liveDisplayAuctions = isSupabaseConfigured
    ? displayAuctions.filter((a) => a.status === "live")
    : displayAuctions;

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
    currency,
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
    language,
    isFeatured,
    referencePrice,
    reservePrice,
    buyNowPrice,
    isSaleOnly,
    isFreeClaim,
    freeClaimWinningNumber,
  }) {
    setCreateBusy(true);
    setCreateError("");
    try {
      setCreatePhase(photoFiles?.length ? "Subiendo fotos..." : "Publicando...");
      const photoUrls = photoFiles?.length ? await uploadAuctionPhotos(photoFiles) : [];
      setCreatePhase("Publicando...");
      const row = await createAuction({
        sellerId: auth.session.user.id,
        cardName: name,
        currency,
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
        language,
        isFeatured,
        referencePrice,
        reservePrice,
        buyNowPrice,
        isSaleOnly,
        isFreeClaim,
        freeClaimWinningNumber,
      });
      setRealRows((rows) => [row, ...rows]);
      setView({ name: "list" });
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreateBusy(false);
      setCreatePhase("");
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

  async function handleRealBuyNow(auctionId) {
    setBuyNowBusy(true);
    setBuyNowError("");
    try {
      const row = await buyNowAuction(auctionId);
      setRealRows((rows) => rows.map((r) => (r.id === auctionId ? row : r)));
      listMyTickets().then(setRealTickets);
      return row;
    } catch (e) {
      setBuyNowError(e.message);
      return null;
    } finally {
      setBuyNowBusy(false);
    }
  }

  async function handleRealClaimFree(auctionId) {
    setClaimBusy(true);
    setClaimError("");
    try {
      const result = await claimFreeItem(auctionId);
      setClaimResult(result);
      setRealRows((rows) =>
        rows.map((r) =>
          r.id === auctionId
            ? {
                ...r,
                free_claim_count: r.free_claim_count + 1,
                ...(result?.won ? { status: "closed", winner_id: auth.session.user.id } : {}),
              }
            : r
        )
      );
      if (result?.won) listMyTickets().then(setRealTickets);
      return result;
    } catch (e) {
      setClaimError(e.message);
      return null;
    } finally {
      setClaimBusy(false);
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
    const [p, badges, stats] = await Promise.all([getProfile(targetId), getProfileBadges(targetId), getProfileStats(targetId)]);
    setViewedProfile(p);
    setViewedBadges(badges);
    setViewedStats(stats);
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

  async function handleUpdateGender(gender) {
    const updated = await updateGender(auth.session.user.id, gender);
    setViewedProfile(updated);
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

  async function handleSuspendUser(userId, suspended) {
    setSuspendBusyId(userId);
    try {
      await setUserSuspended(userId, suspended);
      setAdminProfiles((rows) => rows.map((p) => (p.id === userId ? { ...p, is_suspended: suspended } : p)));
    } finally {
      setSuspendBusyId(null);
    }
  }

  async function handleSetPremium(userId, premium) {
    setPremiumBusyId(userId);
    try {
      await setUserPremium(userId, premium);
      setAdminProfiles((rows) => rows.map((p) => (p.id === userId ? { ...p, is_premium: premium } : p)));
    } finally {
      setPremiumBusyId(null);
    }
  }

  async function handleCreateLot({ title, currency, description, photoFiles, durationMinutes, items, fullPrice }) {
    setCreateLotBusy(true);
    setCreateLotError("");
    try {
      const photoUrls = photoFiles?.length ? await uploadAuctionPhotos(photoFiles) : [];
      const lot = await createCardLot({
        sellerId: auth.session.user.id,
        title,
        currency,
        description,
        photoUrls,
        durationMinutes,
        items,
        fullPrice,
      });
      setLiveLots((rows) => [{ ...lot, seller: auth.profile, items: [] }, ...rows]);
      setView({ name: "list" });
    } catch (e) {
      setCreateLotError(e.message);
    } finally {
      setCreateLotBusy(false);
    }
  }

  async function handleClaimLotItem(itemId) {
    setClaimingLotItemId(itemId);
    setClaimLotItemError("");
    try {
      const row = await buyNowAuction(itemId);
      setActiveLotItems((rows) => rows.map((r) => (r.id === itemId ? auctionToVM(row) : r)));
      setLiveLots((lots) =>
        lots.map((lot) => ({
          ...lot,
          items: lot.items?.map((it) => (it.id === itemId ? { ...it, status: "closed" } : it)),
        }))
      );
      listMyTickets().then(setRealTickets);
    } catch (e) {
      setClaimLotItemError(e.message);
    } finally {
      setClaimingLotItemId(null);
    }
  }

  async function handleBuyFullLot(lotId) {
    setBuyFullLotBusy(true);
    setBuyFullLotError("");
    try {
      await buyFullLot(lotId);
      setActiveLotItems((rows) => rows.map((r) => ({ ...r, status: "closed" })));
      setLiveLots((lots) =>
        lots.map((lot) =>
          lot.id === lotId ? { ...lot, items: lot.items?.map((it) => ({ ...it, status: "closed" })) } : lot
        )
      );
      listMyTickets().then(setRealTickets);
    } catch (e) {
      setBuyFullLotError(e.message);
    } finally {
      setBuyFullLotBusy(false);
    }
  }

  async function handleRepublish(auction, { price, durationMinutes }) {
    setRepublishBusy(true);
    setRepublishError("");
    try {
      const row = await createAuction({
        sellerId: auth.session.user.id,
        cardName: auction.card,
        currency: auction.currency,
        basePrice: price,
        durationMinutes,
        photoUrls: auction.photoUrls,
        setName: auction.setName,
        cardNumber: auction.cardNumber,
        year: auction.year,
        condition: auction.condition,
        isGraded: auction.isGraded,
        gradingCompany: auction.gradingCompany,
        grade: auction.grade,
        rarity: auction.rarity,
        isFeatured: false,
        referencePrice: auction.referencePrice,
        reservePrice: null,
        buyNowPrice: auction.isSaleOnly ? price : null,
        isSaleOnly: auction.isSaleOnly,
      });
      setRealRows((rows) => [row, ...rows]);
      setView({ name: "detail", auctionId: row.id, back: { name: "list" } });
    } catch (e) {
      setRepublishError(e.message);
    } finally {
      setRepublishBusy(false);
    }
  }

  async function handleSetReaction(auctionId, reaction) {
    const previous = myReaction;
    setMyReaction(reaction);
    setAuctionReactions((rows) => {
      const withoutMine = rows.filter((r) => r.user_id !== auth.session.user.id);
      return reaction ? [...withoutMine, { user_id: auth.session.user.id, reaction }] : withoutMine;
    });
    try {
      if (reaction) await apiSetMyReaction(auth.session.user.id, auctionId, reaction);
      else await removeMyReaction(auctionId);
    } catch {
      setMyReaction(previous);
    }
  }

  async function handleToggleFavorite(auctionId) {
    const isFav = favoriteIds.has(auctionId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(auctionId);
      else next.add(auctionId);
      return next;
    });
    try {
      if (isFav) await removeFavorite(auctionId);
      else await addFavorite(auth.session.user.id, auctionId);
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(auctionId);
        else next.delete(auctionId);
        return next;
      });
    }
  }

  async function handleCreateSuggestion(message) {
    setSuggestionBusy(true);
    setSuggestionError("");
    try {
      await createSuggestion(auth.session.user.id, message.trim());
      return true;
    } catch (e) {
      setSuggestionError(e.message);
      return false;
    } finally {
      setSuggestionBusy(false);
    }
  }

  async function handleSetSuggestionStatus(id, status) {
    setSuggestionStatusBusyId(id);
    try {
      await setSuggestionStatus(id, status);
      setAdminSuggestions((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
    } finally {
      setSuggestionStatusBusyId(null);
    }
  }

  async function handleCreateRecommendedSeller(fields) {
    setCreateRecommendedBusy(true);
    setCreateRecommendedError("");
    try {
      const row = await createRecommendedSeller(fields);
      setRecommendedSellers((rows) => [row, ...rows]);
      return true;
    } catch (e) {
      setCreateRecommendedError(e.message);
      return false;
    } finally {
      setCreateRecommendedBusy(false);
    }
  }

  async function handleToggleRecommendedActive(id, isActive) {
    setRecommendedBusyId(id);
    try {
      await setRecommendedSellerActive(id, isActive);
      setRecommendedSellers((rows) => rows.map((s) => (s.id === id ? { ...s, is_active: isActive } : s)));
    } finally {
      setRecommendedBusyId(null);
    }
  }

  async function handleDeleteRecommendedSeller(id) {
    setRecommendedBusyId(id);
    try {
      await deleteRecommendedSeller(id);
      setRecommendedSellers((rows) => rows.filter((s) => s.id !== id));
    } finally {
      setRecommendedBusyId(null);
    }
  }

  async function handleCreatePickupPoint(fields) {
    setCreatePickupPointBusy(true);
    setCreatePickupPointError("");
    try {
      const row = await createPickupPoint(fields);
      setPickupPoints((rows) => [...rows, row]);
      return true;
    } catch (e) {
      setCreatePickupPointError(e.message);
      return false;
    } finally {
      setCreatePickupPointBusy(false);
    }
  }

  async function handleTogglePickupPointActive(id, isActive) {
    setPickupPointBusyId(id);
    try {
      await setPickupPointActive(id, isActive);
      setPickupPoints((rows) => rows.map((p) => (p.id === id ? { ...p, is_active: isActive } : p)));
    } finally {
      setPickupPointBusyId(null);
    }
  }

  async function handleDeletePickupPoint(id) {
    setPickupPointBusyId(id);
    try {
      await deletePickupPoint(id);
      setPickupPoints((rows) => rows.filter((p) => p.id !== id));
    } finally {
      setPickupPointBusyId(null);
    }
  }

  async function handleCreateBlogPost({ title, body, photoUrl }) {
    setCreateBlogBusy(true);
    setCreateBlogError("");
    try {
      const row = await createBlogPost({ title, body, photoUrl, authorId: auth.session.user.id });
      setBlogPosts((rows) => [row, ...rows]);
      return true;
    } catch (e) {
      setCreateBlogError(e.message);
      return false;
    } finally {
      setCreateBlogBusy(false);
    }
  }

  async function handleToggleBlogPublished(id, isPublished) {
    setBlogBusyId(id);
    try {
      await setBlogPostPublished(id, isPublished);
      setBlogPosts((rows) => rows.map((p) => (p.id === id ? { ...p, is_published: isPublished } : p)));
    } finally {
      setBlogBusyId(null);
    }
  }

  async function handleDeleteBlogPost(id) {
    setBlogBusyId(id);
    try {
      await deleteBlogPost(id);
      setBlogPosts((rows) => rows.filter((p) => p.id !== id));
    } finally {
      setBlogBusyId(null);
    }
  }

  async function handleCreateGiveaway({ title, description, prizeDescription, durationDays }) {
    setCreateGiveawayBusy(true);
    setCreateGiveawayError("");
    try {
      const closesAt = new Date(Date.now() + durationDays * 24 * 60 * 60_000).toISOString();
      const row = await createGiveaway({
        title,
        description,
        prizeDescription,
        closesAt,
        createdBy: auth.session.user.id,
      });
      setGiveaways((rows) => [row, ...rows]);
      return true;
    } catch (e) {
      setCreateGiveawayError(e.message);
      return false;
    } finally {
      setCreateGiveawayBusy(false);
    }
  }

  async function handleLoadGiveawayEntrants(giveawayId) {
    return listGiveawayEntrantsForAdmin(giveawayId);
  }

  async function handleCloseGiveaway(giveawayId, winnerId) {
    setCloseGiveawayBusyId(giveawayId);
    try {
      await closeGiveaway(giveawayId, winnerId);
      const rows = await listGiveaways();
      setGiveaways(rows);
    } finally {
      setCloseGiveawayBusyId(null);
    }
  }

  async function handleDeleteGiveaway(id) {
    setDeleteGiveawayBusyId(id);
    try {
      await deleteGiveaway(id);
      setGiveaways((rows) => rows.filter((g) => g.id !== id));
    } finally {
      setDeleteGiveawayBusyId(null);
    }
  }

  async function handleEnterGiveaway(giveawayId) {
    setEnterGiveawayBusyId(giveawayId);
    try {
      await enterGiveaway(giveawayId, auth.session.user.id);
      setMyGiveawayEntryIds((ids) => new Set(ids).add(giveawayId));
    } finally {
      setEnterGiveawayBusyId(null);
    }
  }

  async function handleCreateWhatsappCommunity(fields) {
    setCreateWhatsappCommunityBusy(true);
    setCreateWhatsappCommunityError("");
    try {
      const row = await createWhatsappCommunity(fields);
      setWhatsappCommunities((rows) => [row, ...rows]);
      return true;
    } catch (e) {
      setCreateWhatsappCommunityError(e.message);
      return false;
    } finally {
      setCreateWhatsappCommunityBusy(false);
    }
  }

  async function handleToggleWhatsappCommunityActive(id, isActive) {
    setWhatsappCommunityBusyId(id);
    try {
      await setWhatsappCommunityActive(id, isActive);
      setWhatsappCommunities((rows) => rows.map((c) => (c.id === id ? { ...c, is_active: isActive } : c)));
    } finally {
      setWhatsappCommunityBusyId(null);
    }
  }

  async function handleDeleteWhatsappCommunity(id) {
    setWhatsappCommunityBusyId(id);
    try {
      await deleteWhatsappCommunity(id);
      setWhatsappCommunities((rows) => rows.filter((c) => c.id !== id));
    } finally {
      setWhatsappCommunityBusyId(null);
    }
  }

  async function handleEditAuction(auctionId, fields) {
    setEditBusy(true);
    setEditError("");
    try {
      const row = await updateOwnAuction(auctionId, {
        cardName: fields.name,
        basePrice: fields.price,
        setName: fields.setName,
        cardNumber: fields.cardNumber,
        year: fields.year,
        condition: fields.condition,
        isGraded: fields.isGraded,
        gradingCompany: fields.gradingCompany,
        grade: fields.grade,
        rarity: fields.rarity,
        isFeatured: fields.isFeatured,
        referencePrice: fields.referencePrice,
        reservePrice: fields.reservePrice,
        buyNowPrice: fields.buyNowPrice,
      });
      setRealRows((rows) => rows.map((r) => (r.id === auctionId ? row : r)));
      setView({ name: "detail", auctionId, back: { name: "list" } });
    } catch (e) {
      setEditError(e.message);
    } finally {
      setEditBusy(false);
    }
  }

  async function handleCancelAuction(auctionId) {
    setCancelAuctionBusy(true);
    try {
      await cancelOwnAuction(auctionId);
      setRealRows((rows) => rows.filter((r) => r.id !== auctionId));
      setView({ name: "list" });
    } catch (e) {
      setEditError(e.message);
    } finally {
      setCancelAuctionBusy(false);
    }
  }

  async function handleOpenNotification(n) {
    if (!n.read_at) {
      setNotifications((rows) => rows.map((r) => (r.id === n.id ? { ...r, read_at: new Date().toISOString() } : r)));
      markNotificationRead(n.id).catch(() => {});
    }
    if (n.kind === "city_reminder") {
      const p = await getProfile(auth.session.user.id);
      setViewedProfile(p);
      setView({ name: "editPickup", back: { name: "notifications" } });
    } else if (n.auction_id) {
      setView({ name: "detail", auctionId: n.auction_id, back: { name: "notifications" } });
    }
  }

  async function handleMarkAllNotificationsRead() {
    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifications((rows) => rows.map((r) => (unreadIds.includes(r.id) ? { ...r, read_at: new Date().toISOString() } : r)));
    markAllNotificationsRead(unreadIds).catch(() => {});
  }

  const activeAuction =
    view.name === "detail"
      ? displayAuctions.find((a) => a.id === view.auctionId) ||
        topMonthlyAuctions.find((a) => a.id === view.auctionId) ||
        myPublications.find((a) => a.id === view.auctionId) ||
        myBids.find((a) => a.id === view.auctionId) ||
        directAuction
      : null;
  const activeEditAuction =
    view.name === "editAuction" ? displayAuctions.find((a) => a.id === view.auctionId) : null;
  const displayTickets = isSupabaseConfigured
    ? realTickets.map((t) => ticketToVM(t, auth.session?.user.id))
    : tickets;

  return (
    <div className="min-h-dvh bg-cream font-sans text-ink" style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}>
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
          auctions={liveDisplayAuctions}
          onOpen={(a) => setView({ name: "detail", auctionId: a.id, back: view })}
          onCreate={() => setView({ name: "create" })}
          profile={isSupabaseConfigured ? auth.profile : null}
          onSignOut={auth.signOut}
          onOpenProfile={() => openProfile()}
          onOpenSellerProfile={isSupabaseConfigured ? openProfile : undefined}
          onOpenMyBids={() => setView({ name: "myBids" })}
          onOpenMyPublications={() => setView({ name: "myPublications" })}
          onOpenMyTickets={() => setView({ name: "myTickets" })}
          onOpenFavorites={() => setView({ name: "favorites", back: view })}
          onOpenRecommended={() => setView({ name: "recommended", back: view })}
          onOpenTopMonthly={() => setView({ name: "topMonthly", back: view })}
          onOpenBlog={() => setView({ name: "blog", back: view })}
          onOpenGiveaways={() => setView({ name: "giveaways", back: view })}
          onOpenCommunities={() => setView({ name: "communities", back: view })}
          onOpenRanking={() => setView({ name: "ranking", back: view })}
          onOpenSuggestions={() => setView({ name: "suggestions", back: view })}
          onOpenFaq={() => setView({ name: "faq", back: view })}
          onOpenAdmin={() => setView({ name: "admin" })}
          onOpenNotifications={() => setView({ name: "notifications", back: view })}
          unreadNotifCount={notifications.filter((n) => !n.read_at).length}
          searchTerm={searchTerm}
          onSearchChange={isSupabaseConfigured ? setSearchTerm : undefined}
          pendingCount={displayTickets.filter((t) => t.status === "pendiente").length}
          recommendedSellers={recommendedSellers}
          whatsappCommunities={whatsappCommunities}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          onOpenCreateLot={() => setView({ name: "createLot" })}
          liveLots={liveLots}
          onOpenLot={(lot) => setView({ name: "lotDetail", lotId: lot.id, back: view })}
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
          onBuyNow={isSupabaseConfigured ? handleRealBuyNow : undefined}
          buyNowBusy={buyNowBusy}
          buyNowError={buyNowError}
          onClaimFree={isSupabaseConfigured ? handleRealClaimFree : undefined}
          claimBusy={claimBusy}
          claimError={claimError}
          claimResult={claimResult}
          onGoToMyTickets={() => setView({ name: "myTickets" })}
          isMine={isSupabaseConfigured && activeAuction.sellerId === auth.session?.user.id}
          bidHistory={bidHistory}
          onOpenUserProfile={isSupabaseConfigured ? openProfile : undefined}
          onEdit={
            isSupabaseConfigured ? () => setView({ name: "editAuction", auctionId: activeAuction.id, back: view }) : undefined
          }
          onReport={isSupabaseConfigured ? handleReport : undefined}
          reportBusy={reportBusy}
          reportError={reportError}
          recommendedSellers={recommendedSellers}
          onOpenRecommended={() => setView({ name: "recommended", back: view })}
          isFavorite={favoriteIds.has(activeAuction.id)}
          onToggleFavorite={isSupabaseConfigured ? handleToggleFavorite : undefined}
          reactions={auctionReactions}
          myReaction={myReaction}
          onSetReaction={isSupabaseConfigured ? (r) => handleSetReaction(activeAuction.id, r) : undefined}
          viewerCount={viewerCount}
          onRepublish={isSupabaseConfigured ? handleRepublish : undefined}
          republishBusy={republishBusy}
          republishError={republishError}
          allAuctions={displayAuctions}
          onOpenAuction={(a) => setView({ name: "detail", auctionId: a.id, back: view })}
        />
      )}

      {view.name === "editAuction" && activeEditAuction && (
        <EditAuction
          auction={activeEditAuction}
          busy={editBusy}
          cancelBusy={cancelAuctionBusy}
          error={editError}
          onBack={() => setView(view.back ?? { name: "list" })}
          onSave={(fields) => handleEditAuction(activeEditAuction.id, fields)}
          onCancelAuction={() => handleCancelAuction(activeEditAuction.id)}
        />
      )}

      {view.name === "ticket" && (
        <TicketView
          ticket={view.ticket}
          busy={redeemBusy}
          onBack={() => setView(view.back ?? { name: "list" })}
          onMarkDelivered={async () => {
            if (isSupabaseConfigured) {
              await handleRedeem(view.ticket.id);
              setView({ name: "ticket", ticket: { ...view.ticket, status: "entregado" }, back: view.back });
            } else {
              setTickets((ts) => ts.map((t) => (t.id === view.ticket.id ? { ...t, status: "entregado" } : t)));
              setView({ name: "ticket", ticket: { ...view.ticket, status: "entregado" }, back: view.back });
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
          stats={viewedStats}
          isOwn={view.userId === auth.session?.user.id}
          onBack={() => setView(view.back ?? { name: "list" })}
          onEditPickup={() => setView({ name: "editPickup", back: view })}
          onOpenLegal={() => setShowLegal(true)}
          onUpdateGender={isSupabaseConfigured ? handleUpdateGender : undefined}
        />
      )}

      {view.name === "editPickup" && (
        <EditPickupInfo
          profile={viewedProfile}
          busy={pickupBusy}
          error={pickupError}
          pickupPoints={pickupPoints}
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
          onOpenSellerProfile={isSupabaseConfigured ? openProfile : undefined}
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

      {view.name === "favorites" && (
        <MyAuctionsView
          title="MIS FAVORITOS"
          emptyText="Todavía no guardaste ninguna publicación."
          auctions={myFavoriteAuctions}
          onBack={() => setView(view.back ?? { name: "list" })}
          onOpen={(a) => setView({ name: "detail", auctionId: a.id, back: view })}
          onOpenSellerProfile={isSupabaseConfigured ? openProfile : undefined}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {view.name === "myTickets" && (
        <MyTicketsView
          tickets={displayTickets}
          onBack={() => setView({ name: "list" })}
          onOpenTicket={(t) => setView({ name: "ticket", ticket: t, back: view })}
        />
      )}

      {view.name === "admin" && (
        <AdminPanel
          profiles={adminProfiles}
          auctions={adminAuctions}
          reports={allReports}
          recommendedSellers={recommendedSellers}
          blogPosts={blogPosts}
          resolveBusyId={resolveReportBusyId}
          suspendBusyId={suspendBusyId}
          premiumBusyId={premiumBusyId}
          onBack={() => setView({ name: "list" })}
          onResolveReport={handleResolveReport}
          onSuspend={handleSuspendUser}
          onSetPremium={handleSetPremium}
          onCreateRecommendedSeller={handleCreateRecommendedSeller}
          createRecommendedBusy={createRecommendedBusy}
          createRecommendedError={createRecommendedError}
          onToggleRecommendedActive={handleToggleRecommendedActive}
          onDeleteRecommendedSeller={handleDeleteRecommendedSeller}
          recommendedBusyId={recommendedBusyId}
          onCreateBlogPost={handleCreateBlogPost}
          createBlogBusy={createBlogBusy}
          createBlogError={createBlogError}
          onToggleBlogPublished={handleToggleBlogPublished}
          onDeleteBlogPost={handleDeleteBlogPost}
          blogBusyId={blogBusyId}
          giveaways={giveaways}
          onCreateGiveaway={handleCreateGiveaway}
          createGiveawayBusy={createGiveawayBusy}
          createGiveawayError={createGiveawayError}
          onLoadGiveawayEntrants={handleLoadGiveawayEntrants}
          onCloseGiveaway={handleCloseGiveaway}
          closeGiveawayBusyId={closeGiveawayBusyId}
          onDeleteGiveaway={handleDeleteGiveaway}
          deleteGiveawayBusyId={deleteGiveawayBusyId}
          whatsappCommunities={whatsappCommunities}
          onCreateWhatsappCommunity={handleCreateWhatsappCommunity}
          createWhatsappCommunityBusy={createWhatsappCommunityBusy}
          createWhatsappCommunityError={createWhatsappCommunityError}
          onToggleWhatsappCommunityActive={handleToggleWhatsappCommunityActive}
          onDeleteWhatsappCommunity={handleDeleteWhatsappCommunity}
          whatsappCommunityBusyId={whatsappCommunityBusyId}
          suggestions={adminSuggestions}
          onSetSuggestionStatus={handleSetSuggestionStatus}
          suggestionStatusBusyId={suggestionStatusBusyId}
          pickupPoints={pickupPoints}
          onCreatePickupPoint={handleCreatePickupPoint}
          createPickupPointBusy={createPickupPointBusy}
          createPickupPointError={createPickupPointError}
          onTogglePickupPointActive={handleTogglePickupPointActive}
          onDeletePickupPoint={handleDeletePickupPoint}
          pickupPointBusyId={pickupPointBusyId}
        />
      )}

      {view.name === "recommended" && (
        <RecommendedSellersView sellers={recommendedSellers} onBack={() => setView(view.back ?? { name: "list" })} />
      )}

      {view.name === "topMonthly" && (
        <TopMonthlyAuctionsView
          auctions={topMonthlyAuctions}
          onBack={() => setView(view.back ?? { name: "list" })}
          onOpen={(a) => setView({ name: "detail", auctionId: a.id, back: view })}
          onOpenSellerProfile={isSupabaseConfigured ? openProfile : undefined}
          recommendedSellers={recommendedSellers}
          onOpenRecommended={() => setView({ name: "recommended", back: view })}
        />
      )}

      {view.name === "giveaways" && (
        <GiveawaysView
          giveaways={giveaways}
          myEntryIds={myGiveawayEntryIds}
          onBack={() => setView(view.back ?? { name: "list" })}
          onEnter={handleEnterGiveaway}
          enterBusyId={enterGiveawayBusyId}
        />
      )}

      {view.name === "blog" && (
        <BlogView posts={blogPosts} onBack={() => setView(view.back ?? { name: "list" })} />
      )}

      {view.name === "communities" && (
        <WhatsappCommunitiesView communities={whatsappCommunities} onBack={() => setView(view.back ?? { name: "list" })} />
      )}

      {view.name === "ranking" && (
        <RankingView
          topSellers={topSellers}
          topBuyers={topBuyers}
          onBack={() => setView(view.back ?? { name: "list" })}
          onOpenUserProfile={isSupabaseConfigured ? openProfile : undefined}
        />
      )}

      {view.name === "suggestions" && (
        <SuggestionsView
          onBack={() => setView(view.back ?? { name: "list" })}
          onSubmit={handleCreateSuggestion}
          busy={suggestionBusy}
          error={suggestionError}
        />
      )}

      {view.name === "faq" && (
        <FaqView onBack={() => setView(view.back ?? { name: "list" })} />
      )}

      {view.name === "notifications" && (
        <NotificationsView
          notifications={notifications}
          onBack={() => setView(view.back ?? { name: "list" })}
          onOpenNotification={handleOpenNotification}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />
      )}

      {view.name === "create" && (
        <CreateAuction
          onBack={() => setView({ name: "list" })}
          onCreate={isSupabaseConfigured ? handleRealCreate : handleCreate}
          showDuration={isSupabaseConfigured}
          busy={createBusy}
          busyText={createPhase}
          error={createError}
        />
      )}

      {view.name === "createLot" && (
        <CreateLotView
          onBack={() => setView({ name: "list" })}
          onCreate={handleCreateLot}
          busy={createLotBusy}
          error={createLotError}
        />
      )}

      {view.name === "lotDetail" && activeLotData && (
        <LotDetailView
          lot={activeLotData}
          items={activeLotItems}
          onBack={() => setView(view.back ?? { name: "list" })}
          onOpenUserProfile={isSupabaseConfigured ? openProfile : undefined}
          onClaimItem={handleClaimLotItem}
          claimingItemId={claimingLotItemId}
          claimError={claimLotItemError}
          onBuyFullLot={handleBuyFullLot}
          buyFullLotBusy={buyFullLotBusy}
          buyFullLotError={buyFullLotError}
        />
      )}
    </div>
  );
}
