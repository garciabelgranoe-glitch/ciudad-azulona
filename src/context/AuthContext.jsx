import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [profileLoading, setProfileLoading] = useState(false);
  const lastProfileUserIdRef = useRef(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !session?.user) {
      setProfile(null);
      setProfileLoading(false);
      lastProfileUserIdRef.current = null;
      return;
    }
    // Supabase refresca el token en segundo plano (por ejemplo al volver a la
    // pestaña), lo que dispara este efecto con el mismo usuario pero un
    // objeto `session` nuevo. Si ya tenemos el perfil de ese usuario, no hace
    // falta volver a pedirlo — hacerlo prendía `profileLoading` y eso tapaba
    // la vista actual con una pantalla en blanco, perdiendo cualquier
    // formulario que el usuario estuviera completando.
    if (lastProfileUserIdRef.current === session.user.id) return;
    lastProfileUserIdRef.current = session.user.id;
    setProfileLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [session]);

  async function sendOtp(email) {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  }

  async function verifyOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: token.trim(), type: "email" });
    if (error) throw error;
    setSession(data.session);
  }

  async function createProfile(alias, gender, phone) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({ id: session.user.id, alias, gender: gender || null, phone })
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, profileLoading, sendOtp, verifyOtp, createProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
