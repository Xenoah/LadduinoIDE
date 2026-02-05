export type DeviceProfile = 'generic' | 'kv-like';

export type BitContactNotation = 'kv-decimal-2' | 'mitsubishi-hex-1';

export type NumericLiteralFormat = 'decimal' | 'hex-with-prefix';

export interface DeviceAddressConfig {
  profile: DeviceProfile;
  bitContactNotation: BitContactNotation;
  allowContactOmission: boolean;
  bitDeviceUpperBound: number;
  wordDeviceUpperBound: number;
}

export interface BitDeviceRef {
  kind: 'BIT';
  base: string;
  bitIndex: number;
  channel: number;
  contact: number;
}

export interface WordDeviceRef {
  kind: 'WORD';
  base: string;
  wordIndex: number;
  bitIndex?: number;
}

export type DeviceRef = BitDeviceRef | WordDeviceRef;

export const DEVICE_PROFILE_BASES: Record<DeviceProfile, { bit: string[]; word: string[] }> = {
  generic: {
    bit: ['X', 'Y', 'R', 'M', 'MR', 'T', 'C'],
    word: ['D']
  },
  'kv-like': {
    bit: ['R', 'MR', 'LR', 'T', 'C'],
    word: ['DM']
  }
};

export const DEFAULT_ADDRESS_CONFIG: DeviceAddressConfig = {
  profile: 'generic',
  bitContactNotation: 'kv-decimal-2',
  allowContactOmission: true,
  bitDeviceUpperBound: 2048,
  wordDeviceUpperBound: 1024
};
