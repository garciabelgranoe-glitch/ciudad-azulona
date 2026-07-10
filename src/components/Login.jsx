import { useState } from "react";
import { Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import PokeballIcon from "./PokeballIcon";
import GenderIcon from "./GenderIcon";

// A veces el error que llega de Supabase no trae un .message legible (por
// ejemplo si falla el envío del mail del lado del proveedor de SMTP) — en
// vez de mostrar algo críptico tipo "{}", mostramos un mensaje genérico.
function getErrorMessage(e) {
  const msg = e?.message;
  if (typeof msg === "string" && msg.trim() && msg.trim() !== "{}") return msg;
  return "No pudimos completar la acción. Probá de nuevo en un momento.";
}

export default function Login({ onOpenLegal }) {
  const { sendOtp, verifyOtp, createProfile, session, profile } = useAuth();
  const [step, setStep] = useState("email"); // email | otp | alias
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [alias, setAlias] = useState("");
  const [gender, setGender] = useState("masculino");
  const [contactPhone, setContactPhone] = useState("+549");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSendOtp() {
    setError("");
    setBusy(true);
    try {
      await sendOtp(email);
      setStep("otp");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    setBusy(true);
    try {
      await verifyOtp(email, token);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateProfile() {
    setError("");
    setBusy(true);
    try {
      await createProfile(alias, gender, contactPhone);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (session?.user && !profile) {
    return (
      <AuthShell title="Elegí tu alias" subtitle="Así te van a ver otros en las subastas" onOpenLegal={onOpenLegal}>
        <input
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Ej: Fede_Cards"
          className="w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[16px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid"
        />

        <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
          Elegí tu ícono de entrenador
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "masculino", label: "Entrenador" },
            { value: "femenino", label: "Entrenadora" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGender(opt.value)}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 py-3 transition ${
                gender === opt.value ? "border-forest-mid bg-forest-mid/10" : "border-line bg-white"
              }`}
            >
              <GenderIcon gender={opt.value} size={30} />
              <span className="text-[11px] font-bold text-ink">{opt.label}</span>
            </button>
          ))}
        </div>

        <p className="mb-1.5 mt-4 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
          Tu teléfono de contacto
        </p>
        <input
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="+5491122334455"
          className="w-full rounded-lg border-2 border-line bg-white px-3 py-2.5 text-[16px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none focus-visible:border-forest-mid"
        />
        <p className="mt-1 text-[11px] text-ink-soft">
          Lo usamos para coordinar la entrega de las cartas, no para el login.
        </p>

        {error && <p className="mt-2 text-[12px] text-[#B9432C]">{error}</p>}
        <button
          onClick={handleCreateProfile}
          disabled={!alias || !contactPhone || busy}
          className="mt-4 w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
        >
          Continuar
        </button>
      </AuthShell>
    );
  }

  if (step === "otp") {
    return (
      <AuthShell title="Ingresá el código" subtitle={`Te lo enviamos por mail a ${email}`} onOpenLegal={onOpenLegal}>
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
          onClick={() => setStep("email")}
          className="mt-3 w-full text-center text-[12px] font-bold text-ink-soft underline underline-offset-2"
        >
          Cambiar email
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Bienvenido a Ciudad Azulona" subtitle="Usamos tu email para identificarte, sin contraseñas" onOpenLegal={onOpenLegal}>
      {!isSupabaseConfigured && (
        <p className="mb-3 rounded-lg border-2 border-[#B9432C]/30 bg-[#FBE6E0] px-3 py-2 text-[12px] font-medium text-[#B9432C]">
          Supabase todavía no está configurado (falta VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
        </p>
      )}
      <div className="flex items-center gap-2 rounded-lg border-2 border-line bg-white px-3 py-2.5">
        <Mail size={16} className="text-ink-soft" />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          type="email"
          className="w-full bg-transparent text-[16px] font-medium text-ink placeholder:text-ink-soft/50 focus:outline-none"
        />
      </div>
      {error && <p className="mt-2 text-[12px] text-[#B9432C]">{error}</p>}
      <button
        onClick={handleSendOtp}
        disabled={!email || busy || !isSupabaseConfigured}
        className="mt-4 w-full rounded-lg bg-gold py-3 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)] disabled:opacity-40"
      >
        Enviar código
      </button>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children, onOpenLegal }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2 text-gold-dark">
          <PokeballIcon size={18} />
          <span className="font-pixel text-[9px] tracking-wide">CIUDAD AZULONA</span>
        </div>
        <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
        <p className="mt-1 text-[13px] text-ink-soft">{subtitle}</p>
        <div className="mt-6">{children}</div>
        {onOpenLegal && (
          <button
            onClick={onOpenLegal}
            className="mt-6 text-[11px] font-medium text-ink-soft underline underline-offset-2"
          >
            Términos de uso y privacidad
          </button>
        )}
      </div>
    </div>
  );
}
