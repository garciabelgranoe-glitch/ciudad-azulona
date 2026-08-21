import { ArrowLeft } from "lucide-react";

export default function NotificationsView({ notifications, onBack, onOpenNotification, onMarkAllRead }) {
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">NOTIFICACIONES</p>
      </header>

      <div className="px-5 pt-6">
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="mb-3 text-[11px] font-bold text-forest-deep underline underline-offset-2"
          >
            Marcar todas como leídas
          </button>
        )}

        {notifications.length === 0 && (
          <p className="text-[12px] text-ink-soft">Todavía no tenés notificaciones.</p>
        )}

        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => onOpenNotification(n)}
              className={`rounded-lg border-2 p-3 text-left transition ${
                n.read_at ? "border-line bg-paper" : "border-[#B9432C]/30 bg-[#FBE6E0]"
              }`}
            >
              <p className={`text-[13px] leading-relaxed ${n.read_at ? "text-ink-soft" : "font-bold text-[#B9432C]"}`}>
                {n.message}
              </p>
              <p className="mt-1 text-[10px] text-ink-soft">
                {new Date(n.created_at).toLocaleString("es-AR")}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
