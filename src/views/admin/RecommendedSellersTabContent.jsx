import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { uploadAuctionPhoto } from "../../lib/auctions";

export default function RecommendedSellersTabContent({ sellers, onCreate, createBusy, createError, onToggleActive, onDelete, busyId }) {
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[11px] font-bold text-ink-soft";

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleCreate() {
    setPhotoError("");
    let photoUrl = null;
    if (photoFile) {
      setUploadingPhoto(true);
      try {
        photoUrl = await uploadAuctionPhoto(photoFile);
      } catch (e) {
        setPhotoError(e.message);
        setUploadingPhoto(false);
        return;
      }
      setUploadingPhoto(false);
    }
    const ok = await onCreate({ businessName, description, contactInfo, whatsappUrl, photoUrl });
    if (ok) {
      setBusinessName("");
      setDescription("");
      setContactInfo("");
      setWhatsappUrl("");
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-line bg-paper p-3">
        <p className="text-[12px] font-extrabold text-ink">Agregar comercio recomendado</p>
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Nombre del comercio</label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Packs y colecciones originales, envíos a todo el país"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Link directo de WhatsApp (opcional)</label>
            <input
              value={whatsappUrl}
              onChange={(e) => setWhatsappUrl(e.target.value)}
              placeholder="Ej: https://wa.me/5491122334455"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Otro contacto (Instagram, etc. — opcional)</label>
            <input value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Imagen (opcional)</label>
            <div className="mt-1.5 flex items-center gap-2">
              {photoPreview && (
                <img src={photoPreview} alt="" className="h-14 w-14 rounded-lg border-2 border-line object-cover" />
              )}
              <label className="flex h-14 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-line bg-white text-[12px] text-ink-soft">
                <ImageIcon size={14} /> {photoFile ? "Cambiar imagen" : "Elegir imagen"}
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
          </div>
          {(createError || photoError) && <p className="text-[11px] text-[#B9432C]">{createError || photoError}</p>}
          <button
            onClick={handleCreate}
            disabled={!businessName || createBusy || uploadingPhoto}
            className="w-full rounded-lg bg-gold py-2 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
          >
            {uploadingPhoto ? "Subiendo imagen..." : createBusy ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sellers.map((s) => (
          <div key={s.id} className={`rounded-lg border-2 p-3 ${s.is_active ? "border-line bg-paper" : "border-line bg-cream-dark/40 opacity-70"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 gap-2.5">
                {s.photo_url && (
                  <img src={s.photo_url} alt="" className="h-12 w-12 shrink-0 rounded-lg border-2 border-line object-cover" />
                )}
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-ink">{s.business_name}</p>
                  {s.description && <p className="text-[11px] text-ink-soft">{s.description}</p>}
                  {s.whatsapp_url && <p className="text-[11px] font-bold text-[#128C4A]">{s.whatsapp_url}</p>}
                  {s.contact_info && <p className="text-[11px] font-bold text-forest-deep">{s.contact_info}</p>}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  onClick={() => onToggleActive(s.id, !s.is_active)}
                  disabled={busyId === s.id}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-40 ${
                    s.is_active ? "border-2 border-line text-ink-soft" : "bg-forest-mid text-paper"
                  }`}
                >
                  {s.is_active ? "Ocultar" : "Activar"}
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  disabled={busyId === s.id}
                  className="rounded-lg border-2 border-[#B9432C]/40 px-2.5 py-1 text-[11px] font-bold text-[#B9432C] disabled:opacity-40"
                >
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
        {sellers.length === 0 && <p className="text-[12px] text-ink-soft">Todavía no cargaste ningún comercio.</p>}
      </div>
    </div>
  );
}
