import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import type { AppTabParamList } from '../types';

import TaskStackNavigator from './TaskStackNavigator';
import HabitStackNavigator from './HabitStackNavigator';
import DeadlinesScreen from '../screens/deadlines/DeadlinesScreen';
import InsightsScreen from '../screens/insights/InsightsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: TabIconName; inactive: TabIconName }> = {
  Tasks: { active: 'checkmark-circle', inactive: 'checkmark-circle-outline' },
  Habits: { active: 'repeat', inactive: 'repeat-outline' },
  Deadlines: { active: 'alarm', inactive: 'alarm-outline' },
  Insights: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.active : icons.inactive;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, styles.tabBarBg]} />
        ),
      })}
    >
      <Tab.Screen name="Tasks" component={TaskStackNavigator} />
      <Tab.Screen name="Habits" component={HabitStackNavigator} />
      <Tab.Screen name="Deadlines" component={DeadlinesScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bgElevated,
    borderTopColor: Colors.border,
    borderTopWidth: 0.5,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    height: Platform.OS === 'ios' ? 80 : 60,
    elevation: 0,
  },
  tabBarBg: {
    backgroundColor: Colors.bgElevated,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
});
