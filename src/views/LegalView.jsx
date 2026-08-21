import { ArrowLeft } from "lucide-react";

// Vista: Términos de uso y privacidad
export default function LegalView({ onBack }) {
  const Section = ({ title, children }) => (
    <div className="mt-5">
      <h3 className="text-[13px] font-extrabold text-ink">{title}</h3>
      <div className="mt-1.5 space-y-2 text-[12.5px] leading-relaxed text-ink-soft">{children}</div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">TERMINOS Y PRIVACIDAD</p>
      </header>

      <div className="px-5 pt-6">
        <p className="text-[11px] text-ink-soft">Última actualización: julio de 2026.</p>

        <Section title="Qué es Ciudad Azulona">
          <p>
            Ciudad Azulona es un espacio para coordinar subastas de cartas Pokémon TCG entre coleccionistas.
            Complementa la coordinación por WhatsApp, no la reemplaza: la plataforma organiza la puja y genera
            un código de retiro, pero el intercambio de la carta y del dinero pasa siempre en persona, entre
            vendedor y comprador.
          </p>
        </Section>

        <Section title="Pagos y entregas">
          <p>
            Ciudad Azulona no procesa pagos ni maneja dinero. El precio que se ve en la app es el que se pactó
            en la puja; cómo y cuándo se paga lo acuerdan vendedor y comprador directamente, fuera de la
            plataforma. El código de retiro solo confirma la identidad de la entrega, no reemplaza tu propio
            criterio: revisá la carta antes de confirmar el retiro.
          </p>
        </Section>

        <Section title="Qué datos guardamos">
          <p>
            Guardamos tu email (para identificarte por código, sin contraseñas), tu teléfono de contacto
            (para coordinar la entrega), el alias que elegís, las fotos que subís de tus cartas, y el
            historial de subastas, pujas y calificaciones en las que participás. No compartimos tu email con
            otros usuarios. Tu teléfono de contacto sí se lo mostramos a la otra parte únicamente cuando se
            concreta una venta con vos (comprador y vendedor se ven el teléfono entre sí para coordinar la
            entrega) — el resto de la comunidad solo ve tu alias, tu reputación y las fotos de tus
            publicaciones.
          </p>
        </Section>

        <Section title="Tu responsabilidad como usuario">
          <p>
            Sos responsable de que la información que publicás sobre una carta (estado, autenticidad, fotos)
            sea precisa. Publicar información falsa o engañosa, no presentarte a una entrega acordada, o
            manipular pujas, puede derivar en la suspensión de tu cuenta.
          </p>
        </Section>

        <Section title="Moderación">
          <p>
            Cualquier usuario puede denunciar una subasta que le parezca sospechosa. El equipo de Ciudad
            Azulona puede suspender cuentas que incumplan estas condiciones; una cuenta suspendida no puede
            pujar ni publicar, pero conserva acceso para retirar cartas ya ganadas.
          </p>
        </Section>

        <Section title="Cambios a estos términos">
          <p>
            Podemos actualizar este texto a medida que la plataforma crece. Los cambios importantes se van a
            avisar dentro de la app.
          </p>
        </Section>

        <Section title="Contacto">
          <p>Para dudas, reclamos o para ejercer tus derechos sobre tus datos, escribinos por WhatsApp al grupo de la comunidad.</p>
        </Section>
      </div>
    </div>
  );
}
