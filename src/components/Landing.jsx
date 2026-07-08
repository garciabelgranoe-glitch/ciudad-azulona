import PokeballIcon from "./PokeballIcon";
import PixelTrees from "./PixelTrees";
import FeatureIcon from "./FeatureIcon";

function FeatureRow({ variant, text }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <FeatureIcon variant={variant} size={20} />
      <span className="text-[12.5px] font-medium text-cream/80">{text}</span>
    </div>
  );
}

export default function Landing({ onEnter, onOpenLegal }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-forest-deeper via-forest-deep to-forest-mid">
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-32 pt-16 text-center">
        <PokeballIcon size={34} />
        <h1 className="font-pixel mt-5 text-[16px] leading-relaxed tracking-wide text-gold sm:text-[20px]">
          CIUDAD AZULONA
        </h1>
        <p className="mt-4 max-w-xs text-[14px] font-medium leading-relaxed text-cream/90">
          El punto de encuentro para subastar y coleccionar cartas Pokémon TCG con la comunidad Argentina.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <FeatureRow variant="bolt" text="Subastas en vivo con cierre automático" />
          <FeatureRow variant="trade" text="Coordinás la entrega en persona, vos manejás el pago" />
          <FeatureRow variant="medal" text="Reputación y medallas por tus ventas" />
        </div>

        <button
          onClick={onEnter}
          className="mt-10 rounded-lg bg-gold px-10 py-3.5 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)]"
        >
          Entrar
        </button>

        {onOpenLegal && (
          <button
            onClick={onOpenLegal}
            className="mt-6 text-[11px] font-medium text-cream/60 underline underline-offset-2"
          >
            Términos de uso y privacidad
          </button>
        )}
      </div>

      <PixelTrees />
    </div>
  );
}
