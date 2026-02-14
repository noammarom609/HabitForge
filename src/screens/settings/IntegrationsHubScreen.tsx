import React from 'react';
import { ScrollView, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';

const INTEGRATIONS = [
  { id: 'calendar', icon: 'calendar', title: 'לוח שנה', desc: 'חלונות זמן אוטומטיים' },
  { id: 'health', icon: 'heart', title: 'בריאות', desc: 'שינה, צעדים, דופק' },
  { id: 'widgets', icon: 'phone-portrait', title: 'וידג\'טים', desc: 'iOS / Android' },
  { id: 'voice', icon: 'mic', title: 'קול', desc: '"סמן שתיתי מים"' },
];

export function IntegrationsHubScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>אינטגרציות</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        הופך את HabitForge למערכת הפעלה להתנהגות
      </Text>

      {INTEGRATIONS.map((i) => (
        <Pressable key={i.id}>
          <Card style={styles.card}>
            <Ionicons name={i.icon as any} size={24} color={colors.primary} />
            <View style={styles.cardInfo}>
              <Text variant="h2" style={{ color: colors.text }}>{i.title}</Text>
              <Text variant="caption" style={{ color: colors.textTertiary }}>{i.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardInfo: { flex: 1, marginLeft: 16 },
});
