import { parseDeviceRef } from '../devices/address-codec.js';

export function parseSimpleLadder(lines, config) {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [op, ...args] = line.split(/\s+/);
      if (op === 'LD' || op === 'LDN' || op === 'OUT' || op === 'SET' || op === 'RST') {
        return { type: op, operand: parseDeviceRef(args[0], config), line: index + 1 };
      }
      if (op === 'TON' || op === 'CTU') {
        return { type: op, coil: parseDeviceRef(args[0], config), preset: Number(args[1] ?? 0), line: index + 1 };
      }
      return { type: 'RAW', text: line, line: index + 1 };
    });
}
