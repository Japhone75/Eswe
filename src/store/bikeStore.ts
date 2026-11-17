/**
 * Global bike state store – Zustand
 *
 * Tracks the full bike state: connection, BLE devices found,
 * live status (speed, battery, etc.), and pending confirmations.
 */

import { create } from 'zustand';
import { BikeStatus } from '../ble/StatusParser';
import { VERIFIED_MODEL } from '../ble/EngweCommands';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';
export type LockState = 'locked' | 'unlocked' | 'unknown';

export type DiscoveredDevice = {
  id: string;
  name: string;
  rssi: number;
};

/** What commands are we waiting confirmation for */
export type PendingConfirmation = {
  type: 'speed' | 'lights' | 'assist' | 'lock';
  value: number | boolean;
  sentAt: number;
};

type BikeStore = {
  // Connection
  connectionState: ConnectionState;
  scanning: boolean;
  devices: DiscoveredDevice[];
  error: string | null;
  connectedDeviceId: string | null;

  // Bike identity
  model: string | null;
  isVerified: boolean;

  // Live status
  status: BikeStatus | null;
  lockState: LockState;

  // Confirmed settings (shown after echo confirmation)
  confirmedSpeedLimit: number | null;
  confirmedLights: boolean | null;
  confirmedAssist: number | null;

  // Pending confirmations
  pending: PendingConfirmation | null;

  // Demo mode
  isDemoMode: boolean;
  startDemo: () => void;
  stopDemo: () => void;

  // Actions
  setConnectionState: (state: ConnectionState) => void;
  setScanning: (scanning: boolean) => void;
  addDevice: (device: DiscoveredDevice) => void;
  clearDevices: () => void;
  setError: (error: string | null) => void;
  setModel: (model: string) => void;
  updateStatus: (status: BikeStatus) => void;
  setLockState: (state: LockState) => void;
  setPending: (pending: PendingConfirmation | null) => void;
  handleEcho: (command: number, payload: Uint8Array) => void;
  reset: () => void;
};

let demoTimer: ReturnType<typeof setInterval> | null = null;

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

const initialState = {
  connectionState: 'disconnected' as ConnectionState,
  scanning: false,
  devices: [],
  error: null,
  connectedDeviceId: null,
  model: null,
  isVerified: false,
  status: null,
  lockState: 'unknown' as LockState,
  confirmedSpeedLimit: null,
  confirmedLights: null,
  confirmedAssist: null,
  pending: null,
  isDemoMode: false,
};

export const useBikeStore = create<BikeStore>()((set, get) => ({
  ...initialState,

  startDemo: () => {
    if (demoTimer) clearInterval(demoTimer);
    set({
      isDemoMode: true,
      connectionState: 'connected',
      model: VERIFIED_MODEL,
      isVerified: true,
      status: { ...DEMO_STATUS },
      confirmedSpeedLimit: 25,
      confirmedAssist: 3,
      confirmedLights: true,
    });

    let tick = 0;
    demoTimer = setInterval(() => {
      tick++;
      const speed = 18 + Math.sin(tick * 0.4) * 8;
      const cur = get().status || DEMO_STATUS;
      set({
        status: {
          ...cur,
          speedKmh: Math.max(0, Math.round(speed * 10) / 10),
        },
      });
    }, 1000);
  },

  stopDemo: () => {
    if (demoTimer) {
      clearInterval(demoTimer);
      demoTimer = null;
    }
    set({
      isDemoMode: false,
      connectionState: 'disconnected',
      status: null,
      model: null,
      isVerified: false,
      confirmedSpeedLimit: null,
      confirmedAssist: null,
      confirmedLights: null,
      connectedDeviceId: null,
    });
  },

  setConnectionState: (connectionState) => {
    set({ connectionState });
    if (connectionState === 'disconnected') {
      if (demoTimer) {
        clearInterval(demoTimer);
        demoTimer = null;
      }
      set({
        status: null,
        model: null,
        isVerified: false,
        lockState: 'unknown',
        confirmedSpeedLimit: null,
        confirmedLights: null,
        confirmedAssist: null,
        pending: null,
        connectedDeviceId: null,
        isDemoMode: false,
      });
    }
  },

  setScanning: (scanning) => set({ scanning }),

  addDevice: (device) =>
    set((state) => ({
      devices: state.devices.some((d) => d.id === device.id)
        ? state.devices.map((d) => (d.id === device.id ? device : d))
        : [...state.devices, device],
    })),

  clearDevices: () => set({ devices: [] }),

  setError: (error) => set({ error }),

  setModel: (model) =>
    set({ model, isVerified: model === VERIFIED_MODEL }),

  updateStatus: (status) => {
    const prev = get().status;
    set({ status });

    // Detect power-on (both flags went from 0 to non-0)
    if (
      prev &&
      (!prev.isOn && status.isOn)
    ) {
      // Reset confirmed speed on power-on (bike resets to 25 km/h)
      set({ confirmedSpeedLimit: 25 });
    }

    // Confirm assist level after echo + status shows new level
    const { pending } = get();
    if (
      pending?.type === 'assist' &&
      typeof pending.value === 'number' &&
      status.assistLevel === pending.value
    ) {
      set({ confirmedAssist: pending.value, pending: null });
    }
  },

  setLockState: (lockState) => {
    set({ lockState });
  },

  setPending: (pending) => set({ pending }),

  handleEcho: (command, payload) => {
    const { pending } = get();

    // Speed echo: command 0x2A65 with the speed byte in payload[0]
    if (command === 0x2a65 && payload.length >= 1) {
      const speed = payload[0];
      set({ confirmedSpeedLimit: speed, pending: null });
      return;
    }

    // Lights echo: command 0x0597
    if (command === 0x0597 && payload.length >= 1) {
      const on = payload[0] === 0xff;
      set({ confirmedLights: on, pending: null });
      return;
    }

    // Assist echo: command 0x1009
    if (command === 0x1009 && pending?.type === 'assist') {
      // Handled by updateStatus
    }
  },

  reset: () => {
    if (demoTimer) {
      clearInterval(demoTimer);
      demoTimer = null;
    }
    set(initialState);
  },
}));
