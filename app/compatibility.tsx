/**
 * Compatibility check screen – sends read-only identity query (0x2411 payload 0xFF01)
 * to verify model without modifying any bike setting.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBikeStore } from '../src/store/bikeStore';
import { bleManager } from '../src/ble/BleManager';
import { EngweCommands, VERIFIED_MODEL } from '../src/ble/EngweCommands';

export default function CompatibilityScreen() {
  const router = useRouter();
  const { connectionState, model, isVerified } = useBikeStore();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const connected = connectionState === 'connected';

  async function handleCheck() {
    if (!connected) return;
    setChecking(true);
    setResult(null);
    try {
      await bleManager.writeCommand(EngweCommands.readIdentity);
      // Wait a moment for identity reply
      setTimeout(() => {
        setChecking(false);
        const currentModel = useBikeStore.getState().model;
        if (currentModel) {
          setResult(currentModel);
        } else {
          setResult('No response to identity request.');
        }
      }, 1500);
    } catch (e: unknown) {
      setChecking(false);
      setResult(e instanceof Error ? e.message : 'Check failed');
    }
  }

  return (
    <LinearGradient colors={['#0a0a1a', '#12122a']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#f0f0ff" />
          </TouchableOpacity>
          <Text style={styles.title}>Compatibility Check</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={32} color="#22c55e" style={{ alignSelf: 'center', marginBottom: 8 }} />
            <Text style={styles.cardTitle}>Read-Only Verification</Text>
            <Text style={styles.cardDesc}>
              This check sends a safe read-only query (command 0x2411) to query the bike's IoT identity without altering any speeds, assist levels or power settings.
            </Text>
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.sectionLabel}>Target Model:</Text>
            <Text style={styles.modelCode}>{VERIFIED_MODEL}</Text>
            <Text style={styles.modelDesc}>ENGWE E26 3.0 Pro · IoT firmware 218CAN</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Current Connection:</Text>
            <Text style={[styles.statusText, { color: connected ? '#22c55e' : '#ef4444' }]}>
              {connected ? 'Connected' : 'Disconnected (connect via Scan tab first)'}
            </Text>

            {model && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.sectionLabel}>Detected Bike Identity:</Text>
                <Text style={styles.detectedModel}>{model}</Text>
                <Text style={[styles.verificationBadge, { color: isVerified ? '#22c55e' : '#f59e0b' }]}>
                  {isVerified ? '✓ Fully Verified Compatible' : '⚠️ Unverified Model'}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.checkBtn, (!connected || checking) && styles.disabledBtn]}
            onPress={handleCheck}
            disabled={!connected || checking}
          >
            <LinearGradient colors={connected ? ['#4a9eff', '#2563eb'] : ['#2a2a5a', '#1a1a3a']} style={styles.btnGradient}>
              {checking ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>Query Bike Identity</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {result && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          )}
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
  content: { padding: 20, gap: 16 },
  infoCard: {
    backgroundColor: '#1a1a3a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a5a',
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#f0f0ff', textAlign: 'center', marginBottom: 6 },
  cardDesc: { color: '#8888bb', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  detailsCard: {
    backgroundColor: '#12122a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a5a',
  },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#5555aa', textTransform: 'uppercase', marginBottom: 4 },
  modelCode: { fontSize: 15, fontWeight: '700', color: '#4a9eff' },
  modelDesc: { fontSize: 12, color: '#8888bb', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#2a2a5a', marginVertical: 12 },
  statusText: { fontSize: 14, fontWeight: '600' },
  detectedModel: { fontSize: 15, fontWeight: '700', color: '#f0f0ff', marginTop: 2 },
  verificationBadge: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  checkBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  disabledBtn: { opacity: 0.6 },
  btnGradient: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultBox: {
    backgroundColor: '#1a1a3a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#4a9eff',
  },
  resultText: { color: '#c0c0ee', fontSize: 13 },
});
