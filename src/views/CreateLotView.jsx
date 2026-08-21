import { useState } from "react";
import { ArrowLeft, X, Plus, Loader2 } from "lucide-react";
import { MAX_PHOTOS, DURATION_OPTIONS } from "../lib/auctions";

// Vista: Publicar lote (Premium) — varias cartas sueltas, cada una
// con su propia descripción y precio, en una sola publicación.
export default function CreateLotView({ onBack, onCreate, busy = false, busyText = "", error = "" }) {
  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [duration, setDuration] = useState(1440);
  const [items, setItems] = useState([{ description: "", price: "" }, { description: "", price: "" }]);
  const [fullPrice, setFullPrice] = useState("");
  const [photoConverting, setPhotoConverting] = useState(false);
  const [photoError, setPhotoError] = useState("");

  async function handlePhotoChange(e) {
    const files = [...(e.target.files ?? [])];
    e.target.value = "";
    setPhotoError("");
    if (files.length === 0) return;

    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      setPhotoError(`Ya tenés el máximo de ${MAX_PHOTOS} fotos.`);
      return;
    }
    const toAdd = files.slice(0, room);

    setPhotoConverting(true);
    try {
      const converted = await Promise.all(
        toAdd.map(async (file) => {
          const isHeic =
            file.type === "image/heic" || file.type === "image/heif" || /\.heic$|\.heif$/i.test(file.name);
          if (!isHeic) return file;
          const heic2any = (await import("heic2any")).default;
          const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
          return new File([blob], "foto.jpg", { type: "image/jpeg" });
        })
      );
      setPhotos((prev) => [...prev, ...converted.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    } catch {
      setPhotoError("No pudimos convertir alguna foto. Probá sacándola de nuevo o elegí otra.");
    } finally {
      setPhotoConverting(false);
    }
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => (prev.length >= 10 ? prev : [...prev, { description: "", price: "" }]));
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const validItems = items.filter((it) => it.description.trim() && Number(it.price) > 0);
  const canPublish = title.trim() && photos.length > 0 && validItems.length >= 2 && !busy && !photoConverting;

  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[12px] font-bold text-ink-soft";

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">PUBLICAR LOTE</p>
      </header>

      <div className="space-y-4 px-5 pt-6">
        <p className="rounded-lg border-2 border-gold/40 bg-gold/10 px-3 py-2.5 text-[12px] leading-relaxed text-ink-soft">
          Cada carta que cargues abajo se publica con su propio precio — quien la quiera la claimea directo, sin pujas.
        </p>

        <div>
          <label className={labelClass}>Título del lote</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Lote de sueltas Base Set — 8 cartas"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Moneda (aplica a todas las cartas del lote)</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCurrency("ARS")}
              className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
                currency === "ARS"
                  ? "border-gold bg-gold/15 text-gold-dark"
                  : "border-line bg-paper text-ink-soft hover:border-forest-mid"
              }`}
            >
              Pesos ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
                currency === "USD"
                  ? "border-gold bg-gold/15 text-gold-dark"
                  : "border-line bg-paper text-ink-soft hover:border-forest-mid"
              }`}
            >
              Dólares (U$S)
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Descripción general (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Contexto del lote: estado general, de dónde salieron, etc."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Fotos del panorama general (obligatoria, hasta {MAX_PHOTOS})</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-ink">
                <img src={p.preview} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-paper"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-line bg-paper text-center text-[11px] text-ink-soft">
                {photoConverting ? "Convirtiendo..." : "Sacar o elegir foto"}
                <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
          </div>
          {photoError && <p className="mt-1.5 text-[11px] text-[#B9432C]">{photoError}</p>}
        </div>

        <div>
          <label className={labelClass}>Cartas incluidas (mínimo 2, hasta 10)</label>
          <div className="mt-1.5 flex flex-col gap-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={item.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  placeholder={`Ej: Charizard NM, alt art, 2023`}
                  className="min-w-0 flex-1 rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(i, "price", e.target.value)}
                  placeholder={currency === "USD" ? "U$S" : "$"}
                  className="w-24 shrink-0 rounded-lg border-2 border-line bg-white px-2.5 py-2.5 text-[13px] font-bold text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid"
                />
                {items.length > 2 && (
                  <button onClick={() => removeItem(i)} className="shrink-0 text-ink-soft hover:text-[#B9432C]">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {items.length < 10 && (
            <button
              onClick={addItem}
              className="mt-2 flex items-center gap-1 text-[12px] font-bold text-forest-deep underline underline-offset-2"
            >
              <Plus size={13} /> Agregar otra carta
            </button>
          )}
        </div>

        <div>
          <label className={labelClass}>Precio por el lote completo (opcional)</label>
          <input
            type="number"
            value={fullPrice}
            onChange={(e) => setFullPrice(e.target.value)}
            placeholder={currency === "USD" ? "Ej: U$S 50 por todo el lote" : "Ej: $50.000 por todo el lote"}
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-ink-soft">
            Si lo cargás, además de vender cada carta suelta alguien va a poder llevarse el lote entero por
            este precio — pero solo mientras esté 100% completo (ninguna carta vendida todavía).
          </p>
        </div>

        <div>
          <label className={labelClass}>Dura</label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDuration(opt.value)}
                className={`rounded-lg border-2 py-2 text-[12px] font-bold transition ${
                  duration === opt.value
                    ? "border-gold bg-gold/15 text-gold-dark"
                    : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-[12px] text-[#B9432C]">{error}</p>}
        <button
          disabled={!canPublish}
          onClick={() =>
            onCreate({
              title: title.trim(),
              currency,
              description: description.trim(),
              photoFiles: photos.map((p) => p.file),
              durationMinutes: duration,
              items: validItems.map((it) => ({ description: it.description.trim(), price: Number(it.price) })),
              fullPrice: fullPrice ? Number(fullPrice) : null,
            })
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          {busy && <Loader2 size={15} className="animate-spin" />}
          {busy ? busyText || "Publicando..." : "Publicar lote"}
        </button>
        {validItems.length < 2 && (
          <p className="text-center text-[11px] text-ink-soft">Cargá al menos 2 cartas con descripción y precio.</p>
        )}
      </div>
    </div>
  );
}
