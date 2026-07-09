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

function StoreGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="100%" height="100%">
      <polygon points="2,9 18,9 16,3 4,3" fill="#B9432C" stroke="#20291C" strokeWidth="1" strokeLinejoin="round" />
      <rect x="3" y="9" width="14" height="9" fill="#F3C868" stroke="#20291C" strokeWidth="1" />
      <rect x="8" y="12" width="4" height="6" fill="#2E8B8B" stroke="#20291C" strokeWidth="0.8" />
    </svg>
  );
}

function GiftGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="100%" height="100%">
      <path
        d="M10 6 C7 6 6 3 8 2 C9.5 1.5 10 4 10 6 Z"
        fill="#B9432C"
        stroke="#20291C"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <path
        d="M10 6 C13 6 14 3 12 2 C10.5 1.5 10 4 10 6 Z"
        fill="#B9432C"
        stroke="#20291C"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <rect x="2" y="6" width="16" height="4" fill="#F3C868" stroke="#20291C" strokeWidth="1" />
      <rect x="3" y="10" width="14" height="8" fill="#2E8B8B" stroke="#20291C" strokeWidth="1" />
      <rect x="8.5" y="6" width="3" height="12" fill="#D9A441" stroke="#20291C" strokeWidth="0.8" />
    </svg>
  );
}

function NewsGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="100%" height="100%">
      <rect x="3" y="2" width="14" height="16" fill="#F3C868" stroke="#20291C" strokeWidth="1" />
      <rect x="5" y="5" width="10" height="2" fill="#20291C" opacity="0.65" />
      <rect x="5" y="8.5" width="10" height="1.4" fill="#2E8B8B" />
      <rect x="5" y="11" width="10" height="1.4" fill="#2E8B8B" />
      <rect x="5" y="13.5" width="6" height="1.4" fill="#B9432C" />
    </svg>
  );
}

const VARIANTS = {
  bolt: BoltGlyph,
  trade: TradeGlyph,
  medal: MedalGlyph,
  store: StoreGlyph,
  gift: GiftGlyph,
  news: NewsGlyph,
};

export default function FeatureIcon({ variant, size = 18 }) {
  const Glyph = VARIANTS[variant];
  if (!Glyph) return null;
  return (
    <div style={{ width: size, height: size }} className="shrink-0">
      <Glyph />
    </div>
  );
}
