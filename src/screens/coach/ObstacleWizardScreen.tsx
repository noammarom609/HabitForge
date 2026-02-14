import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';

const OBSTACLES = [
  { id: 'time', label: 'לא היה לי זמן' },
  { id: 'forgot', label: 'שכחתי' },
  { id: 'hard', label: 'זה היה קשה מדי' },
  { id: 'tired', label: 'הייתי עייף' },
  { id: 'other', label: 'סיבה אחרת' },
];

const SOLUTIONS: Record<string, string> = {
  time: 'נסה להקטין את המינימום — גם דקה אחת נחשבת. או שנה את השעה לשעה פחות עמוסה.',
  forgot: 'הוסף תזכורת חכמה. או חבר את ההרגל לטריגר קבוע (למשל: אחרי צחצוח שיניים).',
  hard: 'הפחת את המינימום ל־30 שניות. "2 דחיפות" עדיף מ־"אימון מלא" שלא קורה.',
  tired: 'שנה את השעה לבוקר — כשהאנרגיה גבוהה יותר. או צמצם את המינימום ליום קשה.',
  other: 'חשב מה החסימה האמיתית. לפעמים שינוי קטן (מקום, זמן, גודל) פותר הכל.',
};

export function ObstacleWizardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  const solution = selected ? SOLUTIONS[selected] : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>למה לא הצלחתי?</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        בחר את הסיבה הכי קרובה — נציע התאמה
      </Text>

      <View style={styles.chips}>
        {OBSTACLES.map((o) => (
          <Chip
            key={o.id}
            label={o.label}
            selected={selected === o.id}
            onPress={() => setSelected(o.id)}
          />
        ))}
      </View>

      {solution && (
        <Card style={[styles.solutionCard, { backgroundColor: colors.primaryBg, borderColor: colors.primary + '40' }]}>
          <Text variant="caption" style={{ color: colors.primary }}>ההתאמה המומלצת</Text>
          <Text variant="body" style={{ color: colors.text, marginTop: 8 }}>{solution}</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  solutionCard: { marginTop: 8 },
});
