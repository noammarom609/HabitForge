import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { EmptyState } from '../../components/ui/EmptyState';

export function PartnersScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>שותף אחריות</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        זוג או חבר — "תזכיר לי"
      </Text>

      <EmptyState
        emoji="🤝"
        title="אין שותף עדיין"
        subtitle="הוסף חבר שיזכיר לך — פרטיות מלאה, opt-in"
        actionLabel="הוסף שותף"
        onAction={() => {}}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
});
