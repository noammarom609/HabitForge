import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getOrCreateUser } from "./auth";

export const submitFeedback = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const userId = await getOrCreateUser(ctx);
    const trimmed = args.text.trim();
    if (!trimmed) throw new Error("EMPTY");
    return ctx.db.insert("feedback", {
      userId,
      text: trimmed,
      createdAt: Date.now(),
    });
  },
});
