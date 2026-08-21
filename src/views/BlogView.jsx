import { ArrowLeft } from "lucide-react";

// Vista: Novedades / blog (pública)
export default function BlogView({ posts, onBack }) {
  const published = posts.filter((p) => p.is_published);
  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">NOVEDADES</p>
      </header>

      <div className="px-5 pt-6">
        {published.length === 0 ? (
          <p className="text-[12px] text-ink-soft">Todavía no hay novedades publicadas.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {published.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-lg border-2 border-line bg-paper">
                {p.photo_url && <img src={p.photo_url} alt="" className="h-40 w-full object-cover" />}
                <div className="p-3.5">
                  <p className="text-[10px] font-bold text-ink-soft">
                    {new Date(p.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                    {p.author?.alias ? ` · ${p.author.alias}` : ""}
                  </p>
                  <p className="mt-1 text-[15px] font-extrabold text-ink">{p.title}</p>
                  <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
