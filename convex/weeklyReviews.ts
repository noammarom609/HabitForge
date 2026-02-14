import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateUser, requireUser, tryGetUser } from "./auth";

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export const saveWeeklyReview = mutation({
  args: {
    worked: v.optional(v.string()),
    broke: v.optional(v.string()),
    improve: v.optional(v.string()),
    weekStart: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getOrCreateUser(ctx);
    const weekStart = args.weekStart ?? getWeekStart(new Date());
    const now = Date.now();

    const existing = await ctx.db
      .query("weeklyReviews")
      .withIndex("by_user_week", (q) =>
        q.eq("userId", userId).eq("weekStart", weekStart)
      )
      .first();

    const data = {
      worked: args.worked ?? "",
      broke: args.broke ?? "",
      improve: args.improve ?? "",
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }
    return ctx.db.insert("weeklyReviews", {
      userId,
      weekStart,
      ...data,
      createdAt: now,
    });
  },
});

export const getWeeklyReview = query({
  args: { weekStart: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await tryGetUser(ctx);
    if (!user) return null;
    const weekStart = args.weekStart ?? getWeekStart(new Date());
    return ctx.db
      .query("weeklyReviews")
      .withIndex("by_user_week", (q) =>
        q.eq("userId", user._id).eq("weekStart", weekStart)
      )
      .first();
  },
});
