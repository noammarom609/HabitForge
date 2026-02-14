import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Id } from '../../convex/_generated/dataModel';
import { Routes } from '../app/routes';

export type RootStackParamList = {
  [Routes.Onboarding]: undefined;
  [Routes.Auth]: undefined;
  [Routes.AppTabs]: undefined;
  [Routes.HabitForm]: { habitId?: string } | undefined;
  [Routes.QuickCheckInModal]: undefined;
  [Routes.CompleteHabitModal]: { habitId: string };
  [Routes.CreateHabitModal]: undefined;
  [Routes.PaywallModal]: undefined;
};

export type TodayStackParamList = {
  [Routes.TodayHome]: undefined;
  [Routes.TodayPlan]: undefined;
  [Routes.RoutineRun]: { routineId?: string };
  [Routes.FocusMode]: { habitId?: string };
};

export type HabitsStackParamList = {
  [Routes.HabitsHome]: undefined;
  [Routes.HabitDetails]: { habitId: string };
  [Routes.HabitLog]: { habitId: string };
  [Routes.Templates]: undefined;
};

export type CoachStackParamList = {
  [Routes.CoachHome]: undefined;
  [Routes.ObstacleWizard]: { habitId?: string };
  [Routes.RepairMode]: { habitId?: string };
  [Routes.WeeklyReviewWizard]: undefined;
  [Routes.MotivationVault]: undefined;
};

export type InsightsStackParamList = {
  [Routes.InsightsHome]: undefined;
  [Routes.CalendarHeatmap]: undefined;
  [Routes.Patterns]: undefined;
  [Routes.HabitHealthScore]: { habitId?: string };
};

export type SettingsStackParamList = {
  [Routes.SettingsHome]: undefined;
  [Routes.Profile]: undefined;
  [Routes.Theme]: undefined;
  [Routes.NotificationsCenter]: undefined;
  [Routes.Identity]: undefined;
  [Routes.Privacy]: undefined;
  [Routes.Support]: undefined;
  [Routes.IntegrationsHub]: undefined;
  [Routes.DataBackupRestore]: undefined;
  [Routes.Feedback]: undefined;
  [Routes.CalendarHeatmap]: undefined;
  [Routes.HabitHealthScore]: { habitId?: string };
};

export type TabsParamList = {
  [Routes.TodayTab]: undefined;
  [Routes.HabitsTab]: undefined;
  [Routes.CoachTab]: undefined;
  [Routes.InsightsTab]: undefined;
  [Routes.SettingsTab]: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
    interface TodayParamList extends TodayStackParamList {}
    interface HabitsParamList extends HabitsStackParamList {}
    interface CoachParamList extends CoachStackParamList {}
    interface InsightsParamList extends InsightsStackParamList {}
    interface SettingsParamList extends SettingsStackParamList {}
  }
}
