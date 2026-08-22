import Pill from "../../components/ui/Pill";

export default function ReportsTabContent({ reports, onResolve, busyId }) {
  const open = reports.filter((r) => r.status === "open");
  const resolved = reports.filter((r) => r.status !== "open");

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
        Abiertas ({open.length})
      </h3>
      {open.length === 0 && <p className="text-[12px] text-ink-soft">No hay denuncias pendientes.</p>}
      {open.map((r) => (
        <div key={r.id} className="rounded-lg border-2 border-[#B9432C]/30 bg-[#FBE6E0] p-3">
          <p className="text-[13px] font-extrabold text-ink">{r.auction?.card_name ?? "Subasta eliminada"}</p>
          <p className="text-[11px] text-ink-soft">Vendedor: {r.auction?.seller?.alias ?? "—"}</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink">{r.reason}</p>
          <p className="mt-1 text-[10px] text-ink-soft">
            Denunciado por {r.reporter?.alias ?? "—"} · {new Date(r.created_at).toLocaleString("es-AR")}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onResolve(r.id, "resolved")}
              disabled={busyId === r.id}
              className="rounded-lg bg-forest-mid px-3 py-1.5 text-[11px] font-bold text-paper disabled:opacity-40"
            >
              Marcar resuelta
            </button>
            <button
              onClick={() => onResolve(r.id, "dismissed")}
              disabled={busyId === r.id}
              className="rounded-lg border-2 border-line px-3 py-1.5 text-[11px] font-bold text-ink-soft disabled:opacity-40"
            >
              Descartar
            </button>
          </div>
        </div>
      ))}

      {resolved.length > 0 && (
        <>
          <h3 className="mt-4 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Resueltas</h3>
          {resolved.map((r) => (
            <div key={r.id} className="rounded-lg border-2 border-line bg-paper p-3 opacity-70">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-extrabold text-ink">{r.auction?.card_name ?? "Subasta eliminada"}</p>
                <Pill tone={r.status === "resolved" ? "live" : "default"}>
                  {r.status === "resolved" ? "Resuelta" : "Descartada"}
                </Pill>
              </div>
              <p className="mt-1 text-[12px] text-ink-soft">{r.reason}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
