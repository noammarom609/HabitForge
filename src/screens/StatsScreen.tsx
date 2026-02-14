import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInsights } from '../hooks/useConvexHabits';
import { Routes } from '../constants/routes';
import { useTheme } from '../theme/ThemeContext';

export function StatsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const { data: insights } = useInsights();

  const hasData = (insights?.habits?.length ?? 0) > 0;

  if (!hasData) {
    return (
      <View style={[styles.container, styles.emptyContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>אין עדיין תובנות</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          צור הרגלים והתחל לעקוב כדי לראות את הדפוסים שלך כאן
        </Text>
      </View>
    );
  }

  const weeklyDataArr = insights?.weeklyData ?? [];
  const weeklyRate = insights?.weeklyRate ?? 0;
  const perHabitData = insights?.perHabit ?? [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text style={[styles.screenTitle, { color: colors.text }]}>תובנות</Text>

      {/* ──── Improvement Tip ──── */}
      {insights?.improvementTip && (
        <Pressable
          style={[styles.tipCard, { backgroundColor: colors.primaryBg, borderColor: colors.primary + '30' }]}
          onPress={() => navigation.navigate(Routes.HabitForm)}
        >
          <Ionicons name="bulb" size={20} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.tipLabel, { color: colors.textTertiary }]}>מיקוד השבוע</Text>
            <Text style={[styles.tipText, { color: colors.text }]}>{insights.improvementTip}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>
      )}

      {/* ──── Weekly Chart ──── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>השבוע</Text>
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
          <Text style={[styles.weeklyBadgeLabel, { color: colors.textSecondary }]}>אחוז השלמה שבועי</Text>
          <Text style={[styles.weeklyBadgeValue, { color: colors.primary }]}>{weeklyRate}%</Text>
        </View>
      </View>

      {/* ──── Pattern Insights ──── */}
      {insights && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>הדפוסים שלך</Text>

          <View style={styles.patternsGrid}>
            <View style={[styles.patternCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={styles.patternEmoji}>💪</Text>
              <Text style={[styles.patternLabel, { color: colors.textTertiary }]}>היום החזק</Text>
              <Text style={[styles.patternValue, { color: colors.text }]}>{insights?.bestDay ?? '—'}</Text>
            </View>
            <View style={[styles.patternCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={styles.patternEmoji}>🎯</Text>
              <Text style={[styles.patternLabel, { color: colors.textTertiary }]}>היום החלש</Text>
              <Text style={[styles.patternValue, { color: colors.text }]}>{insights?.worstDay ?? '—'}</Text>
            </View>
          </View>

          {/* Anchor habits */}
          {(insights?.anchorHabits?.length ?? 0) > 0 && (
            <View style={[styles.anchorCard, { backgroundColor: colors.successBg, borderColor: colors.success + '30' }]}>
              <Text style={[styles.anchorTitle, { color: colors.success }]}>הרגלי עוגן</Text>
              <Text style={[styles.anchorDesc, { color: colors.textSecondary }]}>
                הרגלים אלה מושכים אחרים כשאתה משלים אותם:
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>30 הימים האחרונים</Text>
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
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>עקביות</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: colors.warning }]}>{habit.current}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>רצף</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: colors.success }]}>{habit.longest}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>הכי טוב</Text>
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
          ציון עקביות חשוב יותר מרצפים.{'\n'}דילוג על יום אחד לא מוחק את ההתקדמות שלך.
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
