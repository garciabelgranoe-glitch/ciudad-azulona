import { ArrowLeft } from "lucide-react";

export default function WhatsappCommunitiesView({ communities, onBack }) {
  const active = communities.filter((c) => c.is_active);
  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">COMUNIDADES</p>
      </header>

      <div className="px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Sumate a los grupos de WhatsApp de la comunidad para coordinar entregas, avisos y charla general.
        </p>

        {active.length === 0 ? (
          <p className="mt-4 text-[12px] text-ink-soft">Todavía no hay comunidades cargadas.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {active.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border-2 border-forest-mid/40 bg-forest-mid/10 p-3.5 transition hover:border-forest-mid"
              >
                <p className="text-[14px] font-extrabold text-ink">{c.name}</p>
                {c.description && <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{c.description}</p>}
                <p className="mt-1.5 text-[11px] font-bold text-forest-deep underline underline-offset-2">Unirme →</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
