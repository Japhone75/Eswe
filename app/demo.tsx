/**
 * Demo mode screen – simulates a connected ENGWE bike
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBikeStore } from '../src/store/bikeStore';
import { VERIFIED_MODEL } from '../src/ble/EngweCommands';
import { BikeStatus } from '../src/ble/StatusParser';

// Demo data – realistic values for the E26 3.0 Pro
const DEMO_STATUS: BikeStatus = {
  speedKmh: 18.4,
  maxSpeedKmh: 32.0,
  odometer: 1247.3,
  assistLevel: 3,
  batteryPct: 78,
  lightsOn: true,
  temperatureC: 22,
  batteryHealth: 94,
  powerFlag1: 1,
  powerFlag2: 1,
  voltage: 42.56,
  rideTimeMin: 2847,
  isOn: true,
};

export default function DemoScreen() {
  const router = useRouter();
  const store = useBikeStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Inject demo state
    store.setConnectionState('connected');
    store.setModel(VERIFIED_MODEL);
    store.updateStatus(DEMO_STATUS);
    store.setPending(null);

    // Animate speed
    let tick = 0;
    intervalRef.current = setInterval(() => {
      tick++;
      const speed = 15 + Math.sin(tick * 0.3) * 8;
      store.updateStatus({
        ...DEMO_STATUS,
        speedKmh: Math.round(speed * 10) / 10,
        assistLevel: tick % 10 < 5 ? 3 : 4,
        lightsOn: tick % 20 < 15,
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      store.setConnectionState('disconnected');
    };
  }, []);

  return (
    <LinearGradient colors={['#0a0a1a', '#12122a']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Demo banner */}
        <View style={styles.banner}>
          <Ionicons name="play-circle" size={18} color="#f59e0b" />
          <Text style={styles.bannerText}>DEMO MODE · No real bike connected</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Demo Mode</Text>
          <Text style={styles.desc}>
            Simulating an ENGWE E26 3.0 Pro.{'\n'}
            All controls are shown but no real BLE commands are sent.
          </Text>

          <TouchableOpacity
            style={styles.dashButton}
            onPress={() => router.replace('/(tabs)/dashboard')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#4a9eff', '#2563eb']} style={styles.dashGradient}>
              <Ionicons name="speedometer" size={24} color="#fff" />
              <Text style={styles.dashText}>Open Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashButton}
            onPress={() => router.replace('/(tabs)/control')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#a855f7', '#7c3aed']} style={styles.dashGradient}>
              <Ionicons name="flash" size={24} color="#fff" />
              <Text style={styles.dashText}>Open Speed Control</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.75}
          >
            <Text style={styles.exitText}>Exit Demo</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2a1a00',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4a3000',
  },
  bannerText: { fontSize: 13, fontWeight: '700', color: '#f59e0b' },
  scroll: { padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#f0f0ff', marginBottom: 4 },
  desc: { fontSize: 15, color: '#8888bb', lineHeight: 24, marginBottom: 8 },
  dashButton: { borderRadius: 14, overflow: 'hidden' },
  dashGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  dashText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  exitButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a5a',
    marginTop: 8,
  },
  exitText: { color: '#5555aa', fontSize: 15, fontWeight: '600' },
});
