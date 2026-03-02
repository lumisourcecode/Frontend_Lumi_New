import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { getSupabase } from "@/lib/supabase";

export type AppRole = "rider" | "driver";

export type Profile = {
  id: string;
  role: AppRole;
  full_name: string | null;
  phone: string | null;
};

type AuthState = {
  isReady: boolean;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
  devSetRole: (role: AppRole) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;

    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setIsReady(true);
    });

    const { data: sub } = getSupabase().auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile(userId: string) {
      const supabase = getSupabase();
      // profiles table is created in our Supabase schema file.
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, full_name, phone")
        .eq("id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        // Schema not created yet or RLS misconfigured.
        setProfile(null);
        return;
      }

      if (!data) {
        // Create a default rider profile on first login.
        const { data: created, error: createError } = await supabase
          .from("profiles")
          .insert({ id: userId, role: "rider" })
          .select("id, role, full_name, phone")
          .single();
        if (cancelled) return;
        if (createError) {
          setProfile(null);
          return;
        }
        setProfile(created as Profile);
        return;
      }

      setProfile(data as Profile);
    }

    if (!session?.user?.id) {
      setProfile(null);
      return;
    }

    void loadProfile(session.user.id);
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const value = useMemo<AuthState>(
    () => ({
      isReady,
      user: session?.user ?? null,
      session,
      profile,
      signOut: async () => {
        await getSupabase().auth.signOut();
      },
      devSetRole: async (role: AppRole) => {
        if (!session?.user?.id) return;
        const supabase = getSupabase();
        await supabase.from("profiles").update({ role }).eq("id", session.user.id);
        setProfile((p) => (p ? { ...p, role } : p));
      },
    }),
    [isReady, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

