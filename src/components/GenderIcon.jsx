// Mini busto pixel-art estilo sprite de entrenador de Game Boy — diseño
// propio (no copia ningún personaje), solo evoca la estética retro.

function Pixels({ cells, size, color }) {
  return cells.map(([x, y, w = 1, h = 1], i) => (
    <rect key={i} x={x} y={y} width={w} height={h} fill={color} />
  ));
}

const SKIN = "#E8B98A";

// cap con visera (gorra), estilo genérico de entrenador
const MASCULINO_CAP = [
  [2, 0, 7, 2],
  [7, 2, 4, 1],
];
const MASCULINO_BODY = [[1, 8, 10, 4]];

// pelo largo con dos colitas, estética distinta a propósito
const FEMENINO_HAIR = [
  [1, 0, 10, 2],
  [0, 2, 2, 4],
  [10, 2, 2, 4],
];
const FEMENINO_BOW = [[10, 2, 2, 1]];
const FEMENINO_BODY = [[1, 8, 10, 4]];

export default function GenderIcon({ gender, size = 14 }) {
  if (gender !== "masculino" && gender !== "femenino") return null;
  const isM = gender === "masculino";
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      className="inline-block shrink-0 rounded-sm"
      style={{ imageRendering: "pixelated" }}
      aria-label={isM ? "Entrenador" : "Entrenadora"}
    >
      <rect x="0" y="0" width="12" height="12" fill="none" />
      <Pixels cells={[[3, 3, 6, 5]]} color={SKIN} />
      {isM ? (
        <>
          <Pixels cells={MASCULINO_CAP} color="#2E8B8B" />
          <Pixels cells={MASCULINO_BODY} color="#1B4630" />
        </>
      ) : (
        <>
          <Pixels cells={FEMENINO_HAIR} color="#5B4C87" />
          <Pixels cells={FEMENINO_BOW} color="#D9A441" />
          <Pixels cells={FEMENINO_BODY} color="#B9432C" />
        </>
      )}
    </svg>
  );
}
