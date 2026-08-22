import { useState } from "react";

export default function GiveawayEntrantsPicker({ giveawayId, onLoadEntrants, onPickWinner, closeBusy }) {
  const [entrants, setEntrants] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    setLoading(true);
    try {
      const rows = await onLoadEntrants(giveawayId);
      setEntrants(rows);
    } finally {
      setLoading(false);
    }
  }

  if (entrants === null) {
    return (
      <button
        onClick={handleOpen}
        disabled={loading}
        className="rounded-lg bg-gold px-2.5 py-1 text-[11px] font-bold text-forest-deep disabled:opacity-40"
      >
        {loading ? "Cargando..." : "Elegir ganador"}
      </button>
    );
  }

  if (entrants.length === 0) {
    return <p className="text-[11px] text-ink-soft">Todavía no hay inscriptos.</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {entrants.map((e) => (
        <button
          key={e.user_id}
          onClick={() => onPickWinner(giveawayId, e.user_id)}
          disabled={closeBusy}
          className="rounded-lg border-2 border-gold/50 px-2.5 py-1 text-left text-[11px] font-bold text-gold-dark disabled:opacity-40"
        >
          {e.alias} →
        </button>
      ))}
    </div>
  );
}
