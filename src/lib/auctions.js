import { supabase } from "./supabaseClient";

const AUCTION_SELECT = `
  id, card_name, photo_urls, base_price, current_bid, bid_count, status, closes_at, created_at, winner_id,
  set_name, card_number, year, condition, is_graded, grading_company, grade, rarity, is_featured, language,
  reference_price, reference_price_currency, reference_price_source, reserve_price, buy_now_price, is_sale_only, currency,
  is_free_claim, free_claim_winning_number, free_claim_count, lot_id,
  seller:profiles!auctions_seller_id_fkey ( id, alias, gender, rating_avg, sales_count, is_premium, city )
`;

export const DURATION_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hora", value: 60 },
  { label: "3 horas", value: 180 },
  { label: "12 horas", value: 720 },
  { label: "24 horas", value: 1440 },
  { label: "3 días", value: 4320 },
  { label: "1 semana", value: 10080 },
];

export const GIVEAWAY_DURATION_OPTIONS = [
  { value: 3, label: "3 días" },
  { value: 7, label: "7 días" },
  { value: 14, label: "14 días" },
  { value: 30, label: "30 días" },
];

export const REFERENCE_PRICE_SOURCE_OPTIONS = [
  { value: "pricecharting", label: "PriceCharting" },
  { value: "ebay", label: "eBay" },
  { value: "tcgplayer", label: "TCGplayer" },
  { value: "cardmarket", label: "Cardmarket" },
  { value: "otro", label: "Otra fuente" },
];

export const REFERENCE_PRICE_SOURCE_LABEL = Object.fromEntries(
  REFERENCE_PRICE_SOURCE_OPTIONS.map((o) => [o.value, o.label])
);

export const BLOG_CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "novedades_plataforma", label: "Novedades de la plataforma" },
  { value: "nuevas_colecciones", label: "Nuevas colecciones y sets" },
  { value: "mercado_precios", label: "Mercado y precios" },
  { value: "eventos_torneos", label: "Eventos y torneos" },
  { value: "tips_coleccionismo", label: "Tips de coleccionismo" },
  { value: "historias_comunidad", label: "Historias de la comunidad" },
];

export const BLOG_CATEGORY_LABEL = Object.fromEntries(
  BLOG_CATEGORY_OPTIONS.map((o) => [o.value, o.label])
);

export const LANGUAGE_OPTIONS = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "jp", label: "Japonés" },
  { value: "otro", label: "Otro" },
];

export const CONDITION_OPTIONS = [
  { value: "mint", label: "Mint" },
  { value: "near_mint", label: "Near Mint" },
  { value: "lightly_played", label: "Lightly Played" },
  { value: "moderately_played", label: "Moderately Played" },
  { value: "heavily_played", label: "Heavily Played" },
  { value: "damaged", label: "Dañada" },
];

export const CONDITION_SHORT = {
  mint: "M",
  near_mint: "NM",
  lightly_played: "LP",
  moderately_played: "MP",
  heavily_played: "HP",
  damaged: "DMG",
};

// De mejor a peor estado — colores que se puedan distinguir de un vistazo
// en una card chica, sin depender de leer el texto.
export const CONDITION_COLORS = {
  mint: "border-gold/50 bg-gold/15 text-gold-dark",
  near_mint: "border-forest-mid/40 bg-forest-mid/15 text-forest-deep",
  lightly_played: "border-teal/40 bg-teal/15 text-teal",
  moderately_played: "border-plum/40 bg-plum/15 text-plum",
  heavily_played: "border-[#B9432C]/40 bg-[#FBE6E0] text-[#B9432C]",
  damaged: "border-ink/40 bg-ink/10 text-ink-soft",
};

export const GRADING_COMPANY_OPTIONS = [
  { value: "psa", label: "PSA" },
  { value: "bgs", label: "BGS" },
  { value: "cgc", label: "CGC" },
  { value: "otra", label: "Otra" },
];

