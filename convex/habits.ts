import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateUser, requireUser, tryGetUser } from "./auth";
import { Id } from "./_generated/dataModel";

// ============ QUERIES ============

/**
 * Get all active habits for the current user
 */
export const getHabits = query({
  args: {},
  handler: async (ctx) => {
    const user = await tryGetUser(ctx);
    if (!user) {
      return [];
    }

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();

    return habits;
  },
});

/**
 * Get all habits including archived for the current user
 */
export const getAllHabits = query({
  args: {},
  handler: async (ctx) => {
    const user = await tryGetUser(ctx);
    if (!user) {
      return [];
    }

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return habits;
  },
});

/**
 * Get habits and their entries for a specific date (Today view)
 */
export const getToday = query({
  args: {
    date: v.string(), // "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const user = await tryGetUser(ctx);
    if (!user) {
      return { habits: [], entries: [] };
    }

    // Get active habits
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();

    // Get entries for this date
    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).eq("date", args.date)
      )
      .collect();

    return { habits, entries };
  },
});

/**
 * Get a habit with its recent entries
 */
export const getHabitWithRecentEntries = query({
  args: {
    habitId: v.id("habits"),
    rangeDays: v.optional(v.number()), // default 30
  },
  handler: async (ctx, args) => {
    const user = await tryGetUser(ctx);
    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const habit = await ctx.db.get(args.habitId);
    if (!habit) {
      throw new Error("NOT_FOUND: Habit not found");
    }

    // Ownership check
    if (habit.userId !== user._id) {
      throw new Error("FORBIDDEN: Access denied");
    }

    // Get recent entries
    const rangeDays = args.rangeDays ?? 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);
    const startDateStr = startDate.toISOString().split("T")[0];

    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_date", (q) => q.eq("habitId", args.habitId))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    return { habit, entries };
  },
});

/**
 * Debug query to verify auth is working - returns user identity info
 */
export const getAuthDebug = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { authenticated: false, identity: null, user: null };
    }

    const user = await tryGetUser(ctx);
    return {
      authenticated: true,
      identity: {
        subject: identity.subject,
        email: identity.email,
        name: identity.name,
      },
      user: user
        ? {
            _id: user._id,
            clerkUserId: user.clerkUserId,
            name: user.name,
          }
        : null,
    };
  },
});

// ============ MUTATIONS ============

/**
 * Create a new habit
 */
export const createHabit = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    scheduleType: v.union(v.literal("daily"), v.literal("weekly")),
    daysOfWeek: v.optional(v.array(v.number())),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getOrCreateUser(ctx);
    const now = Date.now();

    // Validate daysOfWeek for weekly habits
    if (args.scheduleType === "weekly") {
      if (!args.daysOfWeek || args.daysOfWeek.length === 0) {
        throw new Error("VALIDATION: Weekly habits require at least one day");
      }
      for (const day of args.daysOfWeek) {
        if (day < 0 || day > 6) {
          throw new Error("VALIDATION: Days must be 0-6 (Sunday-Saturday)");
        }
      }
    }

    const habitId = await ctx.db.insert("habits", {
      userId,
      title: args.title,
      description: args.description,
      scheduleType: args.scheduleType,
      daysOfWeek: args.daysOfWeek,
      color: args.color,
      icon: args.icon,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return habitId;
  },
});

/**
 * Update a habit
 */
export const updateHabit = mutation({
  args: {
    habitId: v.id("habits"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    scheduleType: v.optional(v.union(v.literal("daily"), v.literal("weekly"))),
    daysOfWeek: v.optional(v.array(v.number())),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);

    const habit = await ctx.db.get(args.habitId);
    if (!habit) {
      throw new Error("NOT_FOUND: Habit not found");
    }

    // Ownership check
    if (habit.userId !== userId) {
      throw new Error("FORBIDDEN: Access denied");
    }

    const updates: Partial<typeof habit> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.scheduleType !== undefined) updates.scheduleType = args.scheduleType;
    if (args.daysOfWeek !== undefined) updates.daysOfWeek = args.daysOfWeek;
    if (args.color !== undefined) updates.color = args.color;
    if (args.icon !== undefined) updates.icon = args.icon;

    await ctx.db.patch(args.habitId, updates);
    return args.habitId;
  },
});

