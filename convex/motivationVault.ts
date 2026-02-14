import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateUser, requireUser, tryGetUser } from "./auth";
import { Id } from "./_generated/dataModel";

export const getMotivationReminders = query({
  args: {},
  handler: async (ctx) => {
    const user = await tryGetUser(ctx);
    if (!user) return [];
    return ctx.db
      .query("motivationReminders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const addMotivationReminder = mutation({
  args: {
    text: v.string(),
    habitId: v.optional(v.id("habits")),
  },
  handler: async (ctx, args) => {
    const userId = await getOrCreateUser(ctx);
    const existing = await ctx.db
      .query("motivationReminders")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const sortOrder = existing.length;
    return ctx.db.insert("motivationReminders", {
      userId,
      text: args.text,
      habitId: args.habitId,
      sortOrder,
      createdAt: Date.now(),
    });
  },
});

export const deleteMotivationReminder = mutation({
  args: { id: v.id("motivationReminders") },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("NOT_FOUND");
    await ctx.db.delete(args.id);
    return args.id;
  },
});
