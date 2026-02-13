import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { HabitFormScreen } from '../screens/HabitFormScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useTheme } from '../theme/ThemeContext';
import { TabsNavigator } from './TabsNavigator';

export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: undefined;
  HabitForm: { habitId?: string } | undefined;
};

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
      initialRouteName={showOnboarding ? 'Onboarding' : 'Tabs'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {showOnboarding && (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      )}
      <Stack.Screen
        name="Tabs"
        component={TabsNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HabitForm"
        component={HabitFormScreen}
        options={{
          title: 'New Habit',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
