import { MessageCircle } from "lucide-react";

export default function WhatsappCommunityBanner({ communities, onOpenAll }) {
  const active = (communities ?? []).filter((c) => c.is_active);
  if (active.length === 0 || !onOpenAll) return null;

  return (
    <button
      onClick={onOpenAll}
      className="flex w-full items-center gap-2.5 rounded-lg border-2 border-[#25D366]/50 bg-[#25D366]/10 px-3.5 py-2.5 text-left transition hover:bg-[#25D366]/15"
    >
      <MessageCircle size={16} className="shrink-0 text-[#128C4A]" />
      <span className="min-w-0 flex-1 text-[11.5px] font-bold text-ink">
        Sumate a la comunidad de WhatsApp de Ciudad Azulona
      </span>
      <span className="shrink-0 text-[11px] font-bold text-[#128C4A] underline underline-offset-2">
        Unirme →
      </span>
    </button>
  );
}
