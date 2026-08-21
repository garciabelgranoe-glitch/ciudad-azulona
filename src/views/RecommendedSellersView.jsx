import { ArrowLeft, Trophy, MessageCircle } from "lucide-react";

// Vista: Vendedores recomendados (pública)
export default function RecommendedSellersView({ sellers, onBack }) {
  const active = sellers.filter((s) => s.is_active);
  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">VENDEDORES GARANTIZADOS</p>
      </header>

      <div className="px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Vendedores garantizados de productos oficiales: comercios de confianza para comprar packs y colecciones originales, sellados y verificados, fuera de las subastas de la comunidad.
        </p>

        {active.length === 0 ? (
          <p className="mt-4 text-[12px] text-ink-soft">Todavía no hay comercios recomendados cargados.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {active.map((s) => (
              <div key={s.id} className="flex gap-3 rounded-lg border-2 border-gold/50 bg-gold/10 p-3.5">
                {s.photo_url && (
                  <img src={s.photo_url} alt="" className="h-16 w-16 shrink-0 rounded-lg border-2 border-gold/40 object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[14px] font-extrabold text-ink">
                    <Trophy size={13} className="shrink-0 text-gold-dark" /> {s.business_name}
                  </p>
                  {s.description && <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{s.description}</p>}
                  {s.contact_info && <p className="mt-1.5 text-[12px] font-bold text-forest-deep">{s.contact_info}</p>}
                  {s.whatsapp_url && (
                    <a
                      href={s.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold text-[#128C4A] underline underline-offset-2"
                    >
                      <MessageCircle size={12} /> Escribir por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
