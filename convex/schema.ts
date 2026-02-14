import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Users ───
  users: defineTable({
    clerkUserId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  // ─── Identities ("I am a person who...") ───
  identities: defineTable({
    userId: v.id("users"),
    label: v.string(), // "I am a person who exercises"
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ─── Habits (with Atomic Habits Blueprint) ───
  habits: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    scheduleType: v.union(v.literal("daily"), v.literal("weekly")),
    daysOfWeek: v.optional(v.array(v.number())),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
    // ── Atomic Habits Blueprint ──
    cue: v.optional(v.string()),           // "After I brush my teeth..."
    minimumAction: v.optional(v.string()),  // "2 push-ups" (30-second version)
    reward: v.optional(v.string()),         // "Mark done + celebration"
    frictionNotes: v.optional(v.string()),  // "Lay out clothes the night before"
    // ── Identity link ──
    identityId: v.optional(v.id("identities")),
    // ── Scheduling ──
    reminderTime: v.optional(v.string()),   // "HH:MM"
    reminderEnabled: v.optional(v.boolean()), // default true when reminderTime set
    // ── Meta ──
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_active", ["userId", "isActive"]),

  // ─── Weekly Reviews ───
  weeklyReviews: defineTable({
    userId: v.id("users"),
    weekStart: v.string(), // "YYYY-MM-DD" (Sunday)
    worked: v.optional(v.string()),
    broke: v.optional(v.string()),
    improve: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_user_week", ["userId", "weekStart"]),

  // ─── Feedback ───
  feedback: defineTable({
    userId: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ─── Motivation Vault (reminders) ───
  motivationReminders: defineTable({
    userId: v.id("users"),
    text: v.string(),
    habitId: v.optional(v.id("habits")),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ─── Habit Entries (completions) ───
  habitEntries: defineTable({
    userId: v.id("users"),
    habitId: v.id("habits"),
    date: v.string(), // "YYYY-MM-DD"
    status: v.union(v.literal("done"), v.literal("skipped")),
    createdAt: v.number(),
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_habit_date", ["habitId", "date"])
    .index("by_userId", ["userId"]),
});
