/**
 * ENGWE Speed Tool – Design tokens & theme
 * Dark-first design inspired by the original Android app
 */

export const Colors = {
  dark: {
    background: '#0a0a1a',
    surface: '#12122a',
    surfaceElevated: '#1a1a3a',
    card: '#1e1e40',
    border: '#2a2a5a',
    primary: '#4a9eff',
    primaryDark: '#2a7edf',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    dangerDark: '#b91c1c',
    text: '#f0f0ff',
    textSecondary: '#8888bb',
    textMuted: '#5555aa',
    speedLegal: '#22c55e',       // ≤ 25 km/h
    speedWarning: '#f59e0b',     // 32 km/h
    speedDanger: '#ef4444',      // 45 km/h
    batteryFull: '#22c55e',
    batteryMid: '#f59e0b',
    batteryLow: '#ef4444',
    lightsOn: '#fbbf24',
    lightsOff: '#3a3a6a',
    verified: '#22c55e',
    unverified: '#f59e0b',
    tabBar: '#0d0d24',
    tabBarActive: '#4a9eff',
    tabBarInactive: '#5555aa',
  },
  light: {
    background: '#f0f2ff',
    surface: '#ffffff',
    surfaceElevated: '#f8f9ff',
    card: '#ffffff',
    border: '#d0d5ff',
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    dangerDark: '#991b1b',
    text: '#0a0a3a',
    textSecondary: '#4a4a9a',
    textMuted: '#8888cc',
    speedLegal: '#16a34a',
    speedWarning: '#d97706',
    speedDanger: '#dc2626',
    batteryFull: '#16a34a',
    batteryMid: '#d97706',
    batteryLow: '#dc2626',
    lightsOn: '#d97706',
    lightsOff: '#c0c5e8',
    verified: '#16a34a',
    unverified: '#d97706',
    tabBar: '#ffffff',
    tabBarActive: '#2563eb',
    tabBarInactive: '#8888cc',
  },
};

export type ColorScheme = typeof Colors.dark;

export const Typography = {
  fontFamily: {
    regular: 'System',
    mono: 'Courier New',
  },
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
    '5xl': 64,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};
