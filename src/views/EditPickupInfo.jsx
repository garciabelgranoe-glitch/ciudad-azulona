import { useState } from "react";
import { ArrowLeft } from "lucide-react";

// Vista: Editar info de retiro
export default function EditPickupInfo({ profile, onBack, onSave, busy = false, error = "", pickupPoints = [] }) {
  const [hasStand, setHasStand] = useState(profile.has_stand ?? false);
  const [standNumber, setStandNumber] = useState(profile.stand_number ?? "");
  const [pickupDay, setPickupDay] = useState(profile.pickup_day ?? "");
  const [pickupTime, setPickupTime] = useState(profile.pickup_time ?? "");
  const [contactPhone, setContactPhone] = useState(profile.contact_phone ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [pickupPointId, setPickupPointId] = useState(profile.pickup_point_id ?? "");

  const matchingPoints = pickupPoints.filter(
    (p) => p.is_active && p.city.trim().toLowerCase() === city.trim().toLowerCase()
  );

  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[12px] font-bold text-ink-soft";

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">INFO DE RETIRO</p>
      </header>

      <div className="space-y-4 px-5 pt-6">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Contale a quien te gane la subasta cómo coordinar el retiro de la carta.
        </p>

        <div>
          <label className={labelClass}>Ciudad</label>
          <input
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPickupPointId("");
            }}
            placeholder="Ej: Buenos Aires, Mendoza, Córdoba"
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-ink-soft">
            Se usa para que los compradores puedan filtrar por ciudad en la grilla.
          </p>
        </div>

        {matchingPoints.length > 0 && (
          <div>
            <label className={labelClass}>Punto de retiro (opcional)</label>
            <select value={pickupPointId} onChange={(e) => setPickupPointId(e.target.value)} className={inputClass}>
              <option value="">Sin punto específico</option>
              {matchingPoints.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setHasStand(true)}
            className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
              hasStand ? "border-gold bg-gold/15 text-gold-dark" : "border-line bg-paper text-ink-soft"
            }`}
          >
            Tengo stand fijo
          </button>
          <button
            onClick={() => setHasStand(false)}
            className={`rounded-lg border-2 py-2.5 text-[12px] font-bold transition ${
              !hasStand ? "border-gold bg-gold/15 text-gold-dark" : "border-line bg-paper text-ink-soft"
            }`}
          >
            Prefiero coordinar
          </button>
        </div>

        {hasStand ? (
          <div>
            <label className={labelClass}>Número o nombre del stand</label>
            <input
              value={standNumber}
              onChange={(e) => setStandNumber(e.target.value)}
              placeholder="Ej: Stand 14"
              className={inputClass}
            />
          </div>
        ) : (
          <>
            <div>
              <label className={labelClass}>Día de la semana</label>
              <input
                value={pickupDay}
                onChange={(e) => setPickupDay(e.target.value)}
                placeholder="Ej: Sábados"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Horario preferido</label>
              <input
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                placeholder="Ej: 15 a 18hs"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Teléfono de contacto</label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Ej: 1122334455"
                className={inputClass}
              />
            </div>
          </>
        )}

        {error && <p className="text-[12px] text-[#B9432C]">{error}</p>}

        <button
          disabled={busy}
          onClick={() => onSave({ hasStand, standNumber, pickupDay, pickupTime, contactPhone, city, pickupPointId })}
          className="w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          {busy ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
