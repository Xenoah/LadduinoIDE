export const DeviceProfiles = {
  generic: { bit: ['X', 'Y', 'R', 'M', 'MR', 'T', 'C'], word: ['D'] },
  'kv-like': { bit: ['R', 'MR', 'LR', 'T', 'C'], word: ['DM'] }
};

export const DEFAULT_ADDRESS_CONFIG = {
  profile: 'generic',
  bitContactNotation: 'kv-decimal-2',
  allowContactOmission: true,
  bitDeviceUpperBound: 2048,
  wordDeviceUpperBound: 1024
};
