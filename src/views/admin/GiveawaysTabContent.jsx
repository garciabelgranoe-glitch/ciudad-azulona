import { useState } from "react";
import { Share2, Image as ImageIcon } from "lucide-react";
import { uploadAuctionPhoto, GIVEAWAY_DURATION_OPTIONS } from "../../lib/auctions";
import { giveawayRequirementText, handleShareGiveaway } from "../../lib/giveaways";
import Pill from "../../components/ui/Pill";
import GiveawayEntrantsPicker from "./GiveawayEntrantsPicker";

export default function GiveawaysTabContent({ giveaways, onCreate, createBusy, createError, onLoadEntrants, onClose, closeBusyId, onDelete, deleteBusyId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prizeDescription, setPrizeDescription] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [minPublications, setMinPublications] = useState("");
  const [minSales, setMinSales] = useState("");
  const [communityUrl, setCommunityUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [shareCopiedId, setShareCopiedId] = useState(null);
  const inputClass =
    "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
  const labelClass = "text-[11px] font-bold text-ink-soft";

  async function handleShareClick(g) {
    const copied = await handleShareGiveaway(g);
    if (copied) {
      setShareCopiedId(g.id);
      setTimeout(() => setShareCopiedId((id) => (id === g.id ? null : id)), 5000);
    }
  }

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
    const ok = await onCreate({
      title,
      description,
      prizeDescription,
      durationDays,
      minPublications: minPublications ? Number(minPublications) : null,
      minSales: minSales ? Number(minSales) : null,
      communityUrl,
      photoUrl,
    });
    if (ok) {
      setTitle("");
      setDescription("");
      setPrizeDescription("");
      setMinPublications("");
      setMinSales("");
      setCommunityUrl("");
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-line bg-paper p-3">
        <p className="text-[12px] font-extrabold text-ink">Nuevo sorteo</p>
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Premio</label>
            <input
              value={prizeDescription}
              onChange={(e) => setPrizeDescription(e.target.value)}
              placeholder="Ej: 1 booster box Scarlet & Violet"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Dura</label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {GIVEAWAY_DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDurationDays(opt.value)}
                  className={`rounded-lg border-2 py-1.5 text-[11px] font-bold transition ${
                    durationDays === opt.value ? "border-gold bg-gold/15 text-gold-dark" : "border-line bg-paper text-ink-soft"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Mínimo de cartas publicadas (opcional)</label>
              <input
                type="number"
                min={0}
                value={minPublications}
                onChange={(e) => setMinPublications(e.target.value)}
                placeholder="Sin requisito"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Mínimo de ventas concretadas (opcional)</label>
              <input
                type="number"
                min={0}
                value={minSales}
                onChange={(e) => setMinSales(e.target.value)}
                placeholder="Sin requisito"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Foto del premio (opcional)</label>
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
          <div>
            <label className={labelClass}>Link del grupo de la comunidad (opcional)</label>
            <input
              value={communityUrl}
              onChange={(e) => setCommunityUrl(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-ink-soft">
              Si lo cargás, se muestra en el sorteo aclarando que hay que estar en el grupo para participar.
            </p>
          </div>
          {(createError || photoError) && <p className="text-[11px] text-[#B9432C]">{createError || photoError}</p>}
          <button
            onClick={handleCreate}
            disabled={!title || createBusy || uploadingPhoto}
            className="w-full rounded-lg bg-gold py-2 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
          >
            {uploadingPhoto ? "Subiendo foto..." : createBusy ? "Creando..." : "Crear sorteo"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {giveaways.map((g) => (
          <div key={g.id} className="rounded-lg border-2 border-line bg-paper p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 gap-2.5">
                {g.photo_url && (
                  <img src={g.photo_url} alt="" className="h-14 w-14 shrink-0 rounded-lg border-2 border-line object-cover" />
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-ink">
                    {g.title}
                    <Pill tone={g.status === "open" ? "live" : "default"}>{g.status === "open" ? "Abierto" : "Cerrado"}</Pill>
                  </p>
                  {g.prize_description && <p className="text-[11px] text-ink-soft">Premio: {g.prize_description}</p>}
                  {giveawayRequirementText(g) && (
                    <p className="text-[11px] text-plum">{giveawayRequirementText(g)}</p>
                  )}
                  {g.community_url && (
                    <p className="truncate text-[11px] text-teal">Grupo: {g.community_url}</p>
                  )}
                  <p className="text-[10px] text-ink-soft">
                    Cierra: {new Date(g.closes_at).toLocaleDateString("es-AR")}
                  </p>
                  {g.status === "closed" && (
                    <p className="mt-1 text-[11px] font-bold text-gold-dark">Ganador: {g.winner?.alias ?? "—"}</p>
                  )}
                  {shareCopiedId === g.id && (
                    <p className="mt-1 text-[11px] font-bold text-forest-deep">
                      Texto copiado — pegalo como descripción si WhatsApp solo mandó la foto.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => handleShareClick(g)}
                  className="rounded-lg border-2 border-line p-1.5 text-ink-soft hover:border-forest-mid"
                  title="Compartir"
                >
                  <Share2 size={14} />
                </button>
              <button
                onClick={() => onDelete(g.id)}
                disabled={deleteBusyId === g.id}
                className="shrink-0 rounded-lg border-2 border-[#B9432C]/40 px-2.5 py-1 text-[11px] font-bold text-[#B9432C] disabled:opacity-40"
              >
                Borrar
              </button>
              </div>
            </div>
            {g.status === "open" && (
              <div className="mt-2">
                <GiveawayEntrantsPicker
                  giveawayId={g.id}
                  onLoadEntrants={onLoadEntrants}
                  onPickWinner={onClose}
                  closeBusy={closeBusyId === g.id}
                />
              </div>
            )}
          </div>
        ))}
        {giveaways.length === 0 && <p className="text-[12px] text-ink-soft">Todavía no creaste ningún sorteo.</p>}
      </div>
    </div>
  );
}
