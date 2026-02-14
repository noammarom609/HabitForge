import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAddMotivationReminder, useDeleteMotivationReminder, useMotivationReminders } from '../../hooks/useConvexHabits';

export function MotivationVaultScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);

  const { reminders, isLoading } = useMotivationReminders();
  const addReminder = useAddMotivationReminder();
  const deleteReminder = useDeleteMotivationReminder();

  const onAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      await addReminder({ text: trimmed });
      setText('');
    } finally {
      setAdding(false);
    }
  };

  const onDelete = async (id: string) => {
    await deleteReminder({ id: id as any });
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>אוצר המוטיבציה</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        "למה זה חשוב לי" — שמור תזכורות אישיות שיעזרו ברגעים קשים
      </Text>

      <View style={[styles.addRow, { borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="הוסף תזכורת (למה זה חשוב לי?)"
          placeholderTextColor={colors.textTertiary}
          value={text}
          onChangeText={setText}
        />
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={onAdd}
          disabled={!text.trim() || adding}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </Pressable>
      </View>

      {reminders.length === 0 ? (
        <EmptyState
          emoji="💪"
          title="אין עדיין תזכורות"
          subtitle="הוסף סיבה אחת למה ההרגל חשוב לך — זה עוזר כשקשה"
        />
      ) : (
        <FlatList
          data={reminders}
          scrollEnabled={false}
          keyExtractor={(r) => r._id}
          renderItem={({ item }) => (
            <Card style={[styles.reminderCard, { borderColor: colors.border }]}>
              <Text variant="body" style={{ color: colors.text, flex: 1 }}>{item.text}</Text>
              <Pressable onPress={() => onDelete(item._id)} hitSlop={12}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </Card>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addRow: { flexDirection: 'row', gap: 12, marginBottom: 24, borderBottomWidth: 1, paddingBottom: 16 },
  input: { flex: 1, padding: 12, borderWidth: 1, borderRadius: 12, fontSize: 16 },
  addBtn: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  reminderCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
});
