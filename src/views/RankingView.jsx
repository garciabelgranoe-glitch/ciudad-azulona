import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import GenderIcon from "../components/GenderIcon";
import { formatARS, formatPrice } from "../lib/format";

// Vista: Ranking (top 10 vendedores y top 10 compradores, por separado)
export default function RankingView({ topSellers, topBuyers, onBack, onOpenUserProfile }) {
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
