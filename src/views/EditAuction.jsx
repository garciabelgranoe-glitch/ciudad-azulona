import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CONDITION_OPTIONS, RARITY_OPTIONS, GRADING_COMPANY_OPTIONS, REFERENCE_PRICE_SOURCE_OPTIONS } from "../lib/auctions";
import PokemonSetDatalist from "../components/ui/PokemonSetDatalist";

// Vista: Editar subasta propia (sin pujas todavía)
export default function EditAuction({ auction, onBack, onSave, onCancelAuction, busy = false, cancelBusy = false, error = "" }) {
  const [name, setName] = useState(auction.card);
  const [price, setPrice] = useState(String(auction.basePrice));
  const [referencePrice, setReferencePrice] = useState(auction.referencePrice ? String(auction.referencePrice) : "");
  const [referencePriceCurrency, setReferencePriceCurrency] = useState(auction.referencePriceCurrency ?? "USD");
  const [referencePriceSource, setReferencePriceSource] = useState(auction.referencePriceSource ?? "");
  const [reservePrice, setReservePrice] = useState(auction.reservePrice ? String(auction.reservePrice) : "");
  const [buyNowPrice, setBuyNowPrice] = useState(auction.buyNowPrice ? String(auction.buyNowPrice) : "");
  const [setName_, setSetName] = useState(auction.setName ?? "");
  const [cardNumber, setCardNumber] = useState(auction.cardNumber ?? "");
  const [year, setYear] = useState(auction.year ? String(auction.year) : "");
  const [condition, setCondition] = useState(auction.condition ?? "near_mint");
  const [isGraded, setIsGraded] = useState(!!auction.isGraded);
  const [gradingCompany, setGradingCompany] = useState(auction.gradingCompany ?? "psa");
  const [grade, setGrade] = useState(auction.grade ? String(auction.grade) : "");
  const [rarity, setRarity] = useState(auction.rarity ?? "");
  const [isFeatured, setIsFeatured] = useState(!!auction.isFeatured);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[12px] font-bold text-ink-soft";
  const reserveInvalid = !auction.isSaleOnly && reservePrice !== "" && Number(reservePrice) < Number(price || 0);
  const buyNowInvalid =
    !auction.isSaleOnly &&
    buyNowPrice !== "" &&
    (Number(buyNowPrice) <= Number(price || 0) ||
      (reservePrice !== "" && Number(buyNowPrice) <= Number(reservePrice)));
  const canSave = name && price && !reserveInvalid && !buyNowInvalid;

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <PokemonSetDatalist />
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">EDITAR PUBLICACION</p>
      </header>

      <div className="space-y-4 px-5 pt-6">
        <p className="rounded-lg border-2 border-line bg-paper p-3 text-[12px] leading-relaxed text-ink-soft">
          Podés corregir estos datos porque todavía no tiene pujas. Las fotos no se pueden cambiar acá.
        </p>

        <div>
          <label className={labelClass}>Nombre de la carta</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Colección / set</label>
            <input value={setName_} onChange={(e) => setSetName(e.target.value)} list="pokemon-set-options" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Número</label>
            <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Año</label>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
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

        <div>
          <label className={labelClass}>Rareza</label>
          <select value={rarity} onChange={(e) => setRarity(e.target.value)} className={inputClass}>
            <option value="">Sin especificar</option>
            {RARITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.symbol} {opt.label}</option>
            ))}
          </select>
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
              <input type="number" step="0.5" value={grade} onChange={(e) => setGrade(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>{auction.isSaleOnly ? "Precio de venta" : "Precio base"}</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Precio de referencia (opcional)</label>
          <input
            type="number"
            value={referencePrice}
            onChange={(e) => setReferencePrice(e.target.value)}
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
        </div>

        {!auction.isSaleOnly && (
          <div>
            <label className={labelClass}>Precio mínimo / reserva (opcional)</label>
            <input
              type="number"
              value={reservePrice}
              onChange={(e) => setReservePrice(e.target.value)}
              className={inputClass}
            />
            {reserveInvalid && (
              <p className="mt-1 text-[11px] text-[#B9432C]">Tiene que ser mayor o igual al precio base.</p>
            )}
          </div>
        )}

        {!auction.isSaleOnly && (
          <div>
            <label className={labelClass}>Precio de claim inmediato (opcional)</label>
            <input
              type="number"
              value={buyNowPrice}
              onChange={(e) => setBuyNowPrice(e.target.value)}
              className={inputClass}
            />
            {buyNowInvalid && (
              <p className="mt-1 text-[11px] text-[#B9432C]">Tiene que ser mayor al precio base{reservePrice ? " y a la reserva" : ""}.</p>
            )}
          </div>
        )}

        {error && <p className="text-[12px] text-[#B9432C]">{error}</p>}

        <button
          disabled={!canSave || busy}
          onClick={() =>
            onSave({
              name,
              price: Number(price),
              setName: setName_,
              cardNumber,
              year: year ? Number(year) : null,
              condition,
              isGraded,
              gradingCompany,
              grade: grade ? Number(grade) : null,
              rarity,
              isFeatured,
              referencePrice: referencePrice ? Number(referencePrice) : null,
              referencePriceCurrency,
              referencePriceSource,
              reservePrice: auction.isSaleOnly ? null : reservePrice ? Number(reservePrice) : null,
              buyNowPrice: auction.isSaleOnly ? Number(price) : buyNowPrice ? Number(buyNowPrice) : null,
            })
          }
          className="w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          {busy ? "Guardando..." : "Guardar cambios"}
        </button>

        <div className="border-t-2 border-line pt-4">
          {confirmCancel ? (
            <div className="rounded-lg border-2 border-[#B9432C]/30 bg-[#FBE6E0] p-3">
              <p className="text-[12px] font-bold text-[#B9432C]">
                ¿Seguro que querés cancelar esta subasta? No se puede deshacer.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={onCancelAuction}
                  disabled={cancelBusy}
                  className="rounded-lg bg-[#B9432C] px-3 py-2 text-[12px] font-bold text-paper disabled:opacity-40"
                >
                  {cancelBusy ? "Cancelando..." : "Sí, cancelar"}
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="rounded-lg border-2 border-line px-3 py-2 text-[12px] font-bold text-ink-soft"
                >
                  Volver
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmCancel(true)}
              className="text-[12px] font-bold text-[#B9432C] underline underline-offset-2"
            >
              Cancelar esta subasta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
