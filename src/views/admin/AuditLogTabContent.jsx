const ACTION_LABEL = {
  suspender_usuario: "Suspendió a un usuario",
  reactivar_usuario: "Reactivó a un usuario",
  dar_premium: "Le dio premium a un usuario",
  quitar_premium: "Le quitó premium a un usuario",
  resolver_denuncia: "Resolvió una denuncia",
  cancelar_subasta: "Canceló una subasta",
  destacar_subasta: "Destacó una subasta",
  quitar_destacado_subasta: "Le quitó el destacado a una subasta",
  bloquear_email: "Bloqueó un email",
  desbloquear_email: "Desbloqueó un email",
};

export default function AuditLogTabContent({ entries }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-ink-soft">
        Registro de las acciones sensibles hechas desde este panel — quién y cuándo.
      </p>
      {entries.map((e) => (
        <div key={e.id} className="rounded-lg border-2 border-line bg-paper p-3">
          <p className="text-[13px] font-bold text-ink">{ACTION_LABEL[e.action] ?? e.action}</p>
          <p className="text-[11px] text-ink-soft">
            {e.admin?.alias ?? "—"} · {new Date(e.created_at).toLocaleString("es-AR")}
          </p>
          {e.details && (
            <p className="mt-1 text-[10px] text-ink-soft">{JSON.stringify(e.details)}</p>
          )}
        </div>
      ))}
      {entries.length === 0 && <p className="text-[12px] text-ink-soft">Todavía no hay ninguna acción registrada.</p>}
    </div>
  );
}
