// Íconos pixel-art propios para los features de la landing, en vez de
// emojis genéricos — mismo lenguaje visual bloque + borde oscuro que
// PokeballIcon/BadgeIcon/GenderIcon.

function BoltGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="100%" height="100%">
      <polygon
        points="11,1 4,11 9,11 8,19 16,8 11,8"
        fill="#D9A441"
        stroke="#20291C"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TradeGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="100%" height="100%">
      <rect x="2" y="5" width="12" height="3" fill="#2E8B8B" stroke="#20291C" strokeWidth="1" />
      <polygon points="14,3 18,6.5 14,10" fill="#2E8B8B" stroke="#20291C" strokeWidth="1" strokeLinejoin="round" />
      <rect x="6" y="12" width="12" height="3" fill="#B9432C" stroke="#20291C" strokeWidth="1" />
      <polygon points="6,10 2,13.5 6,17" fill="#B9432C" stroke="#20291C" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

function MedalGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="100%" height="100%">
      <path d="M10 9 L4 18 L7.5 16.5 L9 20 L10 13 Z" fill="#B9862F" stroke="#20291C" strokeWidth="0.8" />
      <path d="M10 9 L16 18 L12.5 16.5 L11 20 L10 13 Z" fill="#D9A441" stroke="#20291C" strokeWidth="0.8" />
      <circle cx="10" cy="7.5" r="6" fill="#F3C868" stroke="#20291C" strokeWidth="1.2" />
      <circle cx="10" cy="7.5" r="3" fill="#B9862F" />
    </svg>
  );
}

const VARIANTS = { bolt: BoltGlyph, trade: TradeGlyph, medal: MedalGlyph };

export default function FeatureIcon({ variant, size = 18 }) {
  const Glyph = VARIANTS[variant];
  if (!Glyph) return null;
  return (
    <div style={{ width: size, height: size }} className="shrink-0">
      <Glyph />
    </div>
  );
}
