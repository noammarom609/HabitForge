import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateUser, requireUser, tryGetUser } from "./auth";
import { Id } from "./_generated/dataModel";
import { pickInsight, calculateStreakFromEntries, detectAnchorHabits, getBestDays } from "./insights";

// ═══════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════

/**
 * "Command Center" — Everything the Today screen needs in ONE query
 */
export const getCommandCenter = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const user = await tryGetUser(ctx);
    if (!user) {
      return {
        habits: [], entries: [], identities: [],
        insight: { text: "Sign in to start building your identity.", category: "start" },
        stats: { completedToday: 0, totalToday: 0, streaks: {} as Record<string, { current: number; longest: number; consistency30: number }> },
        missedYesterday: false,
      };
    }

    // Get active habits
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();

    // Get entries for today
    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).eq("date", args.date)
      )
      .collect();

    // Get yesterday's entries to detect recovery state
    const yesterday = new Date(args.date + "T12:00:00");
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const yesterdayEntries = await ctx.db
      .query("habitEntries")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).eq("date", yesterdayStr)
      )
      .collect();
    const missedYesterday =
      habits.length > 0 &&
      yesterdayEntries.filter((e) => e.status === "done").length === 0;

    // Get identities
    const identities = await ctx.db
      .query("identities")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Calculate streaks per habit (last 60 days of entries)
    const sixtyDaysAgo = new Date(args.date + "T12:00:00");
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const sixtyStr = sixtyDaysAgo.toISOString().split("T")[0];

    const allRecentEntries = await ctx.db
      .query("habitEntries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("date"), sixtyStr))
      .collect();

    const streaks: Record<string, { current: number; longest: number; consistency30: number }> = {};
    for (const habit of habits) {
      const habitEntries = allRecentEntries.filter(
        (e) => e.habitId === habit._id
      );
      streaks[habit._id] = calculateStreakFromEntries(habitEntries, args.date);
    }

    // Compute today stats
    const completedToday = entries.filter((e) => e.status === "done").length;
    const totalToday = habits.length;
    const maxStreak = Math.max(0, ...Object.values(streaks).map((s) => s.current));
    const hasBlueprints = habits.some((h) => h.cue || h.minimumAction);

    // Pick contextual insight
    const insight = pickInsight({
      completedToday,
      totalToday,
      currentStreak: maxStreak,
      missedYesterday,
      hasBlueprints,
    });

    return {
      habits,
      entries,
      identities,
      insight,
      stats: { completedToday, totalToday, streaks },
      missedYesterday,
    };
  },
});

/**
 * Get all active habits
 */
