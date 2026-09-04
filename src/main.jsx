import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { logClientError } from "./lib/auctions.js";
import { isSupabaseConfigured } from "./lib/supabaseClient.js";

if (isSupabaseConfigured) {
  window.addEventListener("error", (e) => {
    logClientError({ message: e.message, stack: e.error?.stack, viewName: "window_error" }).catch(() => {});
  });
  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    logClientError({
      message: reason?.message ?? String(reason),
      stack: reason?.stack,
      viewName: "unhandled_rejection",
    }).catch(() => {});
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
