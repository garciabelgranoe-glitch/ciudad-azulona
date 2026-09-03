import { useState, useMemo } from "react";
import { Bell, LogOut, Search, SlidersHorizontal, Package, Plus } from "lucide-react";
import { RARITY_OPTIONS, CONDITION_OPTIONS, CONDITION_SHORT, LANGUAGE_OPTIONS } from "../lib/auctions";
import PokeballIcon from "../components/PokeballIcon";
import AccountMenu from "../components/ui/AccountMenu";
import WhatsappCommunityBanner from "../components/ui/WhatsappCommunityBanner";
import GuaranteedSellersBanner from "../components/ui/GuaranteedSellersBanner";
import LotsRow from "../components/ui/LotsRow";
import AuctionCard from "../components/ui/AuctionCard";

const MODE_TABS = [
  { value: "todas", label: "Todas" },
  { value: "subasta", label: "Subastas" },
  { value: "venta", label: "Venta directa" },
  { value: "free", label: "Free claims" },
];

// Vista: Lista de subastas
export default function AuctionList({
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
  onOpenPro,
  recommendedSellers,
  whatsappCommunities,
  favoriteIds,
  onToggleFavorite,
  onOpenCreateLot,
  liveLots,
  onOpenLot,
}) {
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [modeFilter, setModeFilter] = useState("todas");
  const [showFilters, setShowFilters] = useState(false);
  const [filterSet, setFilterSet] = useState("");
  const [filterRarity, setFilterRarity] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("recientes");

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
  const modeCounts = {
    todas: filtered.length,
    subasta: filtered.filter((a) => !a.isSaleOnly && !a.isFreeClaim).length,
    venta: filtered.filter((a) => a.isSaleOnly).length,
    free: filtered.filter((a) => a.isFreeClaim).length,
  };
  if (modeFilter === "subasta") filtered = filtered.filter((a) => !a.isSaleOnly && !a.isFreeClaim);
  if (modeFilter === "venta") filtered = filtered.filter((a) => a.isSaleOnly);
  if (modeFilter === "free") filtered = filtered.filter((a) => a.isFreeClaim);
  if (filterSet) filtered = filtered.filter((a) => a.setName === filterSet);
  if (filterRarity) filtered = filtered.filter((a) => a.rarity === filterRarity);
  if (filterCondition) filtered = filtered.filter((a) => a.condition === filterCondition);
  if (filterCity) filtered = filtered.filter((a) => a.sellerCity === filterCity);
  if (filterLanguage) filtered = filtered.filter((a) => a.language === filterLanguage);
  if (minPrice) filtered = filtered.filter((a) => a.currentBid >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter((a) => a.currentBid <= Number(maxPrice));

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "precio_asc") return a.currentBid - b.currentBid;
    if (sortBy === "precio_desc") return b.currentBid - a.currentBid;
    return new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);
  });

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
        <div className="mx-auto max-w-3xl">
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
                  onOpenPro={onOpenPro}
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
              <span className="inline-flex items-center gap-1.5 px-1 text-[11px] font-bold text-cream/60">
                <span className="h-1.5 w-1.5 rounded-full bg-forest-light" /> {auctions.length} activas
              </span>
              <button
                onClick={() => setFeaturedOnly((f) => !f)}
                aria-pressed={featuredOnly}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                  featuredOnly
                    ? "border-plum bg-plum/30 text-cream shadow-[0_0_0_1px_rgba(139,94,158,0.5)]"
                    : "border-forest-light/40 bg-white/10 text-cream/80 hover:border-forest-light/70"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-plum" /> Destacadas
              </button>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
            {MODE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setModeFilter(tab.value)}
                className={`rounded-lg border px-2.5 py-1.5 text-center text-[12px] font-bold leading-tight transition sm:px-3 ${
                  modeFilter === tab.value
                    ? "border-gold bg-gold/20 text-gold"
                    : "border-white/20 bg-white/10 text-cream/80 hover:border-white/40"
                }`}
              >
                {tab.label} <span className={modeFilter === tab.value ? "text-gold/70" : "text-cream/50"}>({modeCounts[tab.value]})</span>
              </button>
            ))}
          </div>

          {onSearchChange && (
            <div className="mt-2.5 flex items-center gap-2 sm:max-w-lg">
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
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-white/20 bg-forest-deep px-2 py-1.5 text-[12px] font-medium text-cream"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
              </select>
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
          aria-label="Publicar lote"
          className="fixed bottom-[5.75rem] right-4 z-10 flex h-11 w-11 items-center justify-center gap-2 rounded-full bg-plum text-cream shadow-[0_4px_0_rgba(76,29,87,1)] transition hover:brightness-110 active:translate-y-[3px] active:shadow-[0_1px_0_rgba(76,29,87,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-deep sm:h-auto sm:w-auto sm:px-5 sm:py-3.5 sm:text-[13px] sm:font-extrabold"
        >
          <Package size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline">Publicar lote</span>
        </button>
      )}

      <button
        onClick={onCreate}
        aria-label="Publicar carta"
        className="fixed bottom-5 right-4 z-10 flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-gold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-deep sm:h-auto sm:w-auto sm:px-5 sm:py-3.5 sm:text-[13px] sm:font-extrabold"
      >
        <Plus size={20} strokeWidth={2.5} />
        <span className="hidden sm:inline">Publicar carta</span>
      </button>
    </div>
  );
}
