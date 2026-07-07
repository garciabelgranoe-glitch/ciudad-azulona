import { useState } from "react";
import { ShieldCheck, Smartphone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured } from "../lib/supabaseClient";

export default function Login() {
  const { sendOtp, verifyOtp, createProfile, session, profile } = useAuth();
  const [step, setStep] = useState("phone"); // phone | otp | alias
  const [phone, setPhone] = useState("+549");
  const [token, setToken] = useState("");
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSendOtp() {
    setError("");
    setBusy(true);
    try {
      await sendOtp(phone);
      setStep("otp");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    setBusy(true);
    try {
      await verifyOtp(phone, token);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateProfile() {
    setError("");
    setBusy(true);
    try {
      await createProfile(alias);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (session?.user && !profile) {
    return (
      <AuthShell title="Elegí tu alias" subtitle="Así te van a ver otros en las subastas">
        <input
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Ej: Fede_Cards"
          className="w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid"
        />
        {error && <p className="mt-2 text-[12px] text-[#B9432C]">{error}</p>}
        <button
          onClick={handleCreateProfile}
          disabled={!alias || busy}
          className="mt-4 w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          Continuar
        </button>
      </AuthShell>
    );
  }

  if (step === "otp") {
    return (
      <AuthShell title="Ingresá el código" subtitle={`Te lo enviamos por SMS a ${phone}`}>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="123456"
          inputMode="numeric"
          className="w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-center text-[20px] font-bold tracking-[0.3em] text-ink placeholder:text-ink-soft/40 focus:outline-none focus-visible:border-forest-mid"
        />
        {error && <p className="mt-2 text-[12px] text-[#B9432C]">{error}</p>}
        <button
          onClick={handleVerifyOtp}
          disabled={!token || busy}
          className="mt-4 w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          Confirmar
        </button>
        <button
          onClick={() => setStep("phone")}
          className="mt-3 w-full text-center text-[12px] font-bold text-ink-soft underline underline-offset-2"
        >
          Cambiar número
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Entrá con tu WhatsApp" subtitle="Usamos tu número para identificarte, sin contraseñas">
      {!isSupabaseConfigured && (
        <p className="mb-3 rounded-lg border-2 border-[#B9432C]/30 bg-[#FBE6E0] px-3 py-2 text-[12px] font-medium text-[#B9432C]">
          Supabase todavía no está configurado (falta VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
        </p>
      )}
      <div className="flex items-center gap-2 rounded-lg border-2 border-line bg-white px-3 py-2.5">
        <Smartphone size={16} className="text-ink-soft" />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+5491122334455"
          className="w-full bg-transparent text-[14px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none"
        />
      </div>
      {error && <p className="mt-2 text-[12px] text-[#B9432C]">{error}</p>}
      <button
        onClick={handleSendOtp}
        disabled={!phone || busy || !isSupabaseConfigured}
        className="mt-4 w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
      >
        Enviar código
      </button>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2 text-gold-dark">
          <ShieldCheck size={18} />
          <span className="font-pixel text-[9px] tracking-wide">POKECOOL SUBASTAS</span>
        </div>
        <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
        <p className="mt-1 text-[13px] text-ink-soft">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
