import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Models } from "appwrite";
import { getCurrentUser, getUserProfile, signOut, handleOAuthCallback } from "../lib/auth";
import { Profile, Workspace } from "../types";

interface AuthContextValue {
  isAuthLoading: boolean;
  user: Models.User<Models.Preferences> | null;
  profile: Profile | null;
  workspace: Workspace | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode; }) {
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        // First, handle OAuth callback if present (after redirect)
        await handleOAuthCallback();
        if (!isMounted) return;

        // Then check if user is authenticated
        const currentUser = await getCurrentUser();
        if (!isMounted) return;

        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      }
    };
    init();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      setIsAuthLoading(true);
      try {
        const userProfile = await getUserProfile(user.$id);
        if (cancelled) return;

        if (userProfile) {
          setProfile(userProfile);
          setWorkspace({
            id: userProfile.$id,
            name: userProfile.username || "My Workspace"
          });
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthLoading,
      user,
      profile,
      workspace,
      signOut: async () => {
        await signOut();
        setUser(null);
        setProfile(null);
        setWorkspace(null);
        setIsAuthLoading(false);
      },
    }),
    [isAuthLoading, user, profile, workspace]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


