import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export function SettingsScreen() {
  const { isDark, colors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Screen title */}
      <Text style={[styles.screenTitle, { color: colors.text }]}>Settings</Text>

      {/* ──── Appearance ──── */}
      <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
        APPEARANCE
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View
              style={[styles.iconCircle, { backgroundColor: colors.primaryBg }]}
            >
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={18}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      {/* ──── About ──── */}
      <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
        ABOUT
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.row, styles.rowBorder, { borderColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <View
              style={[styles.iconCircle, { backgroundColor: colors.primaryBg }]}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              Version
            </Text>
          </View>
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
            1.0.0
          </Text>
        </View>

        <Pressable style={styles.row}>
          <View style={styles.rowLeft}>
            <View
              style={[styles.iconCircle, { backgroundColor: colors.dangerBg }]}
            >
              <Ionicons name="heart" size={18} color={colors.danger} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              Rate HabitForge
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textTertiary}
          />
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          HabitForge — Build better habits
        </Text>
        <Text style={[styles.footerSub, { color: colors.textTertiary }]}>
          Made with ❤️
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    paddingTop: 8,
    paddingBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowValue: { fontSize: 16 },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 30,
    gap: 4,
  },
  footerText: { fontSize: 14, fontWeight: '500' },
  footerSub: { fontSize: 13 },
});
