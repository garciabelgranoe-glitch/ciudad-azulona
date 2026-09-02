import { useState, useEffect, useMemo } from "react";
import { Loader2, Eye, Zap } from "lucide-react";
import { getAdminDailyMetrics } from "../../lib/auctions";
import { formatPrice } from "../../lib/format";
import MiniBarChart from "../../components/ui/MiniBarChart";

const DAY_OPTIONS = [
  { value: 7, label: "7 días" },
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
  { value: 180, label: "6 meses" },
  { value: 365, label: "1 año" },
];

const INTERACTION_SERIES = [
  { key: "bidsCount", label: "Pujas" },
  { key: "reactionsCount", label: "Reacciones" },
  { key: "favoritesCount", label: "Favoritos" },
];

export default function MetricsTabContent() {
  const [days, setDays] = useState(30);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gmvCurrency, setGmvCurrency] = useState("ARS");
  const [interactionKey, setInteractionKey] = useState("bidsCount");

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
          bidsCount: acc.bidsCount + m.bidsCount,
          reactionsCount: acc.reactionsCount + m.reactionsCount,
          favoritesCount: acc.favoritesCount + m.favoritesCount,
          pageViewsCount: acc.pageViewsCount + m.pageViewsCount,
        }),
        {
          newUsers: 0,
          newListings: 0,
          salesCount: 0,
          gmvArs: 0,
          gmvUsd: 0,
          bidsCount: 0,
          reactionsCount: 0,
          favoritesCount: 0,
          pageViewsCount: 0,
        }
      ),
    [metrics]
  );

  const conversionRate = totals.pageViewsCount > 0 ? (totals.salesCount / totals.pageViewsCount) * 100 : 0;

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

  function SummaryStat({ label, value }) {
    return (
      <div className="rounded-lg border-2 border-line bg-cream px-2.5 py-2 text-center">
        <p className="text-[15px] font-extrabold leading-none text-forest-deep">{value}</p>
        <p className="mt-1 text-[9px] font-bold uppercase leading-tight tracking-wide text-ink-soft">{label}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {DAY_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => setDays(opt.value)} className={pillClass(days === opt.value)}>
            {opt.label}
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
          {/* Estado del negocio de un vistazo */}
          <div className="rounded-lg border-2 border-gold/50 bg-gold/10 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gold-dark">
              <Zap size={12} /> Estado del negocio — últimos {days} días
            </p>
            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
              <SummaryStat label="Usuarios nuevos" value={totals.newUsers} />
              <SummaryStat label="Publicaciones" value={totals.newListings} />
              <SummaryStat label="Ventas" value={totals.salesCount} />
              <SummaryStat label="Vistas de página" value={totals.pageViewsCount.toLocaleString("es-AR")} />
              <SummaryStat label="Interacciones" value={(totals.bidsCount + totals.reactionsCount + totals.favoritesCount).toLocaleString("es-AR")} />
              <SummaryStat label="Vista → venta" value={`${conversionRate.toFixed(1)}%`} />
            </div>
          </div>

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
              formatValue={(v) => formatPrice(v, gmvCurrency)}
            />
          </Block>

          <Block
            title={`Vistas de página (${totals.pageViewsCount.toLocaleString("es-AR")})`}
          >
            <p className="mb-2 flex items-center gap-1 text-[10px] text-ink-soft">
              <Eye size={11} /> Cada cambio de pantalla cuenta como una vista — no son visitantes únicos.
            </p>
            <MiniBarChart series={metrics} valueKey="pageViewsCount" color="#2E8B8B" />
          </Block>

          <Block
            title={`Interacción — ${INTERACTION_SERIES.find((s) => s.key === interactionKey)?.label} (${totals[interactionKey].toLocaleString("es-AR")})`}
          >
            <div className="mb-2 flex flex-wrap gap-1.5">
              {INTERACTION_SERIES.map((s) => (
                <button key={s.key} onClick={() => setInteractionKey(s.key)} className={pillClass(interactionKey === s.key)}>
                  {s.label}
                </button>
              ))}
            </div>
            <MiniBarChart series={metrics} valueKey={interactionKey} color="#5FA872" />
          </Block>
        </div>
      )}
    </div>
  );
}
