import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { getAdminDailyMetrics } from "../../lib/auctions";
import { formatPrice } from "../../lib/format";
import MiniBarChart from "../../components/ui/MiniBarChart";

export default function MetricsTabContent() {
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
