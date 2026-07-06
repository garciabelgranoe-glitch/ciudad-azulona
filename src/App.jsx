import { useState, useEffect, useMemo } from "react";
import { Clock, Check, QrCode, ArrowLeft, Plus, ShieldCheck, Star, X, LogOut } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import Login from "./components/Login";
import {
  listLiveAuctions,
  subscribeToLiveAuctions,
  placeBid,
  uploadAuctionPhoto,
  createAuction,
  auctionToVM,
  listMyTickets,
  ticketToVM,
  redeemTicket,
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
    closesInMin: 42,
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
    closesInMin: 8,
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
    closesInMin: 120,
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

function formatCountdown(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

// ---------------------------------------------
// Componentes pequeños
// ---------------------------------------------

function Pill({ children, tone = "default" }) {
  const tones = {
    default: "bg-[#242832] text-[#B9BCC4] border-[#33384444]",
    live: "bg-[#1F6F5C]/20 text-[#4FBF9F] border-[#1F6F5C]/40",
    urgent: "bg-[#B5462F]/20 text-[#E38166] border-[#B5462F]/40",
    gold: "bg-[#C9A34E]/15 text-[#D9BB74] border-[#C9A34E]/40",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

function SellerBadge({ name, rating, sales }) {
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-[#9A9DA6]">
      <span className="font-medium text-[#D5D7DC]">{name}</span>
      <span className="flex items-center gap-0.5 text-[#D9BB74]">
        <Star size={11} fill="currentColor" strokeWidth={0} />
        {rating.toFixed(1)}
      </span>
      <span>· {sales} ventas</span>
    </div>
  );
}

function CardArt({ label, photoUrl }) {
  if (photoUrl) {
    return (
      <div className="relative aspect-[5/7] w-full overflow-hidden rounded-lg border border-[#3A3F4B] bg-[#14161A]">
        <img src={photoUrl} alt={label} className="h-full w-full object-cover" />
      </div>
    );
  }
  // Placeholder visual con proporción de carta TCG (aprox 2.5:3.5)
  return (
    <div className="relative aspect-[5/7] w-full overflow-hidden rounded-lg border border-[#3A3F4B] bg-gradient-to-br from-[#1B1E24] via-[#20242C] to-[#14161A]">
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: "repeating-linear-gradient(115deg, rgba(201,163,78,0.08) 0px, rgba(201,163,78,0.08) 2px, transparent 2px, transparent 14px)"
      }} />
      <div className="absolute inset-3 rounded-md border border-[#C9A34E]/25" />
      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
        <span className="text-[11px] uppercase tracking-[0.15em] text-[#6B6F79]">{label}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Lista de subastas
// ---------------------------------------------
function AuctionList({ auctions, onOpen, onCreate }) {
  return (
    <div className="pb-24">
      <header className="sticky top-0 z-10 border-b border-[#2A2E36] bg-[#14161A]/95 px-5 pb-4 pt-6 backdrop-blur">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A34E]">Subastas en vivo</p>
            <h1 className="mt-1 font-display text-2xl text-[#F2EFE9]">Mesa del evento</h1>
          </div>
          <Pill tone="live">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4FBF9F]" /> {auctions.length} activas
          </Pill>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 px-5 pt-4">
        {auctions.map((a) => (
          <button
            key={a.id}
            onClick={() => onOpen(a)}
            className="group flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A34E] rounded-xl"
          >
            <CardArt label={a.card} photoUrl={a.photoUrl} />
            <div className="mt-2 space-y-1">
              <p className="line-clamp-2 text-[13px] font-medium leading-tight text-[#F2EFE9]">{a.card}</p>
              <SellerBadge name={a.seller} rating={a.sellerRating} sales={a.sellerSales} />
              <div className="flex items-center justify-between pt-1">
                <span className="font-display text-[15px] text-[#D9BB74]">{formatARS(a.currentBid)}</span>
                <span className={`flex items-center gap-1 text-[11px] ${a.closesInMin <= 10 ? "text-[#E38166]" : "text-[#9A9DA6]"}`}>
                  <Clock size={11} /> {formatCountdown(a.closesInMin)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onCreate}
        className="fixed bottom-6 right-5 flex items-center gap-2 rounded-full bg-[#C9A34E] px-5 py-3.5 text-[13px] font-semibold text-[#14161A] shadow-lg shadow-black/40 transition hover:bg-[#D9BB74] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2EFE9]"
      >
        <Plus size={16} strokeWidth={2.5} /> Publicar carta
      </button>
    </div>
  );
}

// ---------------------------------------------
// Vista: Detalle de subasta + pujar
// ---------------------------------------------
function AuctionDetail({ auction, onBack, onWin, onBid, bidError, bidBusy, isMine }) {
  const [bid, setBid] = useState(auction.currentBid + 1000);
  const [placed, setPlaced] = useState(false);
  const [confirmedBid, setConfirmedBid] = useState(null);
  const minBid = auction.currentBid + 1000;

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
    <div className="pb-10">
      <header className="flex items-center gap-3 border-b border-[#2A2E36] px-5 py-4">
        <button onClick={onBack} className="text-[#9A9DA6] hover:text-[#F2EFE9] focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A34E]">Detalle de subasta</p>
      </header>

      <div className="px-5 pt-5">
        <div className="mx-auto w-40">
          <CardArt label={auction.card} photoUrl={auction.photoUrl} />
        </div>

        <h2 className="mt-4 font-display text-xl text-[#F2EFE9]">{auction.card}</h2>
        <div className="mt-1"><SellerBadge name={auction.seller} rating={auction.sellerRating} sales={auction.sellerSales} /></div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[#2A2E36] bg-[#1B1E24] p-3">
            <p className="text-[11px] text-[#9A9DA6]">Puja actual</p>
            <p className="mt-0.5 font-display text-lg text-[#D9BB74]">{formatARS(auction.currentBid)}</p>
            <p className="text-[11px] text-[#6B6F79]">{auction.bids} pujas</p>
          </div>
          <div className="rounded-lg border border-[#2A2E36] bg-[#1B1E24] p-3">
            <p className="text-[11px] text-[#9A9DA6]">Cierra en</p>
            <p className={`mt-0.5 font-display text-lg ${auction.closesInMin <= 10 ? "text-[#E38166]" : "text-[#F2EFE9]"}`}>
              {formatCountdown(auction.closesInMin)}
            </p>
            <p className="text-[11px] text-[#6B6F79]">Base: {formatARS(auction.basePrice)}</p>
          </div>
        </div>

        {isMine ? (
          <p className="mt-6 rounded-xl border border-[#2A2E36] bg-[#1B1E24] p-4 text-[12px] text-[#9A9DA6]">
            Esta es tu publicación — no podés pujar en tu propia carta.
          </p>
        ) : !placed ? (
          <div className="mt-6 rounded-xl border border-[#2A2E36] bg-[#1B1E24] p-4">
            <p className="text-[12px] text-[#9A9DA6]">Tu puja (mínimo {formatARS(minBid)})</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={bid}
                min={minBid}
                step={1000}
                onChange={(e) => setBid(Number(e.target.value))}
                className="w-full rounded-lg border border-[#3A3F4B] bg-[#14161A] px-3 py-2.5 text-[15px] text-[#F2EFE9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A34E]"
              />
              <button
                onClick={handleBid}
                disabled={bid < minBid || bidBusy}
                className="shrink-0 rounded-lg bg-[#C9A34E] px-4 py-2.5 text-[13px] font-semibold text-[#14161A] transition hover:bg-[#D9BB74] disabled:opacity-40"
              >
                Pujar
              </button>
            </div>
            {bidError && <p className="mt-2 text-[12px] text-[#E38166]">{bidError}</p>}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-[#1F6F5C]/40 bg-[#1F6F5C]/10 p-4">
            <p className="flex items-center gap-2 text-[13px] font-medium text-[#4FBF9F]">
              <Check size={15} /> Pujaste {formatARS(confirmedBid)}
            </p>
            <p className="mt-1 text-[12px] text-[#9A9DA6]">Te avisamos si te superan o si ganás cuando cierre.</p>
            {!onBid && (
              <button
                onClick={() => onWin({ ...auction, currentBid: confirmedBid })}
                className="mt-3 text-[12px] font-medium text-[#D9BB74] underline underline-offset-2"
              >
                (Demo) Simular cierre — gané la subasta →
              </button>
            )}
          </div>
        )}

        <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-[#6B6F79]">
          <ShieldCheck size={14} className="mt-0.5 shrink-0" />
          El pago se hace en persona en el stand del vendedor. La plataforma no procesa dinero — solo confirma la identidad de la entrega con un código único.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Vista: Ticket de retiro (signature element)
// ---------------------------------------------
function TicketView({ ticket, onBack, onMarkDelivered, busy = false }) {
  const delivered = ticket.status === "entregado";
  return (
    <div className="pb-10">
      <header className="flex items-center gap-3 border-b border-[#2A2E36] px-5 py-4">
        <button onClick={onBack} className="text-[#9A9DA6] hover:text-[#F2EFE9] focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A34E]">Comprobante de retiro</p>
      </header>

      <div className="px-5 pt-6">
        {/* Ticket con borde perforado */}
        <div className="relative mx-auto max-w-sm">
          <div className="rounded-t-2xl border border-b-0 border-[#3A3F4B] bg-[#1B1E24] p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6F79]">
                {ticket.isSeller ? "Vendiste esta carta" : "Ganaste esta carta"}
              </p>
              {delivered ? <Pill tone="live"><Check size={11} /> Entregado</Pill> : <Pill tone="gold">Pendiente de retiro</Pill>}
            </div>
            <h3 className="mt-3 font-display text-lg text-[#F2EFE9]">{ticket.card}</h3>
            <p className="mt-1 text-[13px] text-[#9A9DA6]">Vendedor: <span className="text-[#D5D7DC]">{ticket.seller}</span></p>
            <p className="text-[13px] text-[#9A9DA6]">Precio final: <span className="font-medium text-[#D9BB74]">{formatARS(ticket.price)}</span></p>
            <p className="mt-1 text-[11px] text-[#6B6F79]">Cerrado {ticket.closedAt}</p>
          </div>

          {/* Perforación */}
          <div className="relative h-0 border-t border-dashed border-[#3A3F4B]">
            <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#0F1115]" />
            <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#0F1115]" />
          </div>

          <div className="flex flex-col items-center rounded-b-2xl border border-t-0 border-[#3A3F4B] bg-[#1B1E24] p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6F79]">Código de retiro</p>
            <p className="mt-2 font-display text-4xl tracking-[0.1em] text-[#F2EFE9]">{ticket.code}</p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#6B6F79]">
              <QrCode size={13} /> Mostrá este código en el stand del vendedor
            </div>
          </div>
        </div>

        {!delivered && (ticket.isSeller || ticket.isSeller === undefined) && (
          <button
            onClick={onMarkDelivered}
            disabled={busy}
            className="mx-auto mt-6 block rounded-lg bg-[#C9A34E] px-5 py-3 text-[13px] font-semibold text-[#14161A] transition hover:bg-[#D9BB74] disabled:opacity-40"
          >
            {busy ? "Confirmando..." : "Vendedor: confirmar entrega"}
          </button>
        )}
        {!delivered && ticket.isSeller === false && (
          <p className="mx-auto mt-6 max-w-sm text-center text-[12px] text-[#6B6F79]">
            Mostrale este código al vendedor cuando vayas a retirar la carta.
          </p>
        )}

        <p className="mx-auto mt-5 max-w-sm text-center text-[12px] leading-relaxed text-[#6B6F79]">
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
  const [duration, setDuration] = useState(60);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  function handlePhotoChange(e) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div className="pb-10">
      <header className="flex items-center gap-3 border-b border-[#2A2E36] px-5 py-4">
        <button onClick={onBack} className="text-[#9A9DA6] hover:text-[#F2EFE9] focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A34E]">Nueva publicación</p>
      </header>

      <div className="space-y-4 px-5 pt-6">
        {showDuration && (
          <div>
            <label className="text-[12px] text-[#9A9DA6]">Foto de la carta</label>
            <label className="mt-1.5 flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#3A3F4B] bg-[#1B1E24] text-[11px] text-[#6B6F79]">
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
              ) : (
                "Sacar foto"
              )}
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
        )}
        <div>
          <label className="text-[12px] text-[#9A9DA6]">Nombre de la carta</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Gengar VMAX Alt Art"
            className="mt-1.5 w-full rounded-lg border border-[#3A3F4B] bg-[#1B1E24] px-3 py-2.5 text-[14px] text-[#F2EFE9] placeholder:text-[#5A5E68] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A34E]"
          />
        </div>
        <div>
          <label className="text-[12px] text-[#9A9DA6]">Precio base</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="mt-1.5 w-full rounded-lg border border-[#3A3F4B] bg-[#1B1E24] px-3 py-2.5 text-[14px] text-[#F2EFE9] placeholder:text-[#5A5E68] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A34E]"
          />
        </div>
        {showDuration && (
          <div>
            <label className="text-[12px] text-[#9A9DA6]">Dura</label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={`rounded-lg border py-2 text-[12px] font-medium transition ${
                    duration === opt.value
                      ? "border-[#C9A34E] bg-[#C9A34E]/15 text-[#D9BB74]"
                      : "border-[#3A3F4B] text-[#9A9DA6] hover:border-[#6B6F79]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {error && <p className="text-[12px] text-[#E38166]">{error}</p>}
        <button
          disabled={!name || !price || busy}
          onClick={() => onCreate({ name, price: Number(price), durationMinutes: duration, photoFile })}
          className="w-full rounded-lg bg-[#C9A34E] py-3 text-[13px] font-semibold text-[#14161A] transition hover:bg-[#D9BB74] disabled:opacity-40"
        >
          {busy ? "Publicando..." : "Publicar subasta"}
        </button>
        <p className="text-center text-[12px] text-[#6B6F79]">
          Compartí el link en tu grupo de WhatsApp. La subasta corre acá; la entrega sigue siendo en el stand.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------
// App raíz
// ---------------------------------------------
export default function App() {
  const auth = useAuth();
  const [view, setView] = useState({ name: "list" });
  const [auctions, setAuctions] = useState(SEED_AUCTIONS);
  const [tickets, setTickets] = useState(SEED_TICKETS);
  const [realRows, setRealRows] = useState([]);
  const [auctionsLoading, setAuctionsLoading] = useState(isSupabaseConfigured);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidBusy, setBidBusy] = useState(false);
  const [realTickets, setRealTickets] = useState([]);
  const [redeemBusy, setRedeemBusy] = useState(false);

  const ready = isSupabaseConfigured && auth.session && auth.profile;

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    listLiveAuctions()
      .then((rows) => !cancelled && setRealRows(rows))
      .finally(() => !cancelled && setAuctionsLoading(false));
    const unsubscribe = subscribeToLiveAuctions((updatedRow) => {
      setRealRows((rows) => rows.map((r) => (r.id === updatedRow.id ? { ...r, ...updatedRow } : r)));
    });
    listMyTickets().then((rows) => !cancelled && setRealTickets(rows));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [ready]);

  if (isSupabaseConfigured && auth.loading) {
    return <div className="min-h-screen bg-[#14161A]" />;
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
      closesInMin: 60,
      status: "live",
    };
    setAuctions((a) => [newAuction, ...a]);
    setView({ name: "list" });
  }

  async function handleRealCreate({ name, price, durationMinutes, photoFile }) {
    setCreateBusy(true);
    setCreateError("");
    try {
      const photoUrl = photoFile ? await uploadAuctionPhoto(photoFile) : null;
      const row = await createAuction({
        sellerId: auth.session.user.id,
        cardName: name,
        basePrice: price,
        durationMinutes,
        photoUrl,
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
      setRealRows((rows) =>
        rows.map((r) => (r.id === auctionId ? { ...r, current_bid: amount, bid_count: r.bid_count + 1 } : r))
      );
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

  const activeAuction =
    view.name === "detail" ? displayAuctions.find((a) => a.id === view.auctionId) : null;
  const displayTickets = isSupabaseConfigured
    ? realTickets.map((t) => ticketToVM(t, auth.session?.user.id))
    : tickets;

  return (
    <div className="min-h-screen bg-[#14161A] font-sans text-[#F2EFE9]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .font-display { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; font-weight: 600; letter-spacing: -0.01em; }
        input:focus { outline: none; }
      `}</style>

      {!isSupabaseConfigured && (
        <div className="flex items-center justify-between bg-[#B5462F]/15 px-5 py-2 text-[11px] text-[#E38166]">
          <span>Modo demo — sin backend conectado (datos de ejemplo, no se guarda nada)</span>
        </div>
      )}

      {isSupabaseConfigured && auth.profile && view.name === "list" && (
        <div className="flex items-center justify-between px-5 pt-4 text-[12px] text-[#9A9DA6]">
          <span>Hola, <span className="text-[#F2EFE9]">{auth.profile.alias}</span></span>
          <button onClick={auth.signOut} className="flex items-center gap-1 hover:text-[#F2EFE9]">
            <LogOut size={13} /> Salir
          </button>
        </div>
      )}

      {displayTickets.length > 0 && view.name === "list" && (
        <div className="px-5 pt-4">
          <button
            onClick={() => setView({ name: "ticket", ticket: displayTickets[0] })}
            className="flex w-full items-center justify-between rounded-lg border border-[#C9A34E]/30 bg-[#C9A34E]/10 px-4 py-3 text-left"
          >
            <span className="text-[12px] text-[#D9BB74]">Tenés {displayTickets.filter(t=>t.status==="pendiente").length} carta(s) pendiente(s) de retiro</span>
            <span className="text-[12px] font-medium text-[#D9BB74]">Ver →</span>
          </button>
        </div>
      )}

      {view.name === "list" && isSupabaseConfigured && auctionsLoading && (
        <p className="px-5 pt-10 text-center text-[12px] text-[#6B6F79]">Cargando subastas...</p>
      )}

      {view.name === "list" && !(isSupabaseConfigured && auctionsLoading) && (
        <AuctionList
          auctions={displayAuctions}
          onOpen={(a) => setView({ name: "detail", auctionId: a.id })}
          onCreate={() => setView({ name: "create" })}
        />
      )}

      {view.name === "detail" && activeAuction && (
        <AuctionDetail
          auction={activeAuction}
          onBack={() => setView({ name: "list" })}
          onWin={handleWin}
          onBid={isSupabaseConfigured ? handleRealBid : undefined}
          bidError={bidError}
          bidBusy={bidBusy}
          isMine={isSupabaseConfigured && activeAuction.sellerId === auth.session?.user.id}
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
