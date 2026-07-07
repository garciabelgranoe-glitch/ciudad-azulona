// Fila de árboles pixel-art estilo overworld de Pokémon Fire Red, con un
// balanceo sutil e independiente por árbol (como si soplara una brisa).
// Verdes más oscuros que el fondo (forest-mid) para que las copas se
// recorten como silueta.
const TREE_GREENS = ["#173822", "#1F4A30", "#122C1C", "#254F32"];

function PixelTree({ scale, green, delay }) {
  return (
    <svg
      viewBox="0 0 24 40"
      className="h-full w-auto"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "bottom center",
        animation: "tree-sway 3.4s ease-in-out infinite",
        animationDelay: `${delay}s`,
      }}
    >
      {/* tronco */}
      <rect x="9" y="26" width="6" height="14" fill="#5A3A22" />
      {/* copa, escalonada como sprite de 8 bits */}
      <rect x="6" y="18" width="12" height="8" fill={green} />
      <rect x="3" y="10" width="18" height="8" fill={green} />
      <rect x="0" y="0" width="24" height="10" fill={green} />
      {/* luz simple arriba a la izquierda de cada bloque */}
      <rect x="6" y="18" width="4" height="8" fill="rgba(255,255,255,0.12)" />
      <rect x="3" y="10" width="4" height="8" fill="rgba(255,255,255,0.12)" />
      <rect x="0" y="0" width="4" height="10" fill="rgba(255,255,255,0.12)" />
    </svg>
  );
}

const TREES = [
  { scale: 1.05, delay: 0 },
  { scale: 0.8, delay: 0.4 },
  { scale: 1.25, delay: 0.15 },
  { scale: 0.9, delay: 0.55 },
  { scale: 1.15, delay: 0.25 },
  { scale: 0.85, delay: 0.7 },
  { scale: 1.1, delay: 0.35 },
];

export default function PixelTrees() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-forest-deeper/90">
      <style>{`
        @keyframes tree-sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
      `}</style>
      <div className="flex h-full items-end justify-around px-2 pb-2">
        {TREES.map((t, i) => (
          <PixelTree key={i} scale={t.scale} delay={t.delay} green={TREE_GREENS[i % TREE_GREENS.length]} />
        ))}
      </div>
    </div>
  );
}
