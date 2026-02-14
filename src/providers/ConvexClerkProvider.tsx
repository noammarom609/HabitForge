/**
 * Combined Convex + Clerk Provider
 *
 * This provider integrates Clerk authentication with Convex.
 * The Convex client receives authenticated tokens from Clerk.
 */
import React, { ReactNode } from "react";
import { Platform } from "react-native";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
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

/**
 * Provider that wraps the app with Clerk and Convex authentication.
 * On web, wraps with AuthenticateWithRedirectCallback so OAuth redirect
 * (e.g. Google sign-in) completes and the session is set.
 */
export function ConvexClerkProvider({ children }: ConvexClerkProviderProps) {
  const content = (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );

  const withOAuthCallback =
    Platform.OS === "web" ? (
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      >
        {content}
      </AuthenticateWithRedirectCallback>
    ) : (
      content
    );

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>{withOAuthCallback}</ClerkLoaded>
    </ClerkProvider>
  );
}

export default ConvexClerkProvider;
