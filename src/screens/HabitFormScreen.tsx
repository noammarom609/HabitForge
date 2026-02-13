import { useAuth } from '@clerk/clerk-expo';
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
import uuid from 'react-native-uuid';

// Convex hooks
import { Id } from '../../convex/_generated/dataModel';
import {
    useArchiveHabit,
    useCreateHabit,
    useDeleteHabit,
    useHabitWithEntries,
    useUpdateHabit,
} from '../hooks/useConvexHabits';

// Legacy storage
import {
    archiveHabit as archiveHabitLegacy,
    deleteHabit as deleteHabitLegacy,
    loadHabits,
    saveHabits,
} from '../data/storage';
import { Habit as LegacyHabit } from '../domain/types';
import { RootStackParamList } from '../navigation/RootNavigator';
import {
    cancelHabitNotifications,
    scheduleHabitNotifications,
} from '../services/notifications';
import { HABIT_COLORS, HABIT_ICONS } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'HabitForm'>;
type R = RouteProp<RootStackParamList, 'HabitForm'>;

const ALL_DAYS = [
  { id: 0, label: 'Sun' },
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
];

export function HabitFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { colors } = useTheme();

  // Auth state
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const useConvex = authLoaded && isSignedIn;

  const habitId = route.params?.habitId;
  const isEditing = useMemo(() => !!habitId, [habitId]);

  // Check if habitId is a Convex ID (starts with specific pattern)
  const isConvexId = useMemo(() => {
    return habitId && !habitId.includes('-'); // UUID has dashes, Convex IDs don't
  }, [habitId]);

  // Convex mutations
  const createHabitMutation = useCreateHabit();
  const updateHabitMutation = useUpdateHabit();
  const archiveHabitMutation = useArchiveHabit();
  const deleteHabitMutation = useDeleteHabit();

  // Convex query for existing habit
  const { habit: convexHabit, isLoading: convexLoading } = useHabitWithEntries(
    isConvexId && isEditing ? (habitId as Id<"habits">) : null
  );

  // Form state
  const [name, setName] = useState('');
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState('');
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [loading, setLoading] = useState(false);
  const [legacyHabitLoaded, setLegacyHabitLoaded] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Habit' : 'New Habit',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerShadowVisible: false,
    });
  }, [isEditing, navigation, colors]);

  // Load Convex habit data
  useEffect(() => {
    if (convexHabit && isConvexId) {
      setName(convexHabit.title);
      setDays(convexHabit.scheduleType === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : (convexHabit.daysOfWeek || []));
      setColor(convexHabit.color || HABIT_COLORS[0]);
      setIcon(convexHabit.icon || HABIT_ICONS[0]);
    }
  }, [convexHabit, isConvexId]);

  // Load legacy habit data
  useEffect(() => {
    if (!habitId || isConvexId || legacyHabitLoaded) return;
    (async () => {
      const all = await loadHabits();
      const found = all.find((h) => h.id === habitId);
      if (!found) return;
      setName(found.name);
      setDays(found.daysOfWeek);
      setReminderTime(found.reminderTime || '');
      setColor(found.color || HABIT_COLORS[0]);
      setIcon(found.icon || HABIT_ICONS[0]);
      setLegacyHabitLoaded(true);
    })();
  }, [habitId, isConvexId, legacyHabitLoaded]);

  const toggleDay = (d: number) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const validateTime = (text: string): boolean => {
    if (!text) return true;
    const match = text.match(/^(\d{2}):(\d{2})$/);
    if (!match) return false;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  };

  const onSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return Alert.alert('Missing name', 'Please enter a habit name.');
    }
    if (!days.length) {
      return Alert.alert('No days selected', 'Pick at least one day.');
    }
    if (reminderTime && !validateTime(reminderTime)) {
      return Alert.alert('Invalid time', 'Use HH:MM format (e.g., 08:30).');
    }

    setLoading(true);
    try {
      if (useConvex) {
        // Convex save
        const isDaily = days.length === 7;
        if (isEditing && isConvexId) {
          await updateHabitMutation({
            habitId: habitId as Id<"habits">,
            title: trimmed,
            scheduleType: isDaily ? 'daily' : 'weekly',
            daysOfWeek: isDaily ? undefined : days,
            color,
            icon,
          });
        } else {
          await createHabitMutation({
            title: trimmed,
            scheduleType: isDaily ? 'daily' : 'weekly',
            daysOfWeek: isDaily ? undefined : days,
            color,
            icon,
          });
        }
      } else {
        // Legacy save
        const all = await loadHabits();
        let habit: LegacyHabit;

        if (habitId && !isConvexId) {
          const existing = all.find((h) => h.id === habitId);
          if (!existing) return;
          habit = {
            ...existing,
            name: trimmed,
            daysOfWeek: days,
            reminderTime: reminderTime || null,
            color,
            icon,
          };
          await saveHabits(all.map((h) => (h.id === habitId ? habit : h)));
        } else {
          habit = {
            id: String(uuid.v4()),
            name: trimmed,
            daysOfWeek: days,
            reminderTime: reminderTime || null,
            color,
            icon,
            createdAt: Date.now(),
            isArchived: false,
          };
          await saveHabits([habit, ...all]);
        }

        // Schedule or cancel notifications
        if (habit.reminderTime) {
          await scheduleHabitNotifications(habit);
        } else {
          await cancelHabitNotifications(habit.id);
        }
      }

      navigation.goBack();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onArchive = () => {
    Alert.alert(
      'Archive Habit',
      'This will hide the habit from your home screen. Historical data is preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            if (!habitId) return;
            try {
              if (useConvex && isConvexId) {
                await archiveHabitMutation({ habitId: habitId as Id<"habits"> });
              } else {
                await archiveHabitLegacy(habitId);
                await cancelHabitNotifications(habitId);
              }
              navigation.goBack();
            } catch (error) {
              console.error('Archive error:', error);
              Alert.alert('Error', 'Failed to archive habit.');
            }
          },
        },
      ]
    );
  };

  const onDelete = () => {
    Alert.alert(
      'Delete Habit',
      'This will permanently delete the habit and all its data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!habitId) return;
            try {
              if (useConvex && isConvexId) {
                await deleteHabitMutation({ habitId: habitId as Id<"habits"> });
              } else {
                await deleteHabitLegacy(habitId);
                await cancelHabitNotifications(habitId);
              }
              navigation.goBack();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete habit.');
            }
          },
        },
      ]
    );
  };

  // Loading state for Convex habit
  if (isConvexId && isEditing && convexLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          HABIT NAME *
        </Text>
        <TextInput
          placeholder="e.g., Morning run"
          placeholderTextColor={colors.placeholder}
          value={name}
          onChangeText={setName}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          autoFocus={!isEditing}
        />

        {/* Days */}
        <Text
          style={[styles.label, styles.sectionGap, { color: colors.textSecondary }]}
        >
          DAYS OF WEEK *
        </Text>
        <View style={styles.daysRow}>
          {ALL_DAYS.map((d) => {
            const active = days.includes(d.id);
            return (
              <Pressable
                key={d.id}
                onPress={() => toggleDay(d.id)}
                style={[
                  styles.dayPill,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: active ? '#FFF' : colors.text },
                  ]}
                >
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Reminder time (only for legacy habits) */}
        {!useConvex && (
          <>
            <Text
              style={[styles.label, styles.sectionGap, { color: colors.textSecondary }]}
            >
              REMINDER TIME (OPTIONAL)
            </Text>
            <TextInput
              placeholder="HH:MM (e.g., 08:30)"
              placeholderTextColor={colors.placeholder}
              value={reminderTime}
              onChangeText={setReminderTime}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />
          </>
        )}

        {/* Color */}
        <Text
          style={[styles.label, styles.sectionGap, { color: colors.textSecondary }]}
        >
          COLOR
        </Text>
        <View style={styles.colorsRow}>
          {HABIT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.colorCircle,
                { backgroundColor: c },
                color === c && styles.colorSelected,
              ]}
            >
              {color === c && (
                <Ionicons name="checkmark" size={16} color="#FFF" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Icon */}
        <Text
          style={[styles.label, styles.sectionGap, { color: colors.textSecondary }]}
        >
          ICON
        </Text>
        <View style={styles.iconsGrid}>
          {HABIT_ICONS.map((ic) => (
            <Pressable
              key={ic}
              onPress={() => setIcon(ic)}
              style={[
                styles.iconCell,
                {
                  backgroundColor:
                    icon === ic ? colors.primaryBg : colors.surface,
                  borderColor: icon === ic ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={styles.iconEmoji}>{ic}</Text>
            </Pressable>
          ))}
        </View>

        {/* Save */}
        <Pressable
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={onSave}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Habit'}
          </Text>
        </Pressable>

        {/* Archive / Delete (edit mode only) */}
        {isEditing && (
          <View style={styles.dangerZone}>
            <Pressable
              style={[styles.dangerBtn, { borderColor: colors.warning }]}
              onPress={onArchive}
            >
              <Ionicons name="archive-outline" size={18} color={colors.warning} />
              <Text style={[styles.dangerBtnText, { color: colors.warning }]}>
                Archive
              </Text>
            </Pressable>
            <Pressable
              style={[styles.dangerBtn, { borderColor: colors.danger }]}
              onPress={onDelete}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={[styles.dangerBtnText, { color: colors.danger }]}>
                Delete
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sectionGap: { marginTop: 22 },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  dayText: { fontSize: 13, fontWeight: '600' },
  colorsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  iconCell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 22 },
  saveBtn: {
    marginTop: 28,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
  },
  saveText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  dangerZone: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  dangerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  dangerBtnText: { fontSize: 15, fontWeight: '600' },
});
