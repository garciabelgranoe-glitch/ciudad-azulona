import { useState } from "react";
import { Search } from "lucide-react";

export default function UsersTabContent({ profiles, onSuspend, busyId, onSetPremium, premiumBusyId }) {
  const [search, setSearch] = useState("");
  const filtered = search
    ? profiles.filter((p) => p.alias.toLowerCase().includes(search.toLowerCase()))
    : profiles;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por alias..."
          className="w-full rounded-lg border-2 border-line bg-white py-2 pl-9 pr-3 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((p) => (
          <div
            key={p.id}
            className={`flex items-center justify-between gap-2 rounded-lg border-2 p-3 ${
              p.is_suspended ? "border-[#B9432C]/30 bg-[#FBE6E0]" : "border-line bg-paper"
            }`}
          >
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-extrabold text-ink">
                {p.alias}
                {p.is_admin && <span className="text-[9px] font-bold text-gold-dark">ADMIN</span>}
                {p.is_premium && <span className="text-[9px] font-bold text-gold-dark">PREMIUM</span>}
                {p.is_suspended && <span className="text-[9px] font-bold text-[#B9432C]">SUSPENDIDO</span>}
              </p>
              <p className="text-[11px] text-ink-soft">
                {p.sales_count} ventas · {p.purchases_count} compras · {Number(p.rating_avg).toFixed(1)}★
              </p>
            </div>
            {!p.is_admin && (
              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  onClick={() => onSetPremium(p.id, !p.is_premium)}
                  disabled={premiumBusyId === p.id}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold disabled:opacity-40 ${
                    p.is_premium ? "bg-gold text-forest-deep" : "border-2 border-gold/50 text-gold-dark"
                  }`}
                >
                  {p.is_premium ? "Quitar premium" : "Hacer premium"}
                </button>
                <button
                  onClick={() => onSuspend(p.id, !p.is_suspended)}
                  disabled={busyId === p.id}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold disabled:opacity-40 ${
                    p.is_suspended ? "bg-forest-mid text-paper" : "border-2 border-[#B9432C]/40 text-[#B9432C]"
                  }`}
                >
                  {p.is_suspended ? "Reactivar" : "Suspender"}
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-[12px] text-ink-soft">No hay usuarios que coincidan con la búsqueda.</p>}
      </div>
    </div>
  );
}
