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
import Pill from "./components/ui/Pill";
import SellerBadge from "./components/ui/SellerBadge";
import CardArt from "./components/ui/CardArt";
import AccountMenu from "./components/ui/AccountMenu";
import GuaranteedSellersBanner from "./components/ui/GuaranteedSellersBanner";
import WhatsappCommunityBanner from "./components/ui/WhatsappCommunityBanner";
import AuctionCard from "./components/ui/AuctionCard";
import MiniBarChart from "./components/ui/MiniBarChart";
import LotsRow from "./components/ui/LotsRow";
import SimilarAuctionsRow from "./components/ui/SimilarAuctionsRow";
import PokemonSetDatalist from "./components/ui/PokemonSetDatalist";
import ToastStack from "./components/ui/ToastStack";
import AuctionList from "./views/AuctionList";
import AuctionDetail from "./views/AuctionDetail";
import CreateAuction from "./views/CreateAuction";
import MyAuctionsView from "./views/MyAuctionsView";
import NotificationsView from "./views/NotificationsView";
import BlogView from "./views/BlogView";
import ProUpsellView from "./views/ProUpsellView";
import GiveawaysView from "./views/GiveawaysView";
import WhatsappCommunitiesView from "./views/WhatsappCommunitiesView";
import RankingView from "./views/RankingView";
import SuggestionsView from "./views/SuggestionsView";
import LotDetailView from "./views/LotDetailView";
import RecommendedSellersView from "./views/RecommendedSellersView";
import TopMonthlyAuctionsView from "./views/TopMonthlyAuctionsView";
import MyTicketsView from "./views/MyTicketsView";
import TicketView from "./views/TicketView";
import LegalView from "./views/LegalView";
import FaqView from "./views/FaqView";
import ProfileView from "./views/ProfileView";
import EditPickupInfo from "./views/EditPickupInfo";
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
  getAdminDailyMetrics,
  REFERENCE_PRICE_SOURCE_OPTIONS,
  REFERENCE_PRICE_SOURCE_LABEL,
  DURATION_OPTIONS,
  GIVEAWAY_DURATION_OPTIONS,
} from "./lib/auctions";
import { POKEMON_SET_ERAS } from "./lib/pokemonSets";
import { formatARS, formatPrice, formatCountdown } from "./lib/format";
import { giveawayRequirementText, handleShareGiveaway } from "./lib/giveaways";

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

