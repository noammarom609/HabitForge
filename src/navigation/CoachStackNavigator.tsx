import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Routes } from '../app/routes';
import type { CoachStackParamList } from './types';
import { CoachHomeScreen } from '../screens/coach/CoachHomeScreen';
import { ObstacleWizardScreen } from '../screens/coach/ObstacleWizardScreen';
import { RepairModeScreen } from '../screens/coach/RepairModeScreen';
import { WeeklyReviewWizardScreen } from '../screens/coach/WeeklyReviewWizardScreen';
import { MotivationVaultScreen } from '../screens/coach/MotivationVaultScreen';

const Stack = createNativeStackNavigator<CoachStackParamList>();

export function CoachStackNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={Routes.CoachHome} component={CoachHomeScreen} />
      <Stack.Screen name={Routes.ObstacleWizard} component={ObstacleWizardScreen} />
      <Stack.Screen name={Routes.RepairMode} component={RepairModeScreen} />
      <Stack.Screen name={Routes.WeeklyReviewWizard} component={WeeklyReviewWizardScreen} />
      <Stack.Screen name={Routes.MotivationVault} component={MotivationVaultScreen} />
    </Stack.Navigator>
  );
}
