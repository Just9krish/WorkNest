import { Models, OAuthProvider } from "appwrite";
import { account, databases, DATABASE_ID, COLLECTIONS } from "./appwrite";
import { mapProfileFromDocument } from "./mappers";
import { Profile } from "../types";

export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    // The "missing scope (account)" error is expected when there's no active session
    // This is a normal way to check if a user is logged in
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as { code?: number; })?.code;

    if (errorCode === 401 || errorMessage.includes("missing scope")) {
      // No active session - this is expected, not an error
      return null;
    }
    // Log unexpected errors
    console.error("Error getting user:", error);
    return null;
  }
}

export async function signInWithOAuth(
  provider: "github" | "google",
  redirectTo: string
): Promise<void> {
  try {
    const providerEnum = provider === "github" ? OAuthProvider.Github : OAuthProvider.Google;
    await account.createOAuth2Token({
      provider: providerEnum,
      success: redirectTo,
      failure: `${redirectTo}/auth/error`,
    });
  } catch (error) {
    console.error("Error during OAuth sign-in:", error);
    throw error;
  }
}

/**
 * Handles OAuth callback after redirect
 * Extracts session from URL parameters and creates a session
 * Note: createOAuth2Token() may automatically store session in localStorage,
 * but we check URL params as fallback for explicit session creation
 */
export async function handleOAuthCallback(): Promise<Models.Session | null> {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return null;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    // Check both query params and hash params (different OAuth flows use different locations)
    const secret = urlParams.get("secret") || hashParams.get("secret");
    const userId = urlParams.get("userId") || hashParams.get("userId");

    // Also check for alternative parameter names
    const sessionSecret = urlParams.get("sessionSecret") || hashParams.get("sessionSecret");
    const sessionId = urlParams.get("sessionId") || hashParams.get("sessionId");

    // If we have OAuth callback parameters, create a session
    const finalSecret = secret || sessionSecret;
    const finalUserId = userId || sessionId;

    if (finalSecret && finalUserId) {
      try {
        // Create session from OAuth token
        const session = await account.createSession({ userId: finalUserId, secret: finalSecret });

        // Clean up URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete("secret");
        url.searchParams.delete("userId");
        url.searchParams.delete("sessionSecret");
        url.searchParams.delete("sessionId");

        // Also clean hash params
        const hash = url.hash.substring(1);
        if (hash) {
          const hashUrl = new URLSearchParams(hash);
          hashUrl.delete("secret");
          hashUrl.delete("userId");
          hashUrl.delete("sessionSecret");
          hashUrl.delete("sessionId");
          url.hash = hashUrl.toString();
        }

        window.history.replaceState({}, "", url.toString());

        return session;
      } catch (error) {
        console.error("Error creating session from OAuth callback:", error);
        // If session creation fails, the token might already be stored in localStorage
        // Try to get current user to verify
        return null;
      }
    }

    // If no callback params, check if session already exists in localStorage
    // (createOAuth2Token might have already stored it)
    return null;
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    await account.deleteSession({ sessionId: 'current' });
  } catch (error) {
    console.error("Error during sign out:", error);
  }
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const profile = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.profiles,
      userId
    );
    return mapProfileFromDocument(profile);
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

export async function updateUserProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
  try {
    const updatedProfile = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.profiles,
      userId,
      data
    );
    return mapProfileFromDocument(updatedProfile);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}


