import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Get the Clerk user ID from the authenticated context.
 * Throws if user is not authenticated.
 */
export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("UNAUTHORIZED: User is not authenticated");
  }
  // Clerk stores the user ID in the 'subject' field of the JWT
  return identity.subject;
}

/**
 * Get or create a user record in the database based on Clerk identity.
 * Returns the internal Convex user ID.
 */
export async function getOrCreateUser(ctx: MutationCtx) {
  const clerkUserId = await getAuthUserId(ctx);
  const identity = await ctx.auth.getUserIdentity();

  // Check if user already exists
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
    .first();

  if (existingUser) {
    return existingUser._id;
  }

  // Create new user
  const userId = await ctx.db.insert("users", {
    clerkUserId,
    name: identity?.name ?? undefined,
    email: identity?.email ?? undefined,
    createdAt: Date.now(),
  });

  return userId;
}

/**
 * Require an authenticated user and return their internal user ID.
 * Throws UNAUTHORIZED if not authenticated.
 * Throws NOT_FOUND if user doesn't exist in database.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const clerkUserId = await getAuthUserId(ctx);

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
    .first();

  if (!user) {
    throw new Error("NOT_FOUND: User not found in database");
  }

  return {
    userId: user._id,
    clerkUserId: user.clerkUserId,
    user,
  };
}

/**
 * Try to get user, return null if not found (used in queries where user might not exist yet)
 */
export async function tryGetUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .first();

  return user;
}
