import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';

export function DataBackupRestoreScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>גיבוי ושחזור</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        ייצוא נתונים (אופציונלי)
      </Text>
      <Button title="ייצא נתונים" onPress={() => {}} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});
