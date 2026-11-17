/**
 * Application Entry Point
 * Intercepts JS fatal errors and prevents native abort() in Release builds
 */

import { NativeModules, Alert } from 'react-native';

function formatError(errorOrData) {
  if (!errorOrData) return 'Unknown error';
  let title = errorOrData.message || errorOrData.name || String(errorOrData);
  let details = '';
  if (Array.isArray(errorOrData.stack)) {
    details = errorOrData.stack
      .slice(0, 4)
      .map((f) => `${f.methodName || 'anonymous'} (${(f.file || '?').split('/').pop()}:${f.lineNumber || '?'})`)
      .join('\n');
  } else if (typeof errorOrData.stack === 'string') {
    details = errorOrData.stack.split('\n').slice(0, 4).join('\n');
  }
  if (errorOrData.componentStack) {
    details += '\n' + String(errorOrData.componentStack).trim().split('\n').slice(0, 3).join('\n');
  }
  return details ? `${title}\n\n${details}` : title;
}

let lastAlertTime = 0;
function showAlert(title, message) {
  const now = Date.now();
  if (now - lastAlertTime < 1000) return; // Prevent spamming duplicate alerts
  lastAlertTime = now;
  try {
    Alert.alert(title, String(message).slice(0, 600));
  } catch {}
}

if (NativeModules && NativeModules.ExceptionsManager) {
  NativeModules.ExceptionsManager.reportFatal = function (title, stack, exceptionId) {
    console.error('CAUGHT FATAL EXCEPTION:', title, stack);
    showAlert('Fatal Notice', String(title) + '\n\n' + JSON.stringify(stack || '').slice(0, 300));
  };

  NativeModules.ExceptionsManager.reportException = function (data) {
    console.error('CAUGHT EXCEPTION:', data);
    // Ignore non-fatal warnings and guarded exceptions in production so release starts clean
    if (data && data.isFatal === false) {
      return;
    }
    showAlert('App Notice', formatError(data));
  };
}

if (typeof global !== 'undefined' && global.ErrorUtils) {
  global.ErrorUtils.setHandler((error, isFatal) => {
    console.error('CAUGHT GLOBAL ERROR:', error);
    // Only alert on fatal errors that would otherwise break app execution
    if (!isFatal) {
      return;
    }
    showAlert('App Error', formatError(error));
  });
}

// Load Expo Router
import 'expo-router/entry';
