import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadCompletions, loadHabits, toggleCompletion } from '../data/storage';
import { calculateStreak, formatDate, getDayOfWeek } from '../data/streaks';
import { Completion, Habit } from '../domain/types';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../theme/ThemeContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);

  const today = formatDate(new Date());

  const refresh = useCallback(async () => {
    const [allHabits, allCompletions] = await Promise.all([
      loadHabits(),
      loadCompletions(),
    ]);
    const dayOfWeek = getDayOfWeek();
    const todayHabits = allHabits.filter(
      (h) => !h.isArchived && h.daysOfWeek.includes(dayOfWeek),
    );
    setHabits(todayHabits);
    setCompletions(allCompletions);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const isCompleted = (habitId: string) =>
    completions.some(
      (c) => c.habitId === habitId && c.date === today && c.completed,
    );

  const onToggle = async (habitId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics may not be available (simulator)
    }
    await toggleCompletion(habitId, today);
    await refresh();
  };

  // Summary
  const completedCount = habits.filter((h) => isCompleted(h.id)).length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const renderHabit = ({ item }: { item: Habit }) => {
    const done = isCompleted(item.id);
    const streak = calculateStreak(item, completions);

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
            {streak > 0 && (
              <Text style={[styles.streakText, { color: colors.warning }]}>
                🔥 {streak} day{streak !== 1 ? 's' : ''}
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
          onPress={() => onToggle(item.id)}
        >
          {done && <Ionicons name="checkmark" size={18} color="#FFF" />}
        </Pressable>
      </View>
    );
  };

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

      {/* Summary card */}
      {totalCount > 0 && (
        <View
          style={[styles.summaryCard, { backgroundColor: colors.primaryBg }]}
        >
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
          <View
            style={[styles.progressBg, { backgroundColor: colors.border }]}
          >
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
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              Tap the + button to create your first habit
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
});
