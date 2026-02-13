export type Habit = {
  id: string;
  name: string;
  daysOfWeek: number[]; // 0-6 (Sun-Sat)
  reminderTime?: string | null; // "HH:mm"
  color?: string;
  icon?: string;
  createdAt: number;
  isArchived: boolean;
};

export type Completion = {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: number | null;
};
