import { DomainError } from '../errors/domain-error.js';

export function parseNumericLiteral(input) {
  const t = input.trim();
  if (/^0x[0-9A-F]+$/i.test(t)) return Number.parseInt(t.slice(2), 16);
  if (/^\d+$/.test(t)) return Number.parseInt(t, 10);
  throw new DomainError('INVALID_NUMERIC_LITERAL', `数値リテラルが不正です: ${input}`);
}

export function formatNumericLiteral(value, format) {
  if (!Number.isInteger(value)) {
    throw new DomainError('INVALID_NUMERIC_LITERAL', '整数のみ対応しています。');
  }
  return format === 'hex-with-prefix' ? `0x${value.toString(16).toUpperCase()}` : String(value);
}
