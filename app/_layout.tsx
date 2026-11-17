/**
 * Root layout – Expo Router
 * Handles: root Stack navigation
 */

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
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
        <Stack.Screen name="safety-view" options={{ title: 'Safety Notice' }} />
        <Stack.Screen name="compatibility" options={{ title: 'Check Compatibility' }} />
        <Stack.Screen name="demo" options={{ title: 'Demo Mode' }} />
      </Stack>
    </>
  );
}
