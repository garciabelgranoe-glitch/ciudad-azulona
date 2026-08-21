import { Trophy, Star } from "lucide-react";
import GenderIcon from "../GenderIcon";

export default function SellerBadge({ name, rating, sales, onClick, gender, isPremium = false }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-ink-soft">
      <GenderIcon gender={gender} size={14} />
      {onClick ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="whitespace-nowrap font-bold text-ink underline decoration-line decoration-dotted underline-offset-2 hover:text-forest-deep"
        >
          {name}
        </button>
      ) : (
        <span className="whitespace-nowrap font-bold text-ink">{name}</span>
      )}
      {isPremium && (
        <span
          className="flex items-center gap-0.5 whitespace-nowrap rounded-full border border-gold bg-gold px-1.5 py-0.5 text-[9px] font-extrabold text-forest-deep"
          title="Vendedor verificado"
        >
          <Trophy size={9} /> VERIFICADO
        </span>
      )}
      <span className="flex items-center gap-0.5 whitespace-nowrap text-gold-dark">
        <Star size={11} fill="currentColor" strokeWidth={0} />
        {rating.toFixed(1)}
      </span>
      <span className="whitespace-nowrap font-bold text-ink">· {sales} ventas</span>
    </div>
  );
}
