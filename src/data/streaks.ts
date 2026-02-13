import { Completion, Habit } from '../domain/types';

// ─── Date helpers ──────────────────────────────────

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getDayOfWeek(): number {
  return new Date().getDay(); // 0 = Sunday
}

// ─── Streak calculations ──────────────────────────

/** Current streak for a habit (computed from completions, never stored) */
export function calculateStreak(
  habit: Habit,
  completions: Completion[],
): number {
  const completed = new Set(
    completions
      .filter((c) => c.habitId === habit.id && c.completed)
      .map((c) => c.date),
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDate(d);
    const dow = d.getDay();

    // Skip days not in the habit's schedule
    if (!habit.daysOfWeek.includes(dow)) continue;

    // On the first scheduled day (today or most recent), allow missing
    if (i === 0 && !completed.has(dateStr)) continue;

    if (completed.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/** Longest streak ever for a habit */
export function longestStreak(
  habit: Habit,
  completions: Completion[],
): number {
  const completed = new Set(
    completions
      .filter((c) => c.habitId === habit.id && c.completed)
      .map((c) => c.date),
  );

  if (completed.size === 0) return 0;

  const sorted = Array.from(completed).sort();
  const first = new Date(sorted[0]);
  const last = new Date(sorted[sorted.length - 1]);

  let longest = 0;
  let current = 0;

  const d = new Date(first);
  while (d <= last) {
    const dateStr = formatDate(d);
    const dow = d.getDay();

    if (habit.daysOfWeek.includes(dow)) {
      if (completed.has(dateStr)) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }

    d.setDate(d.getDate() + 1);
  }

  return longest;
}

/** Completion rate for last N days */
export function completionRate(
  habit: Habit,
  completions: Completion[],
  days: number,
): number {
  const completed = new Set(
    completions
      .filter((c) => c.habitId === habit.id && c.completed)
      .map((c) => c.date),
  );

  const today = new Date();
  let scheduled = 0;
  let done = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    if (habit.daysOfWeek.includes(d.getDay())) {
      scheduled++;
      if (completed.has(formatDate(d))) done++;
    }
  }

  return scheduled === 0 ? 0 : Math.round((done / scheduled) * 100);
}

/** Daily data for the last 7 days (for the weekly chart) */
export function weeklyData(
  habits: Habit[],
  completions: Completion[],
): { day: string; date: string; completed: number; total: number }[] {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const result: { day: string; date: string; completed: number; total: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDate(d);
    const dow = d.getDay();

    const scheduled = habits.filter(
      (h) => !h.isArchived && h.daysOfWeek.includes(dow),
    );
    const done = scheduled.filter((h) =>
      completions.some(
        (c) => c.habitId === h.id && c.date === dateStr && c.completed,
      ),
    ).length;

    result.push({ day: labels[dow], date: dateStr, completed: done, total: scheduled.length });
  }

  return result;
}
