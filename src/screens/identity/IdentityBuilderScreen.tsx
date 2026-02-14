import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Routes } from '../../app/routes';

export function IdentityBuilderScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
    >
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>בנאי זהות</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 24 }}>
        "מי אני רוצה להיות?" — ארכיטיפ, ערכים, חוקי בית
      </Text>

      <Card style={styles.card}>
        <Text variant="body" style={{ color: colors.text }}>
          הגדר 1–3 זהויות. כל הרגל הוא קול לזהות הזו.
        </Text>
      </Card>

      <Button
        title="להגדרת זהויות"
        onPress={() => navigation.navigate(Routes.Identity)}
        style={styles.btn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { marginBottom: 24 },
  btn: {},
});
