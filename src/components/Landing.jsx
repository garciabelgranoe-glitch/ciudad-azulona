import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import PokeballIcon from "./PokeballIcon";
import PixelTrees from "./PixelTrees";
import FeatureIcon from "./FeatureIcon";
import { getPublicPlatformStats } from "../lib/auctions";

// Revela cada sección con un fade + subida sutil cuando entra en pantalla,
// en vez de que todo esté visible de una — nada agresivo, solo un empujón
// de "esto está vivo" al bajar.
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function StepCard({ number, variant, title, text }) {
  return (
    <div className="relative rounded-xl border-2 border-line bg-paper p-5 shadow-card">
      <span className="font-pixel absolute -top-3 left-5 rounded bg-forest-deep px-2 py-1 text-[10px] text-gold">
        {number}
      </span>
      <FeatureIcon variant={variant} size={26} />
      <p className="mt-3 text-[14px] font-extrabold text-ink">{title}</p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}

function StatBlock({ value, label }) {
  return (
    <div className="text-center">
      <p className="font-pixel text-[22px] text-gold sm:text-[28px]">{value}</p>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-cream/70">{label}</p>
    </div>
  );
}

function SellerTile({ seller }) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-line bg-paper shadow-card">
      <div className="flex h-28 items-center justify-center bg-cream-dark/60">
        {seller.photo_url ? (
          <img src={seller.photo_url} alt={seller.business_name} className="h-full w-full object-cover" />
        ) : (
          <Trophy size={28} className="text-gold-dark" />
        )}
      </div>
      <div className="p-3.5">
        <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-ink">
          {seller.business_name}
          <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[8px] font-bold text-gold-dark">VERIFICADO</span>
        </p>
        {seller.description && <p className="mt-1 line-clamp-2 text-[11.5px] text-ink-soft">{seller.description}</p>}
      </div>
    </div>
  );
}

