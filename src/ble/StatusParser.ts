/**
 * Parse the ENGWE 54-byte status frame (command 0x2A63)
 * All multi-byte fields are big-endian, unsigned.
 *
 * Offsets from PROTOCOL.md:
 * | Offset | Size | Value        | Scale   |
 * |--------|------|--------------|---------|
 * |  0     | 2    | speed        | 0.1 km/h|
 * |  2     | 2    | max speed    | 0.1 km/h|
 * | 16     | 2    | odometer     | 0.1 km  |
 * | 18     | 1    | assist level | 1       |
 * | 21     | 1    | battery %    | 1 %     |
 * | 28     | 1    | lights       | 00=off, FF=on |
 * | 36     | 1    | temperature  | 1 °C   |
 * | 37     | 1    | battery health | 1 %  |
 * | 39     | 1    | power flag 1 | 00=off |
 * | 40     | 1    | power flag 2 | 00=off |
 * | 42     | 2    | voltage      | 0.01 V  |
 * | 48     | 2    | total ride time | 1 min |
 */

export type BikeStatus = {
  speedKmh: number;        // current speed in km/h
  maxSpeedKmh: number;     // max speed since power-on
  odometer: number;        // km
  assistLevel: number;     // 0-5
  batteryPct: number;      // 0-100 %
  lightsOn: boolean;
  temperatureC: number;
  batteryHealth: number;   // 0-100 %
  powerFlag1: number;      // 0x00 = off
  powerFlag2: number;
  voltage: number;         // V
  rideTimeMin: number;     // total ride time in minutes
  isOn: boolean;           // true if both power flags != 0
};

const EXPECTED_PAYLOAD_LENGTH = 54;

export function parseStatusFrame(payload: Uint8Array): BikeStatus | null {
  if (payload.length < EXPECTED_PAYLOAD_LENGTH) return null;

  const speed = ((payload[0] << 8) | payload[1]) * 0.1;
  const maxSpeed = ((payload[2] << 8) | payload[3]) * 0.1;
  const odometer = ((payload[16] << 8) | payload[17]) * 0.1;
  const assistLevel = payload[18];
  const battery = payload[21];
  const lights = payload[28] === 0xff;
  const temperature = payload[36];
  const batteryHealth = payload[37];
  const powerFlag1 = payload[39];
  const powerFlag2 = payload[40];
  const voltage = ((payload[42] << 8) | payload[43]) * 0.01;
  const rideTime = (payload[48] << 8) | payload[49];

  return {
    speedKmh: Math.round(speed * 10) / 10,
    maxSpeedKmh: Math.round(maxSpeed * 10) / 10,
    odometer: Math.round(odometer * 10) / 10,
    assistLevel,
    batteryPct: battery,
    lightsOn: lights,
    temperatureC: temperature,
    batteryHealth,
    powerFlag1,
    powerFlag2,
    voltage: Math.round(voltage * 100) / 100,
    rideTimeMin: rideTime,
    isOn: powerFlag1 !== 0 && powerFlag2 !== 0,
  };
}

/**
 * Parse the identity frame (command 0xFF01) – 54-byte payload
 * Returns the model string (ASCII, NUL-terminated).
 * Serial number is discarded on arrival (privacy).
 */
export function parseIdentityFrame(payload: Uint8Array): string {
  // Model string is at offset 0, NUL-terminated ASCII
  let end = payload.indexOf(0);
  if (end < 0) end = payload.length;
  return String.fromCharCode(...payload.slice(0, end));
}
