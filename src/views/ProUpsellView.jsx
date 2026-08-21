import { ArrowLeft, Trophy, ShieldCheck } from "lucide-react";

// Vista: Hazte Pro / Tu tienda (suscripciones vía Mercado Pago)
const PRO_MONTHLY_URL = "https://mpago.la/1oVDGLy";
const PRO_ANNUAL_URL = "https://mpago.la/2rpDwv9";
const STORE_ANNUAL_URL = "https://mpago.la/2LPFpW5";

export default function ProUpsellView({ onBack, onOpenSuggestions }) {
  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">HAZTE PRO</p>
      </header>

      <div className="space-y-5 px-5 pt-6">
        <div className="rounded-lg border-2 border-gold/50 bg-gold/10 p-4">
          <p className="flex items-center gap-1.5 text-[15px] font-extrabold text-ink">
            <Trophy size={16} className="text-gold-dark" /> Cuenta Pro
          </p>
          <ul className="mt-2.5 space-y-1.5 text-[13px] text-ink">
            <li>✓ Insignia "Vendedor Verificado" en tus publicaciones y tu perfil</li>
            <li>✓ Publicá lotes de hasta 10 cartas en una sola publicación</li>
            <li>✓ Más confianza para tus compradores</li>
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={PRO_MONTHLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border-2 border-gold-dark bg-white py-2.5 text-center text-[12px] font-extrabold text-gold-dark transition hover:bg-gold/10"
            >
              Mensual
              <br />
              $10.000/mes
            </a>
            <a
              href={PRO_ANNUAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gold py-2.5 text-center text-[12px] font-extrabold text-forest-deep transition hover:bg-gold-glow"
            >
              Anual (ahorrás 2 meses)
              <br />
              $100.000/año
            </a>
          </div>
        </div>

        <div className="rounded-lg border-2 border-plum/40 bg-plum/10 p-4">
          <p className="flex items-center gap-1.5 text-[15px] font-extrabold text-ink">
            <ShieldCheck size={16} className="text-plum" /> Tu tienda en Ciudad Azulona
          </p>
          <ul className="mt-2.5 space-y-1.5 text-[13px] text-ink">
            <li>✓ Aparecés en el banner rotativo de la página principal</li>
            <li>✓ Listado en la sección "Vendedores garantizados"</li>
            <li>✓ Alcance a toda la comunidad de compradores</li>
          </ul>
          <a
            href={STORE_ANNUAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-lg bg-plum py-2.5 text-center text-[12px] font-extrabold text-cream transition hover:brightness-110"
          >
            Sumar mi tienda — $75.000/año
          </a>
        </div>

        <div className="rounded-lg border-2 border-line bg-paper p-3.5">
          <p className="text-[12px] leading-relaxed text-ink-soft">
            Después de pagar, mandanos el comprobante por{" "}
            <button onClick={onOpenSuggestions} className="font-bold text-forest-deep underline underline-offset-2">
              Sugerencias
            </button>{" "}
            para activar tu cuenta o tu tienda — por ahora la activación la hacemos a mano.
          </p>
        </div>
      </div>
    </div>
  );
}
