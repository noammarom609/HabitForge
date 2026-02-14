import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAllHabits, useHabits } from '../../hooks/useConvexHabits';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { EmptyState } from '../../components/ui/EmptyState';
import { Routes } from '../../constants/routes';

type TabType = 'active' | 'archive';

export function HabitsHomeScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabType>('active');

  const { habits: activeHabits, isLoading: loadingActive } = useHabits();
  const { habits: allHabits, isLoading: loadingAll } = useAllHabits();

  const habits = tab === 'active'
    ? (activeHabits ?? [])
    : (allHabits ?? []).filter((h) => !h.isActive);

  const displayHabits = habits.map((h) => ({
    id: h._id,
    title: h.title,
    color: h.color,
    icon: h.icon,
    scheduleType: h.scheduleType,
    daysOfWeek: h.daysOfWeek ?? [],
  }));

  const isLoading = tab === 'active' ? loadingActive : loadingAll;

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

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        <Pressable
          style={[styles.tab, tab === 'active' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setTab('active')}
        >
          <Text variant="h3" style={{ color: tab === 'active' ? colors.primary : colors.textSecondary }}>פעילים</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'archive' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setTab('archive')}
        >
          <Text variant="h3" style={{ color: tab === 'archive' ? colors.primary : colors.textSecondary }}>ארכיון</Text>
        </Pressable>
      </View>

      {habits.length === 0 ? (
        <EmptyState
          emoji={tab === 'archive' ? '📦' : '📋'}
          title={tab === 'archive' ? 'אין הרגלים בארכיון' : 'אין עדיין הרגלים'}
          subtitle={tab === 'archive' ? 'הרגלים שארכוב יופיעו כאן' : 'הוסף הרגל ראשון כדי להתחיל לבנות את הזהות שלך'}
          actionLabel={tab === 'archive' ? undefined : 'הוסף הרגל'}
          onAction={tab === 'archive' ? undefined : onAddHabit}
        />
      ) : (
        <FlatList
          data={displayHabits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => onHabitPress(item.id)}
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
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
