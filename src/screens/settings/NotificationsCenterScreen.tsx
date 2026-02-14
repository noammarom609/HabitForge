import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { useHabits, useUpdateHabit } from '../../hooks/useConvexHabits';

export function NotificationsCenterScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { habits, isLoading } = useHabits();
  const updateHabit = useUpdateHabit();

  const onToggle = async (habit: { _id: string; reminderTime?: string }, enabled: boolean) => {
    await updateHabit({
      habitId: habit._id as any,
      reminderEnabled: enabled,
      ...(enabled && { reminderTime: habit.reminderTime || '09:00' }),
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>מרכז ההתראות</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        תזכורות לכל הרגל — הפעל או כבה תזכורות
      </Text>

      {habits.length === 0 ? (
        <Card style={styles.card}>
          <Text variant="body" style={{ color: colors.textSecondary }}>
            אין הרגלים פעילים. הוסף הרגל כדי להגדיר תזכורות.
          </Text>
        </Card>
      ) : (
        habits.map((h) => {
          const enabled = h.reminderEnabled !== false && !!h.reminderTime;
          return (
            <Card key={h._id} style={[styles.habitRow, { borderColor: colors.border }]}>
              <View style={styles.habitInfo}>
                <Text variant="h3" style={{ color: colors.text }}>{h.title}</Text>
                <Text variant="caption" style={{ color: colors.textTertiary }}>
                  {enabled ? `תזכורת ב־${h.reminderTime || '09:00'}` : 'כבוי'}
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={(v) => onToggle(h, v)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 16 },
  habitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  habitInfo: { flex: 1 },
});
