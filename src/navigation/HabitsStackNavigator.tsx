import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Routes } from '../constants/routes';
import type { HabitsStackParamList } from './types';
import { HabitsHomeScreen } from '../screens/habits/HabitsHomeScreen';
import { HabitDetailsScreen } from '../screens/habits/HabitDetailsScreen';
import { HabitLogScreen } from '../screens/habits/HabitLogScreen';
import { TemplatesScreen } from '../screens/habits/TemplatesScreen';

const Stack = createNativeStackNavigator<HabitsStackParamList>();

export function HabitsStackNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={Routes.HabitsHome} component={HabitsHomeScreen} />
      <Stack.Screen name={Routes.HabitDetails} component={HabitDetailsScreen} />
      <Stack.Screen name={Routes.HabitLog} component={HabitLogScreen} />
      <Stack.Screen name={Routes.Templates} component={TemplatesScreen} />
    </Stack.Navigator>
  );
}