export const getHabits = query({
  args: {},
  handler: async (ctx) => {
    const user = await tryGetUser(ctx);
    if (!user) return [];
    return ctx.db
      .query("habits")
      .withIndex("by_userId_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();
  },
});

/**
 * Get all habits including archived
 */
export const getAllHabits = query({
  args: {},
  handler: async (ctx) => {
    const user = await tryGetUser(ctx);
    if (!user) return [];
    return ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

/**
 * Get today data (simple version)
 */
export const getToday = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const user = await tryGetUser(ctx);
    if (!user) return { habits: [], entries: [] };
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();
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
 * Insights query for Stats screen
 */
export const getInsights = query({
  args: {},
  handler: async (ctx) => {
    const user = await tryGetUser(ctx);
    if (!user) {
      return {
        habits: [],
        weeklyData: [] as Array<{ day: string; completed: number; total: number }>,
        perHabit: [] as Array<{ habitId: string; title: string; icon: string; color: string; current: number; longest: number; consistency30: number }>,
        anchorHabits: [] as string[],
        bestDay: "",
        worstDay: "",
        weeklyRate: 0,
        improvementTip: "",
      };
    }

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();

    const todayStr = new Date().toISOString().split("T")[0];
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const sixtyStr = sixtyDaysAgo.toISOString().split("T")[0];

    const allEntries = await ctx.db
      .query("habitEntries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("date"), sixtyStr))
      .collect();

    // Per-habit stats
    const perHabit = habits.map((h) => {
      const hEntries = allEntries.filter((e) => e.habitId === h._id);
      const streakData = calculateStreakFromEntries(hEntries, todayStr);
      return {
        habitId: h._id,
        title: h.title,
        icon: h.icon || "🎯",
        color: h.color || "#6366F1",
        ...streakData,
      };
    });

    // Weekly data (last 7 days)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData: Array<{ day: string; completed: number; total: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayEntries = allEntries.filter((e) => e.date === dateStr);
      weeklyData.push({
        day: dayNames[d.getDay()],
        completed: dayEntries.filter((e) => e.status === "done").length,
        total: habits.length,
      });
    }

    // Anchor habits
    const habitEntriesMap = new Map<string, string[]>();
    for (const h of habits) {
      const dates = allEntries
        .filter((e) => e.habitId === h._id && e.status === "done")
        .map((e) => e.date);
      habitEntriesMap.set(h._id, dates);
    }
    const anchorHabits = detectAnchorHabits(habitEntriesMap);

    // Best/worst days
    const { bestDay, worstDay } = getBestDays(allEntries);

    // Weekly rate
    const totalScheduled = weeklyData.reduce((acc, d) => acc + d.total, 0);
    const totalCompleted = weeklyData.reduce((acc, d) => acc + d.completed, 0);
    const weeklyRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

    // Improvement tip
    let improvementTip = "";
    const weakestHabit = perHabit.sort((a, b) => a.consistency30 - b.consistency30)[0];
    if (weakestHabit && weakestHabit.consistency30 < 50) {
      improvementTip = `Consider making "${weakestHabit.title}" easier. What's the 30-second version?`;
    } else if (weeklyRate < 70) {
      improvementTip = `Your ${worstDay}s are the weakest. Could you adjust your schedule?`;
    } else {
      improvementTip = "You're consistent! Consider adding a new habit or increasing difficulty.";
    }

    return {
      habits,
      weeklyData,
      perHabit: perHabit.sort((a, b) => b.consistency30 - a.consistency30),
      anchorHabits,
      bestDay,
      worstDay,
      weeklyRate,
      improvementTip,
    };
  },
});

/**
 * Get a habit with recent entries
 */
export const getHabitWithRecentEntries = query({
  args: { habitId: v.id("habits"), rangeDays: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await tryGetUser(ctx);
    if (!user) throw new Error("UNAUTHORIZED");
    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new Error("NOT_FOUND");
    if (habit.userId !== user._id) throw new Error("FORBIDDEN");
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
 * Auth debug
 */
export const getAuthDebug = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { authenticated: false, identity: null, user: null };
    const user = await tryGetUser(ctx);
    return {
      authenticated: true,
      identity: { subject: identity.subject, email: identity.email, name: identity.name },
      user: user ? { _id: user._id, clerkUserId: user.clerkUserId, name: user.name } : null,
    };
  },
});

/**
 * Get identities for the current user
 */
export const getIdentities = query({
  args: {},
  handler: async (ctx) => {
    const user = await tryGetUser(ctx);
    if (!user) return [];
    return ctx.db
      .query("identities")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// ═══════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════

/**
 * Create a habit (with optional Blueprint)
 */
export const createHabit = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    scheduleType: v.union(v.literal("daily"), v.literal("weekly")),
    daysOfWeek: v.optional(v.array(v.number())),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    // Blueprint
    cue: v.optional(v.string()),
    minimumAction: v.optional(v.string()),
    reward: v.optional(v.string()),
    frictionNotes: v.optional(v.string()),
    identityId: v.optional(v.id("identities")),
    reminderTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getOrCreateUser(ctx);
    const now = Date.now();

    if (args.scheduleType === "weekly") {
      if (!args.daysOfWeek || args.daysOfWeek.length === 0) {
        throw new Error("VALIDATION: Weekly habits require at least one day");
      }
    }

    return ctx.db.insert("habits", {
      userId,
      title: args.title,
      description: args.description,
      scheduleType: args.scheduleType,
      daysOfWeek: args.daysOfWeek,
      color: args.color,
      icon: args.icon,
      cue: args.cue,
      minimumAction: args.minimumAction,
      reward: args.reward,
      frictionNotes: args.frictionNotes,
      identityId: args.identityId,
      reminderTime: args.reminderTime,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
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
    cue: v.optional(v.string()),
    minimumAction: v.optional(v.string()),
    reward: v.optional(v.string()),
    frictionNotes: v.optional(v.string()),
    identityId: v.optional(v.id("identities")),
    reminderTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new Error("NOT_FOUND");
    if (habit.userId !== userId) throw new Error("FORBIDDEN");

    const { habitId, ...updates } = args;
    const filtered: Record<string, any> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[key] = val;
    }
    await ctx.db.patch(habitId, filtered);
    return habitId;
  },
});

/**
 * Toggle habit for a date (done / skipped / undo)
 */
export const toggleHabitForDate = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.string(),
    status: v.union(v.literal("done"), v.literal("skipped")),
  },
  handler: async (ctx, args) => {
    const userId = await getOrCreateUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new Error("NOT_FOUND");
    if (habit.userId !== userId) throw new Error("FORBIDDEN");

    const existing = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_date", (q) =>
        q.eq("habitId", args.habitId).eq("date", args.date)
      )
      .first();

    if (existing) {
      if (existing.status === args.status) {
        // Toggle off (undo)
        await ctx.db.delete(existing._id);
        return { action: "undone", entryId: null };
      }
      await ctx.db.patch(existing._id, { status: args.status });
      return { action: "updated", entryId: existing._id };
    }

    const entryId = await ctx.db.insert("habitEntries", {
      userId,
      habitId: args.habitId,
      date: args.date,
      status: args.status,
      createdAt: Date.now(),
    });
    return { action: "created", entryId };
  },
});

/**
 * Archive a habit
 */
export const archiveHabit = mutation({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new Error("NOT_FOUND");
    if (habit.userId !== userId) throw new Error("FORBIDDEN");
    await ctx.db.patch(args.habitId, { isActive: false, updatedAt: Date.now() });
    return args.habitId;
  },
});

