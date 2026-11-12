/**
 * Control screen – Speed limit and assist level controls
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBikeStore } from '../../src/store/bikeStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { bleManager } from '../../src/ble/BleManager';
import { speedCommands, assistCommands, SPEED_OPTIONS, SpeedOption } from '../../src/ble/EngweCommands';
import * as Haptics from 'expo-haptics';

const SPEED_INFO: Record<number, { color: string; gradient: [string, string]; warn: string | null }> = {
  16: { color: '#22c55e', gradient: ['#064e1e', '#0a2a14'], warn: null },
  25: { color: '#4a9eff', gradient: ['#0a1e3a', '#071428'], warn: null },
  32: { color: '#f59e0b', gradient: ['#3a2000', '#241400'],
    warn: 'Above 25 km/h: use only where legal (e.g. private land).' },
  45: { color: '#ef4444', gradient: ['#3a0a0a', '#240606'],
    warn: 'Above 25 km/h: use only where legal (e.g. private land). Very high speed – extra caution required.' },
};

export default function ControlScreen() {
  const { status, confirmedSpeedLimit, confirmedAssist, connectionState } = useBikeStore();
  const { keepSpeed, keepAssist, setKeepSpeed, setKeepAssist } = useSettingsStore();
  const [sendingSpeed, setSendingSpeed] = useState<number | null>(null);
  const [sendingAssist, setSendingAssist] = useState<number | null>(null);

  const connected = connectionState === 'connected';

  async function handleSetSpeed(speed: SpeedOption) {
    if (!connected) return;
    if (speed > 25) {
      await new Promise<void>((resolve, reject) => {
        Alert.alert(
          `${speed} km/h – Speed Warning`,
          SPEED_INFO[speed].warn ?? '',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => reject() },
            { text: 'Set anyway', style: 'destructive', onPress: () => resolve() },
          ]
        );
      }).catch(() => null);
      // User cancelled
      if (!connected) return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSendingSpeed(speed);
    try {
      await bleManager.writeCommand(speedCommands[speed]);
      useBikeStore.getState().setPending({ type: 'speed', value: speed, sentAt: Date.now() });
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to set speed');
    } finally {
      setSendingSpeed(null);
    }
  }

  async function handleSetAssist(level: number) {
    if (!connected) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSendingAssist(level);
    try {
      await bleManager.writeCommand(assistCommands[level]);
      useBikeStore.getState().setPending({ type: 'assist', value: level, sentAt: Date.now() });
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to set assist level');
    } finally {
      setSendingAssist(null);
    }
  }

  const currentSpeed = confirmedSpeedLimit;
  const currentAssist = status?.assistLevel ?? confirmedAssist ?? 0;

  return (
    <LinearGradient colors={['#0a0a1a', '#12122a']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Speed limit section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="speedometer" size={20} color="#4a9eff" />
              <Text style={styles.sectionTitle}>Speed Limit</Text>
              {currentSpeed !== null && (
                <View style={[styles.currentBadge, { borderColor: SPEED_INFO[currentSpeed]?.color ?? '#4a9eff' }]}>
                  <Text style={[styles.currentBadgeText, { color: SPEED_INFO[currentSpeed]?.color ?? '#4a9eff' }]}>
                    Set: {currentSpeed} km/h ✓
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.speedGrid}>
              {SPEED_OPTIONS.map((speed) => {
                const info = SPEED_INFO[speed];
                const isActive = currentSpeed === speed;
                const isSending = sendingSpeed === speed;

                return (
                  <TouchableOpacity
                    key={speed}
                    onPress={() => handleSetSpeed(speed)}
                    activeOpacity={0.8}
                    disabled={!connected || !!sendingSpeed}
                    style={styles.speedButtonWrapper}
                  >
                    <LinearGradient
                      colors={
                        isActive
                          ? info.gradient
                          : ['#1a1a3a', '#12122a']
                      }
                      style={[
                        styles.speedButton,
                        {
                          borderColor: isActive ? info.color : '#2a2a5a',
                          borderWidth: isActive ? 2 : 1,
                        },
                      ]}
                    >
                      <Text style={[styles.speedNum, { color: info.color }]}>{speed}</Text>
                      <Text style={[styles.speedKmh, { color: isActive ? info.color : '#5555aa' }]}>km/h</Text>
                      {speed === 25 && (
                        <View style={styles.legalBadge}>
                          <Text style={styles.legalText}>Legal EU</Text>
                        </View>
                      )}
                      {isSending && (
                        <View style={styles.sendingOverlay}>
                          <Ionicons name="sync" size={20} color="#fff" />
                        </View>
                      )}
                      {isActive && !isSending && (
                        <Ionicons name="checkmark-circle" size={18} color={info.color} style={styles.checkIcon} />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.keepRow}>
              <View style={styles.keepInfo}>
                <Ionicons name="repeat" size={16} color="#8888bb" />
                <View>
                  <Text style={styles.keepLabel}>Keep this speed</Text>
                  <Text style={styles.keepSub}>Re-apply on reconnect and power-on</Text>
                </View>
              </View>
              <Switch
                value={keepSpeed}
                onValueChange={setKeepSpeed}
                trackColor={{ false: '#2a2a5a', true: '#1a4a2a' }}
                thumbColor={keepSpeed ? '#22c55e' : '#5555aa'}
              />
            </View>
          </View>

          {/* Assist level section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash" size={20} color="#a855f7" />
              <Text style={styles.sectionTitle}>Assist Level</Text>
              <Text style={styles.currentAssistText}>Current: {currentAssist}</Text>
            </View>

            <View style={styles.assistGrid}>
              {[0, 1, 2, 3, 4, 5].map((level) => {
                const isActive = currentAssist === level;
                const isSending = sendingAssist === level;
                return (
                  <TouchableOpacity
                    key={level}
                    onPress={() => handleSetAssist(level)}
                    activeOpacity={0.8}
                    disabled={!connected || !!sendingAssist}
                    style={[
                      styles.assistButton,
                      {
                        backgroundColor: isActive ? '#1a0a3a' : '#1a1a3a',
                        borderColor: isActive ? '#a855f7' : '#2a2a5a',
                        borderWidth: isActive ? 2 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.assistNum, { color: isActive ? '#a855f7' : '#8888bb' }]}>
                      {level}
                    </Text>
                    {level === 0 && <Text style={styles.assistSub}>Off</Text>}
                    {isActive && !isSending && (
                      <Ionicons name="checkmark" size={14} color="#a855f7" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.assistBarContainer}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.assistBarSegment,
                    { backgroundColor: i <= currentAssist ? '#a855f7' : '#2a2a5a' },
                  ]}
                />
              ))}
            </View>

            <View style={styles.keepRow}>
              <View style={styles.keepInfo}>
                <Ionicons name="repeat" size={16} color="#8888bb" />
                <View>
                  <Text style={styles.keepLabel}>Keep this assist level</Text>
                  <Text style={styles.keepSub}>Re-apply on reconnect (at 0 km/h)</Text>
                </View>
              </View>
              <Switch
                value={keepAssist}
                onValueChange={setKeepAssist}
                trackColor={{ false: '#2a2a5a', true: '#2a0a4a' }}
                thumbColor={keepAssist ? '#a855f7' : '#5555aa'}
              />
            </View>
          </View>

          {/* Info note */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color="#5555aa" />
            <Text style={styles.infoText}>
              Speed changes return to 25 km/h when the bike is switched off and on.
              Tap 25 km/h before finishing your ride.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  section: {
    backgroundColor: '#1a1a3a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a5a',
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#f0f0ff', flex: 1 },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  currentBadgeText: { fontSize: 12, fontWeight: '700' },
  currentAssistText: { fontSize: 13, color: '#8888bb', fontWeight: '600' },
  speedGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  speedButtonWrapper: { flex: 1 },
  speedButton: {
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
    gap: 2,
  },
  speedNum: { fontSize: 28, fontWeight: '900' },
  speedKmh: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  legalBadge: {
    backgroundColor: '#1a3a1a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  legalText: { fontSize: 10, color: '#22c55e', fontWeight: '700' },
  checkIcon: { position: 'absolute', top: 8, right: 8 },
  sendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  keepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#2a2a5a',
    gap: 12,
  },
  keepInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 },
  keepLabel: { fontSize: 14, fontWeight: '600', color: '#c0c0ee' },
  keepSub: { fontSize: 11, color: '#5555aa', marginTop: 2 },
  assistGrid: { flexDirection: 'row', gap: 6 },
  assistButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 2,
  },
  assistNum: { fontSize: 20, fontWeight: '800' },
  assistSub: { fontSize: 10, color: '#5555aa', fontWeight: '600' },
  assistBarContainer: {
    flexDirection: 'row',
    gap: 4,
    height: 4,
    marginTop: -4,
  },
  assistBarSegment: {
    flex: 1,
    borderRadius: 2,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#121230',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a5a',
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, color: '#5555aa', fontSize: 13, lineHeight: 20 },
});
