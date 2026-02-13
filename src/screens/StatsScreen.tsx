import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { loadCompletions, loadHabits } from '../data/storage';
import {
    calculateStreak,
    completionRate,
    longestStreak,
    weeklyData,
} from '../data/streaks';
import { Completion, Habit } from '../domain/types';
import { useInsights } from '../hooks/useConvexHabits';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../theme/ThemeContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function StatsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const useConvex = authLoaded && isSignedIn;

  // Convex insights
  const { data: insights, isLoading: convexLoading } = useInsights();

  // Legacy
  const [legacyHabits, setLegacyHabits] = useState<Habit[]>([]);
  const [legacyCompletions, setLegacyCompletions] = useState<Completion[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!useConvex) {
        (async () => {
          const [h, c] = await Promise.all([loadHabits(), loadCompletions()]);
          setLegacyHabits(h.filter((x) => !x.isArchived));
          setLegacyCompletions(c);
        })();
      }
    }, [useConvex])
  );

  // Legacy weekly data
  const legacyWeekly = weeklyData(legacyHabits, legacyCompletions);
  const legacyTotalScheduled = legacyWeekly.reduce((acc, d) => acc + d.total, 0);
  const legacyTotalCompleted = legacyWeekly.reduce((acc, d) => acc + d.completed, 0);
  const legacyWeeklyRate = legacyTotalScheduled > 0 ? Math.round((legacyTotalCompleted / legacyTotalScheduled) * 100) : 0;

  const hasData = useConvex
    ? (insights?.habits?.length ?? 0) > 0
    : legacyHabits.length > 0;

  if (!hasData) {
    return (
      <View style={[styles.container, styles.emptyContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No insights yet</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Create habits and start tracking to see your patterns here
        </Text>
      </View>
    );
  }

  // Determine data source
  const weeklyDataArr = useConvex
    ? (insights?.weeklyData ?? [])
    : legacyWeekly;
  const weeklyRate = useConvex ? (insights?.weeklyRate ?? 0) : legacyWeeklyRate;
  const perHabitData = useConvex
    ? (insights?.perHabit ?? [])
    : legacyHabits.map((h) => ({
        habitId: h.id,
        title: h.name,
        icon: h.icon || '🎯',
        color: h.color || '#6366F1',
        current: calculateStreak(h, legacyCompletions),
        longest: longestStreak(h, legacyCompletions),
        consistency30: completionRate(h, legacyCompletions, 30),
      }));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text style={[styles.screenTitle, { color: colors.text }]}>Insights</Text>

      {/* ──── Improvement Tip ──── */}
      {useConvex && insights?.improvementTip && (
        <Pressable
          style={[styles.tipCard, { backgroundColor: colors.primaryBg, borderColor: colors.primary + '30' }]}
          onPress={() => navigation.navigate('HabitForm')}
        >
          <Ionicons name="bulb" size={20} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.tipLabel, { color: colors.textTertiary }]}>This week's focus</Text>
            <Text style={[styles.tipText, { color: colors.text }]}>{insights.improvementTip}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>
      )}

      {/* ──── Weekly Chart ──── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week</Text>
        <View style={styles.chart}>
          {weeklyDataArr.map((d, i) => {
            const rate = d.total > 0 ? d.completed / d.total : 0;
            return (
              <View key={i} style={styles.barCol}>
                <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                  {d.total > 0 ? `${Math.round(rate * 100)}%` : '—'}
                </Text>
                <View style={[styles.barOuter, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.barInner,
                      {
                        backgroundColor: rate >= 1 ? colors.success : rate > 0 ? colors.primary : 'transparent',
                        height: `${Math.max(rate * 100, rate > 0 ? 6 : 0)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{d.day}</Text>
              </View>
            );
          })}
        </View>
        <View style={[styles.weeklyBadge, { backgroundColor: colors.primaryBg }]}>
          <Text style={[styles.weeklyBadgeLabel, { color: colors.textSecondary }]}>Weekly Completion Rate</Text>
          <Text style={[styles.weeklyBadgeValue, { color: colors.primary }]}>{weeklyRate}%</Text>
        </View>
      </View>

      {/* ──── Pattern Insights (Convex only) ──── */}
      {useConvex && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Patterns</Text>

          <View style={styles.patternsGrid}>
            <View style={[styles.patternCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={styles.patternEmoji}>💪</Text>
              <Text style={[styles.patternLabel, { color: colors.textTertiary }]}>Strongest Day</Text>
              <Text style={[styles.patternValue, { color: colors.text }]}>{insights?.bestDay ?? '—'}</Text>
            </View>
            <View style={[styles.patternCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={styles.patternEmoji}>🎯</Text>
              <Text style={[styles.patternLabel, { color: colors.textTertiary }]}>Weakest Day</Text>
              <Text style={[styles.patternValue, { color: colors.text }]}>{insights?.worstDay ?? '—'}</Text>
            </View>
          </View>

          {/* Anchor habits */}
          {(insights?.anchorHabits?.length ?? 0) > 0 && (
            <View style={[styles.anchorCard, { backgroundColor: colors.successBg, borderColor: colors.success + '30' }]}>
              <Text style={[styles.anchorTitle, { color: colors.success }]}>Anchor Habits</Text>
              <Text style={[styles.anchorDesc, { color: colors.textSecondary }]}>
                These habits pull others along when you complete them:
              </Text>
              {insights?.anchorHabits?.map((ahId) => {
                const h = insights.perHabit.find((p) => p.habitId === ahId);
                if (!h) return null;
                return (
                  <Text key={ahId} style={[styles.anchorHabit, { color: colors.text }]}>
                    {h.icon} {h.title}
                  </Text>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ──── Per-Habit Stats ──── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Last 30 Days</Text>
        {perHabitData.map((habit) => (
          <View
            key={habit.habitId}
            style={[styles.habitRow, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <View style={styles.habitHeader}>
              <Text style={styles.habitIcon}>{habit.icon}</Text>
              <Text style={[styles.habitName, { color: colors.text }]} numberOfLines={1}>
                {habit.title}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{habit.consistency30}%</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Consistency</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: colors.warning }]}>{habit.current}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Streak</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: colors.success }]}>{habit.longest}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Best</Text>
              </View>
            </View>
            {/* Consistency bar */}
            <View style={[styles.consistencyBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.consistencyFill,
                  {
                    backgroundColor: habit.consistency30 >= 80 ? colors.success : habit.consistency30 >= 50 ? colors.primary : colors.warning,
                    width: `${habit.consistency30}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Note: streak is not sacred */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Consistency Score matters more than streaks.{'\n'}Missing one day doesn't erase your progress.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  screenTitle: { fontSize: 28, fontWeight: '800', paddingTop: 8, paddingBottom: 16 },

  // Tip
  tipCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 16,
  },
  tipLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  tipText: { fontSize: 14, marginTop: 2, lineHeight: 20 },

  // Section
  section: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },

  // Chart
  chart: { flexDirection: 'row', height: 140, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValue: { fontSize: 10, marginBottom: 4, fontWeight: '600' },
  barOuter: { width: '100%', flex: 1, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  barInner: { width: '100%', borderRadius: 6, minHeight: 0 },
  barLabel: { fontSize: 11, marginTop: 6, fontWeight: '500' },
  weeklyBadge: {
    marginTop: 14, padding: 12, borderRadius: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  weeklyBadgeLabel: { fontSize: 14, fontWeight: '500' },
  weeklyBadgeValue: { fontSize: 20, fontWeight: '800' },

  // Patterns
  patternsGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  patternCard: {
    flex: 1, alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1,
  },
  patternEmoji: { fontSize: 24, marginBottom: 6 },
  patternLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  patternValue: { fontSize: 16, fontWeight: '800', marginTop: 2 },

  // Anchor
  anchorCard: { padding: 14, borderRadius: 12, borderWidth: 1 },
  anchorTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  anchorDesc: { fontSize: 13, marginBottom: 8 },
  anchorHabit: { fontSize: 14, fontWeight: '600', marginBottom: 4 },

  // Per-habit
  habitRow: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  habitHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  habitIcon: { fontSize: 20, marginRight: 8 },
  habitName: { fontSize: 15, fontWeight: '600', flex: 1 },
  statsRow: { flexDirection: 'row', marginBottom: 10 },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },
  consistencyBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  consistencyFill: { height: '100%', borderRadius: 2 },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Empty
  emptyContainer: { justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 40 },
});
