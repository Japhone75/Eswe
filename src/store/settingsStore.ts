/**
 * User preferences store – persisted with AsyncStorage
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsStore = {
  safetyAccepted: boolean;
  keepSpeed: boolean;
  keepAssist: boolean;
  darkMode: 'auto' | 'dark' | 'light';

  loadSettings: () => Promise<void>;
  acceptSafety: () => Promise<void>;
  setKeepSpeed: (v: boolean) => Promise<void>;
  setKeepAssist: (v: boolean) => Promise<void>;
  setDarkMode: (v: 'auto' | 'dark' | 'light') => Promise<void>;
};

const KEYS = {
  safetyAccepted: '@engwe:safetyAccepted',
  keepSpeed: '@engwe:keepSpeed',
  keepAssist: '@engwe:keepAssist',
  darkMode: '@engwe:darkMode',
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  safetyAccepted: false,
  keepSpeed: false,
  keepAssist: false,
  darkMode: 'auto',

  loadSettings: async () => {
    const [safety, keepSpeed, keepAssist, darkMode] = await Promise.all([
      AsyncStorage.getItem(KEYS.safetyAccepted),
      AsyncStorage.getItem(KEYS.keepSpeed),
      AsyncStorage.getItem(KEYS.keepAssist),
      AsyncStorage.getItem(KEYS.darkMode),
    ]);
    set({
      safetyAccepted: safety === 'true',
      keepSpeed: keepSpeed === 'true',
      keepAssist: keepAssist === 'true',
      darkMode: (darkMode as 'auto' | 'dark' | 'light') ?? 'auto',
    });
  },

  acceptSafety: async () => {
    await AsyncStorage.setItem(KEYS.safetyAccepted, 'true');
    set({ safetyAccepted: true });
  },

  setKeepSpeed: async (v) => {
    await AsyncStorage.setItem(KEYS.keepSpeed, String(v));
    set({ keepSpeed: v });
  },

  setKeepAssist: async (v) => {
    await AsyncStorage.setItem(KEYS.keepAssist, String(v));
    set({ keepAssist: v });
  },

  setDarkMode: async (v) => {
    await AsyncStorage.setItem(KEYS.darkMode, v);
    set({ darkMode: v });
  },
}));
