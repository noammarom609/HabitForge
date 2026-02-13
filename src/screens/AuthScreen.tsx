import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../theme/ThemeContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type AuthMode = 'signin' | 'signup';

export function AuthScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === 'signup';

  const onSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Missing fields', 'Please fill in all fields.');
    }

    if (isSignUp && password !== confirmPassword) {
      return Alert.alert('Passwords don\'t match', 'Please check your passwords.');
    }

    setLoading(true);

    // Simulate auth (replace with real auth later)
    setTimeout(() => {
      setLoading(false);
      // For now, just go to tabs - in a real app, you'd save auth state
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    }, 1000);
  };

  const onSkip = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="flame" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>HabitForge</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isSignUp
            ? 'Sign up to sync your habits across devices'
            : 'Sign in to continue tracking your habits'}
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>EMAIL</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Enter your email"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, styles.labelGap, { color: colors.textSecondary }]}>
            PASSWORD
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Enter your password"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {isSignUp && (
            <>
              <Text style={[styles.label, styles.labelGap, { color: colors.textSecondary }]}>
                CONFIRM PASSWORD
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Confirm your password"
                placeholderTextColor={colors.placeholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </>
          )}

          {/* Submit button */}
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: colors.primary },
              pressed && styles.submitPressed,
              loading && styles.submitDisabled,
            ]}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </Pressable>

          {/* Toggle mode */}
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <Pressable onPress={() => setMode(isSignUp ? 'signin' : 'signup')}>
              <Text style={[styles.toggleLink, { color: colors.primary }]}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Skip */}
        <Pressable
          style={({ pressed }) => [styles.skipBtn, pressed && styles.skipPressed]}
          onPress={onSkip}
        >
          <Text style={[styles.skipText, { color: colors.textTertiary }]}>
            Continue without account
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  labelGap: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  submitBtn: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  toggleText: {
    fontSize: 14,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  skipBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  skipPressed: {
    opacity: 0.7,
  },
  skipText: {
    fontSize: 14,
  },
});
