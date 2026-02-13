/**
 * Custom hooks for Convex habits operations
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Hook to get all active habits for the current user
 */
export function useHabits() {
  const habits = useQuery(api.habits.getHabits);
  return {
    habits: habits ?? [],
    isLoading: habits === undefined,
  };
}

/**
 * Hook to get all habits including archived
 */
export function useAllHabits() {
  const habits = useQuery(api.habits.getAllHabits);
  return {
    habits: habits ?? [],
    isLoading: habits === undefined,
  };
}

/**
 * Hook to get habits and entries for a specific date
 */
export function useToday(date?: string) {
  const targetDate = date ?? getTodayDate();
  const data = useQuery(api.habits.getToday, { date: targetDate });
  
  return {
    habits: data?.habits ?? [],
    entries: data?.entries ?? [],
    isLoading: data === undefined,
    date: targetDate,
  };
}

/**
 * Hook to get a habit with its recent entries
 */
export function useHabitWithEntries(habitId: Id<"habits"> | null, rangeDays = 30) {
  const data = useQuery(
    api.habits.getHabitWithRecentEntries,
    habitId ? { habitId, rangeDays } : "skip"
  );
  
  return {
    habit: data?.habit ?? null,
    entries: data?.entries ?? [],
    isLoading: habitId !== null && data === undefined,
  };
}

/**
 * Hook to get auth debug info (for testing)
 */
export function useAuthDebug() {
  const debug = useQuery(api.habits.getAuthDebug);
  return debug;
}

// ============ MUTATIONS ============

/**
 * Hook to create a new habit
 */
export function useCreateHabit() {
  return useMutation(api.habits.createHabit);
}

/**
 * Hook to update a habit
 */
export function useUpdateHabit() {
  return useMutation(api.habits.updateHabit);
}

/**
 * Hook to toggle habit completion for a date
 */
export function useToggleHabit() {
  return useMutation(api.habits.toggleHabitForDate);
}

/**
 * Hook to archive a habit
 */
export function useArchiveHabit() {
  return useMutation(api.habits.archiveHabit);
}

/**
 * Hook to restore an archived habit
 */
export function useRestoreHabit() {
  return useMutation(api.habits.restoreHabit);
}

/**
 * Hook to permanently delete a habit
 */
export function useDeleteHabit() {
  return useMutation(api.habits.deleteHabit);
}

/**
 * Hook to seed sample habits (dev only)
 */
export function useSeedHabits() {
  return useMutation(api.habits.devSeedHabits);
}

// ============ UTILITIES ============

/**
 * Check if a habit is completed for a specific date
 */
export function isHabitDone(
  entries: Array<{ habitId: Id<"habits">; status: string }>,
  habitId: Id<"habits">
): boolean {
  return entries.some(
    (entry) => entry.habitId === habitId && entry.status === "done"
  );
}

/**
 * Get the entry status for a habit on a specific date
 */
export function getHabitStatus(
  entries: Array<{ habitId: Id<"habits">; status: string }>,
  habitId: Id<"habits">
): "done" | "skipped" | null {
  const entry = entries.find((e) => e.habitId === habitId);
  return entry ? (entry.status as "done" | "skipped") : null;
}
