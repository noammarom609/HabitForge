import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';

export function FocusModeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text variant="title" style={{ color: colors.text, textAlign: 'center' }}>מצב פוקוס</Text>
      <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12 }}>
        מסך נקי להרגל יחיד — מינימום הסחות
      </Text>
      <View style={[styles.placeholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.emoji}>🎯</Text>
        <Text variant="h2" style={{ color: colors.text }}>הרגל נבחר</Text>
      </View>
      <Button title="סימון בוצע" onPress={() => {}} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  placeholder: {
    alignItems: 'center',
    padding: 48,
    borderRadius: 24,
    borderWidth: 1,
    marginVertical: 32,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  btn: { marginTop: 16 },
});
