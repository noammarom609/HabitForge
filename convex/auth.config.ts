/**
 * Convex Auth Configuration for Clerk
 * 
 * This configures Convex to validate JWTs from Clerk.
 * 
 * SETUP REQUIRED:
 * 1. Go to Clerk Dashboard > JWT Templates
 * 2. Create a new template using the "Convex" preset
 * 3. Copy the "Issuer" URL (e.g., https://enabling-crawdad-39.clerk.accounts.dev)
 * 4. Set it as CLERK_JWT_ISSUER_DOMAIN in Convex Dashboard > Settings > Environment Variables
 * 
 * NOTE: Do NOT rename the JWT token - it must be called "convex"
 */

import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // This domain comes from the Clerk JWT Template "Issuer" field
      // Set CLERK_JWT_ISSUER_DOMAIN in Convex Dashboard environment variables
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
