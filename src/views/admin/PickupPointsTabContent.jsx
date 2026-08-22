import { useState } from "react";

export default function PickupPointsTabContent({ points, onCreate, createBusy, createError, onToggleActive, onDelete, busyId }) {
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[11px] font-bold text-ink-soft";

  async function handleCreate() {
    const ok = await onCreate({ city, name, details });
    if (ok) {
      setCity("");
      setName("");
      setDetails("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-line bg-paper p-3">
        <p className="text-[12px] font-extrabold text-ink">Agregar punto de retiro</p>
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Ciudad</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej: Córdoba" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Nombre del punto</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Plaza San Martín" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Detalle (opcional)</label>
            <input
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Ej: sábados de tarde, esquina con Rivadavia"
              className={inputClass}
            />
          </div>
          {createError && <p className="text-[11px] text-[#B9432C]">{createError}</p>}
          <button
            onClick={handleCreate}
            disabled={!city || !name || createBusy}
            className="w-full rounded-lg bg-gold py-2 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
          >
            {createBusy ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {points.map((p) => (
          <div key={p.id} className={`rounded-lg border-2 p-3 ${p.is_active ? "border-line bg-paper" : "border-line bg-cream-dark/40 opacity-70"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-plum">{p.city}</p>
                <p className="text-[13px] font-extrabold text-ink">{p.name}</p>
                {p.details && <p className="text-[11px] text-ink-soft">{p.details}</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  onClick={() => onToggleActive(p.id, !p.is_active)}
                  disabled={busyId === p.id}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-40 ${
                    p.is_active ? "border-2 border-line text-ink-soft" : "bg-forest-mid text-paper"
                  }`}
                >
                  {p.is_active ? "Ocultar" : "Activar"}
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  disabled={busyId === p.id}
                  className="rounded-lg border-2 border-[#B9432C]/40 px-2.5 py-1 text-[11px] font-bold text-[#B9432C] disabled:opacity-40"
                >
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
        {points.length === 0 && <p className="text-[12px] text-ink-soft">Todavía no cargaste ningún punto de retiro.</p>}
      </div>
    </div>
  );
}
