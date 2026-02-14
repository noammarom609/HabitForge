import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCreateIdentity, useDeleteIdentity, useIdentities } from '../hooks/useConvexHabits';
import { useTheme } from '../theme/ThemeContext';

const IDENTITY_ICONS = ['💪', '📚', '🧘', '🏃', '🎨', '💰', '🧠', '❤️', '🌱', '⭐', '🔥', '🎯'];

export function IdentityScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { identities, isLoading } = useIdentities();
  const createIdentity = useCreateIdentity();
  const deleteIdentity = useDeleteIdentity();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState(IDENTITY_ICONS[0]);

  const onCreate = async () => {
    const trimmed = label.trim();
    if (!trimmed) return Alert.alert('חסר תיאור', 'תאר מי אתה רוצה להיות.');
    await createIdentity({ label: trimmed, icon });
    setLabel('');
    setIcon(IDENTITY_ICONS[0]);
    setShowForm(false);
  };

  const onDelete = (id: string, name: string) => {
    Alert.alert('הסר זהות', `להסיר "${name}"? הרגלים יתנתקו.`, [
      { text: 'ביטול', style: 'cancel' },
      { text: 'הסר', style: 'destructive', onPress: () => deleteIdentity({ identityId: id as any }) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={identities}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[styles.list, { paddingTop: 16 }]}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              מי אתה הופך להיות?
            </Text>
            <Text style={[styles.headerDesc, { color: colors.textSecondary }]}>
              הגדר 1–3 זהויות. כל הרגל הוא קול לזהות הזו.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.cardIcon}>{item.icon || '🎯'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: colors.text }]}>{item.label}</Text>
            </View>
            <Pressable onPress={() => onDelete(item._id, item.label)} hitSlop={12}>
              <Ionicons name="close-circle" size={22} color={colors.textTertiary} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          !showForm ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🪞</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                אין עדיין זהויות. התחל באחת.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <>
            {showForm ? (
              <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                  אני אדם ש...
                </Text>
                <TextInput
                  placeholder="למשל: מתאמן כל יום"
                  placeholderTextColor={colors.placeholder}
                  value={label}
                  onChangeText={setLabel}
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  autoFocus
                />

                <Text style={[styles.formLabel, { color: colors.textSecondary, marginTop: 14 }]}>אייקון</Text>
                <View style={styles.iconRow}>
                  {IDENTITY_ICONS.map((ic) => (
                    <Pressable
                      key={ic}
                      onPress={() => setIcon(ic)}
                      style={[
                        styles.iconPick,
                        {
                          backgroundColor: icon === ic ? colors.primaryBg : colors.background,
                          borderColor: icon === ic ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>{ic}</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.formActions}>
                  <Pressable style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setShowForm(false)}>
                    <Text style={[styles.cancelText, { color: colors.text }]}>ביטול</Text>
                  </Pressable>
                  <Pressable style={[styles.createBtn, { backgroundColor: colors.primary }]} onPress={onCreate}>
                    <Text style={styles.createText}>הוסף זהות</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={[styles.addBtn, { borderColor: colors.primary }]}
                onPress={() => setShowForm(true)}
              >
                <Ionicons name="add-circle" size={20} color={colors.primary} />
                <Text style={[styles.addBtnText, { color: colors.primary }]}>הוסף זהות</Text>
              </Pressable>
            )}

            {identities.length >= 3 && !showForm && (
              <Text style={[styles.limitNote, { color: colors.textTertiary }]}>
                3 זהויות זה מקסימום טוב. מיקוד יוצר בהירות.
              </Text>
            )}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },

  headerSection: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  headerDesc: { fontSize: 14, lineHeight: 20 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  cardIcon: { fontSize: 28 },
  cardLabel: { fontSize: 16, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, textAlign: 'center' },

  formCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginTop: 10 },
  formLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  input: { marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  iconPick: { width: 42, height: 42, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600' },
  createBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  createText: { fontSize: 15, fontWeight: '700', color: '#FFF' },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 10, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed',
  },
  addBtnText: { fontSize: 15, fontWeight: '700' },

  limitNote: { textAlign: 'center', fontSize: 13, marginTop: 12 },
});
