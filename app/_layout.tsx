/**
 * Root layout – Expo Router
 * Handles: root Stack navigation, global error boundary
 */

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Intercept unhandled JS exceptions in release mode to prevent native abort()
if (typeof global !== 'undefined' && (global as any).ErrorUtils) {
  const originalHandler = (global as any).ErrorUtils.getGlobalHandler?.();
  (global as any).ErrorUtils.setHandler((error: any, isFatal?: boolean) => {
    console.error('Captured JS Error:', error);
    try {
      Alert.alert(
        'App Notice',
        String(error?.message || error) + (error?.stack ? '\n\n' + String(error.stack).slice(0, 300) : '')
      );
    } catch {}
    if (originalHandler) {
      // Pass isFatal: false to prevent NativeExceptionsManager.reportFatal from calling abort()
      originalHandler(error, false);
    }
  });
}

// Catch-all Error Boundary for Expo Router: displays any crash on-screen instead of SIGABRT
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <SafeAreaView style={styles.errorContainer}>
      <Text style={styles.errorTitle}>App Error</Text>
      <Text style={styles.errorSub}>The application encountered an issue:</Text>
      <ScrollView style={styles.errorBox}>
        <Text style={styles.errorMessage}>{error?.message || String(error)}</Text>
        {error?.stack && <Text style={styles.errorStack}>{error.stack}</Text>}
      </ScrollView>
      <TouchableOpacity style={styles.retryBtn} onPress={retry} activeOpacity={0.8}>
        <Text style={styles.retryText}>Reload App</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default function RootLayout() {
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
        <Stack.Screen name="safety-view" options={{ title: 'Safety Notice' }} />
        <Stack.Screen name="compatibility" options={{ title: 'Check Compatibility' }} />
        <Stack.Screen name="demo" options={{ title: 'Demo Mode' }} />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    padding: 24,
    justifyContent: 'center',
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSub: {
    color: '#a0a0c0',
    fontSize: 14,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#14142b',
    borderRadius: 8,
    padding: 16,
    maxHeight: 280,
    borderWidth: 1,
    borderColor: '#ef444444',
  },
  errorMessage: {
    color: '#ff8888',
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    color: '#666688',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  retryBtn: {
    backgroundColor: '#2563eb',
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
