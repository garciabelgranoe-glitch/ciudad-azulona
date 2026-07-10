export const config = {
  matcher: "/subasta/:path*",
};

const BOT_UA =
  /facebookexternalhit|WhatsApp|Twitterbot|Slackbot|TelegramBot|LinkedInBot|Discordbot|Pinterest|SkypeUriPreview|redditbot|Googlebot|Bingbot|vkShare/i;

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function formatARS(n) {
  return Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default async function middleware(request) {
  const ua = request.headers.get("user-agent") || "";
  if (!BOT_UA.test(ua)) return;

  // WhatsApp's in-app browser (used when a real person taps the link) also
  // includes "WhatsApp" in its User-Agent — only its link-preview crawler
  // fetch should get the static OG page. Real browser navigations (including
  // that in-app browser) always send Fetch Metadata headers like
  // sec-fetch-mode; bare bot HTTP clients don't. This tells them apart
  // without ever intercepting an actual visitor.
  if (request.headers.get("sec-fetch-mode")) return;

  const url = new URL(request.url);
  const match = url.pathname.match(/^\/subasta\/([^/]+)\/?$/);
  if (!match) return;

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/auctions?id=eq.${match[1]}&select=card_name,current_bid,photo_urls,status`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
    );
    const rows = await res.json();
    const auction = rows[0];
    if (!auction) return;

    const title = auction.card_name ? `${auction.card_name} — Ciudad Azulona` : "Ciudad Azulona — Subastas";
    const priceLabel = auction.status === "closed" ? "Cerró en" : "Puja actual";
    const description =
      auction.current_bid != null
        ? `${priceLabel}: ${formatARS(auction.current_bid)} · Subasta de cartas Pokémon TCG en Ciudad Azulona`
        : "Subasta de cartas Pokémon TCG en Ciudad Azulona";
    const image = auction.photo_urls?.[0] || "https://www.ciudadazulona.com/og-default.png";

    const html = `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:url" content="${escapeHtml(url.toString())}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
</head><body></body></html>`;

    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  } catch {
    return;
  }
}
