import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const VIEW_LABEL = {
  render_crash: "Se rompió una pantalla (React)",
  window_error: "Error de JavaScript",
  unhandled_rejection: "Falló una operación sin manejar",
};

function ErrorRow({ e }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border-2 border-[#B9432C]/30 bg-[#FBE6E0] p-3">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-2 text-left">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#B9432C]/80">
            {VIEW_LABEL[e.view_name] ?? e.view_name ?? "Error"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[13px] font-bold text-ink">{e.message}</p>
          <p className="mt-1 text-[10px] text-ink-soft">{new Date(e.created_at).toLocaleString("es-AR")}</p>
        </div>
        {open ? <ChevronUp size={16} className="shrink-0 text-ink-soft" /> : <ChevronDown size={16} className="shrink-0 text-ink-soft" />}
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 border-t border-[#B9432C]/20 pt-2">
          {e.url && <p className="break-all text-[11px] text-ink-soft">{e.url}</p>}
          {e.stack && (
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-white/60 p-2 text-[10px] text-ink-soft">{e.stack}</pre>
          )}
          {e.user_agent && <p className="break-all text-[10px] text-ink-soft/70">{e.user_agent}</p>}
        </div>
      )}
    </div>
  );
}

export default function ErrorLogTabContent({ entries }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-ink-soft">
        Errores reales de usuarios en vivo — de JavaScript, pantallas que se rompen, u operaciones que fallan sin
        avisar. Se actualiza solo, sin recargar.
      </p>
      {entries.map((e) => (
        <ErrorRow key={e.id} e={e} />
      ))}
      {entries.length === 0 && <p className="text-[12px] text-ink-soft">Ningún error registrado. 🎉</p>}
    </div>
  );
}
