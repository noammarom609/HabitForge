import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const STEPS = [
  { id: 'worked', title: 'מה עבד השבוע?', placeholder: 'כתוב 1–3 דברים שהצליחו...' },
  { id: 'broke', title: 'מה נשבר?', placeholder: 'אילו הרגלים דילגת עליהם ולמה...' },
  { id: 'improve', title: 'מה משפרים בשבוע הבא?', placeholder: 'שינוי אחד קטן שתוכל לעשות...' },
];

export function WeeklyReviewWizardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const onNext = () => {
    if (isLast) return; // TODO: save and close
    setStep((s) => s + 1);
  };

  const onBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="caption" style={{ color: colors.textTertiary, marginBottom: 8 }}>
        שלב {step + 1} מתוך {STEPS.length}
      </Text>
      <Text variant="title" style={{ color: colors.text, marginBottom: 24 }}>{current.title}</Text>

      <Card style={styles.card}>
        <Text variant="body" style={{ color: colors.textSecondary }}>
          {current.placeholder}
        </Text>
      </Card>

      <View style={styles.actions}>
        {step > 0 && (
          <Button title="חזור" onPress={onBack} variant="secondary" style={styles.backBtn} />
        )}
        <Button
          title={isLast ? 'סיום' : 'המשך'}
          onPress={onNext}
          style={styles.nextBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { marginBottom: 32 },
  actions: { flexDirection: 'row', gap: 12 },
  backBtn: { flex: 1 },
  nextBtn: { flex: 1 },
});
