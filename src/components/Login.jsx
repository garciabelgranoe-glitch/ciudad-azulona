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
          className="w-full rounded-lg border border-[#3A3F4B] bg-[#1B1E24] px-3 py-2.5 text-[14px] text-[#F2EFE9] placeholder:text-[#5A5E68] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A34E]"
        />
        {error && <p className="mt-2 text-[12px] text-[#E38166]">{error}</p>}
        <button
          onClick={handleCreateProfile}
          disabled={!alias || busy}
          className="mt-4 w-full rounded-lg bg-[#C9A34E] py-3 text-[13px] font-semibold text-[#14161A] transition hover:bg-[#D9BB74] disabled:opacity-40"
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
          className="w-full rounded-lg border border-[#3A3F4B] bg-[#1B1E24] px-3 py-2.5 text-center text-[20px] tracking-[0.3em] text-[#F2EFE9] placeholder:text-[#5A5E68] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A34E]"
        />
        {error && <p className="mt-2 text-[12px] text-[#E38166]">{error}</p>}
        <button
          onClick={handleVerifyOtp}
          disabled={!token || busy}
          className="mt-4 w-full rounded-lg bg-[#C9A34E] py-3 text-[13px] font-semibold text-[#14161A] transition hover:bg-[#D9BB74] disabled:opacity-40"
        >
          Confirmar
        </button>
        <button
          onClick={() => setStep("phone")}
          className="mt-3 w-full text-center text-[12px] text-[#9A9DA6] underline underline-offset-2"
        >
          Cambiar número
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Entrá con tu WhatsApp" subtitle="Usamos tu número para identificarte, sin contraseñas">
      {!isSupabaseConfigured && (
        <p className="mb-3 rounded-lg border border-[#B5462F]/40 bg-[#B5462F]/10 px-3 py-2 text-[12px] text-[#E38166]">
          Supabase todavía no está configurado (falta VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
        </p>
      )}
      <div className="flex items-center gap-2 rounded-lg border border-[#3A3F4B] bg-[#1B1E24] px-3 py-2.5">
        <Smartphone size={16} className="text-[#6B6F79]" />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+5491122334455"
          className="w-full bg-transparent text-[14px] text-[#F2EFE9] placeholder:text-[#5A5E68] focus:outline-none"
        />
      </div>
      {error && <p className="mt-2 text-[12px] text-[#E38166]">{error}</p>}
      <button
        onClick={handleSendOtp}
        disabled={!phone || busy || !isSupabaseConfigured}
        className="mt-4 w-full rounded-lg bg-[#C9A34E] py-3 text-[13px] font-semibold text-[#14161A] transition hover:bg-[#D9BB74] disabled:opacity-40"
      >
        Enviar código
      </button>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2 text-[#C9A34E]">
          <ShieldCheck size={18} />
          <span className="text-[11px] uppercase tracking-[0.2em]">PokeCool subastas</span>
        </div>
        <h1 className="font-display text-2xl text-[#F2EFE9]">{title}</h1>
        <p className="mt-1 text-[13px] text-[#9A9DA6]">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
