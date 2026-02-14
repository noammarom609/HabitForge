import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

export function MotivationVaultScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>אוצר המוטיבציה</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        "למה זה חשוב לי" — שמור תזכורות אישיות שיעזרו ברגעים קשים
      </Text>

      <EmptyState
        emoji="💪"
        title="אין עדיין תזכורות"
        subtitle="הוסף סיבה אחת למה ההרגל חשוב לך — זה עוזר כשקשה"
        actionLabel="הוסף תזכורת"
        onAction={() => {}}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
});
