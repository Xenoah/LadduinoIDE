import { DomainError } from '../errors/domain-error.js';
import { DEVICE_PROFILE_BASES, type BitContactNotation, type BitDeviceRef, type DeviceAddressConfig, type DeviceRef, type WordDeviceRef } from './types.js';

const BIT_RE = /^([A-Z]+)(\d+[A-F0-9]*)$/;
const WORD_RE = /^([A-Z]+)(\d+)(?:\.(\d+))?$/;

function parseContactByNotation(rawTail: string, notation: BitContactNotation): { channel: number; contact: number } {
  if (notation === 'kv-decimal-2') {
    if (rawTail.length < 3) {
      throw new DomainError('INVALID_FORMAT', 'KV形式では末尾2桁の接点が必要です。例: R10015');
    }
    const channelText = rawTail.slice(0, -2);
    const contactText = rawTail.slice(-2);
    const channel = Number(channelText);
    const contact = Number(contactText);
    if (!Number.isInteger(channel) || !Number.isInteger(contact)) {
      throw new DomainError('INVALID_FORMAT', 'デバイスアドレスの数値解析に失敗しました。');
    }
    if (contact < 0 || contact > 15) {
      throw new DomainError('OUT_OF_RANGE', '接点番号は00〜15で指定してください。');
    }
    return { channel, contact };
  }

  const channelText = rawTail.slice(0, -1);
  const contactText = rawTail.slice(-1);
  const channel = Number(channelText || '0');
  const contact = Number.parseInt(contactText, 16);
  if (!Number.isInteger(channel) || Number.isNaN(contact)) {
    throw new DomainError('INVALID_FORMAT', '三菱形式の解析に失敗しました。例: R100F');
  }
  if (contact < 0 || contact > 15) {
    throw new DomainError('OUT_OF_RANGE', '接点番号は0〜Fで指定してください。');
  }
  return { channel, contact };
}

function normalizeBit(base: string, channel: number, contact: number): BitDeviceRef {
  return {
    kind: 'BIT',
    base,
    channel,
    contact,
    bitIndex: channel * 16 + contact
  };
}

export function parseDeviceRef(input: string, config: DeviceAddressConfig): DeviceRef {
  const normalized = input.trim().toUpperCase();
  const profile = DEVICE_PROFILE_BASES[config.profile];

  const wordMatch = normalized.match(WORD_RE);
  if (wordMatch) {
    const [, base, wordIndexText, bitInWordText] = wordMatch;
    if (profile.word.includes(base)) {
      const wordIndex = Number(wordIndexText);
      if (wordIndex < 0 || wordIndex >= config.wordDeviceUpperBound) {
        throw new DomainError('OUT_OF_RANGE', `ワードアドレスが範囲外です。0〜${config.wordDeviceUpperBound - 1}で指定してください。`);
      }
      const bitIndex = bitInWordText ? Number(bitInWordText) : undefined;
      if (bitIndex !== undefined && (bitIndex < 0 || bitIndex > 15)) {
        throw new DomainError('OUT_OF_RANGE', 'ワード内ビット指定は0〜15で指定してください。');
      }
      const ref: WordDeviceRef = { kind: 'WORD', base, wordIndex, bitIndex };
      return ref;
    }
  }

  const bitMatch = normalized.match(BIT_RE);
  if (!bitMatch) {
    throw new DomainError('INVALID_FORMAT', `デバイス形式が不正です: ${input}`);
  }

  const [, base, tail] = bitMatch;
  if (!profile.bit.includes(base)) {
    throw new DomainError('UNSUPPORTED_DEVICE', `${base} は選択中のデバイス体系では使用できません。`);
  }

  if (config.allowContactOmission) {
    const pureDigits = /^\d+$/.test(tail);
    if (pureDigits && tail.length <= 4) {
      const channel = Number(tail);
      return normalizeBit(base, channel, 0);
    }
  }

  const parsed = parseContactByNotation(tail, config.bitContactNotation);
  const ref = normalizeBit(base, parsed.channel, parsed.contact);
  if (ref.bitIndex < 0 || ref.bitIndex >= config.bitDeviceUpperBound) {
    throw new DomainError('OUT_OF_RANGE', `ビットアドレスが範囲外です。bitIndexは0〜${config.bitDeviceUpperBound - 1}です。`);
  }
  return ref;
}

export function formatBitRef(ref: BitDeviceRef, notation: BitContactNotation): string {
  if (notation === 'kv-decimal-2') {
    return `${ref.base}${ref.channel}${ref.contact.toString().padStart(2, '0')}`;
  }
  return `${ref.base}${ref.channel}${ref.contact.toString(16).toUpperCase()}`;
}

export function convertBitNotation(input: string, config: DeviceAddressConfig, to: BitContactNotation): string {
  const parsed = parseDeviceRef(input, config);
  if (parsed.kind !== 'BIT') {
    throw new DomainError('INVALID_FORMAT', 'ビットデバイスのみ表記変換できます。');
  }
  return formatBitRef(parsed, to);
}
