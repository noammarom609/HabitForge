/**
 * Convex client configuration and provider setup
 */
import { ConvexReactClient } from "convex/react";

// Get the Convex URL from environment
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_CONVEX_URL. Please set it in your .env.local file."
  );
}

// Create the Convex client
export const convex = new ConvexReactClient(convexUrl);
