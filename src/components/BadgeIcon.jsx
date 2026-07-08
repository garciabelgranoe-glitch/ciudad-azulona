// Íconos propios para las medallas — bola genérica de dos tonos con
// banda central (el mismo lenguaje visual que PokeballIcon, con distinta
// paleta por tier) y una cinta para la medalla de reputación. Formas y
// colores genéricos, sin logos ni personajes de terceros.

function PokeballGlyph({ top, bottom, band = "#20291C", centerShape = "circle" }) {
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%">
      <circle cx="16" cy="16" r="14" fill={bottom} stroke="#20291C" strokeWidth="1.5" />
      <path d="M2 16 A14 14 0 0 1 30 16 Z" fill={top} stroke="#20291C" strokeWidth="1.5" />
      <rect x="1.5" y="14" width="29" height="4" fill={band} />
      {centerShape === "diamond" ? (
        <rect x="12" y="12" width="8" height="8" transform="rotate(45 16 16)" fill="#F3C868" stroke="#20291C" strokeWidth="1.2" />
      ) : (
        <>
          <circle cx="16" cy="16" r="5" fill="#FBF7EC" stroke="#20291C" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="2.2" fill={band} />
        </>
      )}
    </svg>
  );
}

function RibbonGlyph() {
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%">
      <path d="M16 15 L6 27 L11 25 L14 30 L16 20 Z" fill="#B9862F" stroke="#20291C" strokeWidth="1" />
      <path d="M16 15 L26 27 L21 25 L18 30 L16 20 Z" fill="#D9A441" stroke="#20291C" strokeWidth="1" />
      <circle cx="16" cy="13" r="8" fill="#F3C868" stroke="#20291C" strokeWidth="1.5" />
      <circle cx="16" cy="13" r="4" fill="#B9862F" />
    </svg>
  );
}

const VARIANTS = {
  pokeball_red: <PokeballGlyph top="#E05B3D" bottom="#FBF7EC" />,
  pokeball_blue: <PokeballGlyph top="#2E8B8B" bottom="#FBF7EC" />,
  pokeball_black: <PokeballGlyph top="#20291C" bottom="#F3C868" band="#20291C" />,
  pokeball_purple: <PokeballGlyph top="#5B4C87" bottom="#E7D9F2" centerShape="diamond" />,
  ribbon_gold: <RibbonGlyph />,
};

export default function BadgeIcon({ icon, size = 32 }) {
  const glyph = VARIANTS[icon];
  if (!glyph) return null;
  return <div style={{ width: size, height: size }}>{glyph}</div>;
}
