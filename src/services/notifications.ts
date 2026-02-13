import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Habit } from '../domain/types';

// ─── Notification handler (call once at app startup) ───

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Permissions ───────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habits', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// ─── Scheduling ────────────────────────────────────

export async function scheduleHabitNotifications(habit: Habit) {
  if (!habit.reminderTime) return;

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  const [hourStr, minuteStr] = habit.reminderTime.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (isNaN(hour) || isNaN(minute)) return;

  // Remove old notifications first
  await cancelHabitNotifications(habit.id);

  for (const day of habit.daysOfWeek) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${habit.name}`,
          body: 'Time to work on your habit!',
          data: { habitId: habit.id },
          ...(Platform.OS === 'android' ? { channelId: 'habits' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day + 1, // expo uses 1=Sun … 7=Sat; our model uses 0=Sun … 6=Sat
          hour,
          minute,
        },
        identifier: `habit-${habit.id}-${day}`,
      });
    } catch (err) {
      console.warn('Failed to schedule notification:', err);
    }
  }
}

export async function cancelHabitNotifications(habitId: string) {
  for (let day = 0; day < 7; day++) {
    try {
      await Notifications.cancelScheduledNotificationAsync(
        `habit-${habitId}-${day}`,
      );
    } catch {
      // notification may not exist — safe to ignore
    }
  }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
