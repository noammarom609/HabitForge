export const HABIT_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
];

export const HABIT_ICONS = [
  '🔥', '💪', '📚', '🧘', '🏃', '💧', '🎵', '✍️',
  '🍎', '😴', '🧠', '💊', '🎯', '⭐', '🏋️', '☕',
  '🚴', '🧹', '📝', '🎨', '💰', '🙏', '🌅', '🛌',
];

export type ThemeColors = {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryLight: string;
  primaryBg: string;
  success: string;
  successBg: string;
  warning: string;
  danger: string;
  dangerBg: string;
  border: string;
  shadow: string;
  tabBar: string;
  tabBarBorder: string;
  placeholder: string;
};

export const lightColors: ThemeColors = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryBg: '#EEF2FF',
  success: '#10B981',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  border: '#E5E7EB',
  shadow: '#000000',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  placeholder: '#9CA3AF',
};

export const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  card: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryBg: '#1E1B4B',
  success: '#34D399',
  successBg: '#064E3B',
  warning: '#FBBF24',
  danger: '#F87171',
  dangerBg: '#7F1D1D',
  border: '#334155',
  shadow: '#000000',
  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  placeholder: '#64748B',
};
