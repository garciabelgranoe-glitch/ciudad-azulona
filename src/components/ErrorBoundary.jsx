import { Component } from "react";
import { logClientError } from "../lib/auctions";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import PokeballIcon from "./PokeballIcon";

// Sin esto, cualquier error de render deja al usuario con una pantalla en
// blanco sin ningún aviso — y a nosotros sin ningún registro de que pasó.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (!isSupabaseConfigured) return;
    logClientError({
      message: error?.message ?? String(error),
      stack: (error?.stack ?? "") + "\n" + (info?.componentStack ?? ""),
      viewName: "render_crash",
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-6 text-center">
          <PokeballIcon size={32} />
          <h1 className="mt-4 text-xl font-extrabold text-ink">Algo salió mal</h1>
          <p className="mt-2 max-w-sm text-[13px] text-ink-soft">
            Encontramos un error inesperado. Ya quedó registrado — probá recargar la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-gold px-5 py-2.5 text-[13px] font-extrabold text-forest-deep shadow-[0_4px_0_rgba(185,134,47,1)] transition hover:bg-gold-glow active:translate-y-[3px] active:shadow-[0_1px_0_rgba(185,134,47,1)]"
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
