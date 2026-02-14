import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabitWithEntries } from '../../hooks/useConvexHabits';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Routes } from '../../app/routes';
import { Id } from '../../../convex/_generated/dataModel';

export function HabitDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const habitId = (route.params as any)?.habitId as Id<'habits'>;

  const { habit, entries, isLoading } = useHabitWithEntries(habitId, 30);

  if (isLoading || !habit) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const doneCount = entries.filter((e) => e.status === 'done').length;
  const consistency = entries.length > 0 ? Math.round((doneCount / entries.length) * 100) : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={styles.icon}>{habit.icon || '🎯'}</Text>
        <Text variant="title" style={{ color: colors.text }}>{habit.title}</Text>
        {habit.description && (
          <Text variant="body" style={{ color: colors.textSecondary, marginTop: 8 }}>
            {habit.description}
          </Text>
        )}
      </View>

      <Card style={styles.card}>
        <Text variant="caption" style={{ color: colors.textTertiary }}>עקביות 30 יום</Text>
        <Text variant="h1" style={{ color: colors.primary, marginTop: 4 }}>{consistency}%</Text>
      </Card>

      <Card style={styles.card}>
        <Text variant="caption" style={{ color: colors.textTertiary }}>בוצע ב־30 יום</Text>
        <Text variant="h1" style={{ color: colors.text, marginTop: 4 }}>{doneCount} פעמים</Text>
      </Card>

      {habit.cue && (
        <Card style={styles.card}>
          <Text variant="caption" style={{ color: colors.textTertiary }}>טריגר</Text>
          <Text variant="body" style={{ color: colors.text, marginTop: 4 }}>{habit.cue}</Text>
        </Card>
      )}

      {habit.minimumAction && (
        <Card style={styles.card}>
          <Text variant="caption" style={{ color: colors.textTertiary }}>פעולה מינימלית</Text>
          <Text variant="body" style={{ color: colors.text, marginTop: 4 }}>{habit.minimumAction}</Text>
        </Card>
      )}

      <Button
        title="ערוך הרגל"
        onPress={() => navigation.navigate(Routes.HabitForm, { habitId: habit._id })}
        variant="secondary"
        style={styles.editBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  icon: { fontSize: 48, marginBottom: 12 },
  card: { marginBottom: 16 },
  editBtn: { marginTop: 24 },
});
