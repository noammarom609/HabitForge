import { useAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Routes } from '../app/routes';
import { useTheme } from '../theme/ThemeContext';

// Warm up browser for OAuth (improves UX on Android)
WebBrowser.maybeCompleteAuthSession();
type AuthMode = 'signin' | 'signup';

// ─── Password strength calculator ───
function getPasswordStrength(pw: string): {
  score: number; // 0-4
  label: string;
  color: string;
  checks: { label: string; met: boolean }[];
} {
  const checks = [
    { label: '8+ characters', met: pw.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(pw) },
    { label: 'Lowercase letter', met: /[a-z]/.test(pw) },
    { label: 'Number', met: /[0-9]/.test(pw) },
    { label: 'Special character (!@#$...)', met: /[^A-Za-z0-9]/.test(pw) },
  ];

  const score = checks.filter((c) => c.met).length;

  const labels: Record<number, { label: string; color: string }> = {
    0: { label: '', color: 'transparent' },
    1: { label: 'Very weak', color: '#EF4444' },
    2: { label: 'Weak', color: '#F97316' },
    3: { label: 'Fair', color: '#EAB308' },
    4: { label: 'Good', color: '#22C55E' },
    5: { label: 'Strong', color: '#10B981' },
  };

  return { score, ...labels[score], checks };
}

