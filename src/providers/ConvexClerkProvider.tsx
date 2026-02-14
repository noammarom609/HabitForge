/**
 * Combined Convex + Clerk Provider
 *
 * Wraps the app with Clerk authentication and Convex backend.
 * Handles OAuth redirect callbacks on web (Google, etc.).
 *
 * CRITICAL for web OAuth:
 * - Clerk redirects back to redirectUrl with params in URL (query or hash)
 * - handleRedirectCallback must run to create the session in Clerk
 * - tokenCache: native = SecureStore; web = undefined (Clerk uses default cookies)
 */
import React, { ReactNode, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { ClerkProvider, ClerkLoaded, useAuth, useClerk } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { convex } from "../lib/convex";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in your .env.local file."
  );
}

interface ConvexClerkProviderProps {
  children: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// OAuth callback URL param patterns (Clerk may use query or hash)
// Broad match to avoid missing the callback — session won't be created otherwise
// ─────────────────────────────────────────────────────────────────────────────
function hasOAuthCallbackParams(): boolean {
  if (typeof window === "undefined") return false;
  const search = window.location.search;
  const hash = window.location.hash;
  const full = search + hash;
  // Clerk: __clerk_status, __clerk_created_session, __clerk_ticket, rotating_token_nonce
  // OAuth: code=, state= (when redirect passes through our domain)
  const has =
    /__clerk/i.test(full) ||
    /rotating_token_nonce/.test(full) ||
    /\bcode=/.test(full) ||
    /\bstate=/.test(full);
  if (has && __DEV__) {
    console.log("[WebOAuthCallback] Detected OAuth params in URL, running handleRedirectCallback");
  }
  return has;
}

/**
 * WebOAuthCallbackHandler
 *
 * Runs on web when the page loads. If the URL contains OAuth callback params
 * (returning from Google sign-in redirect), calls handleRedirectCallback to
 * complete the flow and create the session.
 */
function WebOAuthCallbackHandler({ children }: { children: ReactNode }) {
  const clerk = useClerk();
  const handled = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!clerk?.loaded) return;
    if (handled.current) return;

    if (!hasOAuthCallbackParams()) return;

    handled.current = true;

    const origin =
      typeof window !== "undefined" ? window.location.origin + "/" : "/";

    clerk
      .handleRedirectCallback({
        signInFallbackRedirectUrl: origin,
        signUpFallbackRedirectUrl: origin,
      })
      .then(() => {
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", window.location.origin + "/");
        }
      })
      .catch((err) => {
        console.error("[WebOAuthCallbackHandler] handleRedirectCallback failed:", err);
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", window.location.origin + "/");
        }
      });
  }, [clerk?.loaded]);

  return <>{children}</>;
}

/**
 * Provider that wraps the app with Clerk and Convex authentication.
 */
export function ConvexClerkProvider({ children }: ConvexClerkProviderProps) {
  const content = (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );

  const withOAuthHandler =
    Platform.OS === "web" ? (
      <WebOAuthCallbackHandler>{content}</WebOAuthCallbackHandler>
    ) : (
      content
    );

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>{withOAuthHandler}</ClerkLoaded>
    </ClerkProvider>
  );
}

export default ConvexClerkProvider;
