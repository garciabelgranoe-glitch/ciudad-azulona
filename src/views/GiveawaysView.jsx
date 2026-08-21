import { useState, useEffect } from "react";
import { ArrowLeft, Trophy, Share2, Check } from "lucide-react";
import { giveawayRequirementText, handleShareGiveaway } from "../lib/giveaways";

// Vista: Sorteos para la comunidad (pública)
export default function GiveawaysView({ giveaways, myEntryIds, onBack, onEnter, enterBusyId, enterError, enterErrorId, highlightId }) {
  const [shareCopiedId, setShareCopiedId] = useState(null);

  async function handleShareClick(g) {
    const copied = await handleShareGiveaway(g);
    if (copied) {
      setShareCopiedId(g.id);
      setTimeout(() => setShareCopiedId((id) => (id === g.id ? null : id)), 5000);
    }
  }

  useEffect(() => {
    if (!highlightId || giveaways.length === 0) return;
    document.getElementById(`giveaway-${highlightId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, giveaways]);

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">SORTEOS</p>
      </header>

      <div className="mx-auto max-w-xl px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Sorteos para la comunidad — los organiza el equipo de Ciudad Azulona, inscribite y esperá el resultado.
        </p>

        {giveaways.length === 0 ? (
          <p className="mt-4 text-[12px] text-ink-soft">Todavía no hay sorteos activos.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {giveaways.map((g) => {
              const entered = myEntryIds.has(g.id);
              const open = g.status === "open" && new Date(g.closes_at) > new Date();
              return (
                <div
                  key={g.id}
                  id={`giveaway-${g.id}`}
                  className={`overflow-hidden rounded-lg border-2 bg-paper transition ${
                    g.id === highlightId ? "border-gold ring-2 ring-gold/50" : "border-line"
                  }`}
                >
                  {g.photo_url && (
                    <img
                      src={g.photo_url}
                      alt={g.title}
                      className="max-h-72 w-full bg-cream-dark object-contain"
                    />
                  )}
                  <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-[14px] font-extrabold text-ink">
                      <Trophy size={13} className="text-gold-dark" /> {g.title}
                    </p>
                    <button
                      onClick={() => handleShareClick(g)}
                      className="flex shrink-0 items-center gap-1 rounded-lg border-2 border-line px-2 py-1 text-[11px] font-bold text-ink-soft hover:border-forest-mid"
                    >
                      <Share2 size={13} /> Compartir
                    </button>
                  </div>
                  {shareCopiedId === g.id && (
                    <p className="mt-1 text-[11px] font-bold text-forest-deep">
                      Texto copiado — si WhatsApp solo mandó la foto, pegalo como descripción del posteo.
                    </p>
                  )}
                  {g.description && <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{g.description}</p>}
                  {g.prize_description && (
                    <p className="mt-1.5 text-[12px] font-bold text-forest-deep">Premio: {g.prize_description}</p>
                  )}
                  {giveawayRequirementText(g) && (
                    <p className="mt-1 text-[11px] text-plum">{giveawayRequirementText(g)}</p>
                  )}
                  {g.community_url && (
                    <p className="mt-1.5 rounded-lg bg-teal/10 px-2.5 py-1.5 text-[11px] leading-relaxed text-teal">
                      Para participar tenés que estar en nuestro grupo de la comunidad:{" "}
                      <a href={g.community_url} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-2">
                        unirme al grupo
                      </a>
                    </p>
                  )}
                  {g.status === "closed" ? (
                    <p className="mt-2 text-[12px] font-bold text-gold-dark">Ganador: {g.winner?.alias ?? "—"}</p>
                  ) : (
                    <>
                      <p className="mt-1 text-[11px] text-ink-soft">
                        Cierra el {new Date(g.closes_at).toLocaleDateString("es-AR")}
                      </p>
                      {entered ? (
                        <p className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-forest-deep">
                          <Check size={13} /> Ya estás inscripto
                        </p>
                      ) : open ? (
                        <>
                          <button
                            onClick={() => onEnter(g.id)}
                            disabled={enterBusyId === g.id}
                            className="mt-2 rounded-lg bg-gold px-3 py-1.5 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
                          >
                            {enterBusyId === g.id ? "Inscribiendo..." : "Inscribirme"}
                          </button>
                          {enterErrorId === g.id && (
                            <p className="mt-1.5 text-[11px] text-[#B9432C]">{enterError}</p>
                          )}
                        </>
                      ) : (
                        <p className="mt-2 text-[11px] text-ink-soft">Cerrado, esperando resultado.</p>
                      )}
                    </>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
