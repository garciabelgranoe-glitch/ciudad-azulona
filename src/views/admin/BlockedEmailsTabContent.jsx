import { useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-lg border-2 border-line bg-white px-3 py-2 text-[13px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid";
const labelClass = "text-[11px] font-bold text-ink-soft";

export default function BlockedEmailsTabContent({ blockedEmails, onBlock, blockBusy, blockError, onUnblock, unblockBusyId }) {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");

  async function handleBlock() {
    const ok = await onBlock(email, reason);
    if (ok) {
      setEmail("");
      setReason("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-line bg-paper p-3">
        <p className="text-[12px] font-extrabold text-ink">Bloquear un email</p>
        <p className="mt-1 text-[11px] text-ink-soft">
          Nadie va a poder crear una cuenta con este email — se corta en el momento del registro.
        </p>
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: usuario@ejemplo.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Motivo (opcional, queda para referencia)</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} />
          </div>
          {blockError && <p className="text-[11px] text-[#B9432C]">{blockError}</p>}
          <button
            onClick={handleBlock}
            disabled={!email.trim() || blockBusy}
            className="w-full rounded-lg bg-[#B9432C] py-2 text-[12px] font-extrabold text-paper disabled:opacity-40"
          >
            {blockBusy ? "Bloqueando..." : "Bloquear"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {blockedEmails.map((b) => (
          <div key={b.email} className="flex items-start justify-between gap-2 rounded-lg border-2 border-line bg-paper p-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-extrabold text-ink">{b.email}</p>
              {b.reason && <p className="text-[11px] text-ink-soft">{b.reason}</p>}
              <p className="mt-1 text-[10px] text-ink-soft">{new Date(b.created_at).toLocaleDateString("es-AR")}</p>
            </div>
            <button
              onClick={() => onUnblock(b.email)}
              disabled={unblockBusyId === b.email}
              className="shrink-0 rounded-lg border-2 border-line px-2.5 py-1 text-[11px] font-bold text-ink-soft disabled:opacity-40"
            >
              Desbloquear
            </button>
          </div>
        ))}
        {blockedEmails.length === 0 && <p className="text-[12px] text-ink-soft">No hay ningún email bloqueado.</p>}
      </div>
    </div>
  );
}
