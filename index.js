/**
 * Application Entry Point
 * Intercepts JS fatal errors and prevents native abort() in Release builds
 */

import { NativeModules, Alert } from 'react-native';

// Intercept fatal JS exceptions so Release builds NEVER call native abort()
if (NativeModules && NativeModules.ExceptionsManager) {
  NativeModules.ExceptionsManager.reportFatal = function (title, stack, exceptionId) {
    console.error('CAUGHT FATAL EXCEPTION:', title, stack);
    try {
      Alert.alert(
        'App Notice',
        String(title) + '\n\n' + JSON.stringify(stack || '').slice(0, 300)
      );
    } catch {}
    // Do NOT bridge to native reportFatal to prevent abort()
  };

  NativeModules.ExceptionsManager.reportException = function (data) {
    console.error('CAUGHT EXCEPTION:', data);
    try {
      Alert.alert(
        'App Notice',
        (data && data.message ? data.message : JSON.stringify(data)).slice(0, 500)
      );
    } catch {}
    // Do NOT bridge to native reportException if fatal
  };
}

if (typeof global !== 'undefined' && global.ErrorUtils) {
  global.ErrorUtils.setHandler((error, isFatal) => {
    console.error('CAUGHT GLOBAL ERROR:', error);
    try {
      Alert.alert('App Error', String(error?.message || error));
    } catch {}
  });
}

// Load Expo Router
import 'expo-router/entry';
