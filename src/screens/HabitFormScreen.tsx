import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Id } from '../../convex/_generated/dataModel';
import {
  useArchiveHabit,
  useCreateHabit,
  useDeleteHabit,
  useHabitWithEntries,
  useIdentities,
  useUpdateHabit,
} from '../hooks/useConvexHabits';
import type { RootStackParamList } from '../navigation/types';
import {
  cancelHabitNotifications,
  scheduleHabitNotifications,
} from '../services/notifications';
import { HABIT_COLORS, HABIT_ICONS } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'HabitForm'>;
type R = RouteProp<RootStackParamList, 'HabitForm'>;

const ALL_DAYS = [
  { id: 0, label: 'S' },
  { id: 1, label: 'M' },
  { id: 2, label: 'T' },
  { id: 3, label: 'W' },
  { id: 4, label: 'T' },
  { id: 5, label: 'F' },
  { id: 6, label: 'S' },
];

const STEPS = ['What', 'When', 'How'] as const;
type Step = (typeof STEPS)[number];

export function HabitFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { colors } = useTheme();

  const habitId = route.params?.habitId as Id<'habits'> | undefined;
  const isEditing = useMemo(() => !!habitId, [habitId]);

  // Convex
  const createHabitMutation = useCreateHabit();
  const updateHabitMutation = useUpdateHabit();
  const archiveHabitMutation = useArchiveHabit();
  const deleteHabitMutation = useDeleteHabit();
  const { habit: convexHabit, isLoading: convexLoading } = useHabitWithEntries(
    isEditing ? habitId! : null
  );
  const { identities } = useIdentities();

  // ─── Wizard state ───
  const [step, setStep] = useState<Step>(isEditing ? 'What' : 'What');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState('');
  const [cue, setCue] = useState('');
  const [minimumAction, setMinimumAction] = useState('');
  const [reward, setReward] = useState('');
  const [frictionNotes, setFrictionNotes] = useState('');
  const [selectedIdentityId, setSelectedIdentityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── Header ───
  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Habit' : 'New Habit',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerShadowVisible: false,
    });
  }, [isEditing, navigation, colors]);

  useEffect(() => {
    if (convexHabit) {
      setName(convexHabit.title);
      setDays(convexHabit.scheduleType === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : (convexHabit.daysOfWeek || []));
      setColor(convexHabit.color || HABIT_COLORS[0]);
      setIcon(convexHabit.icon || HABIT_ICONS[0]);
      setCue(convexHabit.cue || '');
      setMinimumAction(convexHabit.minimumAction || '');
      setReward(convexHabit.reward || '');
      setFrictionNotes(convexHabit.frictionNotes || '');
      setReminderTime(convexHabit.reminderTime || '');
      setSelectedIdentityId(convexHabit.identityId || null);
    }
  }, [convexHabit]);

  const toggleDay = (d: number) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };

  // ─── Navigation between steps ───
  const stepIndex = STEPS.indexOf(step);
  const canGoNext = () => {
    if (step === 'What') return name.trim().length > 0;
    if (step === 'When') return days.length > 0;
    return true;
  };
  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
  };
  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
    else navigation.goBack();
  };

  // ─── Save ───
  const onSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return Alert.alert('Missing name', 'Please enter a habit name.');
    if (!days.length) return Alert.alert('No days selected', 'Pick at least one day.');

    setLoading(true);
    try {
      const isDaily = days.length === 7;
      const payload = {
        title: trimmed,
        scheduleType: (isDaily ? 'daily' : 'weekly') as 'daily' | 'weekly',
        daysOfWeek: isDaily ? undefined : days,
        color,
        icon,
        cue: cue || undefined,
        minimumAction: minimumAction || undefined,
        reward: reward || undefined,
        frictionNotes: frictionNotes || undefined,
        identityId: selectedIdentityId ? (selectedIdentityId as Id<'identities'>) : undefined,
        reminderTime: reminderTime || undefined,
      };
      let savedHabitId: string;
      if (isEditing && habitId) {
        await updateHabitMutation({ habitId, ...payload });
        savedHabitId = habitId;
      } else {
        savedHabitId = await createHabitMutation(payload);
      }
      if (reminderTime) {
        await scheduleHabitNotifications({
          id: savedHabitId,
          name: trimmed,
          reminderTime,
          daysOfWeek: days,
          createdAt: Date.now(),
          isArchived: false,
        });
      } else {
        await cancelHabitNotifications(savedHabitId);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save habit.');
    } finally {
      setLoading(false);
    }
  };

  const doArchive = async () => {
    if (!habitId) return;
    try {
      await archiveHabitMutation({ habitId });
      await cancelHabitNotifications(habitId);
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('שגיאה', 'לא ניתן לארכב.');
    }
  };

  const doDelete = async () => {
    if (!habitId) return;
    try {
      await deleteHabitMutation({ habitId });
      await cancelHabitNotifications(habitId);
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('שגיאה', 'לא ניתן למחוק.');
    }
  };

  const onArchive = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('ארכוב הרגל. ההרגל יוסתר מהמסך הראשי. להמשיך?')) {
        doArchive();
      }
    } else {
      Alert.alert('ארכוב הרגל', 'ההרגל יוסתר מהמסך הראשי. הנתונים נשמרים.', [
        { text: 'ביטול', style: 'cancel' },
        { text: 'ארכב', style: 'destructive', onPress: doArchive },
      ]);
    }
  };

  const onDelete = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('מחיקת הרגל. פעולה קבועה. להמשיך?')) {
        doDelete();
      }
    } else {
      Alert.alert('מחיקת הרגל', 'פעולה קבועה. לא ניתן לבטל.', [
        { text: 'ביטול', style: 'cancel' },
        { text: 'מחק', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  if (isEditing && convexLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ─── Step indicators ───
  const renderStepIndicator = () => (
    <View style={styles.stepsRow}>
      {STEPS.map((s, i) => (
        <Pressable key={s} onPress={() => { if (i <= stepIndex || isEditing) setStep(s); }} style={styles.stepItem}>
          <View style={[
            styles.stepDot,
            { backgroundColor: i <= stepIndex ? colors.primary : colors.border },
          ]}>
            {i < stepIndex && <Ionicons name="checkmark" size={12} color="#FFF" />}
            {i === stepIndex && <Text style={styles.stepNum}>{i + 1}</Text>}
          </View>
          <Text style={[styles.stepLabel, { color: i <= stepIndex ? colors.text : colors.textTertiary }]}>
            {s}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Step indicator — only for new habits */}
      {!isEditing && renderStepIndicator()}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* ══════ STEP 1: WHAT ══════ */}
        {(step === 'What' || isEditing) && (
          <>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              {isEditing ? 'Edit Habit' : 'What habit do you want to build?'}
            </Text>

            <TextInput
              placeholder="e.g., Morning exercise"
              placeholderTextColor={colors.placeholder}
              value={name}
              onChangeText={setName}
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              autoFocus={!isEditing && step === 'What'}
            />

            {/* Icon picker */}
            <Text style={[styles.label, styles.sectionGap, { color: colors.textSecondary }]}>ICON</Text>
            <View style={styles.iconsGrid}>
              {HABIT_ICONS.map((ic) => (
                <Pressable
                  key={ic}
                  onPress={() => setIcon(ic)}
                  style={[
                    styles.iconCell,
                    {
                      backgroundColor: icon === ic ? colors.primaryBg : colors.surface,
                      borderColor: icon === ic ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.iconEmoji}>{ic}</Text>
                </Pressable>
              ))}
            </View>

            {/* Color */}
            <Text style={[styles.label, styles.sectionGap, { color: colors.textSecondary }]}>COLOR</Text>
            <View style={styles.colorsRow}>
              {HABIT_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.colorSelected]}
                >
                  {color === c && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* ══════ STEP 2: WHEN ══════ */}
        {(step === 'When' || isEditing) && (
          <>
            {!isEditing && (
              <Text style={[styles.stepTitle, { color: colors.text }]}>When will you do it?</Text>
            )}

            <Text style={[styles.label, isEditing && styles.sectionGap, { color: colors.textSecondary }]}>DAYS</Text>
            <View style={styles.daysRow}>
              {ALL_DAYS.map((d) => {
                const active = days.includes(d.id);
                return (
                  <Pressable
                    key={d.id}
                    onPress={() => toggleDay(d.id)}
                    style={[
                      styles.dayPill,
                      { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                    ]}
                  >
                    <Text style={[styles.dayText, { color: active ? '#FFF' : colors.text }]}>{d.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Cue / Trigger */}
            <>
              <Text style={[styles.label, styles.sectionGap, { color: colors.textSecondary }]}>
                TRIGGER (AFTER I...)
              </Text>
              <TextInput
                placeholder="e.g., After I brush my teeth"
                placeholderTextColor={colors.placeholder}
                value={cue}
                onChangeText={setCue}
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              />
            </>
          </>
        )}

        {/* ══════ STEP 3: HOW ══════ */}
        {(step === 'How' || isEditing) && (
          <>
            {!isEditing && (
              <Text style={[styles.stepTitle, { color: colors.text }]}>How will you succeed?</Text>
            )}

            <Text style={[styles.label, isEditing && styles.sectionGap, { color: colors.textSecondary }]}>
              30-SECOND VERSION (minimum action)
            </Text>
            <TextInput
              placeholder="e.g., 2 push-ups"
              placeholderTextColor={colors.placeholder}
              value={minimumAction}
              onChangeText={setMinimumAction}
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.label, styles.sectionGap, { color: colors.textSecondary }]}>
              REWARD (what makes it satisfying?)
            </Text>
            <TextInput
              placeholder="e.g., Checkmark + energy rush"
              placeholderTextColor={colors.placeholder}
              value={reward}
              onChangeText={setReward}
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.label, styles.sectionGap, { color: colors.textSecondary }]}>
              FRICTION CONTROL (make it easier)
            </Text>
            <TextInput
              placeholder="e.g., Lay out workout clothes tonight"
              placeholderTextColor={colors.placeholder}
              value={frictionNotes}
              onChangeText={setFrictionNotes}
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            />

            {/* Identity link */}
            {identities.length > 0 && (
              <>
                <Text style={[styles.label, styles.sectionGap, { color: colors.textSecondary }]}>
                  LINKED IDENTITY
                </Text>
                <View style={styles.identityList}>
                  {identities.map((id) => (
                    <Pressable
                      key={id._id}
                      onPress={() => setSelectedIdentityId(selectedIdentityId === id._id ? null : id._id)}
                      style={[
                        styles.identityChip,
                        {
                          backgroundColor: selectedIdentityId === id._id ? colors.primaryBg : colors.surface,
                          borderColor: selectedIdentityId === id._id ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={styles.identityChipIcon}>{id.icon || '🎯'}</Text>
                      <Text
                        style={[
                          styles.identityChipText,
                          { color: selectedIdentityId === id._id ? colors.primary : colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {id.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* ══════ NAVIGATION ══════ */}
        {isEditing ? (
          <>
            <Pressable
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={onSave}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </Pressable>
            <View style={styles.dangerZone}>
              <Pressable style={[styles.dangerBtn, { borderColor: colors.warning }]} onPress={onArchive}>
                <Ionicons name="archive-outline" size={18} color={colors.warning} />
                <Text style={[styles.dangerBtnText, { color: colors.warning }]}>ארכב</Text>
              </Pressable>
              <Pressable style={[styles.dangerBtn, { borderColor: colors.danger }]} onPress={onDelete}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                <Text style={[styles.dangerBtnText, { color: colors.danger }]}>מחק</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.wizardNav}>
            {stepIndex > 0 && (
              <Pressable style={[styles.wizardBackBtn, { borderColor: colors.border }]} onPress={goBack}>
                <Ionicons name="arrow-back" size={18} color={colors.text} />
                <Text style={[styles.wizardBackText, { color: colors.text }]}>Back</Text>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.wizardNextBtn,
                { backgroundColor: canGoNext() ? colors.primary : colors.border, flex: stepIndex > 0 ? 1 : undefined },
              ]}
              onPress={stepIndex === STEPS.length - 1 ? onSave : goNext}
              disabled={!canGoNext() || loading}
            >
              <Text style={styles.wizardNextText}>
                {loading ? 'Saving...' : stepIndex === STEPS.length - 1 ? 'Create Habit' : 'Continue'}
              </Text>
              {stepIndex < STEPS.length - 1 && <Ionicons name="arrow-forward" size={18} color="#FFF" />}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  // Steps indicator
  stepsRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 12, paddingHorizontal: 20 },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 12, fontWeight: '600' },

  stepTitle: { fontSize: 22, fontWeight: '800', marginBottom: 16 },

  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  sectionGap: { marginTop: 22 },
  input: { marginTop: 8, borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },

  // Days
  daysRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dayPill: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  dayText: { fontSize: 14, fontWeight: '700' },

  // Colors
  colorsRow: { flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  colorCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  colorSelected: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)' },

  // Icons
  iconsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  iconCell: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 22 },

  // Identity
  identityList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  identityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1,
  },
  identityChipIcon: { fontSize: 16 },
  identityChipText: { fontSize: 14, fontWeight: '500' },

  // Save
  saveBtn: { marginTop: 28, borderRadius: 14, paddingVertical: 16, alignItems: 'center', elevation: 2 },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },

  // Wizard nav
  wizardNav: { flexDirection: 'row', gap: 12, marginTop: 28 },
  wizardBackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1,
  },
  wizardBackText: { fontSize: 16, fontWeight: '600' },
  wizardNextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 14, elevation: 2,
  },
  wizardNextText: { fontSize: 17, fontWeight: '700', color: '#FFF' },

  // Danger
  dangerZone: { flexDirection: 'row', gap: 12, marginTop: 20 },
  dangerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 12, borderWidth: 1.5,
  },
  dangerBtnText: { fontSize: 15, fontWeight: '600' },
});
