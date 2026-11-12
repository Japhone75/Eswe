import { crc16modbus } from '../src/utils/crc16modbus';
import { buildFrame, parseFrames, hexToBytes, bytesToHex } from '../src/ble/EngweProtocol';
import { EngweCommands } from '../src/ble/EngweCommands';
import { parseStatusFrame } from '../src/ble/StatusParser';

describe('ENGWE Protocol & CRC', () => {
  test('CRC-16 MODBUS matches documented command frames', () => {
    // CRC covers: command (2) + length (2) + payload
    // Speed 16: 2A 65 00 01 10 -> CRC in frame is 56 23 (highByte = 56, lowByte = 23)
    const speed16CrcData = hexToBytes('2A65000110');
    const crc16 = crc16modbus(speed16CrcData);
    expect((crc16 >> 8) & 0xff).toBe(0x56);
    expect(crc16 & 0xff).toBe(0x23);

    // Speed 25: 2A 65 00 01 19 -> CRC in frame is 50 E3
    const speed25CrcData = hexToBytes('2A65000119');
    const crc25 = crc16modbus(speed25CrcData);
    expect((crc25 >> 8) & 0xff).toBe(0x50);
    expect(crc25 & 0xff).toBe(0xe3);

    // Speed 32: 2A 65 00 01 20 -> CRC in frame is 42 23
    const speed32CrcData = hexToBytes('2A65000120');
    const crc32 = crc16modbus(speed32CrcData);
    expect((crc32 >> 8) & 0xff).toBe(0x42);
    expect(crc32 & 0xff).toBe(0x23);

    // Speed 45: 2A 65 00 01 2D -> CRC in frame is 87 E2
    const speed45CrcData = hexToBytes('2A6500012D');
    const crc45 = crc16modbus(speed45CrcData);
    expect((crc45 >> 8) & 0xff).toBe(0x87);
    expect(crc45 & 0xff).toBe(0xe2);
  });

  test('buildFrame constructs complete valid frames', () => {
    const frame16 = buildFrame([0x2a, 0x65], new Uint8Array([0x10]));
    expect(bytesToHex(frame16).toUpperCase()).toBe('456E2A6500011056237765'.toUpperCase());
    expect(frame16).toEqual(EngweCommands.speed16);

    const frame25 = buildFrame([0x2a, 0x65], new Uint8Array([0x19]));
    expect(bytesToHex(frame25).toUpperCase()).toBe('456E2A6500011950E37765'.toUpperCase());
    expect(frame25).toEqual(EngweCommands.speed25);
  });

  test('parseFrames parses valid frame stream', () => {
    const sample = EngweCommands.speed25;
    const frames = parseFrames(sample);
    expect(frames.length).toBe(1);
    expect(frames[0].command).toBe(0x2a65);
    expect(frames[0].payload).toEqual(new Uint8Array([0x19]));
  });

  test('Status frame parser unpacks 54-byte payload correctly', () => {
    const payload = new Uint8Array(54);
    // Speed: 0x012C = 300 -> 30.0 km/h (offset 0-1)
    payload[0] = 0x01;
    payload[1] = 0x2c;
    // Max speed: 0x0140 = 320 -> 32.0 km/h (offset 2-3)
    payload[2] = 0x01;
    payload[3] = 0x40;
    // Odometer: 1000.5 km = 10005 -> 0x2715 (offset 16-17)
    payload[16] = 0x27;
    payload[17] = 0x15;
    // Assist level: 3 (offset 18)
    payload[18] = 3;
    // Battery: 85% (offset 21)
    payload[21] = 85;
    // Lights on: 0xff (offset 28)
    payload[28] = 0xff;
    // Temp: 24 (offset 36)
    payload[36] = 24;
    // Battery health: 95% (offset 37)
    payload[37] = 95;
    // Power flags: 1, 1 (offset 39, 40)
    payload[39] = 1;
    payload[40] = 1;
    // Voltage: 4250 -> 42.50V (offset 42-43)
    payload[42] = 0x10;
    payload[43] = 0x9a;
    // Ride time: 120 min (offset 48-49)
    payload[48] = 0x00;
    payload[49] = 0x78;

    const status = parseStatusFrame(payload);
    expect(status).not.toBeNull();
    expect(status!.speedKmh).toBe(30.0);
    expect(status!.maxSpeedKmh).toBe(32.0);
    expect(status!.odometer).toBe(1000.5);
    expect(status!.assistLevel).toBe(3);
    expect(status!.batteryPct).toBe(85);
    expect(status!.lightsOn).toBe(true);
    expect(status!.temperatureC).toBe(24);
    expect(status!.batteryHealth).toBe(95);
    expect(status!.isOn).toBe(true);
    expect(status!.voltage).toBe(42.5);
    expect(status!.rideTimeMin).toBe(120);
  });
});
