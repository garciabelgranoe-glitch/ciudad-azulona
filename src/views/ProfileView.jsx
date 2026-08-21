import { useState } from "react";
import { ArrowLeft, Trophy, Star, TrendingDown, TrendingUp } from "lucide-react";
import GenderIcon from "../components/GenderIcon";
import BadgeIcon from "../components/BadgeIcon";
import { formatARS, formatPrice } from "../lib/format";
import StatHistoryList from "../components/ui/StatHistoryList";
import PickupInfoText from "../components/ui/PickupInfoText";

// Vista: Perfil
export default function ProfileView({ profile, onBack, isOwn = true, badges = [], stats, onEditPickup, onOpenLegal, onUpdateGender }) {
  const [editingGender, setEditingGender] = useState(false);
  const [savingGender, setSavingGender] = useState(false);

  async function handlePickGender(g) {
    if (g === profile.gender) {
      setEditingGender(false);
      return;
    }
    setSavingGender(true);
    try {
      await onUpdateGender(g);
    } finally {
      setSavingGender(false);
      setEditingGender(false);
    }
  }

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <header className="flex items-center gap-3 border-b-4 border-forest-mid bg-forest-deep px-5 py-4">
        <button onClick={onBack} className="text-cream/80 hover:text-paper focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <p className="font-pixel text-[9px] tracking-wide text-gold">{isOwn ? "TU PERFIL" : "PERFIL"}</p>
      </header>

      <div className="px-5 pt-6">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
          <GenderIcon gender={profile.gender} size={22} />
          {profile.alias}
          {profile.is_premium && (
            <span className="flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-extrabold text-gold-dark">
              <Trophy size={11} /> VENDEDOR VERIFICADO
            </span>
          )}
          {isOwn && onUpdateGender && !editingGender && (
            <button
              onClick={() => setEditingGender(true)}
              className="text-[11px] font-bold text-forest-deep underline underline-offset-2"
            >
              Editar ícono
            </button>
          )}
        </h2>

        {editingGender && (
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border-2 border-line bg-paper p-2.5">
            {[
              { value: "masculino", label: "Entrenador" },
              { value: "femenino", label: "Entrenadora" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={savingGender}
                onClick={() => handlePickGender(opt.value)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border-2 py-2.5 transition disabled:opacity-50 ${
                  profile.gender === opt.value ? "border-forest-mid bg-forest-mid/10" : "border-line bg-white"
                }`}
              >
                <GenderIcon gender={opt.value} size={24} />
                <span className="text-[10px] font-bold text-ink">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center gap-1 text-gold-dark">
          <Star size={14} fill="currentColor" strokeWidth={0} />
          <span className="text-[14px] font-bold">{Number(profile.rating_avg).toFixed(1)}</span>
          <span className="text-[12px] font-medium text-ink-soft">de reputación</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg border-2 border-ink bg-paper p-4 shadow-card">
            <p className="text-[11px] font-bold text-ink-soft">Ventas completadas</p>
            <p className="mt-1 text-2xl font-extrabold text-forest-deep">{profile.sales_count}</p>
          </div>
          <div className="rounded-lg border-2 border-ink bg-paper p-4 shadow-card">
            <p className="text-[11px] font-bold text-ink-soft">Compras completadas</p>
            <p className="mt-1 text-2xl font-extrabold text-forest-deep">{profile.purchases_count}</p>
          </div>
        </div>

        {stats && (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg border-2 border-line bg-paper p-3">
                <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                  <TrendingDown size={12} /> Gastó este mes
                </p>
                <p className="mt-1 text-[15px] font-extrabold text-ink">{formatARS(stats.monthlySpent?.ars ?? 0)}</p>
                {stats.monthlySpent?.usd > 0 && (
                  <p className="text-[12px] font-bold text-plum">{formatPrice(stats.monthlySpent.usd, "USD")}</p>
                )}
              </div>
              <div className="rounded-lg border-2 border-line bg-paper p-3">
                <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                  <TrendingUp size={12} /> Vendió este mes
                </p>
                <p className="mt-1 text-[15px] font-extrabold text-ink">{formatARS(stats.monthlyEarned?.ars ?? 0)}</p>
                {stats.monthlyEarned?.usd > 0 && (
                  <p className="text-[12px] font-bold text-plum">{formatPrice(stats.monthlyEarned.usd, "USD")}</p>
                )}
              </div>
            </div>

            {(stats.bestPurchase || stats.bestSale) && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {stats.bestPurchase && (
                  <div className="rounded-lg border-2 border-gold/50 bg-gold/10 p-3">
                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-gold-dark">
                      <Trophy size={12} /> Mejor compra
                    </p>
                    <p className="mt-1 line-clamp-1 text-[12px] font-bold text-ink">{stats.bestPurchase.cardName}</p>
                    <p className="text-[13px] font-extrabold text-forest-deep">{formatARS(stats.bestPurchase.amount)}</p>
                  </div>
                )}
                {stats.bestSale && (
                  <div className="rounded-lg border-2 border-gold/50 bg-gold/10 p-3">
                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-gold-dark">
                      <Trophy size={12} /> Mejor venta
                    </p>
                    <p className="mt-1 line-clamp-1 text-[12px] font-bold text-ink">{stats.bestSale.cardName}</p>
                    <p className="text-[13px] font-extrabold text-forest-deep">{formatARS(stats.bestSale.amount)}</p>
                  </div>
                )}
              </div>
            )}

            <StatHistoryList
              title="Últimas compras"
              icon={<TrendingDown size={12} />}
              items={stats.recentPurchases}
              emptyText={isOwn ? "Todavía no compraste ninguna carta." : "Todavía no compró ninguna carta."}
            />
            <StatHistoryList
              title="Últimas ventas"
              icon={<TrendingUp size={12} />}
              items={stats.recentSales}
              emptyText={isOwn ? "Todavía no vendiste ninguna carta." : "Todavía no vendió ninguna carta."}
            />
          </>
        )}

        <div className="mt-6">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Medallas</h3>
          {badges.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2">
              {badges.map((b) => (
                <div
                  key={b.code}
                  className="flex items-center gap-3 rounded-lg border-2 border-line bg-paper p-2.5 shadow-card"
                >
                  <div className="h-11 w-11 shrink-0">
                    <BadgeIcon icon={b.icon} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold text-ink">{b.name}</p>
                    <p className="text-[11px] leading-tight text-ink-soft">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[12px] text-ink-soft">
              {isOwn ? "Todavía no ganaste medallas." : "Todavía no ganó medallas."}
            </p>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Retiro de la carta</h3>
            {isOwn && (
              <button
                onClick={onEditPickup}
                className="text-[11px] font-bold text-forest-deep underline underline-offset-2"
              >
                Editar
              </button>
            )}
          </div>
          <div className="mt-2 rounded-lg border-2 border-line bg-paper p-3 text-[12px] leading-relaxed text-ink-soft">
            <PickupInfoText profile={profile} />
          </div>
        </div>

        {isOwn && onOpenLegal && (
          <button
            onClick={onOpenLegal}
            className="mt-8 text-[11px] font-medium text-ink-soft underline underline-offset-2"
          >
            Términos de uso y privacidad
          </button>
        )}
      </div>
    </div>
  );
}
