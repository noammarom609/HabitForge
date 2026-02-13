import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Convex hooks
import {
  getTodayDate,
  isHabitDone,
  useAuthDebug,
  useSeedHabits,
  useToday,
  useToggleHabit,
} from '../hooks/useConvexHabits';

// Legacy storage (fallback for unauthenticated users)
import { loadCompletions, loadHabits, toggleCompletion } from '../data/storage';
import { calculateStreak, formatDate, getDayOfWeek } from '../data/streaks';
import { Completion, Habit as LegacyHabit } from '../domain/types';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../theme/ThemeContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Auth state
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  // Convex data (only for authenticated users)
  const today = getTodayDate();
  const { habits: convexHabits, entries, isLoading: convexLoading } = useToday(today);
  const toggleHabitMutation = useToggleHabit();
  const seedHabits = useSeedHabits();
  const authDebug = useAuthDebug();

  // Legacy data (for unauthenticated users)
  const [legacyHabits, setLegacyHabits] = useState<LegacyHabit[]>([]);
  const [legacyCompletions, setLegacyCompletions] = useState<Completion[]>([]);
  const [legacyLoading, setLegacyLoading] = useState(false);

  const legacyToday = formatDate(new Date());

  // Refresh legacy data
  const refreshLegacy = useCallback(async () => {
    setLegacyLoading(true);
    try {
      const [allHabits, allCompletions] = await Promise.all([
        loadHabits(),
        loadCompletions(),
      ]);
      const dayOfWeek = getDayOfWeek();
      const todayHabits = allHabits.filter(
        (h) => !h.isArchived && h.daysOfWeek.includes(dayOfWeek)
      );
      setLegacyHabits(todayHabits);
      setLegacyCompletions(allCompletions);
    } finally {
      setLegacyLoading(false);
    }
  }, []);

  // Load legacy data when screen focuses (only if not signed in)
  useFocusEffect(
    useCallback(() => {
      if (authLoaded && !isSignedIn) {
        refreshLegacy();
      }
    }, [authLoaded, isSignedIn, refreshLegacy])
  );

  // Determine which data source to use
  const useConvex = authLoaded && isSignedIn;
  const isLoading = !authLoaded || (useConvex ? convexLoading : legacyLoading);

  // Unified habit list for rendering
  const habits = useMemo(() => {
    if (useConvex) {
      return convexHabits.map((h) => ({
        id: h._id,
        name: h.title,
        color: h.color,
        icon: h.icon,
        isCompleted: isHabitDone(entries, h._id),
        streak: 0, // TODO: Calculate from Convex entries
        isConvex: true,
      }));
    } else {
      return legacyHabits.map((h) => ({
        id: h.id,
        name: h.name,
        color: h.color,
        icon: h.icon,
        isCompleted: legacyCompletions.some(
          (c) => c.habitId === h.id && c.date === legacyToday && c.completed
        ),
        streak: calculateStreak(h, legacyCompletions),
        isConvex: false,
      }));
    }
  }, [useConvex, convexHabits, entries, legacyHabits, legacyCompletions, legacyToday]);

  // Toggle handler
  const onToggle = async (habitId: string, isConvex: boolean) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics may not be available
    }

    if (isConvex) {
      await toggleHabitMutation({
        habitId: habitId as any,
        date: today,
        status: 'done',
      });
      // Realtime update happens automatically via Convex subscription
    } else {
      await toggleCompletion(habitId, legacyToday);
      await refreshLegacy();
    }
  };

  // Seed habits (dev only)
  const onSeedHabits = async () => {
    try {
      await seedHabits({});
    } catch (err) {
      console.error('Seed error:', err);
    }
  };

  // Summary calculations
  const completedCount = habits.filter((h) => h.isCompleted).length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  type HabitItem = (typeof habits)[number];

  const renderHabit = ({ item }: { item: HabitItem }) => {
    const done = item.isCompleted;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: done ? colors.success + '40' : colors.border,
          },
        ]}
      >
        {/* Color accent bar */}
        <View
          style={[
            styles.cardAccent,
            { backgroundColor: item.color || colors.primary },
          ]}
        />

        <Pressable
          style={styles.cardBody}
          onPress={() => navigation.navigate('HabitForm', { habitId: item.id })}
        >
          <Text style={styles.cardIcon}>{item.icon || '🎯'}</Text>
          <View style={styles.cardInfo}>
            <Text
              style={[
                styles.cardName,
                { color: colors.text },
                done && {
                  opacity: 0.5,
                  textDecorationLine: 'line-through' as const,
                },
              ]}
            >
              {item.name}
            </Text>
            {item.streak > 0 && (
              <Text style={[styles.streakText, { color: colors.warning }]}>
                🔥 {item.streak} day{item.streak !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </Pressable>

        <Pressable
          style={[
            styles.checkBtn,
            {
              backgroundColor: done ? colors.success : 'transparent',
              borderColor: done ? colors.success : colors.border,
            },
          ]}
          onPress={() => onToggle(item.id, item.isConvex)}
        >
          {done && <Ionicons name="checkmark" size={18} color="#FFF" />}
        </Pressable>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {dateStr}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>Today</Text>
        </View>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('HabitForm')}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </Pressable>
      </View>

      {/* Auth status indicator (dev) */}
      {__DEV__ && (
        <View style={[styles.devBanner, { backgroundColor: isSignedIn ? colors.success + '20' : colors.warning + '20' }]}>
          <Text style={[styles.devText, { color: isSignedIn ? colors.success : colors.warning }]}>
            {isSignedIn ? `✓ Convex (${authDebug?.identity?.email || 'loading...'})` : '○ Local Storage'}
          </Text>
        </View>
      )}

      {/* Summary card */}
      {totalCount > 0 && (
        <View style={[styles.summaryCard, { backgroundColor: colors.primaryBg }]}>
          <View style={styles.summaryTop}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {completedCount === totalCount
                ? '🎉 All done for today!'
                : `${completedCount} of ${totalCount} completed`}
            </Text>
            <Text style={[styles.summaryPercent, { color: colors.primary }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor:
                    completedCount === totalCount ? colors.success : colors.primary,
                  width: `${Math.round(progress * 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Habit list */}
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        contentContainerStyle={
          habits.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No habits for today
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Tap the + button to create your first habit
            </Text>

            {/* Dev seed button */}
            {__DEV__ && isSignedIn && (
              <Pressable
                style={[styles.seedBtn, { backgroundColor: colors.primary }]}
                onPress={onSeedHabits}
              >
                <Text style={styles.seedBtnText}>Seed Sample Habits</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  greeting: { fontSize: 14, marginBottom: 2 },
  title: { fontSize: 28, fontWeight: '800' },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  devBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  devText: { fontSize: 12, fontWeight: '600' },
  summaryCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: { fontSize: 15, fontWeight: '600' },
  summaryPercent: { fontSize: 15, fontWeight: '700' },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 12,
  },
  cardIcon: { fontSize: 24, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '600' },
  streakText: { fontSize: 13, marginTop: 2, fontWeight: '500' },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  seedBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  seedBtnText: { color: '#FFF', fontWeight: '600' },
});
