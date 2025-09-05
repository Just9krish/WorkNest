import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function getCurrentSession(): Promise<Session | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session ?? null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function signInWithOAuth(
  provider: "github" | "google",
  redirectTo: string
): Promise<void> {
  try {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
  } catch (error) {
    console.error("Error during OAuth sign-in:", error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error during sign out:", error);
  }
}


