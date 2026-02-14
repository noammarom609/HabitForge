/**
 * Combined Convex + Clerk Provider
 *
 * This provider integrates Clerk authentication with Convex.
 * The Convex client receives authenticated tokens from Clerk.
 */
import React, { ReactNode, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { ClerkProvider, ClerkLoaded, useAuth, useClerk } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { convex } from "../lib/convex";

// Get Clerk publishable key from environment
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in your .env.local file."
  );
}

interface ConvexClerkProviderProps {
  children: ReactNode;
}

/** Handles OAuth redirect callback on web — only when returning from OAuth (avoids redirect loop) */
function WebOAuthCallbackHandler({ children }: { children: ReactNode }) {
  const clerk = useClerk();
  const handled = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "web" || !clerk?.loaded || handled.current) return;

    // Only process when URL has OAuth callback params (returning from Google etc.)
    const search = typeof window !== "undefined" ? window.location.search : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const hasOAuthParams = /__clerk|code=|state=/.test(search + hash);
    if (!hasOAuthParams) return;

    handled.current = true;
    void clerk.handleRedirectCallback({
      signInFallbackRedirectUrl: "/",
      signUpFallbackRedirectUrl: "/",
    }).catch(() => {});
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
