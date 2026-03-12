import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './navigation/RootNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // Hide splash after navigation mounts
    const timer = setTimeout(() => SplashScreen.hideAsync(), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" backgroundColor="#0F0F0F" />
      <RootNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
