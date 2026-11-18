/**
 * Application Entry Point
 * Intercepts JS fatal errors and prevents native abort() in Release builds
 */

import { NativeModules } from 'react-native';

// Intercept fatal exceptions so Release builds NEVER call native abort()
if (NativeModules && NativeModules.ExceptionsManager) {
  NativeModules.ExceptionsManager.reportFatal = function (title, stack, exceptionId) {
    console.error('CAUGHT FATAL EXCEPTION:', title, stack);
    // Do NOT bridge to native reportFatal to prevent iOS abort() trap
  };

  NativeModules.ExceptionsManager.reportException = function (data) {
    console.error('CAUGHT EXCEPTION:', data);
    // Silent in release mode - no disruptive alert popups
  };
}

if (typeof global !== 'undefined' && global.ErrorUtils) {
  global.ErrorUtils.setHandler((error, isFatal) => {
    console.error('CAUGHT GLOBAL ERROR:', error);
    // Silent in release mode
  });
}

// Load Expo Router
import 'expo-router/entry';
