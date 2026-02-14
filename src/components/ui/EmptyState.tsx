import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from './Text';
import { Button } from './Button';

type Props = {
  emoji?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ emoji = '📭', title, subtitle, actionLabel, onAction }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text variant="h1" style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text variant="body" style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 40, paddingVertical: 40 },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: { marginBottom: 8, textAlign: 'center' },
  subtitle: { textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  button: { marginTop: 8 },
});
