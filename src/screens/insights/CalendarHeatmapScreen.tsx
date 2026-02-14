import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { useHeatmapData } from '../../hooks/useConvexHabits';

const CELL_SIZE = 14;
const CELL_GAP = 3;
const WEEKS = 12;

export function CalendarHeatmapScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { completedDates, isLoading } = useHeatmapData();

  // Build grid: 7 rows (Sun–Sat) × 12 columns (weeks, oldest left)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (WEEKS * 7));
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const completedSet = new Set(completedDates);

  const grid: boolean[][] = [];
  for (let d = 0; d < 7; d++) {
    grid[d] = [];
    for (let w = 0; w < WEEKS; w++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + w * 7 + d);
      const dateStr = date.toISOString().split('T')[0];
      grid[d][w] = completedSet.has(dateStr);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
          <Text variant="h3" style={{ color: colors.primary, marginRight: 8 }}>חזור</Text>
        </Pressable>
      </View>

      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>חום לוח שנה</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 8 }}>
        כל ריבוע = יום. ירוק = ביצעת לפחות הרגל אחד באותו יום.
      </Text>
      <Text variant="caption" style={{ color: colors.textTertiary, marginBottom: 20 }}>
        שורות: ימי השבוע (א׳–ש׳). עמודות: 12 השבועות האחרונים.
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <View style={styles.grid}>
          {grid.map((row, ri) => (
              <View key={ri} style={styles.weekRow}>
                {row.map((filled, ci) => (
                  <View
                    key={ci}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: filled ? colors.success : colors.border + '50',
                        marginRight: ci < WEEKS - 1 ? CELL_GAP : 0,
                      },
                    ]}
                  />
                ))}
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  loader: { marginVertical: 40 },
  grid: {},
  weekRow: { flexDirection: 'row', marginBottom: CELL_GAP },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
});
