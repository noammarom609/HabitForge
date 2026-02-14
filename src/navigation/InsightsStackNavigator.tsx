import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Routes } from '../constants/routes';
import type { InsightsStackParamList } from './types';
import { StatsScreen } from '../screens/StatsScreen';
import { CalendarHeatmapScreen } from '../screens/insights/CalendarHeatmapScreen';
import { PatternsScreen } from '../screens/insights/PatternsScreen';
import { HabitHealthScoreScreen } from '../screens/insights/HabitHealthScoreScreen';

const Stack = createNativeStackNavigator<InsightsStackParamList>();

export function InsightsStackNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={Routes.InsightsHome} component={StatsScreen} />
      <Stack.Screen name={Routes.CalendarHeatmap} component={CalendarHeatmapScreen} />
      <Stack.Screen name={Routes.Patterns} component={PatternsScreen} />
      <Stack.Screen name={Routes.HabitHealthScore} component={HabitHealthScoreScreen} />
    </Stack.Navigator>
  );
}
