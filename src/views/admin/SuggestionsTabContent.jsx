export default function SuggestionsTabContent({ suggestions, onSetStatus, busyId }) {
  const fresh = suggestions.filter((s) => s.status === "new");
  const reviewed = suggestions.filter((s) => s.status !== "new");

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Nuevas ({fresh.length})</h3>
      {fresh.length === 0 && <p className="text-[12px] text-ink-soft">No hay sugerencias nuevas.</p>}
      {fresh.map((s) => (
        <div key={s.id} className="rounded-lg border-2 border-gold/40 bg-gold/10 p-3">
          <p className="text-[12px] leading-relaxed text-ink">{s.message}</p>
          <p className="mt-1.5 text-[10px] text-ink-soft">
            {s.user?.alias ?? "—"} · {new Date(s.created_at).toLocaleString("es-AR")}
          </p>
          <button
            onClick={() => onSetStatus(s.id, "reviewed")}
            disabled={busyId === s.id}
            className="mt-2 rounded-lg bg-forest-mid px-3 py-1.5 text-[11px] font-bold text-paper disabled:opacity-40"
          >
            Marcar leída
          </button>
        </div>
      ))}

      {reviewed.length > 0 && (
        <>
          <h3 className="mt-4 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Leídas</h3>
          {reviewed.map((s) => (
            <div key={s.id} className="rounded-lg border-2 border-line bg-paper p-3 opacity-70">
              <p className="text-[12px] text-ink">{s.message}</p>
              <p className="mt-1 text-[10px] text-ink-soft">
                {s.user?.alias ?? "—"} · {new Date(s.created_at).toLocaleString("es-AR")}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
