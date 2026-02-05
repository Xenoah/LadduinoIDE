import { DomainError } from '../errors/domain-error.js';
import { DeviceProfiles } from './types.js';

const WORD_RE = /^([A-Z]+)(\d+)(?:\.(\d+))?$/;
const BIT_RE = /^([A-Z]+)([A-F0-9]+)$/;

function parseKvTail(tail) {
  if (!/^\d{3,}$/.test(tail)) {
    throw new DomainError('INVALID_FORMAT', 'KV形式では末尾2桁接点の10進数が必要です。例: R10015');
  }
  const channel = Number.parseInt(tail.slice(0, -2), 10);
  const contact = Number.parseInt(tail.slice(-2), 10);
  if (contact < 0 || contact > 15) {
    throw new DomainError('OUT_OF_RANGE', '接点番号は00〜15で指定してください。');
  }
  return { channel, contact };
}

function parseMitsubishiTail(tail) {
  if (!/^[0-9A-F]{2,}$/.test(tail)) {
    throw new DomainError('INVALID_FORMAT', '三菱形式では末尾1桁の16進接点が必要です。例: R100F');
  }
  const channel = Number.parseInt(tail.slice(0, -1), 10);
  const contact = Number.parseInt(tail.slice(-1), 16);
  if (Number.isNaN(channel) || Number.isNaN(contact)) {
    throw new DomainError('INVALID_FORMAT', '三菱形式の解析に失敗しました。');
  }
  return { channel, contact };
}

function ensureBounds(ref, config) {
  if (ref.kind === 'BIT' && (ref.bitIndex < 0 || ref.bitIndex >= config.bitDeviceUpperBound)) {
    throw new DomainError('OUT_OF_RANGE', `ビットアドレスが範囲外です。0〜${config.bitDeviceUpperBound - 1}で指定してください。`);
  }
  if (ref.kind === 'WORD' && (ref.wordIndex < 0 || ref.wordIndex >= config.wordDeviceUpperBound)) {
    throw new DomainError('OUT_OF_RANGE', `ワードアドレスが範囲外です。0〜${config.wordDeviceUpperBound - 1}で指定してください。`);
  }
  return ref;
}

export function parseDeviceRef(input, config) {
  const token = input.trim().toUpperCase();
  const profile = DeviceProfiles[config.profile];

  const wm = token.match(WORD_RE);
  if (wm && profile.word.includes(wm[1])) {
    const bitIndex = wm[3] === undefined ? undefined : Number.parseInt(wm[3], 10);
    if (bitIndex !== undefined && (bitIndex < 0 || bitIndex > 15)) {
      throw new DomainError('OUT_OF_RANGE', 'ワード内ビット指定は0〜15で指定してください。');
    }
    return ensureBounds({ kind: 'WORD', base: wm[1], wordIndex: Number.parseInt(wm[2], 10), bitIndex }, config);
  }

  const bm = token.match(BIT_RE);
  if (!bm) {
    throw new DomainError('INVALID_FORMAT', `デバイス形式が不正です: ${input}`);
  }
  const base = bm[1];
  const tail = bm[2];
  if (!profile.bit.includes(base)) {
    throw new DomainError('UNSUPPORTED_DEVICE', `${base} は選択中プロファイルでは使用できません。`);
  }

  if (config.allowContactOmission && config.bitContactNotation === 'kv-decimal-2' && /^\d{1,4}$/.test(tail)) {
    const channel = Number.parseInt(tail, 10);
    return ensureBounds({ kind: 'BIT', base, channel, contact: 0, bitIndex: channel * 16 }, config);
  }

  const parsed = config.bitContactNotation === 'kv-decimal-2' ? parseKvTail(tail) : parseMitsubishiTail(tail);
  const ref = { kind: 'BIT', base, ...parsed, bitIndex: parsed.channel * 16 + parsed.contact };
  return ensureBounds(ref, config);
}

export function formatBitRef(ref, notation) {
  if (notation === 'kv-decimal-2') {
    return `${ref.base}${ref.channel}${String(ref.contact).padStart(2, '0')}`;
  }
  return `${ref.base}${ref.channel}${ref.contact.toString(16).toUpperCase()}`;
}

export function bitIndexToRef(base, bitIndex) {
  const channel = Math.floor(bitIndex / 16);
  const contact = bitIndex % 16;
  return { kind: 'BIT', base, bitIndex, channel, contact };
}

export function convertBitNotation(input, config, notation) {
  const parsed = parseDeviceRef(input, config);
  if (parsed.kind !== 'BIT') {
    throw new DomainError('INVALID_FORMAT', 'ビットデバイスのみ変換できます。');
  }
  return formatBitRef(parsed, notation);
}
