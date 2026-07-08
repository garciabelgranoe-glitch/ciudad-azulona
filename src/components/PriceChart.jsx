// Sparkline de evolución de precio. La punta de la línea es una pokéball
// que se pone más roja a medida que la puja actual se acerca (o supera)
// el precio de referencia cargado por el vendedor.

function lerpColor(hexA, hexB, t) {
  const a = parseInt(hexA.slice(1), 16);
  const b = parseInt(hexB.slice(1), 16);
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

const COLOR_FAR = "#D9A441"; // gold — lejos del precio de referencia
const COLOR_NEAR = "#B9432C"; // rojo — en o por encima del precio de referencia

export default function PriceChart({ points, referencePrice }) {
  if (points.length < 2) return null;

  const width = 300;
  const height = 110;
  const padX = 14;
  const padY = 16;

  const lastPrice = points[points.length - 1];
  const maxVal = Math.max(...points, referencePrice ?? 0);
  const minVal = Math.min(...points, referencePrice ?? points[0]);
  const range = maxVal - minVal || 1;

  const toXY = (value, i) => {
    const x = padX + (i * (width - padX * 2)) / (points.length - 1);
    const y = height - padY - ((value - minVal) / range) * (height - padY * 2);
    return [x, y];
  };

  const coords = points.map((p, i) => toXY(p, i));
  const pathD = coords.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(" ");
  const [ballX, ballY] = coords[coords.length - 1];

  const proximity = referencePrice ? Math.max(0, Math.min(1, lastPrice / referencePrice)) : 0;
  const ballColor = referencePrice ? lerpColor(COLOR_FAR, COLOR_NEAR, proximity) : "#1B4630";

  const refY = referencePrice ? toXY(referencePrice, 0)[1] : null;
  const showRefLine = refY != null && refY >= padY - 2 && refY <= height - padY + 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full">
      {showRefLine && (
        <>
          <line
            x1={padX}
            y1={refY}
            x2={width - padX}
            y2={refY}
            stroke="#5B4C87"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text x={width - padX} y={refY - 4} textAnchor="end" fontSize="8" fill="#5B4C87">
            referencia
          </text>
        </>
      )}
      <path d={pathD} fill="none" stroke="#1B4630" strokeWidth="2" />
      <g transform={`translate(${ballX} ${ballY})`}>
        <circle r="7.5" fill="#FBF7EC" stroke="#20291C" strokeWidth="1.3" />
        <path d="M -7.5 0 A 7.5 7.5 0 0 1 7.5 0 Z" fill={ballColor} stroke="#20291C" strokeWidth="1.3" />
        <rect x="-7.5" y="-1" width="15" height="2" fill="#20291C" />
        <circle r="2.6" fill="#FBF7EC" stroke="#20291C" strokeWidth="1" />
      </g>
    </svg>
  );
}
