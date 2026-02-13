/**
 * Custom hooks for Convex habits operations
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// ═══════ Command Center (Today) ═══════

export function useCommandCenter(date?: string) {
  const targetDate = date ?? getTodayDate();
  const data = useQuery(api.habits.getCommandCenter, { date: targetDate });
  return {
    habits: data?.habits ?? [],
    entries: data?.entries ?? [],
    identities: data?.identities ?? [],
    insight: data?.insight ?? null,
    stats: data?.stats ?? { completedToday: 0, totalToday: 0, streaks: {} },
    missedYesterday: data?.missedYesterday ?? false,
    isLoading: data === undefined,
    date: targetDate,
  };
}

// ═══════ Simple queries ═══════

export function useHabits() {
  const habits = useQuery(api.habits.getHabits);
  return { habits: habits ?? [], isLoading: habits === undefined };
}

export function useAllHabits() {
  const habits = useQuery(api.habits.getAllHabits);
  return { habits: habits ?? [], isLoading: habits === undefined };
}

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

export function useInsights() {
  const data = useQuery(api.habits.getInsights);
  return { data, isLoading: data === undefined };
}

export function useIdentities() {
  const ids = useQuery(api.habits.getIdentities);
  return { identities: ids ?? [], isLoading: ids === undefined };
}

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

export function useAuthDebug() {
  return useQuery(api.habits.getAuthDebug);
}

// ═══════ Mutations ═══════

export function useCreateHabit() { return useMutation(api.habits.createHabit); }
export function useUpdateHabit() { return useMutation(api.habits.updateHabit); }
export function useToggleHabit() { return useMutation(api.habits.toggleHabitForDate); }
export function useArchiveHabit() { return useMutation(api.habits.archiveHabit); }
export function useRestoreHabit() { return useMutation(api.habits.restoreHabit); }
export function useDeleteHabit() { return useMutation(api.habits.deleteHabit); }
export function useSeedHabits() { return useMutation(api.habits.devSeedHabits); }
export function useCreateIdentity() { return useMutation(api.habits.createIdentity); }
export function useDeleteIdentity() { return useMutation(api.habits.deleteIdentity); }

// ═══════ Utilities ═══════

export function isHabitDone(
  entries: Array<{ habitId: Id<"habits">; status: string }>,
  habitId: Id<"habits">
): boolean {
  return entries.some((e) => e.habitId === habitId && e.status === "done");
}

export function getHabitStatus(
  entries: Array<{ habitId: Id<"habits">; status: string }>,
  habitId: Id<"habits">
): "done" | "skipped" | null {
  const entry = entries.find((e) => e.habitId === habitId);
  return entry ? (entry.status as "done" | "skipped") : null;
}
