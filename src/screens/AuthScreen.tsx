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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Routes } from '../constants/routes';
import { useTheme } from '../theme/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

type AuthMode = 'signin' | 'signup';

// ─────────────────────────────────────────────
// Hebrew error mapper — translates Clerk codes
// ─────────────────────────────────────────────
function clerkErrorToHebrew(err: any): string {
  const code: string = err.errors?.[0]?.code ?? '';
  const msg: string =
    err.errors?.[0]?.longMessage || err.errors?.[0]?.message || '';

  // Map known Clerk error codes to Hebrew
  const map: Record<string, string> = {
    form_password_pwned:
      'הסיסמה נמצאה בדליפת מידע באינטרנט. בחר סיסמה אחרת.',
    form_identifier_exists: 'כתובת האימייל כבר רשומה. נסה להתחבר.',
    form_password_incorrect: 'סיסמה שגויה. נסה שוב.',
    form_identifier_not_found: 'לא נמצא חשבון עם כתובת אימייל זו.',
    form_param_nil: 'יש למלא את כל השדות.',
    form_code_incorrect: 'הקוד שהזנת שגוי. נסה שוב.',
    verification_expired: 'קוד האימות פג תוקף. חזור אחורה ונסה שוב.',
    too_many_requests: 'יותר מדי ניסיונות. המתן דקה ונסה שוב.',
    session_exists: 'כבר מחובר. מעביר אותך...',
    captcha_invalid: 'יש להשלים את אימות ה-CAPTCHA לפני ההרשמה.',
    captcha_not_enabled: '',
  };

  if (map[code]) return map[code];

  // Fallback patterns
  if (code.startsWith('captcha'))
    return 'יש להשלים את אימות ה-CAPTCHA לפני ההרשמה.';
  if (msg.toLowerCase().includes('too many'))
    return 'יותר מדי ניסיונות. המתן דקה ונסה שוב.';
  if (msg.toLowerCase().includes('password') && msg.toLowerCase().includes('breach'))
    return 'הסיסמה נמצאה בדליפת מידע באינטרנט. בחר סיסמה אחרת.';

  // Return original message if no translation
  return msg || 'אירעה שגיאה. נסה שוב.';
}

// ─────────────────────────────────────────────
// Password strength calculator
// ─────────────────────────────────────────────
function getPasswordStrength(pw: string) {
  const checks = [
    { label: '8 תווים לפחות', met: pw.length >= 8 },
    { label: 'אות גדולה', met: /[A-Z]/.test(pw) },
    { label: 'אות קטנה', met: /[a-z]/.test(pw) },
    { label: 'מספר', met: /[0-9]/.test(pw) },
    { label: 'תו מיוחד (!@#$...)', met: /[^A-Za-z0-9]/.test(pw) },
  ];
  const score = checks.filter((c) => c.met).length;
  const labels: Record<number, { label: string; color: string }> = {
    0: { label: '', color: 'transparent' },
    1: { label: 'חלשה מאוד', color: '#EF4444' },
    2: { label: 'חלשה', color: '#F97316' },
    3: { label: 'סבירה', color: '#EAB308' },
    4: { label: 'טובה', color: '#22C55E' },
    5: { label: 'חזקה', color: '#10B981' },
  };
  return { score, ...labels[score], checks };
}

