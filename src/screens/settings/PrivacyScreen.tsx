import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';

export function PrivacyScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text variant="title" style={{ color: colors.text }}>פרטיות</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginTop: 12 }}>
        שליטה מלאה בנתונים — opt-in לכל שיתוף
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});
