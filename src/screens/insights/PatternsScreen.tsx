import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { useInsights } from '../../hooks/useConvexHabits';

export function PatternsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: insights } = useInsights();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>דפוסים</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        מתי הסיכוי להצלחה גבוה — ומה לשפר
      </Text>

      <Card style={styles.card}>
        <Text variant="caption" style={{ color: colors.textTertiary }}>היום החזק שלך</Text>
        <Text variant="h1" style={{ color: colors.success, marginTop: 4 }}>
          {insights?.bestDay || '—'}
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text variant="caption" style={{ color: colors.textTertiary }}>היום החלש</Text>
        <Text variant="h1" style={{ color: colors.warning, marginTop: 4 }}>
          {insights?.worstDay || '—'}
        </Text>
      </Card>

      {insights?.improvementTip && (
        <Card style={[styles.card, { backgroundColor: colors.primaryBg, borderColor: colors.primary + '40' }]}>
          <Text variant="caption" style={{ color: colors.primary }}>טיפ לשיפור</Text>
          <Text variant="body" style={{ color: colors.text, marginTop: 8 }}>{insights.improvementTip}</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { marginBottom: 16 },
});
