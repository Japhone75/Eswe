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
};

export const useBikeStore = create<BikeStore>((set, get) => ({
  ...initialState,

  setConnectionState: (connectionState) => {
    set({ connectionState });
    if (connectionState === 'disconnected') {
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
    const { pending } = get();
    if (pending?.type === 'lock') {
      // Lock state confirmed, wait for status to fully confirm
    }
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

    // Assist echo: command 0x1009 (confirmation by status update above)
    if (command === 0x1009 && pending?.type === 'assist') {
      // Don't clear pending yet – wait for status to confirm
    }
  },

  reset: () => set(initialState),
}));
