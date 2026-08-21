import { formatPrice } from "../../lib/format";

export default function StatHistoryList({ title, icon, items = [], emptyText }) {
  return (
    <div className="mt-4">
      <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
        {icon} {title}
      </h4>
      {items.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2 text-[13px]">
              <span className="line-clamp-1 text-ink-soft">{it.cardName}</span>
              <span className="shrink-0 font-bold text-forest-deep">{formatPrice(Number(it.amount), it.currency)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-[12px] text-ink-soft">{emptyText}</p>
      )}
    </div>
  );
}
