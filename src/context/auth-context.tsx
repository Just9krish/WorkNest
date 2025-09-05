import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { TABLES } from "../lib/utils";
import { Profile, Workspace } from "../types";

interface AuthContextValue {
  isAuthLoading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  workspace: Workspace | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (_event === "SIGNED_OUT") {
        setProfile(null);
        setWorkspace(null);
        setIsAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      setIsAuthLoading(true);
      const { data: profileRes } = await supabase
        .from(TABLES.profiles)
        .select("*")
        .eq("id", user.id)
        .single();
      if (cancelled) return;
      if (profileRes) {
        setProfile(profileRes as Profile);
        setWorkspace({ id: profileRes.id, name: profileRes.username || "My Workspace" });
      }
      setIsAuthLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthLoading,
      session,
      user,
      profile,
      workspace,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [isAuthLoading, session, user, profile, workspace]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


