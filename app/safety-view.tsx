/**
 * Safety notice viewer (accessible anytime from Settings)
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
import { Ionicons } from '@expo/vector-icons';

const SAFETY_TEXT = `ENGWE Speed Tool – Safety & Legal Notice

This app is not made by, endorsed by, or affiliated with ENGWE.

Speed limits and legal requirements:
In the EU and many other countries, an e-bike must stop assisting at 25 km/h. Above that, the bike may legally be classified as a moped, requiring type approval, registration, insurance, a driving licence and a helmet.

Use any setting above 25 km/h only where this is legal—for example, on private land—and only if you understand and accept the risks.

Your responsibilities:
• You are responsible for knowing and obeying the law where you ride.
• Higher speeds increase the risk of accidents, injury, and damage to property.
• A change to the speed limit may void your warranty and may affect your insurance cover.
• The app authors accept no liability for any loss, injury, or damage resulting from use of this app.

Technical limitations:
• This app has been verified only on the ENGWE E26 3.0 Pro with IoT firmware 218CAN.
• On unverified models, a speed setting might behave differently, including being permanent.
• Always tap 25 km/h before switching the bike off, and report what you see.`;

export default function SafetyViewScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#0a0a1a', '#12122a']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#f0f0ff" />
          </TouchableOpacity>
          <Text style={styles.title}>Safety & Legal Notice</Text>
          <View style={{ width: 24 }} />
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
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a5a',
  },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: '#f0f0ff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
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
});
