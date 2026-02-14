import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function RepairModeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>חזרה למסלול</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        בלי ענישה — רק התאמות. נשבר רצף? בוא נחזור.
      </Text>

      <Card style={[styles.card, { backgroundColor: colors.successBg, borderColor: colors.success + '40' }]}>
        <Text variant="body" style={{ color: colors.text }}>
          הצעד הראשון: סימון ההרגל היום. גם אם נשבר אתמול — היום מתחילים מחדש.
        </Text>
      </Card>

      <Button title="סמן בוצע עכשיו" onPress={() => {}} style={styles.btn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { marginBottom: 24 },
  btn: {},
});