// ─── Inline error banner ───
function ErrorBanner({ message, colors }: { message: string; colors: any }) {
  if (!message) return null;
  return (
    <View style={[errorStyles.banner, { backgroundColor: colors.dangerBg, borderColor: colors.danger + '40' }]}>
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text style={[errorStyles.text, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}

// ═══════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════

export function AuthScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const isSignUp = mode === 'signup';
  const isReady = authLoaded && signInLoaded && signUpLoaded;
  const strength = getPasswordStrength(password);

  // Warm up browser for OAuth
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigation.reset({ index: 0, routes: [{ name: Routes.AppTabs }] });
    }
  }, [isSignedIn, navigation]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const redirectUrl =
        Platform.OS === 'web' && typeof window !== 'undefined'
          ? `${window.location.origin}/`
          : Linking.createURL('/', { scheme: 'habitforge' });
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        navigation.reset({ index: 0, routes: [{ name: Routes.AppTabs }] });
      }
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'ההתחברות עם Google נכשלה. נסה שוב.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [startSSOFlow, navigation]);

  // Clear error on mode/input change
  useEffect(() => { setError(''); }, [mode, email, password, confirmPassword]);

  const onSignIn = async () => {
    if (!signIn) return;
    try {
      setLoading(true);
      setError('');
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        navigation.reset({ index: 0, routes: [{ name: Routes.AppTabs }] });
      } else {
        setError('Additional verification required.');
      }
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Sign in failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onSignUp = async () => {
    if (!signUp) return;
    try {
      setLoading(true);
      setError('');
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
      setVerifyError('');
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Sign up failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!signUp) return;
    try {
      setLoading(true);
      setVerifyError('');
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        navigation.reset({ index: 0, routes: [{ name: Routes.AppTabs }] });
      } else {
        setVerifyError('Additional steps required.');
      }
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid code. Please try again.';
      if (msg.toLowerCase().includes('too many')) {
        setVerifyError('Too many attempts. Please wait a minute and try again.');
      } else {
        setVerifyError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      return setError('Please fill in all fields.');
    }
    if (isSignUp && password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    if (isSignUp && strength.score < 3) {
      return setError('Password is too weak. Add uppercase, numbers, or special characters.');
    }
    if (isSignUp && password !== confirmPassword) {
      return setError("Passwords don't match.");
    }
    if (isSignUp) await onSignUp();
    else await onSignIn();
  };

  const onSkip = () => {
    navigation.reset({ index: 0, routes: [{ name: Routes.AppTabs }] });
  };

  if (!isReady) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ══════════ Verification Screen ══════════
  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primaryBg }]}>
              <Ionicons name="mail" size={40} color={colors.primary} />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We sent a 6-digit code to{'\n'}
            <Text style={{ fontWeight: '700' }}>{email}</Text>
          </Text>

          <ErrorBanner message={verifyError} colors={colors} />

          <Text style={[styles.label, { color: colors.textSecondary }]}>VERIFICATION CODE</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: verifyError ? colors.danger : colors.border,
                color: colors.text,
                textAlign: 'center',
                fontSize: 24,
                letterSpacing: 8,
              },
            ]}
            placeholder="000000"
            placeholderTextColor={colors.placeholder}
            value={verificationCode}
            onChangeText={(t) => { setVerificationCode(t); setVerifyError(''); }}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
          <Text style={[styles.hintText, { color: colors.textTertiary }]}>
            Didn't receive it? Check your spam folder.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: verificationCode.length === 6 ? colors.primary : colors.border },
              pressed && styles.submitPressed,
              loading && styles.submitDisabled,
            ]}
            onPress={onVerify}
            disabled={loading || verificationCode.length !== 6}
          >
            <Text style={styles.submitText}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Text>
          </Pressable>

          <Pressable style={styles.backBtn} onPress={() => { setPendingVerification(false); setVerifyError(''); }}>
            <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
            <Text style={[styles.backText, { color: colors.textSecondary }]}>Go back</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ══════════ Main Auth Screen ══════════
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="flame" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>HabitForge</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isSignUp
            ? 'Sign up to sync your habits across devices'
            : 'Sign in to continue tracking your habits'}
        </Text>

        {/* Error */}
        <ErrorBanner message={error} colors={colors} />

        {/* Google Sign In */}
        <Pressable
          style={({ pressed }) => [
            styles.googleBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: loading ? 0.6 : pressed ? 0.9 : 1,
            },
          ]}
          onPress={signInWithGoogle}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={22} color="#4285F4" />
          <Text style={[styles.googleBtnText, { color: colors.text }]}>
            {loading ? 'מתחבר...' : 'התחבר עם Google'}
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textTertiary }]}>או</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        {/* Email */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>EMAIL</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border, color: colors.text }]}
          placeholder="Enter your email"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Password */}
        <Text style={[styles.label, styles.labelGap, { color: colors.textSecondary }]}>PASSWORD</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border, color: colors.text }]}
          placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Password strength meter — only for sign up */}
        {isSignUp && password.length > 0 && (
          <View style={styles.strengthSection}>
            {/* Strength bar */}
            <View style={styles.strengthBarRow}>
              {[1, 2, 3, 4, 5].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.strengthSegment,
                    { backgroundColor: level <= strength.score ? strength.color : colors.border },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>

            {/* Requirements checklist */}
            <View style={styles.checksContainer}>
              {strength.checks.map((check) => (
                <View key={check.label} style={styles.checkRow}>
                  <Ionicons
                    name={check.met ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={check.met ? colors.success : colors.textTertiary}
                  />
                  <Text style={[styles.checkText, { color: check.met ? colors.success : colors.textTertiary }]}>
                    {check.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Confirm password */}
        {isSignUp && (
          <>
            <Text style={[styles.label, styles.labelGap, { color: colors.textSecondary }]}>CONFIRM PASSWORD</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: confirmPassword && password !== confirmPassword ? colors.danger : colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Confirm your password"
              placeholderTextColor={colors.placeholder}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Text style={[styles.mismatchHint, { color: colors.danger }]}>Passwords don't match</Text>
            )}
          </>
        )}

        {/* Submit */}
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

        {/* Toggle */}
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

        {/* Skip */}
        <Pressable style={({ pressed }) => [styles.skipBtn, pressed && styles.skipPressed]} onPress={onSkip}>
          <Text style={[styles.skipText, { color: colors.textTertiary }]}>Continue without account</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ═══════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════

const errorStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16,
  },
  text: { fontSize: 14, fontWeight: '500', flex: 1 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },

  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  appName: { fontSize: 24, fontWeight: '800' },

  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 32, lineHeight: 22 },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  googleBtnText: { fontSize: 16, fontWeight: '600' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontWeight: '500' },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  labelGap: { marginTop: 16 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },

  // Strength meter
  strengthSection: { marginTop: 10 },
  strengthBarRow: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  checksContainer: { gap: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkText: { fontSize: 13 },

  // Mismatch
  mismatchHint: { fontSize: 12, fontWeight: '500', marginTop: 6, marginLeft: 4 },

  // Hint
  hintText: { fontSize: 13, marginTop: 8, textAlign: 'center' },

  // Submit
  submitBtn: { marginTop: 24, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  submitPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },

  // Toggle
  toggleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 },
  toggleText: { fontSize: 14 },
  toggleLink: { fontSize: 14, fontWeight: '600' },

  // Skip
  skipBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  skipPressed: { opacity: 0.7 },
  skipText: { fontSize: 14 },

  // Back
  backBtn: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  backText: { fontSize: 14 },
});
