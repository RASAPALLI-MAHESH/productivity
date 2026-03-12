import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import type { HabitStackParamList } from '../types';
import HabitsScreen from '../screens/habits/HabitsScreen';
import HabitDetailScreen from '../screens/habits/HabitDetailScreen';

const Stack = createNativeStackNavigator<HabitStackParamList>();

export default function HabitStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen name="HabitList" component={HabitsScreen} />
      <Stack.Screen
        name="HabitDetail"
        component={HabitDetailScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
