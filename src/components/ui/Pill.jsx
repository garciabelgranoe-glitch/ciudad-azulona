export default function Pill({ children, tone = "default" }) {
  const tones = {
    default: "bg-paper text-ink-soft border-line",
    live: "bg-forest-mid/15 text-forest-deep border-forest-mid/40",
    urgent: "bg-[#FBE6E0] text-[#B9432C] border-[#B9432C]/30",
    gold: "bg-gold/15 text-gold-dark border-gold/40",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}
