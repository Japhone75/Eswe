/**
 * Entry point – redirects cleanly to safety (first run) or tabs
 */

import React from 'react';
import { Redirect } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';

export default function Index() {
  const safetyAccepted = useSettingsStore((s) => s.safetyAccepted);

  if (safetyAccepted) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/safety" />;
}
