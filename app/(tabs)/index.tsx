/**
 * Scanner screen – finds ENGWE bikes via BLE and connects
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBikeStore, DiscoveredDevice } from '../../src/store/bikeStore';
import { bleManager } from '../../src/ble/BleManager';
import * as Haptics from 'expo-haptics';

export default function ScannerScreen() {
  const router = useRouter();
  const { devices, scanning, connectionState, error } = useBikeStore();
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    // Request BLE permissions on mount
    if (Platform.OS === 'android') {
      // On Android, permissions are declared in the manifest
    }
    return () => {
      bleManager.stopScan();
    };
  }, []);

  useEffect(() => {
    if (connectionState === 'connected') {
      router.replace('/(tabs)/dashboard');
    }
  }, [connectionState]);

  async function handleScan() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await bleManager.waitForBluetooth();
      bleManager.startScan();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Bluetooth unavailable';
      Alert.alert('Bluetooth Error', msg);
    }
  }

  async function handleConnect(device: DiscoveredDevice) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConnecting(device.id);
    try {
      await bleManager.connect(device.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not connect';
      Alert.alert('Connection Failed', msg);
    } finally {
      setConnecting(null);
    }
  }

  function rssiToSignal(rssi: number): { label: string; color: string } {
    if (rssi >= -60) return { label: 'Excellent', color: '#22c55e' };
    if (rssi >= -75) return { label: 'Good', color: '#4a9eff' };
    if (rssi >= -85) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Weak', color: '#ef4444' };
  }

  const renderDevice = ({ item }: { item: DiscoveredDevice }) => {
    const signal = rssiToSignal(item.rssi);
    const isConnecting = connecting === item.id;

    return (
      <TouchableOpacity
        style={styles.deviceCard}
        onPress={() => handleConnect(item)}
        disabled={!!connecting}
        activeOpacity={0.8}
      >
        <View style={styles.deviceIcon}>
          <Ionicons name="bicycle" size={28} color="#4a9eff" />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <View style={styles.deviceMeta}>
            <View style={[styles.signalDot, { backgroundColor: signal.color }]} />
            <Text style={[styles.signalLabel, { color: signal.color }]}>
              {signal.label}
            </Text>
            <Text style={styles.rssiText}>{item.rssi} dBm</Text>
          </View>
        </View>
        {isConnecting ? (
          <ActivityIndicator color="#4a9eff" size="small" />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#5555aa" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#0a0a1a', '#12122a']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="flash" size={24} color="#4a9eff" />
            </View>
            <Text style={styles.appName}>ENGWE Speed Tool</Text>
          </View>
          <Text style={styles.tagline}>Unofficial · Open Source · GPL-3.0</Text>
        </View>

        {/* Scan button */}
        <View style={styles.scanSection}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={scanning ? () => bleManager.stopScan() : handleScan}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={scanning ? ['#1a1a4a', '#12122a'] : ['#4a9eff', '#2563eb']}
              style={styles.scanGradient}
            >
              {scanning ? (
                <>
                  <ActivityIndicator color="#4a9eff" size="large" style={{ marginBottom: 8 }} />
                  <Text style={styles.scanButtonText}>Scanning for bikes…</Text>
                  <Text style={styles.scanHint}>Tap to stop (up to 15 s)</Text>
                </>
              ) : (
                <>
                  <Ionicons name="bluetooth" size={48} color="#fff" style={{ marginBottom: 8 }} />
                  <Text style={styles.scanButtonText}>Scan for ENGWE Bike</Text>
                  <Text style={styles.scanHint}>Bluetooth LE · ~15 seconds</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Device list */}
        {devices.length > 0 && (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>
              {devices.length} bike{devices.length !== 1 ? 's' : ''} found
            </Text>
            <FlatList
              data={devices}
              keyExtractor={(d) => d.id}
              renderItem={renderDevice}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Empty state */}
        {!scanning && devices.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bicycle-outline" size={64} color="#2a2a5a" />
            <Text style={styles.emptyTitle}>No bikes found yet</Text>
            <Text style={styles.emptyText}>
              Make sure your ENGWE bike is on and within range.{'\n'}
              The bike advertises slowly – give it up to 15 seconds.
            </Text>
          </View>
        )}

        {/* Demo mode */}
        <TouchableOpacity style={styles.demoButton} onPress={() => router.push('/demo')}>
          <Ionicons name="play-circle-outline" size={18} color="#5555aa" />
          <Text style={styles.demoText}>Demo mode (no bike needed)</Text>
        </TouchableOpacity>

        {error && (
          <View style={styles.errorBar}>
            <Ionicons name="warning-outline" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1a1a3a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a5a',
  },
  appName: { fontSize: 22, fontWeight: '800', color: '#f0f0ff' },
  tagline: { fontSize: 12, color: '#5555aa', letterSpacing: 0.5 },
  scanSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  scanButton: { borderRadius: 20, overflow: 'hidden' },
  scanGradient: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 4,
  },
  scanButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  scanHint: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  listSection: { flex: 1, paddingHorizontal: 24 },
  listTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8888bb',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  listContent: { gap: 8 },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a3a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a5a',
    gap: 12,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0f0f30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 16, fontWeight: '700', color: '#f0f0ff', marginBottom: 4 },
  deviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  signalDot: { width: 7, height: 7, borderRadius: 4 },
  signalLabel: { fontSize: 13, fontWeight: '600' },
  rssiText: { fontSize: 12, color: '#5555aa' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#4444aa', marginTop: 8 },
  emptyText: {
    fontSize: 14,
    color: '#5555aa',
    textAlign: 'center',
    lineHeight: 22,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  demoText: { color: '#5555aa', fontSize: 14 },
  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#5a1a1a',
    padding: 12,
    paddingHorizontal: 20,
  },
  errorText: { color: '#ff7777', fontSize: 13, flex: 1 },
});
