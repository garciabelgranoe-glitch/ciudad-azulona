import { supabase } from "./supabaseClient";

const AUCTION_SELECT = `
  id, card_name, photo_url, base_price, current_bid, bid_count, status, closes_at, winner_id,
  set_name, card_number, year, condition, is_graded, grading_company, grade,
  seller:profiles!auctions_seller_id_fkey ( id, alias, rating_avg, sales_count )
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
    photoUrl: row.photo_url,
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

export async function listRecentBids(auctionId, limit = 10) {
  const { data, error } = await supabase
    .from("bids")
    .select("id, amount, created_at, bidder:profiles!bids_bidder_id_fkey ( alias )")
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

export async function createAuction({
  sellerId,
  cardName,
  basePrice,
  durationMinutes,
  photoUrl,
  setName,
  cardNumber,
  year,
  condition,
  isGraded,
  gradingCompany,
  grade,
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
      photo_url: photoUrl,
      set_name: setName || null,
      card_number: cardNumber || null,
      year: year || null,
      condition,
      is_graded: isGraded,
      grading_company: isGraded ? gradingCompany : null,
      grade: isGraded ? grade : null,
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
         seller:profiles!auctions_seller_id_fkey ( alias ) )`
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
