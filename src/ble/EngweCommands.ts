/**
 * All ENGWE BLE command frames, pre-computed as verified in PROTOCOL.md
 * Source: https://github.com/ridelabz/engwe-speed-tool/blob/main/PROTOCOL.md
 */

import { hexToBytes } from './EngweProtocol';

export const ENGWE_SERVICE_UUID = '00001820-0000-1000-8000-00805f9b34fb';
export const ENGWE_WRITE_CHAR_UUID = '00001822-0000-1000-8000-00805f9b34fb';
export const ENGWE_NOTIFY_CHAR_UUID = '00001821-0000-1000-8000-00805f9b34fb';

// Minimum scan duration in ms (the bike advertises slowly)
export const ENGWE_SCAN_DURATION_MS = 15000;

// Status frame command
export const CMD_STATUS = 0x2a63;
// Wheel motion command
export const CMD_WHEEL = 0x2a64;
// Identity reply command
export const CMD_IDENTITY_REPLY = 0xff01;
// Lock state reply
export const CMD_LOCK_STATE = 0x0109;

// Verified bike model string
export const VERIFIED_MODEL = 'ENGWE_Omni_ebike1100EU317';

/** Speed limit commands */
export const EngweCommands = {
  speed16: hexToBytes('456E2A6500011056237765'),
  speed25: hexToBytes('456E2A6500011950E37765'),
  speed32: hexToBytes('456E2A6500012042237765'),
  speed45: hexToBytes('456E2A6500012D87E27765'),

  lightsOn: hexToBytes('456E05970001FFA4857765'),
  lightsOff: hexToBytes('456E0597000100E4C57765'),

  assist0: hexToBytes('456E1009000100CFE77765'),
  assist1: hexToBytes('456E10090001010F267765'),
  assist2: hexToBytes('456E10090001020E667765'),
  assist3: hexToBytes('456E1009000103CEA77765'),
  assist4: hexToBytes('456E10090001040CE67765'),
  assist5: hexToBytes('456E1009000105CC277765'),

  lock: hexToBytes('456E0108000102F19B7765'),
  unlock: hexToBytes('456E0108000101F0DB7765'),

  readIdentity: hexToBytes('456E24110002FF010CDB7765'),
};

export const speedCommands: Record<number, Uint8Array> = {
  16: EngweCommands.speed16,
  25: EngweCommands.speed25,
  32: EngweCommands.speed32,
  45: EngweCommands.speed45,
};

export const assistCommands: Record<number, Uint8Array> = {
  0: EngweCommands.assist0,
  1: EngweCommands.assist1,
  2: EngweCommands.assist2,
  3: EngweCommands.assist3,
  4: EngweCommands.assist4,
  5: EngweCommands.assist5,
};

export const SPEED_OPTIONS = [16, 25, 32, 45] as const;
export type SpeedOption = (typeof SPEED_OPTIONS)[number];
