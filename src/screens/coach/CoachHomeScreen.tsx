import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Routes } from '../../constants/routes';

export function CoachHomeScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>המאמן שלי</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        המלצות מותאמות אישית לשיפור ההרגלים שלך
      </Text>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>💡</Text>
          <Text variant="h2" style={{ color: colors.text }}>טיפ היומי</Text>
        </View>
        <Text variant="body" style={{ color: colors.textSecondary, marginTop: 8 }}>
          התחל עם ההרגל הכי קל — הצלחה קטנה בונה מומנטום לכל היום.
        </Text>
      </Card>

      <Pressable
        style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => navigation.navigate(Routes.WeeklyReviewWizard)}
      >
        <Ionicons name="calendar" size={24} color={colors.primary} />
        <View style={styles.actionInfo}>
          <Text variant="h2" style={{ color: colors.text }}>סקירת שבוע</Text>
          <Text variant="caption" style={{ color: colors.textTertiary }}>מה עבד, מה נשבר, מה משפרים</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </Pressable>

      <Pressable
        style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => navigation.navigate(Routes.ObstacleWizard)}
      >
        <Ionicons name="help-circle" size={24} color={colors.primary} />
        <View style={styles.actionInfo}>
          <Text variant="h2" style={{ color: colors.text }}>למה לא הצלחתי?</Text>
          <Text variant="caption" style={{ color: colors.textTertiary }}>מצא התאמות להרגל שנכשל</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </Pressable>

      <Pressable
        style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => navigation.navigate(Routes.MotivationVault)}
      >
        <Ionicons name="heart" size={24} color={colors.primary} />
        <View style={styles.actionInfo}>
          <Text variant="h2" style={{ color: colors.text }}>אוצר המוטיבציה</Text>
          <Text variant="caption" style={{ color: colors.textTertiary }}>"למה זה חשוב לי" — תזכורות אישיות</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardEmoji: { fontSize: 28 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionInfo: { flex: 1, marginLeft: 12 },
});
