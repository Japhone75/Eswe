/**
 * Entry point – redirects to safety (first run) or scanner
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useSettingsStore } from '../src/store/settingsStore';

export default function Index() {
  const router = useRouter();
  const safetyAccepted = useSettingsStore((s) => s.safetyAccepted);

  useEffect(() => {
    if (safetyAccepted) {
      router.replace('/(tabs)');
    } else {
      router.replace('/safety');
    }
  }, [safetyAccepted]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a1a', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#4a9eff" size="large" />
    </View>
  );
}
