import { useState } from "react";
import { ArrowLeft, X, Loader2 } from "lucide-react";
import {
  MAX_PHOTOS,
  RARITY_OPTIONS,
  LANGUAGE_OPTIONS,
  CONDITION_OPTIONS,
  GRADING_COMPANY_OPTIONS,
  REFERENCE_PRICE_SOURCE_OPTIONS,
  DURATION_OPTIONS,
  scanCardPhoto,
} from "../lib/auctions";
import PokedexIcon from "../components/PokedexIcon";
import PokemonSetDatalist from "../components/ui/PokemonSetDatalist";

// Vista: Crear subasta
export default function CreateAuction({ onBack, onCreate, showDuration = false, busy = false, busyText = "", error = "" }) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [price, setPrice] = useState("");
  const [referencePrice, setReferencePrice] = useState("");
  const [referencePriceCurrency, setReferencePriceCurrency] = useState("USD");
  const [referencePriceSource, setReferencePriceSource] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [isSaleOnly, setIsSaleOnly] = useState(false);
  const [isFreeClaim, setIsFreeClaim] = useState(false);
  const [freeClaimWinningNumber, setFreeClaimWinningNumber] = useState("");
  const [duration, setDuration] = useState(60);
  const [photos, setPhotos] = useState([]); // [{ file, preview }]
  const [setName_, setSetName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [year, setYear] = useState("");
  const [condition, setCondition] = useState("near_mint");
  const [isGraded, setIsGraded] = useState(false);
  const [gradingCompany, setGradingCompany] = useState("psa");
  const [grade, setGrade] = useState("");
  const [rarity, setRarity] = useState("");
  const [language, setLanguage] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [photoConverting, setPhotoConverting] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanApplied, setScanApplied] = useState(false);
  const [scanAttempted, setScanAttempted] = useState(false);

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

  async function handleScanCard() {
    if (photos.length === 0 || scanning) return;
    setScanning(true);
    setScanError("");
    setScanApplied(false);
    try {
      const fields = await scanCardPhoto(photos[0].file);
      if (!fields) {
        setScanError("No pudimos reconocer la carta — completá los datos a mano.");
        return;
      }
      if (fields.name && !name) setName(fields.name);
      if (fields.setName && !setName_) setSetName(fields.setName);
      if (fields.cardNumber && !cardNumber) setCardNumber(fields.cardNumber);
      if (fields.year && !year) setYear(String(fields.year));
      if (!rarity && RARITY_OPTIONS.some((o) => o.value === fields.rarity)) setRarity(fields.rarity);
      if (!language && LANGUAGE_OPTIONS.some((o) => o.value === fields.language)) setLanguage(fields.language);
      setScanApplied(true);
    } catch {
      setScanError("No pudimos escanear la foto. Probá de nuevo en un momento.");
    } finally {
      setScanning(false);
      setScanAttempted(true);
    }
  }

  const photoRequired = showDuration;
  const reserveInvalid = !isSaleOnly && !isFreeClaim && reservePrice !== "" && Number(reservePrice) < Number(price || 0);
  const buyNowInvalid =
    !isSaleOnly &&
    !isFreeClaim &&
    buyNowPrice !== "" &&
    (Number(buyNowPrice) <= Number(price || 0) ||
      (reservePrice !== "" && Number(buyNowPrice) <= Number(reservePrice)));
  const freeClaimNumberInvalid =
    isFreeClaim && (freeClaimWinningNumber === "" || Number(freeClaimWinningNumber) < 0 || Number(freeClaimWinningNumber) > 50);
  const canPublish =
    name &&
    (isFreeClaim || price) &&
    (!isFreeClaim || !freeClaimNumberInvalid) &&
    (!photoRequired || photos.length > 0) &&
    !busy &&
    !photoConverting &&
    !reserveInvalid &&
    !buyNowInvalid;

  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[12px] font-bold text-ink-soft";

  // Después de escanear una foto, marcamos con un borde fino verde/rojo
  // los campos que la IA completa, para orientar qué falta cargar a mano.
  function scannedInputClass(filled) {
    if (!scanAttempted) return inputClass;
    return inputClass.replace("border-line", filled ? "border-forest-mid" : "border-[#B9432C]");
  }

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <PokemonSetDatalist />
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">NUEVA PUBLICACION</p>
      </header>

      <div className="space-y-4 px-5 pt-6">
        {showDuration && (
          <div>
            <label className={labelClass}>
              Fotos de la carta (obligatoria, hasta {MAX_PHOTOS} — la primera es la portada)
            </label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-ink">
                  <img src={p.preview} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-0 top-0 bg-gold px-1 py-0.5 text-[8px] font-extrabold text-forest-deep">
                      PORTADA
                    </span>
                  )}
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
            {photos.length > 0 && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleScanCard}
                  disabled={scanning || photoConverting}
                  className="flex items-center gap-1.5 rounded-lg border-2 border-plum bg-plum/10 px-3 py-2 text-[12px] font-bold text-plum disabled:opacity-60"
                >
                  {scanning ? <Loader2 size={14} className="animate-spin" /> : <PokedexIcon size={15} />}
                  {scanning ? "Reconociendo carta..." : "Autocompletar con la foto"}
                </button>
                {scanApplied && !scanError && (
                  <p className="mt-1.5 text-[11px] text-plum">Autocompletado con IA — revisá los datos antes de publicar.</p>
                )}
                {scanError && <p className="mt-1.5 text-[11px] text-[#B9432C]">{scanError}</p>}
              </div>
            )}
          </div>
        )}
        <div>
          <label className={labelClass}>Nombre de la carta</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Gengar VMAX Alt Art"
            className={scannedInputClass(!!name)}
          />
        </div>

        {!isFreeClaim && (
          <div>
            <label className={labelClass}>Moneda</label>
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
        )}

        {showDuration && (
          <div>
            <label className={labelClass}>Modo de publicación</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSaleOnly(false);
                  setIsFreeClaim(false);
                }}
                className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
                  !isSaleOnly && !isFreeClaim
                    ? "border-gold bg-gold/15 text-gold-dark"
                    : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                }`}
              >
                Subasta
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSaleOnly(true);
                  setIsFreeClaim(false);
                }}
                className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
                  isSaleOnly
                    ? "border-gold bg-gold/15 text-gold-dark"
                    : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                }`}
              >
                Venta directa
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSaleOnly(false);
                  setIsFreeClaim(true);
                }}
                className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
                  isFreeClaim
                    ? "border-gold bg-gold/15 text-gold-dark"
                    : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                }`}
              >
                Free claim
              </button>
            </div>
            <p className="mt-1 text-[11px] text-ink-soft">
              {isFreeClaim
                ? "Gratis: elegís un número de 0 a 50 y quien sea el reclamo con ese número se la lleva sin pagar."
                : isSaleOnly
                ? "Sin pujas: se vende al precio que pongas abajo, a quien la claimee primero."
                : "La carta se subasta y gana quien más ofrezca (podés sumar reserva y claim inmediato)."}
            </p>
            {isFreeClaim && (
              <div className="mt-3">
                <label className={labelClass}>Número ganador (0 a 50)</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={freeClaimWinningNumber}
                  onChange={(e) => setFreeClaimWinningNumber(e.target.value)}
                  placeholder="Ej: 12"
                  className={inputClass}
                />
                {freeClaimNumberInvalid && freeClaimWinningNumber !== "" && (
                  <p className="mt-1 text-[11px] text-[#B9432C]">Tiene que ser un número entre 0 y 50.</p>
                )}
                <p className="mt-1 text-[11px] text-ink-soft">
                  No se lo mostramos a nadie más — el reclamo que caiga justo en ese número gana automáticamente.
                </p>
              </div>
            )}
          </div>
        )}

        {showDuration && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Colección / set</label>
                <input
                  value={setName_}
                  onChange={(e) => setSetName(e.target.value)}
                  placeholder="Ej: Obsidian Flames"
                  list="pokemon-set-options"
                  className={scannedInputClass(!!setName_)}
                />
              </div>
              <div>
                <label className={labelClass}>Número</label>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Ej: 125/197"
                  className={scannedInputClass(!!cardNumber)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Año</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Ej: 2023"
                  className={scannedInputClass(!!year)}
                />
              </div>
              <div>
                <label className={labelClass}>Condición</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
                  {CONDITION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Rareza</label>
                <select value={rarity} onChange={(e) => setRarity(e.target.value)} className={scannedInputClass(!!rarity)}>
                  <option value="">Sin especificar</option>
                  {RARITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.symbol} {opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Idioma</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className={scannedInputClass(!!language)}>
                  <option value="">Sin especificar</option>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-[13px] font-medium text-ink">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 accent-plum"
              />
              Destacar esta subasta <span className="text-plum">●</span>
            </label>

            <label className="flex items-center gap-2 text-[13px] font-medium text-ink">
              <input
                type="checkbox"
                checked={isGraded}
                onChange={(e) => setIsGraded(e.target.checked)}
                className="h-4 w-4 accent-gold"
              />
              ¿Está gradeada?
            </label>

            {isGraded && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Empresa</label>
                  <select value={gradingCompany} onChange={(e) => setGradingCompany(e.target.value)} className={inputClass}>
                    {GRADING_COMPANY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Grado</label>
                  <input
                    type="number"
                    step="0.5"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Ej: 9.5"
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {!isFreeClaim && (
          <div>
            <label className={labelClass}>{isSaleOnly ? "Precio de venta" : "Precio base"}</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
        )}

        {showDuration && !isFreeClaim && (
          <div>
            <label className={labelClass}>Precio de referencia (opcional)</label>
            <input
              type="number"
              value={referencePrice}
              onChange={(e) => setReferencePrice(e.target.value)}
              placeholder="Ej: lo que vale en PriceCharting u otra fuente"
              className={inputClass}
            />
            {referencePrice !== "" && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReferencePriceCurrency("ARS")}
                    className={`rounded-lg border-2 py-1.5 text-[11px] font-bold transition ${
                      referencePriceCurrency === "ARS"
                        ? "border-gold bg-gold/15 text-gold-dark"
                        : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                    }`}
                  >
                    $
                  </button>
                  <button
                    type="button"
                    onClick={() => setReferencePriceCurrency("USD")}
                    className={`rounded-lg border-2 py-1.5 text-[11px] font-bold transition ${
                      referencePriceCurrency === "USD"
                        ? "border-gold bg-gold/15 text-gold-dark"
                        : "border-line bg-paper text-ink-soft hover:border-forest-mid"
                    }`}
                  >
                    U$S
                  </button>
                </div>
                <select
                  value={referencePriceSource}
                  onChange={(e) => setReferencePriceSource(e.target.value)}
                  className="rounded-lg border-2 border-line bg-white px-2 text-[12px] font-medium text-ink focus:outline-none focus-visible:border-forest-mid"
                >
                  <option value="">¿De dónde lo sacaste?</option>
                  {REFERENCE_PRICE_SOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
            <p className="mt-1 text-[11px] text-ink-soft">
              Se usa para el gráfico de precio — mostramos qué tan cerca está la puja de este valor.
            </p>
          </div>
        )}

        {showDuration && !isSaleOnly && !isFreeClaim && (
          <div>
            <label className={labelClass}>Precio mínimo / reserva (opcional)</label>
            <input
              type="number"
              value={reservePrice}
              onChange={(e) => setReservePrice(e.target.value)}
              placeholder="Ej: no vender por menos de este monto"
              className={inputClass}
            />
            {reserveInvalid && (
              <p className="mt-1 text-[11px] text-[#B9432C]">Tiene que ser mayor o igual al precio base.</p>
            )}
            <p className="mt-1 text-[11px] text-ink-soft">
              Si al cerrar la subasta la puja más alta no lo alcanza, no se genera ganador. No se lo mostramos al público, solo si se alcanzó o no.
            </p>
          </div>
        )}

        {showDuration && !isSaleOnly && !isFreeClaim && (
          <div>
            <label className={labelClass}>Precio de claim inmediato (opcional)</label>
            <input
              type="number"
              value={buyNowPrice}
              onChange={(e) => setBuyNowPrice(e.target.value)}
              placeholder="Ej: quien pague esto se lleva la carta ya"
              className={inputClass}
            />
            {buyNowInvalid && (
              <p className="mt-1 text-[11px] text-[#B9432C]">Tiene que ser mayor al precio base{reservePrice ? " y a la reserva" : ""}.</p>
            )}
            <p className="mt-1 text-[11px] text-ink-soft">
              Si alguien paga este precio antes de que termine el tiempo, la subasta cierra al instante a su favor.
            </p>
          </div>
        )}

        {showDuration && (
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
        )}
        {error && <p className="text-[12px] text-[#B9432C]">{error}</p>}
        <button
          disabled={!canPublish}
          onClick={() =>
            onCreate({
              name,
              currency,
              price: Number(price),
              durationMinutes: duration,
              photoFiles: photos.map((p) => p.file),
              setName: setName_,
              cardNumber,
              year: year ? Number(year) : null,
              condition,
              isGraded,
              gradingCompany,
              grade: grade ? Number(grade) : null,
              rarity,
              language,
              isFeatured,
              referencePrice: referencePrice ? Number(referencePrice) : null,
              referencePriceCurrency,
              referencePriceSource,
              reservePrice: isSaleOnly || isFreeClaim ? null : reservePrice ? Number(reservePrice) : null,
              buyNowPrice: isFreeClaim ? null : isSaleOnly ? Number(price) : buyNowPrice ? Number(buyNowPrice) : null,
              isSaleOnly,
              isFreeClaim,
              freeClaimWinningNumber: isFreeClaim ? Number(freeClaimWinningNumber) : null,
            })
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          {busy && <Loader2 size={15} className="animate-spin" />}
          {busy
            ? busyText || "Publicando..."
            : isFreeClaim
            ? "Publicar free claim"
            : isSaleOnly
            ? "Publicar venta directa"
            : "Publicar subasta"}
        </button>
        {photoRequired && photos.length === 0 && (
          <p className="text-center text-[11px] text-ink-soft">Necesitás sacarle al menos una foto antes de publicar.</p>
        )}
        <p className="text-center text-[12px] text-ink-soft">
          Compartí el link en tu grupo de WhatsApp. La subasta corre acá; la entrega sigue siendo en el stand.
        </p>
      </div>
    </div>
  );
}