// ---------------------------------------------
// Vista: Lista de subastas
// ---------------------------------------------
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
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-[13px] font-extrabold text-ink">{a.card}</p>
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
  const [minPublications, setMinPublications] = useState("");
  const [minSales, setMinSales] = useState("");
  const [communityUrl, setCommunityUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [shareCopiedId, setShareCopiedId] = useState(null);
  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[11px] font-bold text-ink-soft";

  async function handleShareClick(g) {
    const copied = await handleShareGiveaway(g);
    if (copied) {
      setShareCopiedId(g.id);
      setTimeout(() => setShareCopiedId((id) => (id === g.id ? null : id)), 5000);
    }
  }

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
    const ok = await onCreate({
      title,
      description,
      prizeDescription,
      durationDays,
      minPublications: minPublications ? Number(minPublications) : null,
      minSales: minSales ? Number(minSales) : null,
      communityUrl,
      photoUrl,
    });
    if (ok) {
      setTitle("");
      setDescription("");
      setPrizeDescription("");
      setMinPublications("");
      setMinSales("");
      setCommunityUrl("");
      setPhotoFile(null);
      setPhotoPreview(null);
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Mínimo de cartas publicadas (opcional)</label>
              <input
                type="number"
                min={0}
                value={minPublications}
                onChange={(e) => setMinPublications(e.target.value)}
                placeholder="Sin requisito"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Mínimo de ventas concretadas (opcional)</label>
              <input
                type="number"
                min={0}
                value={minSales}
                onChange={(e) => setMinSales(e.target.value)}
                placeholder="Sin requisito"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Foto del premio (opcional)</label>
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
          <div>
            <label className={labelClass}>Link del grupo de la comunidad (opcional)</label>
            <input
              value={communityUrl}
              onChange={(e) => setCommunityUrl(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-ink-soft">
              Si lo cargás, se muestra en el sorteo aclarando que hay que estar en el grupo para participar.
            </p>
          </div>
          {(createError || photoError) && <p className="text-[11px] text-[#B9432C]">{createError || photoError}</p>}
          <button
            onClick={handleCreate}
            disabled={!title || createBusy || uploadingPhoto}
            className="w-full rounded-lg bg-gold py-2 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
          >
            {uploadingPhoto ? "Subiendo foto..." : createBusy ? "Creando..." : "Crear sorteo"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {giveaways.map((g) => (
          <div key={g.id} className="rounded-lg border-2 border-line bg-paper p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 gap-2.5">
                {g.photo_url && (
                  <img src={g.photo_url} alt="" className="h-14 w-14 shrink-0 rounded-lg border-2 border-line object-cover" />
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-ink">
                    {g.title}
                    <Pill tone={g.status === "open" ? "live" : "default"}>{g.status === "open" ? "Abierto" : "Cerrado"}</Pill>
                  </p>
                  {g.prize_description && <p className="text-[11px] text-ink-soft">Premio: {g.prize_description}</p>}
                  {giveawayRequirementText(g) && (
                    <p className="text-[11px] text-plum">{giveawayRequirementText(g)}</p>
                  )}
                  {g.community_url && (
                    <p className="truncate text-[11px] text-teal">Grupo: {g.community_url}</p>
                  )}
                  <p className="text-[10px] text-ink-soft">
                    Cierra: {new Date(g.closes_at).toLocaleDateString("es-AR")}
                  </p>
                  {g.status === "closed" && (
                    <p className="mt-1 text-[11px] font-bold text-gold-dark">Ganador: {g.winner?.alias ?? "—"}</p>
                  )}
                  {shareCopiedId === g.id && (
                    <p className="mt-1 text-[11px] font-bold text-forest-deep">
                      Texto copiado — pegalo como descripción si WhatsApp solo mandó la foto.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => handleShareClick(g)}
                  className="rounded-lg border-2 border-line p-1.5 text-ink-soft hover:border-forest-mid"
                  title="Compartir"
                >
                  <Share2 size={14} />
                </button>
              <button
                onClick={() => onDelete(g.id)}
                disabled={deleteBusyId === g.id}
                className="shrink-0 rounded-lg border-2 border-[#B9432C]/40 px-2.5 py-1 text-[11px] font-bold text-[#B9432C] disabled:opacity-40"
              >
                Borrar
              </button>
              </div>
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


function MetricsTabContent() {
  const [days, setDays] = useState(30);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gmvCurrency, setGmvCurrency] = useState("ARS");

  useEffect(() => {
    setLoading(true);
    setError("");
    getAdminDailyMetrics(days)
      .then(setMetrics)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  const totals = useMemo(
    () =>
      metrics.reduce(
        (acc, m) => ({
          newUsers: acc.newUsers + m.newUsers,
          newListings: acc.newListings + m.newListings,
          salesCount: acc.salesCount + m.salesCount,
          gmvArs: acc.gmvArs + m.gmvArs,
          gmvUsd: acc.gmvUsd + m.gmvUsd,
        }),
        { newUsers: 0, newListings: 0, salesCount: 0, gmvArs: 0, gmvUsd: 0 }
      ),
    [metrics]
  );

  const pillClass = (active) =>
    `rounded-lg border-2 px-3 py-1.5 text-[12px] font-bold transition ${
      active ? "border-gold bg-gold/15 text-gold-dark" : "border-line bg-paper text-ink-soft hover:border-forest-mid"
    }`;

  function Block({ title, children }) {
    return (
      <div className="rounded-lg border-2 border-line bg-paper p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">{title}</p>
        <div className="mt-2">{children}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {[7, 30, 90].map((d) => (
          <button key={d} onClick={() => setDays(d)} className={pillClass(days === d)}>
            {d} días
          </button>
        ))}
      </div>

      {error && <p className="text-[12px] text-[#B9432C]">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-[13px] text-ink-soft">
          <Loader2 size={16} className="animate-spin" /> Cargando métricas...
        </div>
      ) : (
        <div className="space-y-3">
          <Block title={`Usuarios nuevos (${totals.newUsers})`}>
            <MiniBarChart series={metrics} valueKey="newUsers" color="#3E7A52" />
          </Block>
          <Block title={`Publicaciones nuevas (${totals.newListings})`}>
            <MiniBarChart series={metrics} valueKey="newListings" color="#B9862F" />
          </Block>
          <Block title={`Ventas concretadas (${totals.salesCount})`}>
            <MiniBarChart series={metrics} valueKey="salesCount" color="#5B4C87" />
          </Block>
          <Block
            title={`Volumen vendido (GMV) — ${formatPrice(
              gmvCurrency === "ARS" ? totals.gmvArs : totals.gmvUsd,
              gmvCurrency
            )}`}
          >
            <div className="mb-2 flex gap-1.5">
              <button onClick={() => setGmvCurrency("ARS")} className={pillClass(gmvCurrency === "ARS")}>$</button>
              <button onClick={() => setGmvCurrency("USD")} className={pillClass(gmvCurrency === "USD")}>U$S</button>
            </div>
            <MiniBarChart
              series={metrics}
              valueKey={gmvCurrency === "ARS" ? "gmvArs" : "gmvUsd"}
              color="#B9432C"
            />
          </Block>
        </div>
      )}
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
    { value: "metricas", label: "Métricas" },
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
        {tab === "metricas" && <MetricsTabContent />}
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
  const [referencePriceCurrency, setReferencePriceCurrency] = useState(auction.referencePriceCurrency ?? "USD");
  const [referencePriceSource, setReferencePriceSource] = useState(auction.referencePriceSource ?? "");
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
          {referencePrice !== "" && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setReferencePriceCurrency("ARS")}
                  className={`rounded-lg border-2 py-1.5 text-[11px] font-bold transition ${
                    referencePriceCurrency === "ARS"
                      ? "border-gold bg-gold/15 text-gold-dark"
                      : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                  }`}
                >
                  $
                </button>
                <button
                  type="button"
                  onClick={() => setReferencePriceCurrency("USD")}
                  className={`rounded-lg border-2 py-1.5 text-[11px] font-bold transition ${
                    referencePriceCurrency === "USD"
                      ? "border-gold bg-gold/15 text-gold-dark"
                      : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                  }`}
                >
                  U$S
                </button>
              </div>
              <select
                value={referencePriceSource}
                onChange={(e) => setReferencePriceSource(e.target.value)}
                className="rounded-lg border-2 border-line bg-white px-2 text-[12px] font-medium text-ink focus:outline-none focus-visible:border-forest-mid"
              >
                <option value="">¿De dónde lo sacaste?</option>
                {REFERENCE_PRICE_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
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
              referencePriceCurrency,
              referencePriceSource,
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
// App raíz
// ---------------------------------------------
// Si se entra directo por un link compartido (/subasta/:id), arrancamos
// ahí en vez de en la lista — y saltando la landing, ver parseInitialView.
function parseInitialView() {
  const auctionMatch = window.location.pathname.match(/^\/subasta\/([^/]+)\/?$/);
  if (auctionMatch) return { name: "detail", auctionId: auctionMatch[1], back: { name: "list" } };
  const giveawayMatch = window.location.pathname.match(/^\/sorteo\/([^/]+)\/?$/);
  if (giveawayMatch) return { name: "giveaways", highlightId: giveawayMatch[1], back: { name: "list" } };
  return { name: "list" };
}

function urlForView(view) {
  if (view.name === "detail" && view.auctionId) return `/subasta/${view.auctionId}`;
  if (view.name === "giveaways" && view.highlightId) return `/sorteo/${view.highlightId}`;
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

  // Sin esto, el scroll del navegador queda donde estaba en la pantalla
  // anterior — entrar a una subasta desde el medio/fondo de la lista te
  // dejaba caído en esa misma posición en vez de arrancar arriba.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

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
  const [enterGiveawayError, setEnterGiveawayError] = useState("");
  const [enterGiveawayErrorId, setEnterGiveawayErrorId] = useState(null);
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
    referencePriceCurrency,
    referencePriceSource,
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
        referencePriceCurrency,
        referencePriceSource,
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

  async function handleCreateGiveaway({ title, description, prizeDescription, durationDays, minPublications, minSales, communityUrl, photoUrl }) {
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
        minPublications,
        minSales,
        communityUrl,
        photoUrl,
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
    setEnterGiveawayError("");
    setEnterGiveawayErrorId(null);
    try {
      await enterGiveaway(giveawayId);
      setMyGiveawayEntryIds((ids) => new Set(ids).add(giveawayId));
    } catch (e) {
      setEnterGiveawayError(e.message);
      setEnterGiveawayErrorId(giveawayId);
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
        referencePriceCurrency: fields.referencePriceCurrency,
        referencePriceSource: fields.referencePriceSource,
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
          onOpenPro={() => setView({ name: "pro", back: view })}
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
          enterError={enterGiveawayError}
          enterErrorId={enterGiveawayErrorId}
          highlightId={view.highlightId}
        />
      )}

      {view.name === "pro" && (
        <ProUpsellView
          onBack={() => setView(view.back ?? { name: "list" })}
          onOpenSuggestions={() => setView({ name: "suggestions", back: view.back ?? { name: "list" } })}
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
