import { supabase } from "./supabaseClient";

const AUCTION_SELECT = `
  id, card_name, photo_url, base_price, current_bid, bid_count, status, closes_at, winner_id,
  seller:profiles!auctions_seller_id_fkey ( id, alias, rating_avg, sales_count )
`;

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
  const channel = supabase
    .channel("auctions-live")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "auctions" },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function auctionToVM(row) {
  const closesInMin = Math.max(0, Math.round((new Date(row.closes_at).getTime() - Date.now()) / 60000));
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
    closesInMin,
    closesAt: row.closes_at,
    status: row.status,
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

export async function uploadAuctionPhoto(file) {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("auction-photos").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("auction-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function createAuction({ sellerId, cardName, basePrice, durationMinutes, photoUrl }) {
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
