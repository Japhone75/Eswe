/**
 * Safety disclaimer screen – shown once before using the app.
 * Content matches SAFETY.md from the original project.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettingsStore } from '../src/store/settingsStore';

const SAFETY_TEXT = `ENGWE Speed Tool – Safety & Legal Notice

This app is not made by, endorsed by, or affiliated with ENGWE.

Speed limits and legal requirements
In the EU and many other countries, an e-bike must stop assisting at 25 km/h. Above that, the bike may legally be classified as a moped, requiring type approval, registration, insurance, a driving licence and a helmet.

Use any setting above 25 km/h only where this is legal—for example, on private land—and only if you understand and accept the risks.

Your responsibilities
• You are responsible for knowing and obeying the law where you ride.
• Higher speeds increase the risk of accidents, injury, and damage to property.
• A change to the speed limit may void your warranty and may affect your insurance cover.
• The app authors accept no liability for any loss, injury, or damage resulting from use of this app.

Technical limitations
• This app has been verified only on the ENGWE E26 3.0 Pro with IoT firmware 218CAN.
• On unverified models, a speed setting might behave differently, including being permanent.
• Always tap 25 km/h before switching the bike off, and report what you see.

By tapping "I understand and accept" you confirm that you have read this notice, that you understand and accept these risks, and that you will use the app responsibly and lawfully.`;

export default function SafetyScreen({ onAccepted }: { onAccepted?: () => void } = {}) {
  const router = useRouter();
  const { acceptSafety } = useSettingsStore();

  async function handleAccept() {
    await acceptSafety();
    if (onAccepted) {
      onAccepted();
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <LinearGradient colors={['#0a0a1a', '#12122a']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Safety & Legal</Text>
          <Text style={styles.subtitle}>Please read before continuing</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.textBox}>
            <Text style={styles.bodyText}>{SAFETY_TEXT}</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAccept}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#4a9eff', '#2563eb']}
              style={styles.acceptGradient}
            >
              <Text style={styles.acceptText}>I understand and accept</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            You can review this notice again in Settings
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f0f0ff',
    marginBottom: 4,
  },
  subtitle: { fontSize: 15, color: '#8888bb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  textBox: {
    backgroundColor: '#1a1a3a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a5a',
  },
  bodyText: {
    color: '#c0c0ee',
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 12,
    gap: 8,
  },
  acceptButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  acceptGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  disclaimer: {
    textAlign: 'center',
    color: '#5555aa',
    fontSize: 12,
  },
});
