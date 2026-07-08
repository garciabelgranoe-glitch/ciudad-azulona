import { supabase } from "./supabaseClient";

const AUCTION_SELECT = `
  id, card_name, photo_urls, base_price, current_bid, bid_count, status, closes_at, winner_id,
  set_name, card_number, year, condition, is_graded, grading_company, grade, rarity, is_featured,
  seller:profiles!auctions_seller_id_fkey ( id, alias, gender, rating_avg, sales_count )
`;

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
];

export const RARITY_SYMBOL = Object.fromEntries(RARITY_OPTIONS.map((r) => [r.value, r.symbol]));
export const RARITY_LABEL = Object.fromEntries(RARITY_OPTIONS.map((r) => [r.value, r.label]));

export const MAX_PHOTOS = 5;

export async function listLiveAuctions() {
  const { data, error } = await supabase
    .from("auctions")
    .select(AUCTION_SELECT)
    .eq("status", "live")
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
    photoUrls: row.photo_urls ?? [],
    photoUrl: row.photo_urls?.[0] ?? null,
    basePrice: Number(row.base_price),
    currentBid: Number(row.current_bid),
    bids: row.bid_count,
    closesInSec,
    closesAt: row.closes_at,
    status: row.status,
    setName: row.set_name,
    cardNumber: row.card_number,
    year: row.year,
    condition: row.condition,
    isGraded: row.is_graded,
    gradingCompany: row.grading_company,
    grade: row.grade,
    rarity: row.rarity,
    isFeatured: row.is_featured,
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

export async function uploadAuctionPhoto(file) {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("auction-photos").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("auction-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAuctionPhotos(files) {
  const urls = [];
  for (const file of files) {
    urls.push(await uploadAuctionPhoto(file));
  }
  return urls;
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
}) {
  const closesAt = new Date(Date.now() + durationMinutes * 60_000).toISOString();
  const { data, error } = await supabase
    .from("auctions")
    .insert({
      seller_id: sellerId,
      card_name: cardName,
      base_price: basePrice,
      current_bid: basePrice,
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
    })
    .select(AUCTION_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function listMyTickets() {
  // RLS ya restringe esto a tickets donde soy el ganador o el vendedor.
  const { data, error } = await supabase
    .from("tickets")
    .select(
      `id, code, status, redeemed_at, created_at,
       auction:auctions!tickets_auction_id_fkey ( card_name, current_bid, winner_id, seller_id,
         seller:profiles!auctions_seller_id_fkey ( alias, gender, has_stand, stand_number, pickup_day, pickup_time, contact_phone ) )`
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
    price: Number(row.auction.current_bid),
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
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, { hasStand, standNumber, pickupDay, pickupTime, contactPhone }) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      has_stand: hasStand,
      stand_number: hasStand ? standNumber || null : null,
      pickup_day: !hasStand ? pickupDay || null : null,
      pickup_time: !hasStand ? pickupTime || null : null,
      contact_phone: !hasStand ? contactPhone || null : null,
    })
    .eq("id", userId)
    .select("*")
    .single();
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
