/**
 * ENGWE BLE Protocol – Frame builder & parser
 *
 * Frame format (big-endian):
 *   45 6E | command (2) | length (2) | payload (length) | CRC-16/MODBUS (2, high byte first) | 77 65
 *
 * CRC covers: command + length + payload
 */

import { crc16modbusBytes } from '../utils/crc16modbus';

const FRAME_START = [0x45, 0x6e]; // "En"
const FRAME_END = [0x77, 0x65];   // "we"

export type ParsedFrame = {
  command: number; // 2-byte command as number
  payload: Uint8Array;
  valid: boolean;
};

/**
 * Build a complete frame from command bytes and payload
 */
export function buildFrame(cmd: [number, number], payload: Uint8Array): Uint8Array {
  const length = payload.length;
  const crcInput = new Uint8Array(2 + 2 + length);
  crcInput[0] = cmd[0];
  crcInput[1] = cmd[1];
  crcInput[2] = (length >> 8) & 0xff;
  crcInput[3] = length & 0xff;
  crcInput.set(payload, 4);

  const [crcHigh, crcLow] = crc16modbusBytes(crcInput);

  const frame = new Uint8Array(2 + 2 + 2 + length + 2 + 2);
  let i = 0;
  frame[i++] = FRAME_START[0];
  frame[i++] = FRAME_START[1];
  frame[i++] = cmd[0];
  frame[i++] = cmd[1];
  frame[i++] = (length >> 8) & 0xff;
  frame[i++] = length & 0xff;
  for (let j = 0; j < length; j++) frame[i++] = payload[j];
  frame[i++] = crcHigh;
  frame[i++] = crcLow;
  frame[i++] = FRAME_END[0];
  frame[i++] = FRAME_END[1];

  return frame;
}

/**
 * Parse all frames from a received buffer.
 * One notification can carry multiple frames; frames can be split across notifications.
 * Returns all complete valid frames found.
 */
export function parseFrames(buffer: Uint8Array): ParsedFrame[] {
  const frames: ParsedFrame[] = [];
  let i = 0;

  while (i <= buffer.length - 8) {
    // Find frame start: 0x45 0x6E
    if (buffer[i] !== 0x45 || buffer[i + 1] !== 0x6e) {
      i++;
      continue;
    }

    if (i + 7 > buffer.length) break; // Need at least header

    const cmd1 = buffer[i + 2];
    const cmd2 = buffer[i + 3];
    const length = (buffer[i + 4] << 8) | buffer[i + 5];
    const totalSize = 2 + 2 + 2 + length + 2 + 2;

    if (i + totalSize > buffer.length) break; // Frame not complete yet

    const payloadStart = i + 6;
    const payload = buffer.slice(payloadStart, payloadStart + length);

    const crcHigh = buffer[i + 6 + length];
    const crcLow = buffer[i + 7 + length];

    // Verify end marker
    const endOk =
      buffer[i + 8 + length] === FRAME_END[0] &&
      buffer[i + 9 + length] === FRAME_END[1];

    // Verify CRC
    const crcInput = buffer.slice(i + 2, i + 6 + length);
    const [expectedHigh, expectedLow] = crc16modbusBytes(crcInput);
    const crcOk = crcHigh === expectedHigh && crcLow === expectedLow;

    frames.push({
      command: (cmd1 << 8) | cmd2,
      payload,
      valid: crcOk && endOk,
    });

    i += totalSize;
  }

  return frames;
}

/**
 * Convert a hex string to Uint8Array (for the pre-computed command bytes)
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string for logging
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
