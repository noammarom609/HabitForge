/**
 * Design System Tokens — HabitForge
 * Foundation for consistent spacing, radius, typography, motion
 */

export const spacing = {
  0: 0,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.3 },
  h1: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.2 },
  h2: { fontSize: 18, fontWeight: '700' as const, letterSpacing: -0.1 },
  body: { fontSize: 16, fontWeight: '500' as const },
  caption: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.2 },
} as const;

export const motion = {
  duration: { fast: 120, base: 180, slow: 240 },
} as const;
