import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Routes } from '../app/routes';
import type { RootStackParamList } from './types';
import { AuthScreen } from '../screens/AuthScreen';
import { HabitFormScreen } from '../screens/HabitFormScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { TabsNavigator } from './TabsNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('onboarding:done').then((val) => {
      setShowOnboarding(val !== 'true');
    });
  }, []);

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

  return (
    <Stack.Navigator
      initialRouteName={showOnboarding ? Routes.Onboarding : Routes.AppTabs}
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
