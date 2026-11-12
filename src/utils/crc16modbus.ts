/**
 * CRC-16/MODBUS implementation
 * Initial value: 0xFFFF, reflected polynomial: 0xA001
 * Written high byte first (big-endian in the frame)
 */
export function crc16modbus(data: Uint8Array): number {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 0x0001) {
        crc = (crc >>> 1) ^ 0xa001;
      } else {
        crc >>>= 1;
      }
    }
  }
  return crc;
}

/**
 * Returns the CRC as [highByte, lowByte] – big-endian as the protocol specifies
 */
export function crc16modbusBytes(data: Uint8Array): [number, number] {
  const crc = crc16modbus(data);
  return [(crc >> 8) & 0xff, crc & 0xff];
}
