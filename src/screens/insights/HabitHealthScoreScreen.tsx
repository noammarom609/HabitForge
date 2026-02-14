import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';

export function HabitHealthScoreScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>ציון בריאות הרגל</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        מדד איכות: פשטות, עקביות, התאמה ללו"ז
      </Text>

      <Card style={styles.card}>
        <Text variant="body" style={{ color: colors.textSecondary }}>
          כאן יוצג ציון לכל הרגל — פשטות המינימום, עקביות 30 יום, והתאמה לשעות שלך.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { marginBottom: 16 },
});