export const RARITY_OPTIONS = [
  { value: "comun", label: "Común", symbol: "●" },
  { value: "poco_comun", label: "Poco común", symbol: "◆" },
  { value: "rara", label: "Rara", symbol: "★" },
  { value: "rara_doble", label: "Rara doble", symbol: "★★" },
  { value: "promo", label: "Promo", symbol: "P" },
];

export const RARITY_SYMBOL = Object.fromEntries(RARITY_OPTIONS.map((r) => [r.value, r.symbol]));
export const RARITY_LABEL = Object.fromEntries(RARITY_OPTIONS.map((r) => [r.value, r.label]));

export const MAX_PHOTOS = 5;

export async function listLiveAuctions() {
  const { data, error } = await supabase
    .from("auctions")
    .select(AUCTION_SELECT)
    .eq("status", "live")
    .is("lot_id", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAuction(id) {
  const { data, error } = await supabase
    .from("auctions")
    .select(AUCTION_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToLiveAuctions(onUpdate) {
  // Nombre único por suscripción: si dos montajes se solapan (StrictMode,
  // Fast Refresh), evita que ambos reutilicen el mismo canal y apilen
  // listeners duplicados sobre el mismo topic.
  const channel = supabase
    .channel(`auctions-live-${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "auctions" },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function auctionToVM(row) {
  const closesInSec = Math.max(0, Math.round((new Date(row.closes_at).getTime() - Date.now()) / 1000));
  return {
    id: row.id,
    card: row.card_name,
    seller: row.seller?.alias ?? "—",
    sellerRating: Number(row.seller?.rating_avg ?? 5),
    sellerSales: row.seller?.sales_count ?? 0,
    sellerId: row.seller?.id,
    sellerGender: row.seller?.gender ?? null,
    sellerIsPremium: row.seller?.is_premium ?? false,
    sellerCity: row.seller?.city ?? null,
    photoUrls: row.photo_urls ?? [],
    photoUrl: row.photo_urls?.[0] ?? null,
    basePrice: Number(row.base_price),
    currentBid: Number(row.current_bid),
    currency: row.currency ?? "ARS",
    bids: row.bid_count,
    closesInSec,
    closesAt: row.closes_at,
    createdAt: row.created_at,
    status: row.status,
    setName: row.set_name,
    cardNumber: row.card_number,
    year: row.year,
    condition: row.condition,
    isGraded: row.is_graded,
    gradingCompany: row.grading_company,
    grade: row.grade,
    rarity: row.rarity,
    language: row.language,
    isFeatured: row.is_featured,
    referencePrice: row.reference_price != null ? Number(row.reference_price) : null,
    referencePriceCurrency: row.reference_price_currency ?? null,
    referencePriceSource: row.reference_price_source ?? null,
    reservePrice: row.reserve_price != null ? Number(row.reserve_price) : null,
    buyNowPrice: row.buy_now_price != null ? Number(row.buy_now_price) : null,
    isSaleOnly: !!row.is_sale_only,
    isFreeClaim: !!row.is_free_claim,
    freeClaimWinningNumber: row.free_claim_winning_number,
    freeClaimCount: row.free_claim_count ?? 0,
    lotId: row.lot_id ?? null,
  };
}

export async function placeBid(auctionId, amount) {
  const { data, error } = await supabase.rpc("place_bid", {
    p_auction_id: auctionId,
    p_amount: amount,
  });
  if (error) throw error;
  return data;
}

export async function buyNowAuction(auctionId) {
  const { data, error } = await supabase.rpc("buy_now_auction", { p_auction_id: auctionId });
  if (error) throw error;
  return data;
}

export async function buyFullLot(lotId) {
  const { error } = await supabase.rpc("buy_full_lot", { p_lot_id: lotId });
  if (error) throw error;
}

export async function claimFreeItem(auctionId) {
  const { data, error } = await supabase.rpc("claim_free_item", { p_auction_id: auctionId });
  if (error) throw error;
  return data?.[0];
}

export async function listMyPublications(userId) {
  const { data, error } = await supabase
    .from("auctions")
    .select(AUCTION_SELECT)
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listMyBidAuctions(userId) {
  const { data, error } = await supabase
    .from("bids")
    .select(`amount, auction:auctions!bids_auction_id_fkey ( ${AUCTION_SELECT} )`)
    .eq("bidder_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  // Puede haber varias pujas mías por subasta — me quedo con una fila por
  // subasta, guardando la mayor puja que hice ahí.
  const byAuction = new Map();
  for (const row of data) {
    if (!row.auction) continue;
    const prev = byAuction.get(row.auction.id);
    if (!prev || Number(row.amount) > prev.myBid) {
      byAuction.set(row.auction.id, { ...row.auction, myBid: Number(row.amount) });
    }
  }
  return [...byAuction.values()];
}

export async function listRecentBids(auctionId, limit = 10) {
  const { data, error } = await supabase
    .from("bids")
    .select("id, amount, created_at, bidder:profiles!bids_bidder_id_fkey ( id, alias, gender )")
    .eq("auction_id", auctionId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// Las fotos de cámara vienen de varios MB — eso rompe el preview de
// WhatsApp (su crawler ignora imágenes pesadas) y hace lenta la subida.
// Las reescalamos client-side a un máximo razonable antes de subirlas.
async function compressImage(file, maxDimension = 1600, quality = 0.82) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 900_000) {
      bitmap.close?.();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function uploadAuctionPhoto(file) {
  const compressed = await compressImage(file);
  const ext = compressed.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("auction-photos").upload(path, compressed);
  if (error) throw error;
  const { data } = supabase.storage.from("auction-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAuctionPhotos(files) {
  return Promise.all(files.map((file) => uploadAuctionPhoto(file)));
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Reconocimiento de carta por foto (Ximilar) vía Edge Function — la API
// key vive solo server-side. Devuelve los campos reconocidos, o null si
// la foto no matcheó ninguna carta.
export async function scanCardPhoto(file) {
  const compressed = await compressImage(file, 1000, 0.8);
  const image_base64 = await fileToBase64(compressed);
  const { data, error } = await supabase.functions.invoke("scan-card", {
    body: { image_base64 },
  });
  if (error) throw error;
  return data?.ok ? data.fields : null;
}

export async function createAuction({
  sellerId,
  cardName,
  basePrice,
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
  reservePrice,
  buyNowPrice,
  isSaleOnly,
  isFreeClaim,
  freeClaimWinningNumber,
  currency,
  language,
  referencePriceCurrency,
  referencePriceSource,
}) {
  const closesAt = new Date(Date.now() + durationMinutes * 60_000).toISOString();
  const hasReferencePrice = !isFreeClaim && !!referencePrice;
  const { data, error } = await supabase
    .from("auctions")
    .insert({
      seller_id: sellerId,
      card_name: cardName,
      base_price: isFreeClaim ? 0 : basePrice,
      current_bid: isFreeClaim ? 0 : basePrice,
      closes_at: closesAt,
      photo_urls: photoUrls ?? [],
      set_name: setName || null,
      card_number: cardNumber || null,
      year: year || null,
      condition,
      is_graded: isGraded,
      grading_company: isGraded ? gradingCompany : null,
      grade: isGraded ? grade : null,
      rarity: rarity || null,
      is_featured: !!isFeatured,
      reference_price: isFreeClaim ? null : referencePrice || null,
      reference_price_currency: hasReferencePrice ? referencePriceCurrency || null : null,
      reference_price_source: hasReferencePrice ? referencePriceSource || null : null,
      reserve_price: isSaleOnly || isFreeClaim ? null : reservePrice || null,
      buy_now_price: isFreeClaim ? null : isSaleOnly ? basePrice : buyNowPrice || null,
      is_sale_only: !!isSaleOnly,
      is_free_claim: !!isFreeClaim,
      free_claim_winning_number: isFreeClaim ? freeClaimWinningNumber : null,
      currency: currency || "ARS",
      language: language || null,
    })
    .select(AUCTION_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateOwnAuction(auctionId, {
  cardName,
  basePrice,
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
  reservePrice,
  buyNowPrice,
  language,
  referencePriceCurrency,
  referencePriceSource,
}) {
  const { data, error } = await supabase.rpc("update_own_auction", {
    p_auction_id: auctionId,
    p_card_name: cardName,
    p_base_price: basePrice,
    p_set_name: setName || null,
    p_card_number: cardNumber || null,
    p_year: year || null,
    p_condition: condition,
    p_is_graded: isGraded,
    p_grading_company: isGraded ? gradingCompany : null,
    p_grade: isGraded ? grade : null,
    p_rarity: rarity || null,
    p_is_featured: !!isFeatured,
    p_reference_price: referencePrice || null,
    p_reserve_price: reservePrice || null,
    p_buy_now_price: buyNowPrice || null,
    p_language: language || null,
    p_reference_price_currency: referencePrice ? referencePriceCurrency || null : null,
    p_reference_price_source: referencePrice ? referencePriceSource || null : null,
  });
  if (error) throw error;
  return data;
}

export async function cancelOwnAuction(auctionId) {
  const { error } = await supabase.rpc("cancel_own_auction", { p_auction_id: auctionId });
  if (error) throw error;
}

export async function listMyTickets() {
  // RLS ya restringe esto a tickets donde soy el ganador o el vendedor.
  const { data, error } = await supabase
    .from("tickets")
    .select(
      `id, code, status, redeemed_at, created_at,
       auction:auctions!tickets_auction_id_fkey ( card_name, current_bid, winner_id, seller_id, currency,
         seller:profiles!auctions_seller_id_fkey ( alias, gender, has_stand, stand_number, pickup_day, pickup_time, contact_phone, city,
           pickup_point:pickup_points ( name ) ),
         winner:profiles!auctions_winner_id_fkey ( alias, gender, contact_phone ) )`
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export function ticketToVM(row, currentUserId) {
  return {
    id: row.id,
    card: row.auction.card_name,
    seller: row.auction.seller?.alias ?? "—",
    sellerId: row.auction.seller_id,
    sellerGender: row.auction.seller?.gender ?? null,
    sellerHasStand: row.auction.seller?.has_stand ?? false,
    sellerStandNumber: row.auction.seller?.stand_number ?? null,
    sellerPickupDay: row.auction.seller?.pickup_day ?? null,
    sellerPickupTime: row.auction.seller?.pickup_time ?? null,
    sellerContactPhone: row.auction.seller?.contact_phone ?? null,
    sellerCity: row.auction.seller?.city ?? null,
    sellerPickupPointName: row.auction.seller?.pickup_point?.name ?? null,
    buyerId: row.auction.winner_id,
    buyer: row.auction.winner?.alias ?? "—",
    buyerGender: row.auction.winner?.gender ?? null,
    buyerContactPhone: row.auction.winner?.contact_phone ?? null,
    price: Number(row.auction.current_bid),
    currency: row.auction.currency ?? "ARS",
    code: row.code,
    status: row.status === "redeemed" ? "entregado" : "pendiente",
    closedAt: new Date(row.created_at).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
    isSeller: row.auction.seller_id === currentUserId,
  };
}

export async function redeemTicket(ticketId) {
  const { error } = await supabase
    .from("tickets")
    .update({ status: "redeemed", redeemed_at: new Date().toISOString() })
    .eq("id", ticketId);
  if (error) throw error;
}

export async function submitRating(ticketId, raterId, ratedUserId, score) {
  const { error } = await supabase
    .from("ratings")
    .insert({ ticket_id: ticketId, rater_id: raterId, rated_user_id: ratedUserId, score });
  if (error) throw error;
}

export async function listMyGivenRatingTicketIds() {
  const { data, error } = await supabase.from("ratings").select("ticket_id");
  if (error) throw error;
  return new Set(data.map((r) => r.ticket_id));
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, pickup_point:pickup_points ( name, city )")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, { hasStand, standNumber, pickupDay, pickupTime, contactPhone, city, pickupPointId }) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      has_stand: hasStand,
      stand_number: hasStand ? standNumber || null : null,
      pickup_day: !hasStand ? pickupDay || null : null,
      pickup_time: !hasStand ? pickupTime || null : null,
      contact_phone: !hasStand ? contactPhone || null : null,
      city: city || null,
      pickup_point_id: pickupPointId || null,
    })
    .eq("id", userId)
    .select("*, pickup_point:pickup_points ( name, city )")
    .single();
  if (error) throw error;
  return data;
}

export async function updateGender(userId, gender) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ gender })
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getProfileStats(userId) {
  const { data, error } = await supabase.rpc("get_profile_stats", { p_user_id: userId });
  if (error) throw error;
  return data;
}

export async function getProfileBadges(userId) {
  const { data, error } = await supabase
    .from("profile_badges")
    .select("awarded_at, badge:badges ( code, name, description, icon, sort_order )")
    .eq("profile_id", userId);
  if (error) throw error;
  return data.map((row) => row.badge).sort((a, b) => a.sort_order - b.sort_order);
}

export async function createReport({ auctionId, reporterId, reason }) {
  const { error } = await supabase
    .from("reports")
    .insert({ auction_id: auctionId, reporter_id: reporterId, reason });
  if (error) throw error;
}

export async function listAllReports() {
  // RLS solo deja ver todo esto si profiles.is_admin = true para el usuario actual.
  const { data, error } = await supabase
    .from("reports")
    .select(
      `id, reason, status, created_at,
       reporter:profiles!reports_reporter_id_fkey ( alias ),
       auction:auctions!reports_auction_id_fkey ( card_name, seller_id, seller:profiles!auctions_seller_id_fkey ( alias ) )`
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateReportStatus(reportId, status) {
  const { error } = await supabase.rpc("admin_resolve_report", { p_report_id: reportId, p_status: status });
  if (error) throw error;
}

export async function cancelAuctionAsAdmin(auctionId) {
  const { error } = await supabase.rpc("admin_cancel_auction", { p_auction_id: auctionId });
  if (error) throw error;
}

export async function setAuctionFeaturedAsAdmin(auctionId, isFeatured) {
  const { error } = await supabase.rpc("admin_set_auction_featured", { p_auction_id: auctionId, p_is_featured: isFeatured });
  if (error) throw error;
}

export async function listBlockedEmails() {
  const { data, error } = await supabase
    .from("blocked_emails")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function blockEmail(email, reason) {
  const { data, error } = await supabase
    .from("blocked_emails")
    .insert({ email: email.trim().toLowerCase(), reason: reason || null })
    .select("*")
    .single();
  if (error) throw error;
  await supabase.rpc("log_admin_action", {
    p_action: "bloquear_email",
    p_target_type: "blocked_email",
    p_target_id: data.email,
    p_details: reason ? { reason } : null,
  });
  return data;
}

export async function unblockEmail(email) {
  const { error } = await supabase.from("blocked_emails").delete().eq("email", email);
  if (error) throw error;
  await supabase.rpc("log_admin_action", {
    p_action: "desbloquear_email",
    p_target_type: "blocked_email",
    p_target_id: email,
    p_details: null,
  });
}

export async function listAdminAuditLog() {
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("id, action, target_type, target_id, details, created_at, admin:profiles!admin_audit_log_admin_id_fkey ( alias )")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data;
}

export async function listMyNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, kind, message, auction_id, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function markNotificationRead(notificationId) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead(notificationIds) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .in("id", notificationIds);
  if (error) throw error;
}

export function subscribeToAuctionPresence(auctionId, presenceKey, onCountChange) {
  const channel = supabase.channel(`auction-presence-${auctionId}`, {
    config: { presence: { key: presenceKey } },
  });
  channel.on("presence", { event: "sync" }, () => {
    onCountChange(Object.keys(channel.presenceState()).length);
  });
  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") await channel.track({ online_at: new Date().toISOString() });
  });
  return () => supabase.removeChannel(channel);
}

export function subscribeToMyNotifications(userId, onInsert) {
  const channel = supabase
    .channel(`notifications-${userId}-${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function listAllProfilesForAdmin() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, alias, sales_count, purchases_count, rating_avg, is_admin, is_suspended, is_premium, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function setUserSuspended(userId, suspended) {
  const { error } = await supabase.rpc("set_user_suspended", { p_user_id: userId, p_suspended: suspended });
  if (error) throw error;
}

export async function setUserPremium(userId, premium) {
  const { error } = await supabase.rpc("set_user_premium", { p_user_id: userId, p_premium: premium });
  if (error) throw error;
}

export async function listRecommendedSellers() {
  // RLS: admins ven todos (activos e inactivos), el resto solo los activos.
  const { data, error } = await supabase
    .from("recommended_sellers")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createRecommendedSeller({ businessName, description, contactInfo, photoUrl, whatsappUrl }) {
  const { data, error } = await supabase
    .from("recommended_sellers")
    .insert({
      business_name: businessName,
      description: description || null,
      contact_info: contactInfo || null,
      photo_url: photoUrl || null,
      whatsapp_url: whatsappUrl || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateRecommendedSeller(id, { businessName, description, contactInfo, photoUrl, whatsappUrl }) {
  const { data, error } = await supabase
    .from("recommended_sellers")
    .update({
      business_name: businessName,
      description: description || null,
      contact_info: contactInfo || null,
      photo_url: photoUrl || null,
      whatsapp_url: whatsappUrl || null,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function setRecommendedSellerActive(id, isActive) {
  const { error } = await supabase.from("recommended_sellers").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}

export async function deleteRecommendedSeller(id) {
  const { error } = await supabase.from("recommended_sellers").delete().eq("id", id);
  if (error) throw error;
}

export async function listPickupPoints() {
  // RLS: admins ven todos (activos e inactivos), el resto solo los activos.
  const { data, error } = await supabase
    .from("pickup_points")
    .select("*")
    .order("city", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createPickupPoint({ city, name, details }) {
  const { data, error } = await supabase
    .from("pickup_points")
    .insert({ city, name, details: details || null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function setPickupPointActive(id, isActive) {
  const { error } = await supabase.from("pickup_points").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}

export async function deletePickupPoint(id) {
  const { error } = await supabase.from("pickup_points").delete().eq("id", id);
  if (error) throw error;
}

export async function listBlogPosts() {
  // RLS: admins ven todo (publicado y no), el resto solo lo publicado.
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, body, photo_url, category, is_published, created_at, author:profiles!blog_posts_author_id_fkey ( alias )")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createBlogPost({ title, body, authorId, photoUrl, category }) {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({ title, body, author_id: authorId, photo_url: photoUrl || null, category: category || "general" })
    .select("id, title, body, photo_url, category, is_published, created_at, author:profiles!blog_posts_author_id_fkey ( alias )")
    .single();
  if (error) throw error;
  return data;
}

export async function setBlogPostPublished(id, isPublished) {
  const { error } = await supabase.from("blog_posts").update({ is_published: isPublished }).eq("id", id);
  if (error) throw error;
}

export async function updateBlogPost(id, { title, body, category, photoUrl }) {
  const { data, error } = await supabase
    .from("blog_posts")
    .update({ title, body, category, ...(photoUrl !== undefined ? { photo_url: photoUrl || null } : {}) })
    .eq("id", id)
    .select("id, title, body, photo_url, category, is_published, created_at, author:profiles!blog_posts_author_id_fkey ( alias )")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBlogPost(id) {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function listWhatsappCommunities() {
  const { data, error } = await supabase
    .from("whatsapp_communities")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createWhatsappCommunity({ name, description, url }) {
  const { data, error } = await supabase
    .from("whatsapp_communities")
    .insert({ name, description: description || null, url })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function setWhatsappCommunityActive(id, isActive) {
  const { error } = await supabase.from("whatsapp_communities").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}

export async function deleteWhatsappCommunity(id) {
  const { error } = await supabase.from("whatsapp_communities").delete().eq("id", id);
  if (error) throw error;
}

export async function listGiveaways() {
  const { data, error } = await supabase
    .from("giveaways")
    .select("*, winner:profiles!giveaways_winner_id_fkey ( alias )")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createGiveaway({ title, description, prizeDescription, closesAt, createdBy, minPublications, minSales, photoUrl, communityUrl }) {
  const { data, error } = await supabase
    .from("giveaways")
    .insert({
      title,
      description: description || null,
      prize_description: prizeDescription || null,
      closes_at: closesAt,
      created_by: createdBy,
      min_publications: minPublications || null,
      min_sales: minSales || null,
      photo_url: photoUrl || null,
      community_url: communityUrl || null,
    })
    .select("*, winner:profiles!giveaways_winner_id_fkey ( alias )")
    .single();
  if (error) throw error;
  return data;
}

export async function closeGiveaway(id, winnerId) {
  const { error } = await supabase.from("giveaways").update({ status: "closed", winner_id: winnerId }).eq("id", id);
  if (error) throw error;
}

export async function deleteGiveaway(id) {
  const { error } = await supabase.from("giveaways").delete().eq("id", id);
  if (error) throw error;
}

export async function enterGiveaway(giveawayId) {
  const { error } = await supabase.rpc("enter_giveaway", { p_giveaway_id: giveawayId });
  if (error) throw error;
}

export async function listMyGiveawayEntryIds() {
  const { data, error } = await supabase.from("giveaway_entries").select("giveaway_id");
  if (error) throw error;
  return new Set(data.map((r) => r.giveaway_id));
}

export async function listGiveawayEntrantsForAdmin(giveawayId) {
  const { data, error } = await supabase.rpc("list_giveaway_entrants", { p_giveaway_id: giveawayId });
  if (error) throw error;
  return data;
}

export async function listTopAuctionsThisMonth(limit = 10) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from("auctions")
    .select(AUCTION_SELECT)
    .gte("created_at", startOfMonth.toISOString())
    .order("bid_count", { ascending: false })
    .order("current_bid", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function listAllAuctionsForAdmin() {
  const { data, error } = await supabase
    .from("auctions")
    .select(`${AUCTION_SELECT}, created_at`)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data;
}

export async function getAdminDailyMetrics(days = 30) {
  const { data, error } = await supabase.rpc("admin_metrics_daily", { p_days: days });
  if (error) throw error;
  return data.map((row) => ({
    day: row.day,
    newUsers: Number(row.new_users),
    newListings: Number(row.new_listings),
    salesCount: Number(row.sales_count),
    gmvArs: Number(row.gmv_ars),
    gmvUsd: Number(row.gmv_usd),
    bidsCount: Number(row.bids_count ?? 0),
    reactionsCount: Number(row.reactions_count ?? 0),
    favoritesCount: Number(row.favorites_count ?? 0),
    pageViewsCount: Number(row.page_views_count ?? 0),
  }));
}

// Analytics liviano y anónimo: una fila por cambio de pantalla, sin
// bloquear la navegación si falla (ver logPageView en App.jsx).
export async function logPageView(viewName, userId) {
  const { error } = await supabase.from("page_views").insert({ view_name: viewName, user_id: userId || null });
  if (error) throw error;
}

export async function logClientError({ message, stack, viewName, userId }) {
  // Fire-and-forget a propósito — nunca debe hacer que algo más falle.
  await supabase
    .from("client_error_log")
    .insert({
      message: String(message).slice(0, 2000),
      stack: stack ? String(stack).slice(0, 4000) : null,
      view_name: viewName || null,
      url: typeof window !== "undefined" ? window.location.href : null,
      user_id: userId || null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    })
    .then(() => {}, () => {});
}

export async function listClientErrorLog() {
  const { data, error } = await supabase
    .from("client_error_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data;
}

export function subscribeToClientErrors(onInsert) {
  const channel = supabase
    .channel(`client-errors-${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "client_error_log" }, (payload) => onInsert(payload.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function createSuggestion(userId, message) {
  const { data, error } = await supabase
    .from("suggestions")
    .insert({ user_id: userId, message })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listSuggestionsForAdmin() {
  const { data, error } = await supabase
    .from("suggestions")
    .select("id, message, status, created_at, user:profiles!suggestions_user_id_fkey ( alias )")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function setSuggestionStatus(id, status) {
  const { error } = await supabase.from("suggestions").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function getTopSellers() {
  const { data, error } = await supabase.rpc("get_top_sellers");
  if (error) throw error;
  return data;
}

export async function getTopBuyers() {
  const { data, error } = await supabase.rpc("get_top_buyers");
  if (error) throw error;
  return data;
}

export async function listMyFavoriteIds() {
  const { data, error } = await supabase.from("favorites").select("auction_id");
  if (error) throw error;
  return new Set(data.map((r) => r.auction_id));
}

export async function listMyFavoriteAuctions() {
  const { data, error } = await supabase
    .from("favorites")
    .select(`auction:auctions!favorites_auction_id_fkey ( ${AUCTION_SELECT} )`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => r.auction).filter(Boolean);
}

export async function addFavorite(userId, auctionId) {
  const { error } = await supabase.from("favorites").insert({ user_id: userId, auction_id: auctionId });
  if (error) throw error;
}

export async function removeFavorite(auctionId) {
  const { error } = await supabase.from("favorites").delete().eq("auction_id", auctionId);
  if (error) throw error;
}

export async function listAuctionReactions(auctionId) {
  const { data, error } = await supabase.from("auction_reactions").select("user_id, reaction").eq("auction_id", auctionId);
  if (error) throw error;
  return data;
}

export async function setMyReaction(userId, auctionId, reaction) {
  const { error } = await supabase
    .from("auction_reactions")
    .upsert({ user_id: userId, auction_id: auctionId, reaction }, { onConflict: "user_id,auction_id" });
  if (error) throw error;
}

export async function removeMyReaction(auctionId) {
  const { error } = await supabase.from("auction_reactions").delete().eq("auction_id", auctionId);
  if (error) throw error;
}

export async function createCardLot({ sellerId, title, description, photoUrls, durationMinutes, items, currency, fullPrice }) {
  const { data: lot, error: lotError } = await supabase
    .from("card_lots")
    .insert({ seller_id: sellerId, title, description: description || null, photo_urls: photoUrls ?? [], full_price: fullPrice || null })
    .select("*")
    .single();
  if (lotError) throw lotError;

  const closesAt = new Date(Date.now() + durationMinutes * 60_000).toISOString();
  const { error: itemsError } = await supabase.from("auctions").insert(
    items.map((item) => ({
      seller_id: sellerId,
      card_name: item.description,
      base_price: item.price,
      current_bid: item.price,
      buy_now_price: item.price,
      is_sale_only: true,
      closes_at: closesAt,
      lot_id: lot.id,
      currency: currency || "ARS",
    }))
  );
  if (itemsError) throw itemsError;

  return lot;
}

export async function listLiveLots() {
  const { data, error } = await supabase
    .from("card_lots")
    .select(`*, seller:profiles!card_lots_seller_id_fkey ( id, alias, gender, rating_avg, sales_count, is_premium ), items:auctions ( id, status )`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCardLot(lotId) {
  const { data, error } = await supabase
    .from("card_lots")
    .select("*, seller:profiles!card_lots_seller_id_fkey ( id, alias, gender, rating_avg, sales_count, is_premium )")
    .eq("id", lotId)
    .single();
  if (error) throw error;
  return data;
}

export async function listLotItems(lotId) {
  const { data, error } = await supabase
    .from("auctions")
    .select(AUCTION_SELECT)
    .eq("lot_id", lotId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}
