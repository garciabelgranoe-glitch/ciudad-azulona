import { useState } from "react";

// Gráfico de barras genérico chiquito, sin librería (mismo enfoque a mano
// que PriceChart, pero reutilizable para cualquier serie {day, [valueKey]}).
// Cada barra es tocable/hoverable: muestra la fecha y el valor exacto.
export default function MiniBarChart({ series, valueKey, color = "#3E7A52", formatValue = (v) => v }) {
  const [hovered, setHovered] = useState(null);
  const height = 90;
  const values = series.map((s) => Number(s[valueKey]) || 0);
  const max = Math.max(1, ...values);
  const barWidth = series.length > 0 ? 100 / series.length : 100;
  const labelEvery = Math.max(1, Math.ceil(series.length / 6));
  const active = hovered != null ? series[hovered] : null;

  return (
    <div>
      {active && (
        <div className="mb-1 flex items-baseline justify-between text-[11px]">
          <span className="font-bold text-ink">
            {new Date(active.day).toLocaleDateString("es-AR", { day: "2-digit", month: "long" })}
          </span>
          <span className="font-extrabold text-forest-deep">{formatValue(Number(active[valueKey]) || 0)}</span>
        </div>
      )}
      <div className="relative">
        <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-24 w-full">
          {series.map((s, i) => {
            const v = Number(s[valueKey]) || 0;
            const barH = (v / max) * (height - 16);
            const isActive = hovered === i;
            return (
              <rect
                key={s.day}
                x={i * barWidth + barWidth * 0.15}
                y={height - 16 - barH}
                width={barWidth * 0.7}
                height={barH}
                fill={color}
                opacity={hovered == null || isActive ? 1 : 0.35}
                rx="0.5"
              />
            );
          })}
        </svg>
        {/* Overlay HTML invisible, una franja por barra, para hover/tap sin líos de coordenadas de SVG */}
        <div className="absolute inset-0 flex">
          {series.map((s, i) => (
            <button
              key={s.day}
              type="button"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              onClick={() => setHovered((h) => (h === i ? null : i))}
              style={{ width: `${barWidth}%` }}
              className="h-full focus:outline-none"
              aria-label={`${s.day}: ${formatValue(Number(s[valueKey]) || 0)}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-1 flex text-[9px] text-ink-soft">
        {series.map((s, i) => (
          <span key={s.day} style={{ width: `${barWidth}%` }} className="text-center">
            {i % labelEvery === 0
              ? new Date(s.day).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })
              : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
