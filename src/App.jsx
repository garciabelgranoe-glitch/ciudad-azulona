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
import CreateLotView from "./views/CreateLotView";
import EditAuction from "./views/EditAuction";
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
import PublicAuctionPreview from "./views/PublicAuctionPreview";
import ReportsTabContent from "./views/admin/ReportsTabContent";
import SuggestionsTabContent from "./views/admin/SuggestionsTabContent";
import UsersTabContent from "./views/admin/UsersTabContent";
import AuctionsTabContent from "./views/admin/AuctionsTabContent";
import WhatsappCommunitiesTabContent from "./views/admin/WhatsappCommunitiesTabContent";
import RecommendedSellersTabContent from "./views/admin/RecommendedSellersTabContent";
import PickupPointsTabContent from "./views/admin/PickupPointsTabContent";
import BlogTabContent from "./views/admin/BlogTabContent";
import GiveawaysTabContent from "./views/admin/GiveawaysTabContent";
import MetricsTabContent from "./views/admin/MetricsTabContent";
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
  updateBlogPost,
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
// Vista: Panel de administración (usuarios, subastas, denuncias)
// las sub-vistas de cada tab viven en src/views/admin/
// ---------------------------------------------
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
  onUpdateBlogPost,
  editBlogBusyId,
  editBlogError,
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
            onUpdate={onUpdateBlogPost}
            editBusyId={editBlogBusyId}
            editError={editBlogError}
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
  const [previewDismissed, setPreviewDismissed] = useState(false);
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
    const historyState = { view, enteredLanding, showLegal, previewDismissed };
    const url = urlForView(view);
    if (isFirstHistoryRender.current) {
      isFirstHistoryRender.current = false;
      window.history.replaceState(historyState, "", url);
    } else {
      window.history.pushState(historyState, "", url);
    }
  }, [view, enteredLanding, showLegal, previewDismissed]);

  useEffect(() => {
    function onPopState(e) {
      if (e.state) {
        isPoppingRef.current = true;
        setView(e.state.view);
        setEnteredLanding(e.state.enteredLanding);
        setShowLegal(e.state.showLegal);
        setPreviewDismissed(e.state.previewDismissed ?? false);
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
  const [editBlogBusyId, setEditBlogBusyId] = useState(null);
  const [editBlogError, setEditBlogError] = useState("");
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

  if (isSupabaseConfigured && (auth.loading || (auth.session && auth.profileLoading))) {
    return <div className="min-h-dvh bg-cream" />;
  }

  if (!enteredLanding && (!isSupabaseConfigured || !auth.session || !auth.profile)) {
    return <Landing onEnter={() => setEnteredLanding(true)} onOpenLegal={() => setShowLegal(true)} />;
  }

  if (isSupabaseConfigured && (!auth.session || !auth.profile)) {
    if (view.name === "detail" && view.auctionId && !previewDismissed) {
      return (
        <PublicAuctionPreview
          auctionId={view.auctionId}
          onGoToLogin={() => setPreviewDismissed(true)}
          onBack={() => {
            setEnteredLanding(false);
            setView({ name: "list" });
          }}
        />
      );
    }
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

  async function handleCreateBlogPost({ title, body, photoUrl, category }) {
    setCreateBlogBusy(true);
    setCreateBlogError("");
    try {
      const row = await createBlogPost({ title, body, photoUrl, category, authorId: auth.session.user.id });
      setBlogPosts((rows) => [row, ...rows]);
      return true;
    } catch (e) {
      setCreateBlogError(e.message);
      return false;
    } finally {
      setCreateBlogBusy(false);
    }
  }

  async function handleUpdateBlogPost(id, fields) {
    setEditBlogBusyId(id);
    setEditBlogError("");
    try {
      const row = await updateBlogPost(id, fields);
      setBlogPosts((rows) => rows.map((p) => (p.id === id ? row : p)));
      return true;
    } catch (e) {
      setEditBlogError(e.message);
      return false;
    } finally {
      setEditBlogBusyId(null);
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
    view.name === "editAuction"
      ? displayAuctions.find((a) => a.id === view.auctionId) ||
        topMonthlyAuctions.find((a) => a.id === view.auctionId) ||
        myPublications.find((a) => a.id === view.auctionId) ||
        myBids.find((a) => a.id === view.auctionId) ||
        directAuction
      : null;
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
          onUpdateBlogPost={handleUpdateBlogPost}
          editBlogBusyId={editBlogBusyId}
          editBlogError={editBlogError}
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
