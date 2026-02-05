import { DomainError } from '../errors/domain-error.js';

export function parseProjectConfig(data) {
  if (!data || typeof data !== 'object') {
    throw new DomainError('INVALID_FORMAT', 'project.json の形式が不正です。');
  }
  const config = {
    name: String(data.name ?? ''),
    scanCycleMs: Number(data.scanCycleMs ?? 10),
    serialBaudrate: Number(data.serialBaudrate ?? 921600),
    deviceProfile: data.deviceProfile ?? 'generic',
    bitContactNotation: data.bitContactNotation ?? 'kv-decimal-2',
    numericLiteralFormat: data.numericLiteralFormat ?? 'decimal',
    languages: {
      ladder: data.languages?.ladder ?? true,
      st: data.languages?.st ?? false,
      customArduinoCpp: data.languages?.customArduinoCpp ?? false
    }
  };
  if (!config.name) throw new DomainError('INVALID_FORMAT', 'プロジェクト名は必須です。');
  return config;
}
