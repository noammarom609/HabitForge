import AsyncStorage from '@react-native-async-storage/async-storage';
import { Completion, Habit } from '../domain/types';

const KEYS = {
  habits: 'habits:v1',
  completions: 'completions:v1',
  onboarding: 'onboarding:done',
};

// ─── Habits ────────────────────────────────────────

export async function loadHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(KEYS.habits);
  return raw ? (JSON.parse(raw) as Habit[]) : [];
}

export async function saveHabits(habits: Habit[]) {
  await AsyncStorage.setItem(KEYS.habits, JSON.stringify(habits));
}

export async function getHabit(id: string): Promise<Habit | undefined> {
  const habits = await loadHabits();
  return habits.find((h) => h.id === id);
}

export async function deleteHabit(id: string) {
  const habits = await loadHabits();
  await saveHabits(habits.filter((h) => h.id !== id));
  const completions = await loadCompletions();
  await saveCompletions(completions.filter((c) => c.habitId !== id));
}

export async function archiveHabit(id: string) {
  const habits = await loadHabits();
  await saveHabits(
    habits.map((h) => (h.id === id ? { ...h, isArchived: true } : h)),
  );
}

// ─── Completions ───────────────────────────────────

export async function loadCompletions(): Promise<Completion[]> {
  const raw = await AsyncStorage.getItem(KEYS.completions);
  return raw ? (JSON.parse(raw) as Completion[]) : [];
}

export async function saveCompletions(items: Completion[]) {
  await AsyncStorage.setItem(KEYS.completions, JSON.stringify(items));
}

export async function toggleCompletion(
  habitId: string,
  date: string,
): Promise<boolean> {
  const completions = await loadCompletions();
  const idx = completions.findIndex(
    (c) => c.habitId === habitId && c.date === date,
  );

  if (idx >= 0 && completions[idx].completed) {
    // Un-mark
    completions[idx] = { ...completions[idx], completed: false, completedAt: null };
    await saveCompletions(completions);
    return false;
  } else if (idx >= 0) {
    // Re-mark
    completions[idx] = {
      ...completions[idx],
      completed: true,
      completedAt: Date.now(),
    };
    await saveCompletions(completions);
    return true;
  } else {
    // Create new
    completions.push({ habitId, date, completed: true, completedAt: Date.now() });
    await saveCompletions(completions);
    return true;
  }
}

// ─── Onboarding ────────────────────────────────────

export async function isOnboardingDone(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.onboarding);
  return val === 'true';
}

export async function markOnboardingDone() {
  await AsyncStorage.setItem(KEYS.onboarding, 'true');
}
