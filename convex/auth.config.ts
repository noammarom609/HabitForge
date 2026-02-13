/**
 * Convex Auth Configuration for Clerk
 * 
 * This configures Convex to validate JWTs from Clerk.
 * The issuer domain should match your Clerk application.
 */

export default {
  providers: [
    {
      // Clerk domain from the publishable key
      // Format: https://<your-clerk-domain>.clerk.accounts.dev
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
