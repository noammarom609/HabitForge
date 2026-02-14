import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getTodayDate,
  isHabitDone,
  useCommandCenter,
  useSeedHabits,
  useToggleHabit,
} from '../hooks/useConvexHabits';
import { Routes } from '../constants/routes';
import { useTheme } from '../theme/ThemeContext';
import { Id } from '../../convex/_generated/dataModel';

// ─── Undo Toast ───
function UndoToast({
  visible,
  habitName,
  onUndo,
  onDismiss,
  colors,
}: {
  visible: boolean;
  habitName: string;
  onUndo: () => void;
  onDismiss: () => void;
  colors: any;
}) {
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, { toValue: 100, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.undoToast,
        { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.undoContent}>
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        <Text style={[styles.undoText, { color: colors.text }]} numberOfLines={1}>
          {habitName} בוצע
        </Text>
      </View>
      <Pressable onPress={onUndo} style={[styles.undoBtn, { backgroundColor: colors.primaryBg }]}>
        <Text style={[styles.undoBtnText, { color: colors.primary }]}>בטל</Text>
      </Pressable>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════
// HOME SCREEN — COMMAND CENTER
// ═══════════════════════════════════════════

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const today = getTodayDate();
  const {
    habits: convexHabits,
    entries,
    identities,
    insight,
    stats,
    missedYesterday,
    isLoading: convexLoading,
  } = useCommandCenter(today);
  const toggleMutation = useToggleHabit();
  const seedMutation = useSeedHabits();

  // Undo state
  const [undoVisible, setUndoVisible] = useState(false);
  const [undoHabit, setUndoHabit] = useState<{ id: string; name: string } | null>(null);
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  const isLoading = convexLoading;

  const habits = useMemo(() =>
    convexHabits.map((h) => ({
      id: h._id as string,
      name: h.title,
      color: h.color,
      icon: h.icon,
      cue: h.cue,
      minimumAction: h.minimumAction,
      reward: h.reward,
      isCompleted: isHabitDone(entries, h._id),
      isSkipped: entries.some((e) => e.habitId === h._id && e.status === 'skipped'),
      streak: stats.streaks[h._id]?.current ?? 0,
      consistency: stats.streaks[h._id]?.consistency30 ?? 0,
    })),
  [convexHabits, entries, stats]);

  const onToggle = async (habitId: string, status: 'done' | 'skipped', habitName: string) => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    const result = await toggleMutation({ habitId: habitId as Id<"habits">, date: today, status });
    if (status === 'done' && result?.action === 'created') {
      setUndoHabit({ id: habitId, name: habitName });
      setUndoVisible(true);
    }
  };

  const onUndo = async () => {
    if (!undoHabit) return;
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    await toggleMutation({ habitId: undoHabit.id as Id<"habits">, date: today, status: 'done' });
    setUndoVisible(false);
    setUndoHabit(null);
  };

  // ─── Summary ───
  const completedCount = habits.filter((h) => h.isCompleted).length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // ─── Active identity ───
  const activeIdentity = identities.length > 0 ? identities[0] : null;

  type HabitItem = (typeof habits)[number];

  // ─── Render Habit Card ───
  const renderHabit = ({ item }: { item: HabitItem }) => {
    const done = item.isCompleted;
    const skipped = item.isSkipped;
    const expanded = expandedHabitId === item.id;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: done ? colors.success + '40' : skipped ? colors.warning + '30' : colors.border,
          },
        ]}
      >
        <View style={[styles.cardAccent, { backgroundColor: item.color || colors.primary }]} />

        <View style={{ flex: 1 }}>
          {/* Main row */}
          <Pressable
            style={styles.cardBody}
            onPress={() => setExpandedHabitId(expanded ? null : item.id)}
          >
            <Text style={styles.cardIcon}>{item.icon || '🎯'}</Text>
            <View style={styles.cardInfo}>
              <Text
                style={[
                  styles.cardName,
                  { color: colors.text },
                  done && { opacity: 0.5, textDecorationLine: 'line-through' as const },
                ]}
              >
                {item.name}
              </Text>
              {item.minimumAction && !done && (
                <Text style={[styles.microAction, { color: colors.textTertiary }]}>
                  מינימום: {item.minimumAction}
                </Text>
              )}
              {item.streak > 0 && (
                <Text style={[styles.streakBadge, { color: colors.warning }]}>
                  🔥 {item.streak}d {item.consistency > 0 ? `· ${item.consistency}%` : ''}
                </Text>
              )}
            </View>

            {/* Action buttons */}
            <View style={styles.cardActions}>
              {!done && !skipped && (
                <Pressable
                  style={[styles.skipBtn, { borderColor: colors.border }]}
                  onPress={() => onToggle(item.id, 'skipped', item.name)}
                >
                  <Ionicons name="play-skip-forward" size={14} color={colors.textTertiary} />
                </Pressable>
              )}
              <Pressable
                style={[
                  styles.checkBtn,
                  {
                    backgroundColor: done ? colors.success : skipped ? colors.warning : 'transparent',
                    borderColor: done ? colors.success : skipped ? colors.warning : colors.border,
                  },
                ]}
                onPress={() => onToggle(item.id, done ? 'done' : 'done', item.name)}
              >
                {done && <Ionicons name="checkmark" size={18} color="#FFF" />}
                {skipped && <Ionicons name="play-skip-forward" size={14} color="#FFF" />}
              </Pressable>
            </View>
          </Pressable>

          {/* Progressive disclosure — Blueprint details */}
          {expanded && (
            <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
              {item.cue && (
                <View style={styles.blueprintRow}>
                  <Text style={[styles.blueprintLabel, { color: colors.textTertiary }]}>טריגר</Text>
                  <Text style={[styles.blueprintValue, { color: colors.textSecondary }]}>{item.cue}</Text>
                </View>
              )}
              {item.minimumAction && (
                <View style={styles.blueprintRow}>
                  <Text style={[styles.blueprintLabel, { color: colors.textTertiary }]}>גרסת 30 שניות</Text>
                  <Text style={[styles.blueprintValue, { color: colors.textSecondary }]}>{item.minimumAction}</Text>
                </View>
              )}
              {item.reward && (
                <View style={styles.blueprintRow}>
                  <Text style={[styles.blueprintLabel, { color: colors.textTertiary }]}>תגמול</Text>
                  <Text style={[styles.blueprintValue, { color: colors.textSecondary }]}>{item.reward}</Text>
                </View>
              )}
              <Pressable
                style={[styles.editLink]}
                onPress={() => navigation.navigate(Routes.HabitForm, { habitId: item.id })}
              >
                <Ionicons name="pencil" size={14} color={colors.primary} />
                <Text style={[styles.editLinkText, { color: colors.primary }]}>ערוך הרגל</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ─── Loading ───
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* ──── Header ──── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{dateStr}</Text>
          <Text style={[styles.title, { color: colors.text }]}>היום</Text>
        </View>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate(Routes.HabitForm)}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </Pressable>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        contentContainerStyle={habits.length === 0 ? styles.emptyContainer : styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* ──── Identity banner ──── */}
            {activeIdentity && (
              <View style={[styles.identityBanner, { backgroundColor: colors.primaryBg }]}>
                <Text style={[styles.identityText, { color: colors.primary }]}>
                  היום אתה הופך ל: <Text style={styles.identityBold}>{activeIdentity.label}</Text>
                </Text>
              </View>
            )}

            {/* ──── Top Insight ──── */}
            {insight && totalCount > 0 && (
              <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.insightDot, { backgroundColor: missedYesterday ? colors.warning : colors.primary }]} />
                <Text style={[styles.insightText, { color: colors.text }]}>
                  {insight.text}
                </Text>
              </View>
            )}

            {/* ──── Recovery CTA ──── */}
            {missedYesterday && completedCount === 0 && totalCount > 0 && (
              <Pressable
                style={[styles.recoveryCTA, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '40' }]}
                onPress={() => {
                  const first = habits[0];
                  if (first) onToggle(first.id, 'done', first.name);
                }}
              >
                <Ionicons name="arrow-redo" size={20} color={colors.warning} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.recoveryTitle, { color: colors.text }]}>חזרה למסלול</Text>
                  <Text style={[styles.recoverySubtitle, { color: colors.textSecondary }]}>
                    עשה אחד. התחל עם {habits[0]?.name ?? 'ההרגל הראשון שלך'}.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </Pressable>
            )}

            {/* ──── Progress Summary ──── */}
            {totalCount > 0 && (
              <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.summaryTop}>
                  <Text style={[styles.summaryTitle, { color: colors.text }]}>
                    {completedCount === totalCount
                      ? '🎉 הכל הושלם להיום!'
                      : `${completedCount} מתוך ${totalCount} הושלמו`}
                  </Text>
                  <Text style={[styles.summaryPercent, { color: completedCount === totalCount ? colors.success : colors.primary }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: completedCount === totalCount ? colors.success : colors.primary,
                        width: `${Math.round(progress * 100)}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>התחל לבנות את הזהות שלך</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              כל הרגל הוא קול למי שאתה רוצה להיות.{'\n'}לחץ + ליצירת ההרגל הראשון.
            </Text>
            {__DEV__ && (
              <Pressable
                style={[styles.seedBtn, { backgroundColor: colors.primary }]}
                onPress={() => seedMutation({})}
              >
                <Text style={styles.seedBtnText}>טען הרגלים לדוגמה</Text>
              </Pressable>
            )}
          </View>
        }
      />

      {/* ──── Undo Toast ──── */}
      <UndoToast
        visible={undoVisible}
        habitName={undoHabit?.name ?? ''}
        onUndo={onUndo}
        onDismiss={() => setUndoVisible(false)}
        colors={colors}
      />
    </View>
  );
}

// ═══════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4,
  },
  greeting: { fontSize: 14, marginBottom: 2 },
  title: { fontSize: 28, fontWeight: '800' },
  addBtn: {
    width: 48, height: 48, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
  },

  // Identity banner
  identityBanner: {
    marginHorizontal: 20, marginTop: 8, marginBottom: 4,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12,
  },
  identityText: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  identityBold: { fontWeight: '800' },

  // Insight
  insightCard: {
    marginHorizontal: 20, marginTop: 10, marginBottom: 4,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14,
    flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1,
  },
  insightDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, marginRight: 10 },
  insightText: { fontSize: 14, lineHeight: 20, flex: 1, fontStyle: 'italic' },

  // Recovery CTA
  recoveryCTA: {
    marginHorizontal: 20, marginTop: 10, marginBottom: 4,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
  },
  recoveryTitle: { fontSize: 15, fontWeight: '700' },
  recoverySubtitle: { fontSize: 13, marginTop: 2 },

  // Summary
  summaryCard: {
    marginHorizontal: 20, marginTop: 10, marginBottom: 12,
    padding: 16, borderRadius: 14, borderWidth: 1,
  },
  summaryTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  summaryTitle: { fontSize: 15, fontWeight: '600' },
  summaryPercent: { fontSize: 15, fontWeight: '700' },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  // List
  list: { paddingHorizontal: 20, paddingBottom: 100 },

  // Habit card
  card: {
    flexDirection: 'row', borderRadius: 16, borderWidth: 1,
    marginBottom: 10, overflow: 'hidden',
  },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  cardBody: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingLeft: 12, paddingRight: 8,
  },
  cardIcon: { fontSize: 24, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '600' },
  microAction: { fontSize: 12, marginTop: 2 },
  streakBadge: { fontSize: 12, marginTop: 3, fontWeight: '600' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 6 },
  skipBtn: {
    width: 28, height: 28, borderRadius: 8, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  checkBtn: {
    width: 32, height: 32, borderRadius: 10, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },

  // Expanded blueprint
  expandedSection: {
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, borderTopWidth: 1,
  },
  blueprintRow: { marginBottom: 8 },
  blueprintLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  blueprintValue: { fontSize: 14, marginTop: 2 },
  editLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  editLinkText: { fontSize: 13, fontWeight: '600' },

  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  seedBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  seedBtnText: { color: '#FFF', fontWeight: '600' },

  // Undo toast
  undoToast: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14,
    borderWidth: 1, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12,
  },
  undoContent: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  undoText: { fontSize: 14, fontWeight: '500' },
  undoBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, marginLeft: 8 },
  undoBtnText: { fontSize: 13, fontWeight: '700' },
});
