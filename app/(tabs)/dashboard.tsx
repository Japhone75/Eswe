/**
 * Dashboard screen – shows live bike telemetry
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBikeStore } from '../../src/store/bikeStore';
import { bleManager } from '../../src/ble/BleManager';
import { EngweCommands } from '../../src/ble/EngweCommands';
import * as Haptics from 'expo-haptics';

export default function DashboardScreen() {
  const { status, model, isVerified, connectionState, confirmedSpeedLimit, confirmedLights } =
    useBikeStore();

  const connected = connectionState === 'connected';

  async function handleToggleLights() {
    if (!status) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await bleManager.writeCommand(status.lightsOn ? EngweCommands.lightsOff : EngweCommands.lightsOn);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  }

  async function handlePower() {
    if (!status) return;
    const isOn = status.isOn;
    if (isOn && status.speedKmh > 0) {
      Alert.alert('Cannot turn off', 'The bike is moving. Stop before turning off.');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await bleManager.writeCommand(isOn ? EngweCommands.lock : EngweCommands.unlock);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  }

  function batteryColor(pct: number): string {
    if (pct > 50) return '#22c55e';
    if (pct > 20) return '#f59e0b';
    return '#ef4444';
  }

  function batteryIcon(pct: number): keyof typeof Ionicons.glyphMap {
    if (pct > 80) return 'battery-full';
    if (pct > 40) return 'battery-half';
    return 'battery-dead';
  }

  if (!connected || !status) {
    return (
      <LinearGradient colors={['#0a0a1a', '#12122a']} style={{ flex: 1 }}>
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="bluetooth-outline" size={64} color="#2a2a5a" />
          <Text style={styles.noConnText}>Not connected</Text>
          <Text style={styles.noConnSub}>Go to Scan to find your bike</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const { speedKmh, maxSpeedKmh, odometer, assistLevel, batteryPct, lightsOn,
    temperatureC, batteryHealth, voltage, rideTimeMin, isOn } = status;

  const speedLimit = confirmedSpeedLimit ?? 25;
  const speedLimitColor =
    speedLimit <= 25 ? '#22c55e' : speedLimit === 32 ? '#f59e0b' : '#ef4444';

  const hours = Math.floor(rideTimeMin / 60);
  const mins = rideTimeMin % 60;
  const rideTimeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <LinearGradient colors={['#0a0a1a', '#12122a']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Model & verification badge */}
          <View style={styles.modelRow}>
            <Text style={styles.modelName} numberOfLines={1}>
              {model ?? 'Unknown Model'}
            </Text>
            <View style={[styles.badge, { backgroundColor: isVerified ? '#0a2a0a' : '#2a2000' }]}>
              <Ionicons
                name={isVerified ? 'checkmark-circle' : 'help-circle'}
                size={14}
                color={isVerified ? '#22c55e' : '#f59e0b'}
              />
              <Text style={[styles.badgeText, { color: isVerified ? '#22c55e' : '#f59e0b' }]}>
                {isVerified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
          </View>

          {/* Speed gauge – main card */}
          <View style={styles.speedCard}>
            <LinearGradient
              colors={['#1a1a3a', '#12122a']}
              style={styles.speedGradient}
            >
              <Text style={styles.speedLabel}>Current Speed</Text>
              <View style={styles.speedRow}>
                <Text style={styles.speedValue}>{speedKmh.toFixed(1)}</Text>
                <Text style={styles.speedUnit}>km/h</Text>
              </View>
              <View style={styles.speedMeta}>
                <View style={styles.speedMetaItem}>
                  <Ionicons name="trending-up" size={14} color="#8888bb" />
                  <Text style={styles.speedMetaText}>Max: {maxSpeedKmh.toFixed(1)} km/h</Text>
                </View>
                <View style={[styles.limitBadge, { backgroundColor: `${speedLimitColor}20`, borderColor: speedLimitColor }]}>
                  <Text style={[styles.limitText, { color: speedLimitColor }]}>
                    Limit: {speedLimit} km/h
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Stats grid */}
          <View style={styles.grid}>
            {/* Battery */}
            <View style={styles.statCard}>
              <Ionicons name={batteryIcon(batteryPct)} size={24} color={batteryColor(batteryPct)} />
              <Text style={styles.statValue}>{batteryPct}%</Text>
              <Text style={styles.statLabel}>Battery</Text>
              <View style={styles.batteryBar}>
                <View
                  style={[
                    styles.batteryFill,
                    {
                      width: `${batteryPct}%`,
                      backgroundColor: batteryColor(batteryPct),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Assist level */}
            <View style={styles.statCard}>
              <Ionicons name="flash" size={24} color="#4a9eff" />
              <Text style={styles.statValue}>{assistLevel}</Text>
              <Text style={styles.statLabel}>Assist Level</Text>
              <View style={styles.dotRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      { backgroundColor: i <= assistLevel ? '#4a9eff' : '#2a2a5a' },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Odometer */}
            <View style={styles.statCard}>
              <Ionicons name="speedometer-outline" size={24} color="#a855f7" />
              <Text style={styles.statValue}>{odometer.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Odometer (km)</Text>
            </View>

            {/* Ride time */}
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color="#22c55e" />
              <Text style={styles.statValue}>{rideTimeStr}</Text>
              <Text style={styles.statLabel}>Total Ride Time</Text>
            </View>

            {/* Temperature */}
            <View style={styles.statCard}>
              <Ionicons name="thermometer-outline" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{temperatureC}°C</Text>
              <Text style={styles.statLabel}>Temperature</Text>
            </View>

            {/* Voltage */}
            <View style={styles.statCard}>
              <Ionicons name="flash-outline" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{voltage.toFixed(2)}V</Text>
              <Text style={styles.statLabel}>Voltage</Text>
            </View>

            {/* Battery health */}
            <View style={styles.statCard}>
              <Ionicons name="heart-outline" size={24} color={batteryColor(batteryHealth)} />
              <Text style={styles.statValue}>{batteryHealth}%</Text>
              <Text style={styles.statLabel}>Batt. Health</Text>
            </View>
          </View>

          {/* Quick action buttons */}
          <View style={styles.actionsRow}>
            {/* Lights */}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: lightsOn ? '#2a2000' : '#1a1a3a' }]}
              onPress={handleToggleLights}
              activeOpacity={0.8}
            >
              <Ionicons
                name={lightsOn ? 'sunny' : 'sunny-outline'}
                size={28}
                color={lightsOn ? '#fbbf24' : '#5555aa'}
              />
              <Text style={[styles.actionLabel, { color: lightsOn ? '#fbbf24' : '#5555aa' }]}>
                Lights {lightsOn ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>

            {/* Power */}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: isOn ? '#2a0a0a' : '#0a2a0a' }]}
              onPress={handlePower}
              activeOpacity={0.8}
            >
              <Ionicons
                name="power"
                size={28}
                color={isOn ? '#ef4444' : '#22c55e'}
              />
              <Text style={[styles.actionLabel, { color: isOn ? '#ef4444' : '#22c55e' }]}>
                {isOn ? 'Turn Off' : 'Turn On'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  noConnText: { fontSize: 20, fontWeight: '700', color: '#4444aa', marginTop: 16 },
  noConnSub: { color: '#5555aa', marginTop: 8 },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  modelName: { fontSize: 15, fontWeight: '600', color: '#8888bb', flex: 1, marginRight: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  speedCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a5a' },
  speedGradient: { padding: 24, alignItems: 'center' },
  speedLabel: { fontSize: 13, color: '#8888bb', fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  speedRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  speedValue: { fontSize: 80, fontWeight: '900', color: '#f0f0ff', lineHeight: 88 },
  speedUnit: { fontSize: 24, fontWeight: '600', color: '#8888bb', paddingBottom: 12 },
  speedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  speedMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  speedMetaText: { fontSize: 13, color: '#8888bb' },
  limitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  limitText: { fontSize: 12, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1a3a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a5a',
    gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#f0f0ff' },
  statLabel: { fontSize: 11, color: '#5555aa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  batteryBar: {
    height: 4,
    backgroundColor: '#2a2a5a',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  batteryFill: { height: '100%', borderRadius: 2 },
  dotRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2a5a',
    gap: 8,
  },
  actionLabel: { fontSize: 13, fontWeight: '700' },
});