export default function Landing({ onEnter, onGetStarted, onOpenLegal, recommendedSellers = [] }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getPublicPlatformStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const activeSellers = recommendedSellers.filter((s) => s.is_active).slice(0, 4);

  return (
    <div className="bg-paper">
      {/* HERO */}
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-b from-forest-deeper via-forest-deep to-forest-mid">
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-40 pt-16 text-center">
          <PokeballIcon size={38} />
          <p className="font-pixel mt-5 text-[9px] tracking-[0.2em] text-gold/80">SUBASTAS EN VIVO · POKÉMON TCG</p>
          <h1 className="font-pixel mt-3 text-[22px] leading-relaxed tracking-wide text-gold sm:text-[30px]">
            CIUDAD AZULONA
          </h1>
          <p className="mt-5 max-w-md text-[15px] font-medium leading-relaxed text-cream/90 sm:text-[17px]">
            El pueblo donde los coleccionistas argentinos subastan, venden y encuentran sus cartas Pokémon.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onGetStarted}
              className="rounded-lg bg-gold px-8 py-3.5 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)]"
            >
              Crear cuenta gratis
            </button>
            <button
              onClick={onEnter}
              className="rounded-lg border-2 border-cream/30 px-8 py-3.5 text-[13px] font-extrabold text-cream transition hover:border-cream/60 hover:bg-white/5"
            >
              Ver subastas sin registrarte
            </button>
          </div>

          {stats && stats.activeListings > 0 && (
            <p className="mt-6 flex items-center gap-1.5 text-[11.5px] font-bold text-cream/70">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-forest-light" />
              {stats.activeListings} subastas en vivo ahora mismo
            </p>
          )}
        </div>
        <PixelTrees />
      </div>

      {/* CÓMO FUNCIONA */}
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <Reveal>
          <p className="font-pixel text-center text-[9px] tracking-[0.2em] text-gold-dark">CÓMO FUNCIONA</p>
          <h2 className="mt-3 text-center text-[24px] font-extrabold text-ink sm:text-[30px]">
            De la puja al café con el vendedor
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal delay={0}>
            <StepCard
              number="1"
              variant="bolt"
              title="Publicás o pujás"
              text="Subís fotos de tu carta y elegís el formato: subasta, venta directa o free claim. O pujás por lo que estás buscando."
            />
          </Reveal>
          <Reveal delay={80}>
            <StepCard
              number="2"
              variant="trade"
              title="Coordinás la entrega"
              text="Nosotros no tocamos la plata — vos y el vendedor coordinan el pago y el punto de encuentro, como corresponde."
            />
          </Reveal>
          <Reveal delay={160}>
            <StepCard
              number="3"
              variant="medal"
              title="Confirmás con un código"
              text="Un código único de la plataforma confirma que la entrega fue real, antes de calificarse mutuamente."
            />
          </Reveal>
          <Reveal delay={240}>
            <StepCard
              number="4"
              variant="store"
              title="Construís reputación"
              text="Cada venta suma a tu perfil: calificación, medallas y la insignia de vendedor verificado."
            />
          </Reveal>
        </div>
      </div>

      {/* VENDEDORES GARANTIZADOS */}
      {activeSellers.length > 0 && (
        <div className="bg-cream py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <p className="font-pixel text-center text-[9px] tracking-[0.2em] text-gold-dark">CONFIANZA REAL</p>
              <h2 className="mt-3 text-center text-[24px] font-extrabold text-ink sm:text-[30px]">
                Vendedores garantizados
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-center text-[13.5px] leading-relaxed text-ink-soft">
                Comercios y coleccionistas que la plataforma verificó a mano — productos oficiales, buena onda
                comprobada.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {activeSellers.map((s, i) => (
                <Reveal key={s.id} delay={i * 80}>
                  <SellerTile seller={s} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NÚMEROS REALES */}
      <div className="bg-forest-deep py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <p className="font-pixel text-center text-[9px] tracking-[0.2em] text-gold/80">LA CIUDAD, EN NÚMEROS</p>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-8 grid grid-cols-2 gap-y-8 sm:grid-cols-5">
              <StatBlock value={stats ? `${stats.totalListings}+` : "—"} label="Cartas publicadas" />
              <StatBlock value={stats ? stats.activeListings : "—"} label="En vivo ahora" />
              <StatBlock value={stats ? stats.totalSales : "—"} label="Ventas concretadas" />
              <StatBlock value={stats ? stats.verifiedSellers : "—"} label="Vendedores verificados" />
              <StatBlock value={stats ? stats.cities : "—"} label="Ciudades" />
            </div>
          </Reveal>
        </div>
      </div>

      {/* COMUNIDAD */}
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="grid gap-8 sm:grid-cols-3">
          <Reveal delay={0} className="flex flex-col items-center text-center">
            <FeatureIcon variant="gift" size={30} />
            <p className="mt-3 text-[14px] font-extrabold text-ink">Sorteos exclusivos</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
              Giveaways solo para la comunidad, con requisitos claros y ganador transparente.
            </p>
          </Reveal>
          <Reveal delay={100} className="flex flex-col items-center text-center">
            <FeatureIcon variant="news" size={30} />
            <p className="mt-3 text-[14px] font-extrabold text-ink">Novedades del hobby</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
              Colecciones nuevas, precios de mercado y contenido pensado para coleccionistas argentinos.
            </p>
          </Reveal>
          <Reveal delay={200} className="flex flex-col items-center text-center">
            <FeatureIcon variant="medal" size={30} />
            <p className="mt-3 text-[14px] font-extrabold text-ink">Ranking de la comunidad</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
              Los mejores vendedores y compradores, a la vista de todos.
            </p>
          </Reveal>
        </div>
      </div>

      {/* CTA FINAL */}
      <div className="relative overflow-hidden bg-gradient-to-b from-forest-mid to-forest-deeper px-6 py-16 text-center sm:py-20">
        <Reveal>
          <PokeballIcon size={28} />
          <h2 className="mt-4 text-[22px] font-extrabold text-cream sm:text-[28px]">
            Tu próxima carta está en Ciudad Azulona
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[13.5px] text-cream/80">
            Es gratis, no pedimos tarjeta, y te toma un minuto.
          </p>
          <button
            onClick={onGetStarted}
            className="mt-7 rounded-lg bg-gold px-9 py-3.5 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)]"
          >
            Crear cuenta gratis
          </button>
        </Reveal>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col items-center gap-3 bg-forest-deeper px-6 py-8 text-center">
        <div className="flex items-center gap-2">
          <PokeballIcon size={14} />
          <span className="font-pixel text-[8px] tracking-wide text-gold/70">CIUDAD AZULONA</span>
        </div>
        {onOpenLegal && (
          <button onClick={onOpenLegal} className="text-[11px] font-medium text-cream/50 underline underline-offset-2">
            Términos de uso y privacidad
          </button>
        )}
      </div>
    </div>
  );
}
