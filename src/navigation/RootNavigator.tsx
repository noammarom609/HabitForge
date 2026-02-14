import { isOnboardingDone } from '../data/storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@clerk/clerk-expo';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Routes } from '../constants/routes';
import type { RootStackParamList } from './types';
import { AuthScreen } from '../screens/AuthScreen';
import { HabitFormScreen } from '../screens/HabitFormScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { TabsNavigator } from './TabsNavigator';
import { hasOAuthCallbackParams } from '../providers/ConvexClerkProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors } = useTheme();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [oauthTimeout, setOauthTimeout] = useState(false);

  const hasOAuthParams = Platform.OS === 'web' && hasOAuthCallbackParams();

  useEffect(() => {
    isOnboardingDone().then((done) => setShowOnboarding(!done));
  }, []);

  // OAuth return: if we timed out waiting for session, stop showing loading
  useEffect(() => {
    if (!hasOAuthParams || !authLoaded || isSignedIn) return;
    const t = setTimeout(() => setOauthTimeout(true), 8000);
    return () => clearTimeout(t);
  }, [hasOAuthParams, authLoaded, isSignedIn]);

  if (showOnboarding === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Web OAuth return: show loading until session is ready, then go to AppTabs
  if (hasOAuthParams && authLoaded) {
    if (isSignedIn) {
      return (
        <Stack.Navigator
          initialRouteName={Routes.AppTabs}
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name={Routes.AppTabs}
            component={TabsNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={Routes.HabitForm}
            component={HabitFormScreen}
            options={{
              title: 'הרגל חדש',
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      );
    }
    if (!oauthTimeout) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
            gap: 16,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
            מסיים התחברות...
          </Text>
        </View>
      );
    }
    // Timeout: fall through to normal flow — show Auth so user can retry
  }

  // After onboarding: require auth to use app (Convex). Unauthenticated -> Auth.
  const initialRoute =
    oauthTimeout && hasOAuthParams
      ? Routes.Auth
      : showOnboarding
        ? Routes.Onboarding
        : isSignedIn
          ? Routes.AppTabs
          : Routes.Auth;

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name={Routes.Onboarding}
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Routes.Auth}
        component={AuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Routes.AppTabs}
        component={TabsNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Routes.HabitForm}
        component={HabitFormScreen}
        options={{
          title: 'הרגל חדש',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
