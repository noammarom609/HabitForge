import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Routes } from '../constants/routes';
import type { SettingsStackParamList } from './types';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NotificationsCenterScreen } from '../screens/settings/NotificationsCenterScreen';
import { IntegrationsHubScreen } from '../screens/settings/IntegrationsHubScreen';
import { IdentityScreen } from '../screens/IdentityScreen';
import { ProfileScreen } from '../screens/settings/ProfileScreen';
import { ThemeScreen } from '../screens/settings/ThemeScreen';
import { PrivacyScreen } from '../screens/settings/PrivacyScreen';
import { SupportScreen } from '../screens/settings/SupportScreen';
import { DataBackupRestoreScreen } from '../screens/settings/DataBackupRestoreScreen';
import { FeedbackScreen } from '../screens/settings/FeedbackScreen';
import { CalendarHeatmapScreen } from '../screens/insights/CalendarHeatmapScreen';
import { HabitHealthScoreScreen } from '../screens/insights/HabitHealthScoreScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStackNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={Routes.SettingsHome} component={SettingsScreen} />
      <Stack.Screen name={Routes.Profile} component={ProfileScreen} />
      <Stack.Screen name={Routes.Theme} component={ThemeScreen} />
      <Stack.Screen name={Routes.NotificationsCenter} component={NotificationsCenterScreen} />
      <Stack.Screen name={Routes.Identity} component={IdentityScreen} />
      <Stack.Screen name={Routes.Privacy} component={PrivacyScreen} />
      <Stack.Screen name={Routes.Support} component={SupportScreen} />
      <Stack.Screen name={Routes.IntegrationsHub} component={IntegrationsHubScreen} />
      <Stack.Screen name={Routes.DataBackupRestore} component={DataBackupRestoreScreen} />
      <Stack.Screen name={Routes.Feedback} component={FeedbackScreen} />
      <Stack.Screen name={Routes.CalendarHeatmap} component={CalendarHeatmapScreen} />
      <Stack.Screen name={Routes.HabitHealthScore} component={HabitHealthScoreScreen} />
    </Stack.Navigator>
  );
}
