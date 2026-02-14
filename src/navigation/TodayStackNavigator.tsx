import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Routes } from '../app/routes';
import type { TodayStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { TodayPlanScreen } from '../screens/today/TodayPlanScreen';
import { RoutineRunScreen } from '../screens/today/RoutineRunScreen';
import { FocusModeScreen } from '../screens/today/FocusModeScreen';

const Stack = createNativeStackNavigator<TodayStackParamList>();

export function TodayStackNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={Routes.TodayHome} component={HomeScreen} />
      <Stack.Screen name={Routes.TodayPlan} component={TodayPlanScreen} />
      <Stack.Screen name={Routes.RoutineRun} component={RoutineRunScreen} />
      <Stack.Screen name={Routes.FocusMode} component={FocusModeScreen} />
    </Stack.Navigator>
  );
}
