export function giveawayRequirementText(g) {
  const parts = [];
  if (g.min_publications) parts.push(`mínimo ${g.min_publications} carta(s) publicada(s)`);
  if (g.min_sales) parts.push(`mínimo ${g.min_sales} venta(s) concretada(s)`);
  return parts.length > 0 ? `Requisito para anotarte: ${parts.join(" y ")}.` : null;
}

export function giveawayShareText(g) {
  return [
    `🎁 ${g.title}`,
    g.prize_description ? `Premio: ${g.prize_description}` : null,
    `Cierra el ${new Date(g.closes_at).toLocaleDateString("es-AR")}`,
    giveawayRequirementText(g),
    g.community_url ? `Para participar, sumate al grupo: ${g.community_url}` : null,
    `Enterate del resultado acá: ${window.location.origin}/sorteo/${g.id}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// Devuelve true si el texto quedó copiado al portapapeles como resguardo
// (WhatsApp, sobre todo en Android, suele descartar el texto/título del
// share sheet cuando también se adjunta una imagen y solo pasa la foto —
// así el usuario lo puede pegar a mano como descripción del posteo).
export async function handleShareGiveaway(g) {
  const text = giveawayShareText(g);

  if (navigator.share) {
    try {
      if (g.photo_url && navigator.canShare) {
        const res = await fetch(g.photo_url);
        const blob = await res.blob();
        const file = new File([blob], "sorteo.jpg", { type: blob.type || "image/jpeg" });
        if (navigator.canShare({ files: [file] })) {
          let copiedAsCaption = false;
          try {
            await navigator.clipboard.writeText(text);
            copiedAsCaption = true;
          } catch {
            // clipboard no disponible (ej. sin permisos) — seguimos igual
          }
          await navigator.share({ files: [file], title: g.title, text });
          return copiedAsCaption;
        }
      }
      await navigator.share({ title: g.title, text });
    } catch {
      // el usuario canceló el share sheet, no hacemos nada
    }
    return false;
  }

  // Desktop sin Web Share API: abrir WhatsApp Web con el texto precargado
  // (el click-to-chat de WhatsApp no admite adjuntar una imagen por URL).
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  return false;
}
