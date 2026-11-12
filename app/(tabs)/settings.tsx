/**
 * Settings screen – preferences, compatibility check, logs, about
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
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useBikeStore } from '../../src/store/bikeStore';
import { bleManager } from '../../src/ble/BleManager';
import { logger } from '../../src/utils/logger';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { connectionState, model, isVerified } = useBikeStore();
  const { acceptSafety } = useSettingsStore();
  const connected = connectionState === 'connected';

  async function handleDisconnect() {
    Alert.alert('Disconnect', 'Disconnect from the bike?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          await bleManager.disconnect();
        },
      },
    ]);
  }

  async function handleSaveLog() {
    const text = logger.exportText();
    const path = `${FileSystem.documentDirectory}engwe-session-${Date.now()}.txt`;
    await FileSystem.writeAsStringAsync(path, text, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType: 'text/plain' });
    } else {
      Alert.alert('Log saved', path);
    }
  }

  function SettingsRow({
    icon,
    label,
    sub,
    onPress,
    color = '#4a9eff',
    danger = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    sub?: string;
    onPress: () => void;
    color?: string;
    danger?: boolean;
  }) {
    return (
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
        <View style={[styles.rowIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.rowContent}>
          <Text style={[styles.rowLabel, danger && { color: '#ef4444' }]}>{label}</Text>
          {sub && <Text style={styles.rowSub}>{sub}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#5555aa" />
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient colors={['#0a0a1a', '#12122a']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Connection status */}
          {connected && (
            <View style={styles.connCard}>
              <View style={styles.connDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.connTitle}>Connected</Text>
                <Text style={styles.connModel} numberOfLines={1}>
                  {model ?? 'Unknown model'}
                  {isVerified ? ' ✓ Verified' : ' ⚠ Unverified'}
                </Text>
              </View>
              <TouchableOpacity onPress={handleDisconnect}>
                <Text style={styles.disconnText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Session & Logs */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>Session</Text>
            <SettingsRow
              icon="document-text-outline"
              label="Save session log"
              sub="Export and share current session log"
              color="#4a9eff"
              onPress={handleSaveLog}
            />
            <SettingsRow
              icon="play-circle-outline"
              label="Demo mode"
              sub="Simulate a connected bike"
              color="#a855f7"
              onPress={() => router.push('/demo')}
            />
          </View>

          {/* Legal */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>Legal & Safety</Text>
            <SettingsRow
              icon="warning-outline"
              label="View Safety Notice"
              sub="Speed limits, legal requirements, risks"
              color="#f59e0b"
              onPress={() => router.push('/safety-view')}
            />
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Compatibility check"
              sub="Run a read-only check on the connected bike"
              color="#22c55e"
              onPress={() => router.push('/compatibility')}
            />
          </View>

          {/* About */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>About</Text>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>ENGWE Speed Tool (Unofficial)</Text>
              <Text style={styles.aboutVersion}>v1.0.0 · iOS port</Text>
              <Text style={styles.aboutText}>
                Free, open-source (GPL-3.0).{'\n'}
                Not made by, endorsed by, or affiliated with ENGWE.{'\n\n'}
                Verified on: ENGWE E26 3.0 Pro · IoT firmware 218CAN
              </Text>
              <Text style={styles.aboutSource}>
                Source: github.com/ridelabz/engwe-speed-tool
              </Text>
            </View>
          </View>

          {/* Danger zone */}
          {connected && (
            <View style={styles.group}>
              <Text style={[styles.groupLabel, { color: '#ef4444' }]}>Connection</Text>
              <SettingsRow
                icon="power-outline"
                label="Disconnect from bike"
                color="#ef4444"
                danger
                onPress={handleDisconnect}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  connCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a2a1a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a4a2a',
    gap: 10,
  },
  connDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e' },
  connTitle: { fontSize: 15, fontWeight: '700', color: '#22c55e' },
  connModel: { fontSize: 12, color: '#8888bb', marginTop: 2 },
  disconnText: { fontSize: 13, fontWeight: '600', color: '#ef4444' },
  group: { gap: 2 },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5555aa',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a3a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a5a',
    gap: 12,
    marginBottom: 2,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#f0f0ff' },
  rowSub: { fontSize: 12, color: '#5555aa', marginTop: 2 },
  aboutCard: {
    backgroundColor: '#1a1a3a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a5a',
    gap: 6,
  },
  aboutTitle: { fontSize: 15, fontWeight: '700', color: '#f0f0ff' },
  aboutVersion: { fontSize: 12, color: '#4a9eff', fontWeight: '600' },
  aboutText: { fontSize: 13, color: '#8888bb', lineHeight: 20 },
  aboutSource: { fontSize: 12, color: '#4a9eff', marginTop: 4 },
});
