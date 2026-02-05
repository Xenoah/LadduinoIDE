import { DomainError } from '../errors/domain-error.js';
import type { NumericLiteralFormat } from './types.js';

export function parseNumericLiteral(input: string): number {
  const text = input.trim();
  if (/^0x[0-9a-f]+$/i.test(text)) {
    return Number.parseInt(text.slice(2), 16);
  }
  if (/^\d+$/.test(text)) {
    return Number.parseInt(text, 10);
  }
  throw new DomainError('INVALID_NUMERIC_LITERAL', `数値リテラルが不正です: ${input}`);
}

export function formatNumericLiteral(value: number, format: NumericLiteralFormat): string {
  if (!Number.isInteger(value) || value < 0) {
    throw new DomainError('INVALID_NUMERIC_LITERAL', '数値リテラルは0以上の整数のみ対応しています。');
  }
  if (format === 'hex-with-prefix') {
    return `0x${value.toString(16).toUpperCase()}`;
  }
  return String(value);
}
