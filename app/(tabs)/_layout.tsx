/**
 * Tab navigator layout
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBikeStore } from '../../src/store/bikeStore';

export default function TabsLayout() {
  const connected = useBikeStore((s) => s.connectionState === 'connected');

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0a1a' },
        headerTintColor: '#f0f0ff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: '#0d0d24',
          borderTopColor: '#2a2a5a',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#4a9eff',
        tabBarInactiveTintColor: '#5555aa',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          headerTitle: 'ENGWE Speed Tool',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bluetooth" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer" size={size} color={color} />
          ),
          href: connected ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="control"
        options={{
          title: 'Control',
          headerTitle: 'Speed & Assist',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash" size={size} color={color} />
          ),
          href: connected ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
