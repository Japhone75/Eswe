/**
 * Root layout – Expo Router
 * Handles: safety check, BLE permission, tab navigation
 */

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSettingsStore } from '../src/store/settingsStore';

export default function RootLayout() {
  const { loadSettings } = useSettingsStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings().finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0a1a' },
          headerTintColor: '#f0f0ff',
          headerTitleStyle: { fontWeight: '700', color: '#f0f0ff' },
          contentStyle: { backgroundColor: '#0a0a1a' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="safety" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
