import { parseNumericLiteral } from '../devices/numeric-literal.js';

export function parseStSubset(source) {
  const statements = source
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((stmt) => {
      const m = stmt.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:=\s*(.+)$/);
      if (!m) return { type: 'raw', text: stmt };
      const rhs = m[2].trim();
      const value = /^\d+$/.test(rhs) || /^0x/i.test(rhs) ? parseNumericLiteral(rhs) : rhs;
      return { type: 'assign', lhs: m[1], rhs: value };
    });
  return { type: 'st-subset', statements };
}