// ─────────────────────────────────────────────
// Error banner
// ─────────────────────────────────────────────
function ErrorBanner({ message, colors }: { message: string; colors: any }) {
  if (!message) return null;
  return (
    <View
      style={[
        errorStyles.banner,
        { backgroundColor: colors.dangerBg, borderColor: colors.danger + '40' },
      ]}
    >
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text style={[errorStyles.text, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}

// ═══════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════
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

  // ── Native: warm up browser for OAuth ──
  useEffect(() => {
    if (Platform.OS !== 'web') {
      void WebBrowser.warmUpAsync();
      return () => { void WebBrowser.coolDownAsync(); };
    }
  }, []);

  // ── Redirect if already signed in ──
  useEffect(() => {
    if (isSignedIn) {
      navigation.reset({ index: 0, routes: [{ name: Routes.AppTabs }] });
    }
  }, [isSignedIn, navigation]);

  // ── Clear error on input change ──
  useEffect(() => { setError(''); }, [mode, email, password, confirmPassword]);

  // ═══════════════════════════════════════
  // GOOGLE SIGN-IN
  // ═══════════════════════════════════════
  const signInWithGoogle = useCallback(async () => {
    if (!signIn) return;
    try {
      setLoading(true);
      setError('');

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Web: full-page redirect (avoids COOP popup issues)
        const origin = window.location.origin;
        await signIn.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: `${origin}/`,
          redirectUrlComplete: `${origin}/`,
        });
        return; // Page will redirect
      }

      // Native: popup via WebBrowser
      const redirectUrl = Linking.createURL('/', { scheme: 'habitforge' });
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        navigation.reset({ index: 0, routes: [{ name: Routes.AppTabs }] });
      }
    } catch (err: any) {
      setError(clerkErrorToHebrew(err));
    } finally {
      setLoading(false);
    }
  }, [signIn, startSSOFlow, navigation]);

  // ═══════════════════════════════════════
  // SIGN IN (email + password)
  // ═══════════════════════════════════════
  const onSignIn = async () => {
    if (!signIn) return;
    try {
      setLoading(true);
      setError('');
      const result = await signIn.create({ identifier: email, password });

      switch (result.status) {
        case 'complete':
          await setSignInActive({ session: result.createdSessionId });
          navigation.reset({ index: 0, routes: [{ name: Routes.AppTabs }] });
          break;
        case 'needs_first_factor':
          setError('נדרש אימות נוסף. נסה סיסמה או שיטת התחברות אחרת.');
          break;
        case 'needs_second_factor':
          setError('נדרש אימות דו-שלבי. פנה לתמיכה אם הפעלת 2FA.');
          break;
        case 'needs_new_password':
          setError('נדרש איפוס סיסמה. נסה להירשם מחדש.');
          break;
        default:
          setError(`מצב לא צפוי: ${result.status}. נסה שוב.`);
      }
    } catch (err: any) {
      setError(clerkErrorToHebrew(err));
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════
  // SIGN UP (email + password)
  // ═══════════════════════════════════════
  const onSignUp = async () => {
    if (!signUp) return;
    try {
      setLoading(true);
      setError('');

      const result = await signUp.create({ emailAddress: email, password });

      // Check status BEFORE sending verification email
      if (result.status === 'complete') {
        // Rare: auto-verify is on
        await setSignUpActive({ session: result.createdSessionId });
        navigation.reset({ index: 0, routes: [{ name: Routes.AppTabs }] });
        return;
      }

      if (result.status === 'missing_requirements') {
        // Check what's missing
        const unverified = result.unverifiedFields ?? [];
        const missing = result.missingFields ?? [];

        if (unverified.includes('email_address')) {
          // Normal: needs email verification → send code
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setPendingVerification(true);
          setVerifyError('');
          return;
        }

        if (missing.length > 0) {
          setError(`חסרים שדות נוספים: ${missing.join(', ')}. נסה שוב.`);
          return;
        }

        // Unknown missing requirement
        setError('ההרשמה דורשת שלבים נוספים. נסה שוב או השתמש ב-Google.');
        return;
      }

      if (result.status === 'abandoned') {
        setError('ניסיון ההרשמה בוטל. נסה שוב.');
        return;
      }

      setError(`מצב לא צפוי: ${result.status}. נסה שוב.`);
    } catch (err: any) {
      setError(clerkErrorToHebrew(err));
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════
  // VERIFY EMAIL CODE
  // ═══════════════════════════════════════
  const onVerify = async () => {
    if (!signUp) return;
    try {
      setLoading(true);
      setVerifyError('');

      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      switch (result.status) {
        case 'complete':
          await setSignUpActive({ session: result.createdSessionId });
          navigation.reset({ index: 0, routes: [{ name: Routes.AppTabs }] });
          break;
        case 'missing_requirements': {
          const missing = result.missingFields ?? [];
          const unverified = result.unverifiedFields ?? [];
          if (unverified.length > 0 || missing.length > 0) {
            setVerifyError(
              `עדיין נדרשים שלבים נוספים: ${[...missing, ...unverified].join(', ')}. נסה שוב או חזור אחורה.`
            );
          } else {
            setVerifyError('ההרשמה דורשת שלבים נוספים. חזור אחורה ונסה שוב.');
          }
          break;
        }
        default:
          setVerifyError(`מצב לא צפוי: ${result.status}. חזור אחורה ונסה שוב.`);
      }
    } catch (err: any) {
      setVerifyError(clerkErrorToHebrew(err));
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════
  // FORM SUBMIT
  // ═══════════════════════════════════════
  const onSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      return setError('יש למלא את כל השדות.');
    }
    if (isSignUp && password.length < 8) {
      return setError('הסיסמה חייבת להכיל 8 תווים לפחות.');
    }
    if (isSignUp && strength.score < 3) {
      return setError('הסיסמה חלשה מדי. הוסף אותיות גדולות, מספרים או תווים מיוחדים.');
    }
    if (isSignUp && password !== confirmPassword) {
      return setError('הסיסמאות לא תואמות.');
    }
    if (isSignUp) await onSignUp();
    else await onSignIn();
  };

  const onSkip = () => {
    navigation.reset({ index: 0, routes: [{ name: Routes.AppTabs }] });
  };

  // ═══════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════
  if (!isReady) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ═══════════════════════════════════════
  // VERIFICATION SCREEN
  // ═══════════════════════════════════════
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

          <Text style={[styles.title, { color: colors.text }]}>בדוק את האימייל</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            שלחנו קוד בן 6 ספרות ל{'\n'}
            <Text style={{ fontWeight: '700' }}>{email}</Text>
          </Text>

          <ErrorBanner message={verifyError} colors={colors} />

          <Text style={[styles.label, { color: colors.textSecondary }]}>קוד אימות</Text>
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
            לא קיבלת? בדוק בתיקיית הספאם.
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
              {loading ? 'מאמת...' : 'אמת אימייל'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.backBtn}
            onPress={() => { setPendingVerification(false); setVerifyError(''); setVerificationCode(''); }}
          >
            <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
            <Text style={[styles.backText, { color: colors.textSecondary }]}>חזור</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ═══════════════════════════════════════
  // MAIN AUTH SCREEN
  // ═══════════════════════════════════════
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
          {isSignUp ? 'יצירת חשבון' : 'ברוך הבא'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isSignUp
            ? 'הירשם כדי לסנכרן את ההרגלים שלך בין מכשירים'
            : 'התחבר כדי להמשיך לעקוב אחר ההרגלים שלך'}
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
        <Text style={[styles.label, { color: colors.textSecondary }]}>אימייל</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border, color: colors.text }]}
          placeholder="הכנס את כתובת האימייל"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Password */}
        <Text style={[styles.label, styles.labelGap, { color: colors.textSecondary }]}>סיסמה</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border, color: colors.text }]}
          placeholder={isSignUp ? 'צור סיסמה חזקה' : 'הכנס את הסיסמה'}
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Password strength — sign up only */}
        {isSignUp && password.length > 0 && (
          <View style={styles.strengthSection}>
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

        {/* Confirm password — sign up only */}
        {isSignUp && (
          <>
            <Text style={[styles.label, styles.labelGap, { color: colors.textSecondary }]}>אימות סיסמה</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: confirmPassword && password !== confirmPassword ? colors.danger : colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="הכנס את הסיסמה שוב"
              placeholderTextColor={colors.placeholder}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Text style={[styles.mismatchHint, { color: colors.danger }]}>הסיסמאות לא תואמות</Text>
            )}
          </>
        )}

        {/* CAPTCHA — web sign-up only.
            Clerk injects Cloudflare Turnstile into this element.
            Placed BEFORE submit button so user sees + completes it first. */}
        {Platform.OS === 'web' && isSignUp && (
          <View nativeID="clerk-captcha" style={styles.captchaContainer} />
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
            {loading ? 'ממתין...' : isSignUp ? 'יצירת חשבון' : 'התחברות'}
          </Text>
        </Pressable>

        {/* Toggle mode */}
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
            {isSignUp ? 'כבר יש לך חשבון?' : 'אין לך חשבון?'}
          </Text>
          <Pressable onPress={() => setMode(isSignUp ? 'signin' : 'signup')}>
            <Text style={[styles.toggleLink, { color: colors.primary }]}>
              {isSignUp ? 'התחבר' : 'הירשם'}
            </Text>
          </Pressable>
        </View>

        {/* Skip */}
        <Pressable style={({ pressed }) => [styles.skipBtn, pressed && styles.skipPressed]} onPress={onSkip}>
          <Text style={[styles.skipText, { color: colors.textTertiary }]}>המשך בלי חשבון</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 12, borderWidth: 1, marginBottom: 20,
  },
  googleBtnText: { fontSize: 16, fontWeight: '600' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontWeight: '500' },

  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  labelGap: { marginTop: 16 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },

  strengthSection: { marginTop: 10 },
  strengthBarRow: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  checksContainer: { gap: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkText: { fontSize: 13 },

  mismatchHint: { fontSize: 12, fontWeight: '500', marginTop: 6, marginLeft: 4 },

  // CAPTCHA container — prominent, right before submit
  captchaContainer: { minHeight: 85, marginTop: 20, marginBottom: 4 },

  hintText: { fontSize: 13, marginTop: 8, textAlign: 'center' },

  submitBtn: { marginTop: 24, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  submitPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },

  toggleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 },
  toggleText: { fontSize: 14 },
  toggleLink: { fontSize: 14, fontWeight: '600' },

  skipBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  skipPressed: { opacity: 0.7 },
  skipText: { fontSize: 14 },

  backBtn: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  backText: { fontSize: 14 },
});
