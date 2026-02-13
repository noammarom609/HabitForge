/**
 * Combined Convex + Clerk Provider
 * 
 * This provider integrates Clerk authentication with Convex.
 * The Convex client receives authenticated tokens from Clerk.
 */
import React, { useCallback, ReactNode } from "react";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
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

/**
 * Provider that wraps the app with Clerk and Convex authentication
 */
export function ConvexClerkProvider({ children }: ConvexClerkProviderProps) {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

export default ConvexClerkProvider;
