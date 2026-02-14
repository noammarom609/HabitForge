import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAllHabits } from '../../hooks/useConvexHabits';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { EmptyState } from '../../components/ui/EmptyState';
import { Routes } from '../../app/routes';

export function HabitsHomeScreen() {
  const navigation = useNavigation<any>();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { isSignedIn, isLoaded } = useAuth();

  const { habits: convexHabits, isLoading } = useAllHabits();
  const habits = convexHabits ?? [];

  const onAddHabit = () => navigation.navigate(Routes.HabitForm);
  const onHabitPress = (habitId: string) =>
    navigation.navigate(Routes.HabitDetails, { habitId });

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text variant="title" style={{ color: colors.text }}>הרגלים שלי</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={onAddHabit}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </Pressable>
      </View>

      {habits.length === 0 ? (
        <EmptyState
          emoji="📋"
          title="אין עדיין הרגלים"
          subtitle="הוסף הרגל ראשון כדי להתחיל לבנות את הזהות שלך"
          actionLabel="הוסף הרגל"
          onAction={onAddHabit}
        />
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => onHabitPress(item._id)}
            >
              <View style={[styles.cardAccent, { backgroundColor: item.color || colors.primary }]} />
              <Text style={styles.cardIcon}>{item.icon || '🎯'}</Text>
              <View style={styles.cardInfo}>
                <Text variant="h2" style={{ color: colors.text }}>{item.title}</Text>
                <Text variant="caption" style={{ color: colors.textTertiary, marginTop: 2 }}>
                  {item.scheduleType === 'daily' ? 'כל יום' : `ימים: ${(item.daysOfWeek || []).join(', ')}`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  cardIcon: { fontSize: 24, marginHorizontal: 12 },
  cardInfo: { flex: 1 },
});
