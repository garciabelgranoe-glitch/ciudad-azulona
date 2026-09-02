import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { uploadAuctionPhoto, BLOG_CATEGORY_OPTIONS, BLOG_CATEGORY_LABEL } from "../../lib/auctions";

const inputClass =
  "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
const labelClass = "text-[11px] font-bold text-ink-soft";

function BlogPostRow({ post: p, onTogglePublished, onDelete, onUpdate, busy, editBusy, editError }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(p.title);
  const [body, setBody] = useState(p.body);
  const [category, setCategory] = useState(p.category ?? "general");

  function openEdit() {
    setTitle(p.title);
    setBody(p.body);
    setCategory(p.category ?? "general");
    setEditing(true);
  }

  async function handleSave() {
    const ok = await onUpdate(p.id, { title, body, category });
    if (ok) setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-lg border-2 border-forest-mid bg-paper p-3">
        <div className="space-y-2">
          <div>
            <label className={labelClass}>Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Texto</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {BLOG_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {editError && <p className="text-[11px] text-[#B9432C]">{editError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!title || !body || editBusy}
              className="rounded-lg bg-forest-mid px-3 py-2 text-[12px] font-bold text-paper disabled:opacity-40"
            >
              {editBusy ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={editBusy}
              className="rounded-lg border-2 border-line px-3 py-2 text-[12px] font-bold text-ink-soft"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 p-3 ${p.is_published ? "border-line bg-paper" : "border-line bg-cream-dark/40 opacity-70"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 gap-2.5">
          {p.photo_url && (
            <img src={p.photo_url} alt="" className="h-12 w-12 shrink-0 rounded-lg border-2 border-line object-cover" />
          )}
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-ink">{p.title}</p>
            <p className="line-clamp-2 text-[11px] text-ink-soft">{p.body}</p>
            <p className="mt-1 text-[10px] text-ink-soft">
              {new Date(p.created_at).toLocaleDateString("es-AR")}
              {" · "}
              {BLOG_CATEGORY_LABEL[p.category] ?? BLOG_CATEGORY_LABEL.general}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <button
            onClick={openEdit}
            className="rounded-lg border-2 border-line px-2.5 py-1 text-[11px] font-bold text-ink-soft"
          >
            Editar
          </button>
          <button
            onClick={() => onTogglePublished(p.id, !p.is_published)}
            disabled={busy === p.id}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-40 ${
              p.is_published ? "border-2 border-line text-ink-soft" : "bg-forest-mid text-paper"
            }`}
          >
            {p.is_published ? "Ocultar" : "Publicar"}
          </button>
          <button
            onClick={() => onDelete(p.id)}
            disabled={busy === p.id}
            className="rounded-lg border-2 border-[#B9432C]/40 px-2.5 py-1 text-[11px] font-bold text-[#B9432C] disabled:opacity-40"
          >
            Borrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BlogTabContent({
  posts,
  onCreate,
  createBusy,
  createError,
  onTogglePublished,
  onDelete,
  onUpdate,
  editBusyId,
  editError,
  busyId,
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

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
    const ok = await onCreate({ title, body, photoUrl, category });
    if (ok) {
      setTitle("");
      setBody("");
      setCategory("general");
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-line bg-paper p-3">
        <p className="text-[12px] font-extrabold text-ink">Nueva novedad</p>
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Texto</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {BLOG_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
            disabled={!title || !body || createBusy || uploadingPhoto}
            className="w-full rounded-lg bg-gold py-2 text-[12px] font-extrabold text-forest-deep disabled:opacity-40"
          >
            {uploadingPhoto ? "Subiendo imagen..." : createBusy ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {posts.map((p) => (
          <BlogPostRow
            key={p.id}
            post={p}
            onTogglePublished={onTogglePublished}
            onDelete={onDelete}
            onUpdate={onUpdate}
            busy={busyId}
            editBusy={editBusyId === p.id}
            editError={editBusyId === p.id ? editError : ""}
          />
        ))}
        {posts.length === 0 && <p className="text-[12px] text-ink-soft">Todavía no publicaste ninguna novedad.</p>}
      </div>
    </div>
  );
}
