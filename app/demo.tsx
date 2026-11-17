/**
 * Demo mode screen – simulates a connected ENGWE bike
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBikeStore } from '../src/store/bikeStore';

export default function DemoScreen() {
  const router = useRouter();
  const { isDemoMode, startDemo, stopDemo } = useBikeStore();

  function handleStartAndDashboard() {
    startDemo();
    router.replace('/(tabs)/dashboard');
  }

  function handleStartAndControl() {
    startDemo();
    router.replace('/(tabs)/control');
  }

  function handleExit() {
    stopDemo();
    router.replace('/(tabs)');
  }

  return (
    <LinearGradient colors={['#0a0a1a', '#12122a']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Demo banner */}
        <View style={styles.banner}>
          <Ionicons name="play-circle" size={18} color="#f59e0b" />
          <Text style={styles.bannerText}>DEMO MODE · Simulating ENGWE E26 3.0 Pro</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Demo Mode</Text>
          <Text style={styles.desc}>
            Simulate a connected bike without needing Bluetooth.{'\n'}
            You can view live simulated telemetry on the Dashboard and test Speed & Assist controls.
          </Text>

          <TouchableOpacity
            style={styles.dashButton}
            onPress={handleStartAndDashboard}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#4a9eff', '#2563eb']} style={styles.dashGradient}>
              <Ionicons name="speedometer" size={24} color="#fff" />
              <Text style={styles.dashText}>Start Demo & Open Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashButton}
            onPress={handleStartAndControl}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#a855f7', '#7c3aed']} style={styles.dashGradient}>
              <Ionicons name="flash" size={24} color="#fff" />
              <Text style={styles.dashText}>Start Demo & Open Speed Control</Text>
            </LinearGradient>
          </TouchableOpacity>

          {isDemoMode && (
            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleExit}
              activeOpacity={0.75}
            >
              <Text style={styles.exitText}>Exit Demo</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.75}
          >
            <Text style={styles.backText}>Back to App</Text>
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
    borderColor: '#ef4444',
    backgroundColor: '#3a0a0a',
    marginTop: 8,
  },
  exitText: { color: '#ff6666', fontSize: 15, fontWeight: '700' },
  backButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a5a',
    marginTop: 4,
  },
  backText: { color: '#5555aa', fontSize: 15, fontWeight: '600' },
});
