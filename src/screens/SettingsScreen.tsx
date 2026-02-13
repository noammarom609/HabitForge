import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../theme/ThemeContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const { isDark, colors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>Settings</Text>

      {/* ──── Account ──── */}
      {isSignedIn && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ACCOUNT</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.row, styles.rowBorder, { borderColor: colors.border }]}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryBg }]}>
                  <Ionicons name="person" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>
                    {user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'User'}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.textTertiary }]}>
                    {user?.emailAddresses?.[0]?.emailAddress || ''}
                  </Text>
                </View>
              </View>
            </View>
            <Pressable
              style={styles.row}
              onPress={handleSignOut}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconCircle, { backgroundColor: colors.dangerBg }]}>
                  <Ionicons name="log-out-outline" size={18} color={colors.danger} />
                </View>
                <Text style={[styles.rowLabel, { color: colors.danger }]}>Sign Out</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </Pressable>
          </View>
        </>
      )}

      {/* ──── Identity ──── */}
      {isSignedIn && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>IDENTITY</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable style={styles.row} onPress={() => navigation.navigate('Identity')}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryBg }]}>
                  <Ionicons name="finger-print" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>My Identity</Text>
                  <Text style={[styles.rowSub, { color: colors.textTertiary }]}>
                    Define who you're becoming
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </Pressable>
          </View>
        </>
      )}

      {/* ──── Appearance ──── */}
      <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>APPEARANCE</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryBg }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      {/* ──── About ──── */}
      <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ABOUT</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.row, styles.rowBorder, { borderColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryBg }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Version</Text>
          </View>
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>2.0.0</Text>
        </View>
        <Pressable style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconCircle, { backgroundColor: colors.dangerBg }]}>
              <Ionicons name="heart" size={18} color={colors.danger} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Rate HabitForge</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          HabitForge — Build identity, not just habits
        </Text>
        <Text style={[styles.footerSub, { color: colors.textTertiary }]}>Made with ❤️</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  screenTitle: { fontSize: 28, fontWeight: '800', paddingTop: 8, paddingBottom: 16 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.8,
    marginTop: 16, marginBottom: 8, marginLeft: 4,
  },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowSub: { fontSize: 12, marginTop: 1 },
  rowValue: { fontSize: 16 },
  footer: { alignItems: 'center', marginTop: 'auto', paddingBottom: 30, gap: 4 },
  footerText: { fontSize: 14, fontWeight: '500' },
  footerSub: { fontSize: 13 },
});
