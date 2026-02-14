import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';

export function PaywallModal() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>HabitForge Pro</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        Coaching, Insights, Routines, Integrations — הכל בפרימיום
      </Text>

      <Button title="נסה חינם" onPress={() => {}} style={styles.btn} />
      <Button title="שחזר רכישה" onPress={() => {}} variant="secondary" style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  btn: { marginBottom: 12 },
});
