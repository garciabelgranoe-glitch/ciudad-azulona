import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";

// Banner rotativo: vendedores garantizados (recomendados por la plataforma)
export default function GuaranteedSellersBanner({ sellers, onOpenAll }) {
  const active = (sellers ?? []).filter((s) => s.is_active);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (active.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % active.length), 4500);
    return () => clearInterval(id);
  }, [active.length]);

  if (active.length === 0 || !onOpenAll) return null;
  const current = active[index % active.length];

  return (
    <button
      onClick={onOpenAll}
      className="flex w-full items-center gap-3 rounded-xl border-2 border-gold/50 bg-gold/10 px-4 py-3 text-left transition hover:bg-gold/15"
    >
      {current.photo_url ? (
        <img
          src={current.photo_url}
          alt=""
          className="h-11 w-11 shrink-0 rounded-lg border border-gold/50 object-cover"
        />
      ) : (
        <Trophy size={18} className="shrink-0 text-gold-dark" />
      )}
      <span className="min-w-0 flex-1 text-[13px] font-medium text-ink">
        <span className="block text-[10.5px] font-bold uppercase tracking-wide text-gold-dark/80">
          Vendedores garantizados de productos oficiales
        </span>
        <span className="block truncate">
          {current.business_name}
          {current.description ? ` — ${current.description}` : ""}
        </span>
      </span>
      <span className="hidden shrink-0 text-[12.5px] font-bold text-gold-dark underline underline-offset-2 sm:inline">
        Ver todos →
      </span>
      {active.length > 1 && (
        <span className="hidden shrink-0 items-center gap-1 sm:flex">
          {active.map((s, i) => (
            <span key={s.id} className={`h-2 w-2 rounded-full ${i === index ? "bg-gold-dark" : "bg-gold/30"}`} />
          ))}
        </span>
      )}
    </button>
  );
}
