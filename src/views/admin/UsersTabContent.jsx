export default function UsersTabContent({ profiles, onSuspend, busyId, onSetPremium, premiumBusyId }) {
  return (
    <div className="space-y-2">
      {profiles.map((p) => (
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
    </div>
  );
}
