// Gráfico de barras genérico chiquito, sin librería (mismo enfoque a mano
// que PriceChart, pero reutilizable para cualquier serie {day, [valueKey]}).
export default function MiniBarChart({ series, valueKey, color = "#3E7A52" }) {
  const height = 90;
  const values = series.map((s) => Number(s[valueKey]) || 0);
  const max = Math.max(1, ...values);
  const barWidth = series.length > 0 ? 100 / series.length : 100;
  const labelEvery = Math.max(1, Math.ceil(series.length / 6));

  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-24 w-full">
        {series.map((s, i) => {
          const v = Number(s[valueKey]) || 0;
          const barH = (v / max) * (height - 16);
          return (
            <rect
              key={s.day}
              x={i * barWidth + barWidth * 0.15}
              y={height - 16 - barH}
              width={barWidth * 0.7}
              height={barH}
              fill={color}
              rx="0.5"
            />
          );
        })}
      </svg>
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
