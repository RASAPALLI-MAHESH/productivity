import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { authEventEmitter } from '../api/client';
import { getToken } from '../utils/storage';
import { authApi } from '../api/auth';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, setUserFromTokens, logout } = useAuthStore();

  // Restore session on app launch
  useEffect(() => {
    async function restoreSession() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await authApi.refresh();
        await setUserFromTokens(res.data.data);
      } catch {
        await logout();
      }
    }
    restoreSession();
  }, []);

  // Listen for forced logout from token refresh failure
  useEffect(() => {
    return authEventEmitter.on('logout', () => logout());
  }, [logout]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
