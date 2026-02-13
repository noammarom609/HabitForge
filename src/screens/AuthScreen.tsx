import { Ionicons } from '@expo/vector-icons';
import { useSignIn, useSignUp, useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const isSignUp = mode === 'signup';
  const isReady = authLoaded && signInLoaded && signUpLoaded;

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    }
  }, [isSignedIn, navigation]);

  const onSignIn = async () => {
    if (!signIn) return;

    try {
      setLoading(true);
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      } else {
        console.log('Sign in status:', result.status);
        Alert.alert('Sign In', 'Additional verification required.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      Alert.alert('Sign In Failed', err.errors?.[0]?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSignUp = async () => {
    if (!signUp) return;

    try {
      setLoading(true);
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
      Alert.alert('Sign Up Failed', err.errors?.[0]?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!signUp) return;

    try {
      setLoading(true);
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      } else {
        Alert.alert('Verification', 'Additional steps required.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      Alert.alert('Verification Failed', err.errors?.[0]?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Missing fields', 'Please fill in all fields.');
    }

    if (isSignUp && password !== confirmPassword) {
      return Alert.alert("Passwords don't match", 'Please check your passwords.');
    }

    if (isSignUp) {
      await onSignUp();
    } else {
      await onSignIn();
    }
  };

  const onSkip = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  };

  // Show loading while Clerk loads
  if (!isReady) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Verification screen
  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primaryBg }]}>
              <Ionicons name="mail" size={40} color={colors.primary} />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We sent a verification code to {email}
          </Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              VERIFICATION CODE
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                  textAlign: 'center',
                  fontSize: 24,
                  letterSpacing: 8,
                },
              ]}
              placeholder="000000"
              placeholderTextColor={colors.placeholder}
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: colors.primary },
                pressed && styles.submitPressed,
                loading && styles.submitDisabled,
              ]}
              onPress={onVerify}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.backBtn}
              onPress={() => setPendingVerification(false)}
            >
              <Text style={[styles.backText, { color: colors.textSecondary }]}>
                Go back
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  backBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
  },
});
