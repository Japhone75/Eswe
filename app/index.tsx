/**
 * Entry point – clean first-run safety disclaimer or tabs
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import SafetyScreen from './safety';

export default function Index() {
  const router = useRouter();
  const { safetyAccepted, loadSettings } = useSettingsStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings().finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && safetyAccepted) {
      router.replace('/(tabs)');
    }
  }, [loading, safetyAccepted]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4a9eff" />
      </View>
    );
  }

  if (!safetyAccepted) {
    return <SafetyScreen onAccepted={() => router.replace('/(tabs)')} />;
  }

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
