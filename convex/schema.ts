import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - links Clerk identity to internal user
  users: defineTable({
    clerkUserId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  // Habits table
  habits: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    scheduleType: v.union(v.literal("daily"), v.literal("weekly")),
    daysOfWeek: v.optional(v.array(v.number())), // 0-6 for weekly
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_active", ["userId", "isActive"]),

  // Habit entries (completions)
  habitEntries: defineTable({
    userId: v.id("users"),
    habitId: v.id("habits"),
    date: v.string(), // "YYYY-MM-DD" format
    status: v.union(v.literal("done"), v.literal("skipped")),
    createdAt: v.number(),
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_habit_date", ["habitId", "date"])
    .index("by_userId", ["userId"]),
});
