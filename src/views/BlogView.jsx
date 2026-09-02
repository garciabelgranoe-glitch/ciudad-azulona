import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BLOG_CATEGORY_OPTIONS, BLOG_CATEGORY_LABEL } from "../lib/auctions";

// Vista: Novedades / blog (pública)
export default function BlogView({ posts, onBack }) {
  const [category, setCategory] = useState("todas");
  const published = posts.filter((p) => p.is_published);

  const availableCategories = useMemo(() => {
    const present = new Set(published.map((p) => p.category ?? "general"));
    return BLOG_CATEGORY_OPTIONS.filter((opt) => present.has(opt.value));
  }, [published]);

  const filtered =
    category === "todas" ? published : published.filter((p) => (p.category ?? "general") === category);

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
          <>
            {availableCategories.length > 1 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCategory("todas")}
                  className={`rounded-full border-2 px-3 py-1 text-[11px] font-bold transition ${
                    category === "todas"
                      ? "border-gold bg-gold/15 text-gold-dark"
                      : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                  }`}
                >
                  Todas
                </button>
                {availableCategories.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCategory(opt.value)}
                    className={`rounded-full border-2 px-3 py-1 text-[11px] font-bold transition ${
                      category === opt.value
                        ? "border-gold bg-gold/15 text-gold-dark"
                        : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <p className="text-[12px] text-ink-soft">No hay novedades en esta categoría todavía.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((p) => (
                  <div key={p.id} className="overflow-hidden rounded-lg border-2 border-line bg-paper">
                    {p.photo_url && <img src={p.photo_url} alt="" className="h-40 w-full object-cover" />}
                    <div className="p-3.5">
                      <p className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-ink-soft">
                        <span className="rounded-full bg-forest-mid/10 px-1.5 py-0.5 text-forest-deep">
                          {BLOG_CATEGORY_LABEL[p.category] ?? BLOG_CATEGORY_LABEL.general}
                        </span>
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
          </>
        )}
      </div>
    </div>
  );
}