/**
 * Restore archived habit
 */
export const restoreHabit = mutation({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new Error("NOT_FOUND");
    if (habit.userId !== userId) throw new Error("FORBIDDEN");
    await ctx.db.patch(args.habitId, { isActive: true, updatedAt: Date.now() });
    return args.habitId;
  },
});

/**
 * Delete habit + all entries
 */
export const deleteHabit = mutation({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new Error("NOT_FOUND");
    if (habit.userId !== userId) throw new Error("FORBIDDEN");
    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_date", (q) => q.eq("habitId", args.habitId))
      .collect();
    for (const entry of entries) await ctx.db.delete(entry._id);
    await ctx.db.delete(args.habitId);
    return args.habitId;
  },
});

// ─── Identity mutations ───

export const createIdentity = mutation({
  args: {
    label: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getOrCreateUser(ctx);
    return ctx.db.insert("identities", {
      userId,
      label: args.label,
      icon: args.icon,
      color: args.color,
      createdAt: Date.now(),
    });
  },
});

export const deleteIdentity = mutation({
  args: { identityId: v.id("identities") },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);
    const identity = await ctx.db.get(args.identityId);
    if (!identity) throw new Error("NOT_FOUND");
    if (identity.userId !== userId) throw new Error("FORBIDDEN");
    // Unlink habits
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const h of habits) {
      if (h.identityId === args.identityId) {
        await ctx.db.patch(h._id, { identityId: undefined });
      }
    }
    await ctx.db.delete(args.identityId);
    return args.identityId;
  },
});

// ─── Dev seed ───

export const devSeedHabits = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getOrCreateUser(ctx);
    const now = Date.now();

    // Create identities
    const fitnessId = await ctx.db.insert("identities", {
      userId, label: "I am a person who moves every day", icon: "💪", color: "#4CAF50", createdAt: now,
    });
    const learnerId = await ctx.db.insert("identities", {
      userId, label: "I am a lifelong learner", icon: "📚", color: "#2196F3", createdAt: now,
    });
    const mindfulId = await ctx.db.insert("identities", {
      userId, label: "I am calm and present", icon: "🧘", color: "#9C27B0", createdAt: now,
    });

    const sampleHabits = [
      {
        title: "Morning Exercise",
        description: "30 minutes of movement",
        scheduleType: "daily" as const,
        color: "#4CAF50",
        icon: "💪",
        cue: "After I wake up and drink water",
        minimumAction: "2 push-ups",
        reward: "Feel the energy rush",
        frictionNotes: "Lay out workout clothes the night before",
        identityId: fitnessId,
      },
      {
        title: "Read a Book",
        description: "Read at least 20 pages",
        scheduleType: "daily" as const,
        color: "#2196F3",
        icon: "📚",
        cue: "After dinner, when I sit on the couch",
        minimumAction: "Read 1 page",
        reward: "Bookmark progress + note",
        identityId: learnerId,
      },
      {
        title: "Meditate",
        description: "Mindfulness practice",
        scheduleType: "daily" as const,
        color: "#9C27B0",
        icon: "🧘",
        cue: "After morning exercise",
        minimumAction: "3 deep breaths",
        reward: "Calm mind, ready for the day",
        identityId: mindfulId,
      },
      {
        title: "Weekly Review",
        description: "Review goals and progress",
        scheduleType: "weekly" as const,
        daysOfWeek: [0],
        color: "#FF9800",
        icon: "📝",
        cue: "Sunday morning with coffee",
        minimumAction: "Write 3 wins from the week",
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

    // Seed some entries for the last 7 days
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      for (const hId of habitIds.slice(0, 3)) {
        // ~70% completion rate
        if (Math.random() < 0.7) {
          await ctx.db.insert("habitEntries", {
            userId,
            habitId: hId,
            date: dateStr,
            status: "done",
            createdAt: now,
          });
        }
      }
    }

    return habitIds;
  },
});
