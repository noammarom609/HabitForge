import React from 'react';
import { ScrollView, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Routes } from '../../constants/routes';

const TEMPLATES = [
  { id: 'exercise', icon: '💪', title: 'אימון בוקר', desc: 'התחל את היום בתנועה' },
  { id: 'read', icon: '📚', title: 'קריאה יומית', desc: '20 דקות קריאה' },
  { id: 'meditate', icon: '🧘', title: 'מדיטציה', desc: '5 דקות נשימות' },
  { id: 'water', icon: '💧', title: 'שתיית מים', desc: '8 כוסות ביום' },
  { id: 'sleep', icon: '😴', title: 'שינה מוקדמת', desc: 'במיטה עד 23:00' },
];

export function TemplatesScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const onSelect = (templateId: string) => {
    navigation.navigate(Routes.HabitForm);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>תבניות הרגלים</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        בחר תבנית להתחלה מהירה
      </Text>

      {TEMPLATES.map((t) => (
        <Pressable key={t.id} onPress={() => onSelect(t.id)}>
          <Card style={styles.card}>
            <Text style={styles.icon}>{t.icon}</Text>
            <View style={styles.cardInfo}>
              <Text variant="h2" style={{ color: colors.text }}>{t.title}</Text>
              <Text variant="caption" style={{ color: colors.textTertiary }}>{t.desc}</Text>
            </View>
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
  icon: { fontSize: 32, marginRight: 16 },
  cardInfo: { flex: 1 },
});
