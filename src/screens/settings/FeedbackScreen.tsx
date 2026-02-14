import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';

export function FeedbackScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const submitFeedback = useMutation(api.feedback.submitFeedback);

  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await submitFeedback({ text: trimmed });
      setSent(true);
      setText('');
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>השארת פידבק</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        נשמח לשמוע מה עבד, מה לא, ורעיונות לשיפור
      </Text>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        placeholder="כתוב כאן..."
        placeholderTextColor={colors.textTertiary}
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      {sent && (
        <Text variant="body" style={{ color: colors.primary, marginBottom: 16 }}>
          תודה! הפידבק נשמר.
        </Text>
      )}

      <Button
        title={loading ? 'שולח...' : 'שלח פידבק'}
        onPress={onSend}
        disabled={!text.trim() || loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  input: {
    minHeight: 140,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
  },
});
