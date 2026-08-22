import { useState } from "react";

export default function WhatsappCommunitiesTabContent({ communities, onCreate, createBusy, createError, onToggleActive, onDelete, busyId }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[11px] font-bold text-ink-soft";

  async function handleCreate() {
    const ok = await onCreate({ name, description, url });
    if (ok) {
      setName("");
      setDescription("");
      setUrl("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-line bg-paper p-3">
        <p className="text-[12px] font-extrabold text-ink">Agregar comunidad</p>
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Grupo general de la comunidad"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Link de invitación (chat.whatsapp.com/...)</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} />
          </div>
          {createError && <p className="text-[11px] text-[#B9432C]">{createError}</p>}
          <button
            onClick={handleCreate}
            disabled={!name || !url || createBusy}
            className="w-full rounded-lg bg-gold py-2 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
          >
            {createBusy ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {communities.map((c) => (
          <div key={c.id} className={`rounded-lg border-2 p-3 ${c.is_active ? "border-line bg-paper" : "border-line bg-cream-dark/40 opacity-70"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold text-ink">{c.name}</p>
                {c.description && <p className="text-[11px] text-ink-soft">{c.description}</p>}
                <p className="line-clamp-1 text-[11px] font-bold text-forest-deep">{c.url}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  onClick={() => onToggleActive(c.id, !c.is_active)}
                  disabled={busyId === c.id}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-40 ${
                    c.is_active ? "border-2 border-line text-ink-soft" : "bg-forest-mid text-paper"
                  }`}
                >
                  {c.is_active ? "Ocultar" : "Activar"}
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  disabled={busyId === c.id}
                  className="rounded-lg border-2 border-[#B9432C]/40 px-2.5 py-1 text-[11px] font-bold text-[#B9432C] disabled:opacity-40"
                >
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
        {communities.length === 0 && <p className="text-[12px] text-ink-soft">Todavía no cargaste ninguna comunidad.</p>}
      </div>
    </div>
  );
}
