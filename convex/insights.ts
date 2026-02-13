/**
 * Server-side insight generation
 * "Stats that are a mirror of identity, not numbers"
 */

// ─── Daily motivational insights (rotated) ───
const INSIGHTS_LIBRARY = [
  // Momentum
  { text: "You don't need motivation. You need to start in 30 seconds.", category: "start" },
  { text: "Every action is a vote for the person you want to become.", category: "identity" },
  { text: "The task is not to finish. The task is to start.", category: "start" },
  // Consistency
  { text: "You don't rise to the level of your goals. You fall to the level of your systems.", category: "system" },
  { text: "Success is the product of daily habits, not once-in-a-lifetime transformations.", category: "consistency" },
  { text: "Small habits don't add up. They compound.", category: "consistency" },
  // Recovery
  { text: "Missing once is an accident. Missing twice is the start of a new habit.", category: "recovery" },
  { text: "The best time to start was yesterday. The next best time is now.", category: "recovery" },
  { text: "Every day is a new page. Not a new chapter — just a page.", category: "recovery" },
  // Identity
  { text: "The goal is not to read a book. The goal is to become a reader.", category: "identity" },
  { text: "Each habit is a suggestion: 'Hey, maybe this is who I am.'", category: "identity" },
  { text: "True behavior change is identity change.", category: "identity" },
  // Friction
  { text: "Make it easy. Reduce friction. The best habit is the one you actually do.", category: "friction" },
  { text: "Environment is the invisible hand that shapes human behavior.", category: "friction" },
  { text: "When you make it easy, you make it happen.", category: "friction" },
  // Cue
  { text: "Pair your new habit with something you already do. Stack them.", category: "cue" },
  { text: "The cue triggers the craving. The craving motivates the response.", category: "cue" },
];

/**
 * Pick an insight based on user's current state
 */
export function pickInsight(stats: {
  completedToday: number;
  totalToday: number;
  currentStreak: number;
  missedYesterday: boolean;
  hasBlueprints: boolean;
}): { text: string; category: string } {
  // Context-aware selection
  let pool = INSIGHTS_LIBRARY;

  if (stats.missedYesterday && stats.completedToday === 0) {
    // Recovery mode
    pool = INSIGHTS_LIBRARY.filter((i) => i.category === "recovery" || i.category === "start");
  } else if (stats.completedToday === stats.totalToday && stats.totalToday > 0) {
    // All done — identity reinforcement
    pool = INSIGHTS_LIBRARY.filter((i) => i.category === "identity" || i.category === "consistency");
  } else if (stats.completedToday === 0 && stats.totalToday > 0) {
    // Haven't started
    pool = INSIGHTS_LIBRARY.filter((i) => i.category === "start");
  } else if (!stats.hasBlueprints) {
    // No blueprints set up
    pool = INSIGHTS_LIBRARY.filter((i) => i.category === "cue" || i.category === "friction");
  }

  // Deterministic-ish pick based on date + streak (so it doesn't change on re-render)
  const dayHash = new Date().getDate() + stats.currentStreak;
  return pool[dayHash % pool.length];
}

/**
 * Calculate streak for a habit given sorted entries
 */
export function calculateStreakFromEntries(
  entries: Array<{ date: string; status: string }>,
  todayStr: string
): { current: number; longest: number; consistency30: number } {
  if (entries.length === 0) {
    return { current: 0, longest: 0, consistency30: 0 };
  }

  // Sort entries by date descending
  const doneEntries = entries
    .filter((e) => e.status === "done")
    .map((e) => e.date)
    .sort()
    .reverse();

  if (doneEntries.length === 0) {
    return { current: 0, longest: 0, consistency30: 0 };
  }

  // Current streak
  let current = 0;
  let checkDate = new Date(todayStr + "T12:00:00");

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (doneEntries.includes(dateStr)) {
      current++;
    } else if (dateStr !== todayStr) {
      // Allow today to not be done yet
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Longest streak
  let longest = 0;
  let tempStreak = 0;
  const allSorted = [...doneEntries].sort();

  for (let i = 0; i < allSorted.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(allSorted[i - 1] + "T12:00:00");
      const curr = new Date(allSorted[i] + "T12:00:00");
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longest = Math.max(longest, tempStreak);
  }

  // 30-day consistency
  const thirtyDaysAgo = new Date(todayStr + "T12:00:00");
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyStr = thirtyDaysAgo.toISOString().split("T")[0];
  const last30 = doneEntries.filter((d) => d >= thirtyStr).length;
  const consistency30 = Math.round((last30 / 30) * 100);

  return { current, longest, consistency30 };
}

/**
 * Detect "anchor habits" — habits whose completion correlates with others
 */
export function detectAnchorHabits(
  habitEntries: Map<string, string[]> // habitId -> dates completed
): string[] {
  const habitIds = Array.from(habitEntries.keys());
  if (habitIds.length < 2) return [];

  const scores: Array<{ habitId: string; correlationScore: number }> = [];

  for (const targetId of habitIds) {
    const targetDates = new Set(habitEntries.get(targetId) || []);
    let totalCorrelation = 0;
    let comparisons = 0;

    for (const otherId of habitIds) {
      if (otherId === targetId) continue;
      const otherDates = habitEntries.get(otherId) || [];
      if (otherDates.length === 0) continue;

      const overlap = otherDates.filter((d) => targetDates.has(d)).length;
      const correlation = overlap / otherDates.length;
      totalCorrelation += correlation;
      comparisons++;
    }

    if (comparisons > 0) {
      scores.push({
        habitId: targetId,
        correlationScore: totalCorrelation / comparisons,
      });
    }
  }

  // Return habits with >70% correlation
  return scores
    .filter((s) => s.correlationScore > 0.7)
    .sort((a, b) => b.correlationScore - a.correlationScore)
    .map((s) => s.habitId);
}

/**
 * Get best performing time windows
 */
export function getBestDays(
  entries: Array<{ date: string; status: string }>
): { bestDay: string; worstDay: string } {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayCounts = new Array(7).fill(0);
  const dayTotals = new Array(7).fill(0);

  for (const entry of entries) {
    const day = new Date(entry.date + "T12:00:00").getDay();
    dayTotals[day]++;
    if (entry.status === "done") {
      dayCounts[day]++;
    }
  }

  let bestRate = -1;
  let worstRate = 2;
  let bestDay = 0;
  let worstDay = 0;

  for (let i = 0; i < 7; i++) {
    if (dayTotals[i] === 0) continue;
    const rate = dayCounts[i] / dayTotals[i];
    if (rate > bestRate) {
      bestRate = rate;
      bestDay = i;
    }
    if (rate < worstRate) {
      worstRate = rate;
      worstDay = i;
    }
  }

  return {
    bestDay: dayNames[bestDay],
    worstDay: dayNames[worstDay],
  };
}