/**
 * Toggle habit completion for a date
 */
export const toggleHabitForDate = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.string(), // "YYYY-MM-DD"
    status: v.union(v.literal("done"), v.literal("skipped")),
  },
  handler: async (ctx, args) => {
    const userId = await getOrCreateUser(ctx);

    const habit = await ctx.db.get(args.habitId);
    if (!habit) {
      throw new Error("NOT_FOUND: Habit not found");
    }

    // Ownership check
    if (habit.userId !== userId) {
      throw new Error("FORBIDDEN: Access denied");
    }

    // Check if entry already exists
    const existingEntry = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_date", (q) =>
        q.eq("habitId", args.habitId).eq("date", args.date)
      )
      .first();

    if (existingEntry) {
      // If same status, remove entry (toggle off)
      if (existingEntry.status === args.status) {
        await ctx.db.delete(existingEntry._id);
        return null;
      }
      // Otherwise update status
      await ctx.db.patch(existingEntry._id, { status: args.status });
      return existingEntry._id;
    }

    // Create new entry
    const entryId = await ctx.db.insert("habitEntries", {
      userId,
      habitId: args.habitId,
      date: args.date,
      status: args.status,
      createdAt: Date.now(),
    });

    return entryId;
  },
});

/**
 * Archive (soft delete) a habit
 */
export const archiveHabit = mutation({
  args: {
    habitId: v.id("habits"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);

    const habit = await ctx.db.get(args.habitId);
    if (!habit) {
      throw new Error("NOT_FOUND: Habit not found");
    }

    // Ownership check
    if (habit.userId !== userId) {
      throw new Error("FORBIDDEN: Access denied");
    }

    await ctx.db.patch(args.habitId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return args.habitId;
  },
});

/**
 * Restore an archived habit
 */
export const restoreHabit = mutation({
  args: {
    habitId: v.id("habits"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);

    const habit = await ctx.db.get(args.habitId);
    if (!habit) {
      throw new Error("NOT_FOUND: Habit not found");
    }

    // Ownership check
    if (habit.userId !== userId) {
      throw new Error("FORBIDDEN: Access denied");
    }

    await ctx.db.patch(args.habitId, {
      isActive: true,
      updatedAt: Date.now(),
    });

    return args.habitId;
  },
});

/**
 * Permanently delete a habit and all its entries
 */
export const deleteHabit = mutation({
  args: {
    habitId: v.id("habits"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);

    const habit = await ctx.db.get(args.habitId);
    if (!habit) {
      throw new Error("NOT_FOUND: Habit not found");
    }

    // Ownership check
    if (habit.userId !== userId) {
      throw new Error("FORBIDDEN: Access denied");
    }

    // Delete all entries for this habit
    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_date", (q) => q.eq("habitId", args.habitId))
      .collect();

    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }

    // Delete the habit
    await ctx.db.delete(args.habitId);

    return args.habitId;
  },
});

// ============ DEV ONLY ============

/**
 * Seed sample habits for testing (DEV only)
 */
export const devSeedHabits = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getOrCreateUser(ctx);
    const now = Date.now();

    const sampleHabits = [
      {
        title: "Morning Exercise",
        description: "30 minutes of workout",
        scheduleType: "daily" as const,
        color: "#4CAF50",
        icon: "fitness",
      },
      {
        title: "Read a Book",
        description: "Read at least 20 pages",
        scheduleType: "daily" as const,
        color: "#2196F3",
        icon: "book",
      },
      {
        title: "Meditate",
        description: "10 minutes of mindfulness",
        scheduleType: "daily" as const,
        color: "#9C27B0",
        icon: "moon",
      },
      {
        title: "Weekly Review",
        description: "Review goals and progress",
        scheduleType: "weekly" as const,
        daysOfWeek: [0], // Sunday
        color: "#FF9800",
        icon: "calendar",
      },
    ];

    const habitIds: Id<"habits">[] = [];
    for (const habit of sampleHabits) {
      const id = await ctx.db.insert("habits", {
        userId,
        ...habit,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      habitIds.push(id);
    }

    return habitIds;
  },
});
