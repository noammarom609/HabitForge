import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';

const CELL_SIZE = 12;
const CELL_GAP = 2;

export function CalendarHeatmapScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Placeholder — 12 שבועות x 7 ימים
  const weeks = 12;
  const days = 7;
  const grid = Array.from({ length: weeks }, () =>
    Array.from({ length: days }, () => Math.random() > 0.3)
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>חום לוח שנה</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        רציפות ויזואלית — ירוק = בוצע
      </Text>

      <View style={styles.grid}>
        {grid.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((filled, di) => (
              <View
                key={di}
                style={[
                  styles.cell,
                  {
                    backgroundColor: filled ? colors.success : colors.border + '40',
                    marginRight: di < days - 1 ? CELL_GAP : 0,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  grid: { flexDirection: 'row', gap: CELL_GAP },
  weekRow: { flexDirection: 'row' },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
});
