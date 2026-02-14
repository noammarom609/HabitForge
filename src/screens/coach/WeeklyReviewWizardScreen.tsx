import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useConvexAuth } from 'convex/react';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSaveWeeklyReview, useWeeklyReview } from '../../hooks/useConvexHabits';
import { Routes } from '../../constants/routes';

const STEPS = [
  { id: 'worked', title: 'מה עבד השבוע?', placeholder: 'כתוב 1–3 דברים שהצליחו...' },
  { id: 'broke', title: 'מה נשבר?', placeholder: 'אילו הרגלים דילגת עליהם ולמה...' },
  { id: 'improve', title: 'מה משפרים בשבוע הבא?', placeholder: 'שינוי אחד קטן שתוכל לעשות...' },
] as const;

export function WeeklyReviewWizardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const existing = useWeeklyReview();
  const saveReview = useSaveWeeklyReview();
  const initialized = useRef(false);

  useEffect(() => {
    if (existing && !initialized.current) {
      initialized.current = true;
      setAnswers({
        worked: existing.worked ?? '',
        broke: existing.broke ?? '',
        improve: existing.improve ?? '',
      });
    }
  }, [existing]);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const value = answers[current.id] ?? '';

  const onNext = async () => {
    if (isLast) {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        await saveReview({
          worked: answers.worked,
          broke: answers.broke,
          improve: answers.improve,
        });
        router.back();
      } finally {
        setLoading(false);
      }
      return;
    }
    setStep((s) => s + 1);
  };

  const canSave = isAuthenticated && !authLoading;

  const onBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text variant="caption" style={{ color: colors.textTertiary, marginBottom: 8 }}>
        שלב {step + 1} מתוך {STEPS.length}
      </Text>
      <Text variant="title" style={{ color: colors.text, marginBottom: 24 }}>{current.title}</Text>

      <Card style={styles.card}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder={current.placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={(t) => setAnswers((a) => ({ ...a, [current.id]: t }))}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </Card>

      {!canSave && isLast && (
        <Pressable
          onPress={() => navigation.navigate(Routes.Auth)}
          style={[styles.authPrompt, { borderColor: colors.primary }]}
        >
          <Text variant="body" style={{ color: colors.warning, marginBottom: 8, textAlign: 'center' }}>
            יש להתחבר כדי לשמור את הסקירה
          </Text>
          <Text variant="caption" style={{ color: colors.primary, textAlign: 'center' }}>
            לחץ להתחברות
          </Text>
        </Pressable>
      )}
      <View style={styles.actions}>
        {step > 0 && (
          <Button title="חזור" onPress={onBack} variant="secondary" style={styles.backBtn} />
        )}
        <Button
          title={isLast ? (loading ? 'שומר...' : 'סיום ושמירה') : 'המשך'}
          onPress={onNext}
          style={styles.nextBtn}
          disabled={loading || (isLast && !canSave)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { marginBottom: 32 },
  input: {
    minHeight: 120,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 16,
  },
  actions: { flexDirection: 'row', gap: 12 },
  backBtn: { flex: 1 },
  nextBtn: { flex: 1 },
  authPrompt: { padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 16 },
});
