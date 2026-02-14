import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';

export function ThemeScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text variant="title" style={{ color: colors.text, marginBottom: 24 }}>ערכת נושא</Text>
      <Card style={styles.card}>
        <Text variant="h2" style={{ color: colors.text }}>מצב כהה</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFF"
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
