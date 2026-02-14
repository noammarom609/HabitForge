import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useHabitWithEntries } from '../../hooks/useConvexHabits';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Id } from '../../../convex/_generated/dataModel';

export function HabitLogScreen() {
  const route = useRoute<any>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const habitId = (route.params as any)?.habitId as Id<'habits'>;

  const { habit, entries, isLoading } = useHabitWithEntries(habitId, 60);

  if (isLoading || !habit) return null;

  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>יומן: {habit.title}</Text>
      <FlatList
        data={sortedEntries}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text variant="body" style={{ color: colors.text }}>{item.date}</Text>
            <Text variant="caption" style={{ color: item.status === 'done' ? colors.success : colors.warning }}>
              {item.status === 'done' ? '✓ בוצע' : 'דולג'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  list: { paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
});
