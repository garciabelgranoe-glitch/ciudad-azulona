export function formatARS(n) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export function formatPrice(n, currency = "ARS") {
  if (currency === "USD") {
    return `U$S ${Number(n).toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
  }
  return formatARS(n);
}

export function formatCountdown(totalSeconds) {
  if (totalSeconds <= 0) return "Cerrada";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}
