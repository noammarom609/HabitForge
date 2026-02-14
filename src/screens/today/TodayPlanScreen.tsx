import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { useCommandCenter } from '../../hooks/useConvexHabits';
import { getTodayDate } from '../../hooks/useConvexHabits';

export function TodayPlanScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const today = getTodayDate();
  const { habits, stats } = useCommandCenter(today);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>תוכנית היום</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        {stats.totalToday} הרגלים מתוכננים להיום
      </Text>

      {habits.map((h) => (
        <Card key={h._id} style={styles.card}>
          <Text style={styles.icon}>{h.icon || '🎯'}</Text>
          <Text variant="h2" style={{ color: colors.text }}>{h.title}</Text>
          {h.reminderTime && (
            <Text variant="caption" style={{ color: colors.textTertiary, marginTop: 4 }}>
              תזכורת: {h.reminderTime}
            </Text>
          )}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  icon: { fontSize: 24 },
});
