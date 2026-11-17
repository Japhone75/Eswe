/**
 * Entry point – clean first-run gate to safety disclaimer or tabs
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';

export default function Index() {
  const router = useRouter();
  const { safetyAccepted, loadSettings } = useSettingsStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadSettings().finally(() => {
      if (active) setIsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (safetyAccepted) {
      router.replace('/(tabs)');
    } else {
      router.replace('/safety');
    }
  }, [isReady, safetyAccepted]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4a9eff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
