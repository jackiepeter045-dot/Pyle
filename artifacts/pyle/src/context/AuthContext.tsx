import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Profile } from "../types";

interface AuthCtx {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

async function fetchProfile(id: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
  return data ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user?.id) setProfile(await fetchProfile(data.session.user.id));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      if (s?.user?.id) setProfile(await fetchProfile(s.user.id));
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function refreshProfile() {
    if (session?.user?.id) setProfile(await fetchProfile(session.user.id));
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
    console.log("[signUp] data:", data, "error:", error, "raw:", JSON.stringify(error));
    if (!error) return null;
    // error.message can be "{}" when a DB trigger fails — dig deeper
    const msg = error.message;
    if (!msg || msg === "{}") {
      const e = error as unknown as Record<string, unknown>;
      return String(e["details"] || e["hint"] || e["code"] || JSON.stringify(error) || "Signup failed. Please try again.");
    }
    return msg;
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return <Ctx.Provider value={{ session, profile, loading, signUp, signIn, signInGoogle, signOut, refreshProfile }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
