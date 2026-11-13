/**
 * BLE Manager – wraps react-native-ble-plx for ENGWE communication
 *
 * Responsibilities:
 * - Scan for ENGWE devices (name starts with "ENGWE")
 * - Connect and discover services/characteristics
 * - Request MTU 512
 * - Enable notifications on the notify characteristic
 * - Write commands to the write characteristic
 * - Parse incoming frames and dispatch to store
 */

import {
  BleManager as RNBleManager,
  Device,
  Characteristic,
  State,
  BleError,
} from 'react-native-ble-plx';
import { base64ToBytes, bytesToBase64 } from '../utils/base64';
import { parseFrames, bytesToHex } from './EngweProtocol';
import {
  ENGWE_SERVICE_UUID,
  ENGWE_WRITE_CHAR_UUID,
  ENGWE_NOTIFY_CHAR_UUID,
  ENGWE_SCAN_DURATION_MS,
  CMD_STATUS,
  CMD_IDENTITY_REPLY,
  CMD_LOCK_STATE,
  CMD_WHEEL,
  EngweCommands,
} from './EngweCommands';
import { parseStatusFrame, parseIdentityFrame } from './StatusParser';
import { useBikeStore } from '../store/bikeStore';
import { logger } from '../utils/logger';

class BleManagerService {
  private _manager: RNBleManager | null = null;
  private connectedDevice: Device | null = null;
  private notifySubscription: { remove: () => void } | null = null;
  private frameBuffer: Uint8Array = new Uint8Array(0);
  private scanTimeout: ReturnType<typeof setTimeout> | null = null;

  private get manager(): RNBleManager {
    if (!this._manager) {
      this._manager = new RNBleManager();
    }
    return this._manager;
  }

  constructor() {}

  /** Check if Bluetooth is powered on */
  async waitForBluetooth(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sub = this.manager.onStateChange((state) => {
        if (state === State.PoweredOn) {
          sub.remove();
          resolve();
        } else if (state === State.PoweredOff || state === State.Unauthorized) {
          sub.remove();
          reject(new Error(`Bluetooth state: ${state}`));
        }
      }, true);
    });
  }

  /** Start scanning for ENGWE devices */
  startScan(): void {
    const store = useBikeStore.getState();
    store.setScanning(true);
    store.clearDevices();

    this.manager.startDeviceScan(
      null,
      { allowDuplicates: false },
      (error: BleError | null, device: Device | null) => {
        if (error) {
          logger.error('Scan error', error);
          store.setScanning(false);
          store.setError(error.message);
          return;
        }
        if (device?.name?.startsWith('ENGWE')) {
          store.addDevice({
            id: device.id,
            name: device.name ?? 'ENGWE Bike',
            rssi: device.rssi ?? -100,
          });
        }
      }
    );

    // Auto-stop after ENGWE_SCAN_DURATION_MS
    this.scanTimeout = setTimeout(() => {
      this.stopScan();
    }, ENGWE_SCAN_DURATION_MS);
  }

  stopScan(): void {
    this.manager.stopDeviceScan();
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }
    useBikeStore.getState().setScanning(false);
  }

  /** Connect to a device and set up the ENGWE communication channel */
  async connect(deviceId: string): Promise<void> {
    const store = useBikeStore.getState();
    store.setConnectionState('connecting');
    this.stopScan();

    try {
      this.connectedDevice = await this.manager.connectToDevice(deviceId, {
        requestMTU: 512,
      });

      await this.connectedDevice.discoverAllServicesAndCharacteristics();

      // Enable notifications
      this.notifySubscription = this.connectedDevice.monitorCharacteristicForService(
        ENGWE_SERVICE_UUID,
        ENGWE_NOTIFY_CHAR_UUID,
        (error: BleError | null, characteristic: Characteristic | null) => {
          if (error) {
            logger.error('Notify error', error);
            return;
          }
          if (characteristic?.value) {
            this.handleNotification(characteristic.value);
          }
        }
      );

      // Read identity
      await this.writeCommand(EngweCommands.readIdentity);

      store.setConnectionState('connected');
      logger.info(`Connected to ${this.connectedDevice.name ?? deviceId}`);

      // Listen for disconnection
      this.connectedDevice.onDisconnected(() => {
        this.handleDisconnection();
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      store.setConnectionState('disconnected');
      store.setError(msg);
      logger.error('Connect error', err);
      throw err;
    }
  }

  private handleDisconnection(): void {
    this.notifySubscription?.remove();
    this.notifySubscription = null;
    this.connectedDevice = null;
    this.frameBuffer = new Uint8Array(0);
    useBikeStore.getState().setConnectionState('disconnected');
    logger.info('Disconnected from bike');
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      await this.manager.cancelDeviceConnection(this.connectedDevice.id);
    }
    this.handleDisconnection();
  }

  /** Write a pre-built command frame to the bike */
  async writeCommand(frame: Uint8Array): Promise<void> {
    if (!this.connectedDevice) throw new Error('Not connected');
    const b64 = bytesToBase64(frame);
    await this.connectedDevice.writeCharacteristicWithResponseForService(
      ENGWE_SERVICE_UUID,
      ENGWE_WRITE_CHAR_UUID,
      b64
    );
    logger.debug(`Sent: ${bytesToHex(frame)}`);
  }

  /** Handle incoming BLE notification */
  private handleNotification(base64Value: string): void {
    const bytes = base64ToBytes(base64Value);
    logger.debug(`Recv: ${bytesToHex(bytes)}`);

    // Append to buffer (frames can be split across notifications)
    const combined = new Uint8Array(this.frameBuffer.length + bytes.length);
    combined.set(this.frameBuffer);
    combined.set(bytes, this.frameBuffer.length);
    this.frameBuffer = combined;

    const frames = parseFrames(this.frameBuffer);
    // Trim consumed bytes from buffer (keep only what wasn't parsed)
    // Simple approach: reset buffer after each parse cycle
    this.frameBuffer = new Uint8Array(0);

    const store = useBikeStore.getState();

    for (const frame of frames) {
      if (!frame.valid) {
        logger.warn(`Invalid frame cmd=0x${frame.command.toString(16)}`);
        continue;
      }

      switch (frame.command) {
        case CMD_STATUS: {
          const status = parseStatusFrame(frame.payload);
          if (status) {
            store.updateStatus(status);
          }
          break;
        }

        case CMD_IDENTITY_REPLY: {
          const model = parseIdentityFrame(frame.payload);
          store.setModel(model);
          logger.info(`Bike model: ${model}`);
          break;
        }

        case CMD_LOCK_STATE: {
          // Lock state reply: payload[0] is 01 (unlocked) or 02 (locked)
          const lockVal = frame.payload[0];
          store.setLockState(lockVal === 0x02 ? 'locked' : 'unlocked');
          break;
        }

        case CMD_WHEEL:
          // Wheel start (01) / stop (02) – informational
          break;

        default:
          // Echo of a command we sent – used for confirmation
          store.handleEcho(frame.command, frame.payload);
          break;
      }
    }
  }

  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  destroy(): void {
    this.stopScan();
    this.notifySubscription?.remove();
    this.manager.destroy();
  }
}

export const bleManager = new BleManagerService();
