// Mini ícono pixel-art de una Pokédex — diseño propio (caja roja, lente
// azul, pantallita), solo evoca la estética retro de la franquicia.

const RED = "#E05B3D";
const INK = "#20291C";
const BLUE = "#4A8FD9";
const PAPER = "#FBF7EC";
const GOLD = "#D9A441";
const GREEN = "#5FA872";

export default function PokedexIcon({ size = 16 }) {
  return (
    <svg
      viewBox="0 0 14 14"
      width={size}
      height={size}
      className="inline-block shrink-0"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    >
      <rect x="0.5" y="0.5" width="13" height="13" rx="2" fill={RED} stroke={INK} strokeWidth="1" />
      <rect x="6" y="0.5" width="1" height="13" fill={INK} />

      <rect x="1.5" y="2" width="4" height="4" rx="2" fill={BLUE} stroke={INK} strokeWidth="0.6" />
      <rect x="2.3" y="2.7" width="1.2" height="1.2" rx="0.6" fill={PAPER} />

      <rect x="1.5" y="7.3" width="1.4" height="1.4" rx="0.7" fill={GOLD} />
      <rect x="3.3" y="7.3" width="1.4" height="1.4" rx="0.7" fill={GREEN} />

      <rect x="7.5" y="2" width="5" height="7" rx="0.6" fill={PAPER} stroke={INK} strokeWidth="0.5" />
      <rect x="8.3" y="4" width="3.4" height="0.8" fill={INK} opacity="0.4" />
      <rect x="8.3" y="6" width="3.4" height="0.8" fill={INK} opacity="0.4" />

      <rect x="1.5" y="10.5" width="9.8" height="1.6" rx="0.8" fill={INK} opacity="0.15" />
    </svg>
  );
}
