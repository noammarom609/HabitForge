import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';

export function RoutineRunScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Placeholder — ב-V2 יחובר לרוטינות אמיתיות
  const routineItems = [
    { id: '1', title: 'הרגל 1', icon: '💪' },
    { id: '2', title: 'הרגל 2', icon: '📚' },
    { id: '3', title: 'הרגל 3', icon: '🧘' },
  ];

  const current = routineItems[currentIndex];

  const onComplete = () => {
    if (currentIndex < routineItems.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text variant="caption" style={{ color: colors.textTertiary, textAlign: 'center', marginBottom: 8 }}>
        הרגל {currentIndex + 1} מתוך {routineItems.length}
      </Text>
      <View style={[styles.focusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.icon}>{current?.icon || '🎯'}</Text>
        <Text variant="title" style={{ color: colors.text, marginTop: 16 }}>{current?.title}</Text>
      </View>
      <Button title="בוצע ✓" onPress={onComplete} style={styles.completeBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  focusCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
  },
  icon: { fontSize: 64 },
  completeBtn: { marginTop: 16 },
});
