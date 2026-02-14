/**
 * Route names — קבועים לשימוש עקבי בכל האפליקציה
 * לא לשנות שמות — ישבור ניווט קיים
 */
export const Routes = {
  // Root
  Onboarding: 'Onboarding',
  Auth: 'Auth',
  AppTabs: 'Tabs',

  // Tabs
  TodayTab: 'TodayTab',
  HabitsTab: 'HabitsTab',
  CoachTab: 'CoachTab',
  InsightsTab: 'InsightsTab',
  SettingsTab: 'SettingsTab',

  // Today
  TodayHome: 'TodayHome',
  TodayPlan: 'TodayPlan',
  RoutineRun: 'RoutineRun',
  FocusMode: 'FocusMode',

  // Habits
  HabitsHome: 'HabitsHome',
  HabitDetails: 'HabitDetails',
  HabitLog: 'HabitLog',
  HabitForm: 'HabitForm',
  Templates: 'Templates',

  // Coach
  CoachHome: 'CoachHome',
  ObstacleWizard: 'ObstacleWizard',
  RepairMode: 'RepairMode',
  WeeklyReviewWizard: 'WeeklyReviewWizard',
  MotivationVault: 'MotivationVault',

  // Insights
  InsightsHome: 'InsightsHome',
  CalendarHeatmap: 'CalendarHeatmap',
  Patterns: 'Patterns',
  HabitHealthScore: 'HabitHealthScore',

  // Settings
  SettingsHome: 'SettingsHome',
  Profile: 'Profile',
  Theme: 'Theme',
  NotificationsCenter: 'NotificationsCenter',
  Identity: 'Identity',
  Privacy: 'Privacy',
  Support: 'Support',
  IntegrationsHub: 'IntegrationsHub',
  DataBackupRestore: 'DataBackupRestore',
  Feedback: 'Feedback',

  // Identity OS (V3)
  IdentityBuilder: 'IdentityBuilder',
  NorthStarDashboard: 'NorthStarDashboard',
  Milestones: 'Milestones',

  // Social (V3)
  Partners: 'Partners',
  Groups: 'Groups',
  Challenges: 'Challenges',
  ShareCards: 'ShareCards',

  // Planning (V3)
  Planner: 'Planner',

  // Modals
  QuickCheckInModal: 'QuickCheckInModal',
  CompleteHabitModal: 'CompleteHabitModal',
  CreateHabitModal: 'CreateHabitModal',
  PaywallModal: 'PaywallModal',
} as const;
