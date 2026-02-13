import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadCompletions, loadHabits } from '../data/storage';
import {
    calculateStreak,
    completionRate,
    longestStreak,
    weeklyData,
} from '../data/streaks';
import { Completion, Habit } from '../domain/types';
import { useTheme } from '../theme/ThemeContext';

export function StatsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [h, c] = await Promise.all([loadHabits(), loadCompletions()]);
        setHabits(h.filter((x) => !x.isArchived));
        setCompletions(c);
      })();
    }, []),
  );

  const weekly = weeklyData(habits, completions);

  // Overall weekly rate
  const totalScheduled = weekly.reduce((acc, d) => acc + d.total, 0);
  const totalCompleted = weekly.reduce((acc, d) => acc + d.completed, 0);
  const weeklyRate =
    totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

  if (habits.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.emptyContainer,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No stats yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Create habits and start tracking to see your statistics here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      {/* Screen title */}
      <Text style={[styles.screenTitle, { color: colors.text }]}>
        Statistics
      </Text>

      {/* ──── Weekly chart ──── */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          This Week
        </Text>

        <View style={styles.chart}>
          {weekly.map((d, i) => {
            const rate = d.total > 0 ? d.completed / d.total : 0;
            return (
              <View key={i} style={styles.barCol}>
                <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                  {d.total > 0 ? `${Math.round(rate * 100)}%` : '—'}
                </Text>
                <View
                  style={[styles.barOuter, { backgroundColor: colors.border }]}
                >
                  <View
                    style={[
                      styles.barInner,
                      {
                        backgroundColor:
                          rate >= 1
                            ? colors.success
                            : rate > 0
                              ? colors.primary
                              : 'transparent',
                        height: `${Math.max(rate * 100, rate > 0 ? 6 : 0)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                  {d.day}
                </Text>
              </View>
            );
          })}
        </View>

        <View
          style={[styles.weeklyBadge, { backgroundColor: colors.primaryBg }]}
        >
          <Text style={[styles.weeklyBadgeLabel, { color: colors.textSecondary }]}>
            Weekly Completion Rate
          </Text>
          <Text style={[styles.weeklyBadgeValue, { color: colors.primary }]}>
            {weeklyRate}%
          </Text>
        </View>
      </View>

      {/* ──── Per-habit stats (last 30 days) ──── */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Last 30 Days
        </Text>

        {habits.map((habit) => {
          const rate30 = completionRate(habit, completions, 30);
          const longest = longestStreak(habit, completions);
          const current = calculateStreak(habit, completions);

          return (
            <View
              key={habit.id}
              style={[
                styles.habitRow,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
            >
              <View style={styles.habitHeader}>
                <Text style={styles.habitIcon}>{habit.icon || '🎯'}</Text>
                <Text
                  style={[styles.habitName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {habit.name}
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: colors.primary }]}>
                    {rate30}%
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                    Rate
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: colors.warning }]}>
                    {current}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                    Streak
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: colors.success }]}>
                    {longest}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                    Best
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    paddingTop: 8,
    paddingBottom: 16,
  },

  // Sections
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },

  // Chart
  chart: {
    flexDirection: 'row',
    height: 160,
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: { fontSize: 10, marginBottom: 4, fontWeight: '600' },
  barOuter: {
    width: '100%',
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barInner: {
    width: '100%',
    borderRadius: 6,
    minHeight: 0,
  },
  barLabel: { fontSize: 11, marginTop: 6, fontWeight: '500' },

  weeklyBadge: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyBadgeLabel: { fontSize: 14, fontWeight: '500' },
  weeklyBadgeValue: { fontSize: 20, fontWeight: '800' },

  // Per-habit
  habitRow: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitIcon: { fontSize: 20, marginRight: 8 },
  habitName: { fontSize: 15, fontWeight: '600', flex: 1 },
  statsRow: { flexDirection: 'row' },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },

  // Empty
  emptyContainer: { justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 40 },
});
