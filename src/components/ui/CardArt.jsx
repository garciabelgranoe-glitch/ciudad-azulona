export default function CardArt({ label, photoUrl }) {
  if (photoUrl) {
    return (
      <div className="relative aspect-[5/7] w-full overflow-hidden border-b-2 border-ink bg-cream-dark">
        <img src={photoUrl} alt={label} className="h-full w-full object-cover" />
      </div>
    );
  }
  // Placeholder visual con proporción de carta TCG (aprox 2.5:3.5)
  return (
    <div className="relative aspect-[5/7] w-full overflow-hidden border-b-2 border-ink bg-cream-dark">
      <div className="absolute inset-0 opacity-60" style={{
        backgroundImage: "repeating-linear-gradient(45deg, rgba(217,164,65,0.12) 0px, rgba(217,164,65,0.12) 10px, transparent 10px, transparent 20px)"
      }} />
      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
        <span className="font-pixel text-[9px] uppercase leading-relaxed text-ink-soft">{label}</span>
      </div>
    </div>
  );
}
