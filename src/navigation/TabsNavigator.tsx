import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Routes } from '../app/routes';
import type { TabsParamList } from './types';
import { TodayStackNavigator } from './TodayStackNavigator';
import { HabitsStackNavigator } from './HabitsStackNavigator';
import { CoachStackNavigator } from './CoachStackNavigator';
import { InsightsStackNavigator } from './InsightsStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';

const Tab = createBottomTabNavigator<TabsParamList>();

export function TabsNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingTop: 4,
          ...(Platform.OS === 'ios' ? { height: 88 } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name={Routes.TodayTab}
        component={TodayStackNavigator}
        options={{
          tabBarLabel: 'היום',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="today" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={Routes.HabitsTab}
        component={HabitsStackNavigator}
        options={{
          tabBarLabel: 'הרגלים',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={Routes.CoachTab}
        component={CoachStackNavigator}
        options={{
          tabBarLabel: 'מאמן',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={Routes.InsightsTab}
        component={InsightsStackNavigator}
        options={{
          tabBarLabel: 'תובנות',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={Routes.SettingsTab}
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'הגדרות',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
