import { describe, expect, it } from 'vitest';
import { DomainError, convertBitNotation, parseDeviceRef, parseNumericLiteral } from '../src/index.js';
import type { DeviceAddressConfig } from '../src/index.js';

const kvConfig: DeviceAddressConfig = {
  profile: 'kv-like',
  bitContactNotation: 'kv-decimal-2',
  allowContactOmission: true,
  bitDeviceUpperBound: 50000,
  wordDeviceUpperBound: 4096
};

const mitsubishiConfig: DeviceAddressConfig = {
  ...kvConfig,
  bitContactNotation: 'mitsubishi-hex-1'
};

describe('address codec', () => {
  it('R10015 と R100F が同じ bitIndex になる', () => {
    const kv = parseDeviceRef('R10015', kvConfig);
    const mi = parseDeviceRef('R100F', mitsubishiConfig);
    expect(kv.kind).toBe('BIT');
    expect(mi.kind).toBe('BIT');
    if (kv.kind === 'BIT' && mi.kind === 'BIT') {
      expect(kv.bitIndex).toBe(mi.bitIndex);
      expect(convertBitNotation('R10015', kvConfig, 'mitsubishi-hex-1')).toBe('R100F');
      expect(convertBitNotation('R100F', mitsubishiConfig, 'kv-decimal-2')).toBe('R10015');
    }
  });

  it('サンプル入力を正しく解析できる', () => {
    expect(parseDeviceRef('R01012', kvConfig)).toMatchObject({ kind: 'BIT', channel: 10, contact: 12 });
    expect(parseDeviceRef('MR2809', mitsubishiConfig)).toMatchObject({ kind: 'BIT', channel: 280, contact: 9 });
    expect(parseDeviceRef('DM100.12', kvConfig)).toMatchObject({ kind: 'WORD', wordIndex: 100, bitIndex: 12 });
    expect(parseDeviceRef('R100', kvConfig)).toMatchObject({ kind: 'BIT', channel: 100, contact: 0 });
  });

  it('不正入力は日本語エラーになる', () => {
    expect(() => parseDeviceRef('R10099', kvConfig)).toThrow(DomainError);
    expect(() => parseDeviceRef('DM100.20', kvConfig)).toThrow('ワード内ビット指定は0〜15');
    expect(() => parseNumericLiteral('7Bh')).toThrow('数値リテラルが不正');
  });

  it('数値リテラルの10進/16進を解析できる', () => {
    expect(parseNumericLiteral('123')).toBe(123);
    expect(parseNumericLiteral('0x7B')).toBe(123);
  });
});
