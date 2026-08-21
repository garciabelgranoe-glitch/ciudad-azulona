import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";

// Vista: Sugerencias (cualquier usuario puede mandar una)
export default function SuggestionsView({ onBack, onSubmit, busy = false, error = "" }) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    const ok = await onSubmit(message);
    if (ok) {
      setSent(true);
      setMessage("");
    }
  }

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">SUGERENCIAS</p>
      </header>

      <div className="px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          ¿Qué mejorarías de Ciudad Azulona? Tu mensaje lo lee directo el admin de la plataforma.
        </p>

        {sent ? (
          <div className="mt-4 rounded-xl border-2 border-forest-mid bg-forest-mid/10 p-4">
            <p className="flex items-center gap-2 text-[13px] font-bold text-forest-deep">
              <Check size={15} /> ¡Gracias! Ya la recibimos.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-3 text-[12px] font-bold text-forest-deep underline underline-offset-2"
            >
              Mandar otra
            </button>
          </div>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ej: estaría bueno poder filtrar por precio de referencia..."
              rows={5}
              className="mt-4 w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid"
            />
            {error && <p className="mt-2 text-[12px] text-[#B9432C]">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || busy}
              className="mt-3 w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
            >
              {busy ? "Enviando..." : "Enviar sugerencia"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
