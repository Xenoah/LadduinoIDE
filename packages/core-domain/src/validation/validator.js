import { DomainError } from '../errors/domain-error.js';

export function validateNoDuplicateAssignments(mappedPins) {
  const seen = new Set();
  for (const entry of mappedPins) {
    const key = `${entry.device}:${entry.address}`;
    if (seen.has(key)) {
      throw new DomainError('AMBIGUOUS_INPUT', `重複割当を検出しました: ${key}`);
    }
    seen.add(key);
  }
  return true;
}
