import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseDeviceRef,
  convertBitNotation,
  parseNumericLiteral,
  formatNumericLiteral,
  bitIndexToRef,
  parseStSubset,
  parseSimpleLadder,
  validateNoDuplicateAssignments,
  parseProjectConfig
} from '../src/index.js';

const kvConfig = {
  profile: 'kv-like',
  bitContactNotation: 'kv-decimal-2',
  allowContactOmission: true,
  bitDeviceUpperBound: 50000,
  wordDeviceUpperBound: 4096
};

const mConfig = { ...kvConfig, bitContactNotation: 'mitsubishi-hex-1' };

test('R10015 と R100F が同一 bitIndex に正規化', () => {
  const a = parseDeviceRef('R10015', kvConfig);
  const b = parseDeviceRef('R100F', mConfig);
  assert.equal(a.kind, 'BIT');
  assert.equal(b.kind, 'BIT');
  assert.equal(a.bitIndex, b.bitIndex);
  assert.equal(convertBitNotation('R10015', kvConfig, 'mitsubishi-hex-1'), 'R100F');
  assert.equal(convertBitNotation('R100F', mConfig, 'kv-decimal-2'), 'R10015');
});

test('サンプル入力の解析', () => {
  assert.deepEqual(parseDeviceRef('R01012', kvConfig), { kind: 'BIT', base: 'R', channel: 10, contact: 12, bitIndex: 172 });
  assert.deepEqual(parseDeviceRef('MR2809', mConfig), { kind: 'BIT', base: 'MR', channel: 280, contact: 9, bitIndex: 4489 });
  assert.deepEqual(parseDeviceRef('DM100.12', kvConfig), { kind: 'WORD', base: 'DM', wordIndex: 100, bitIndex: 12 });
  assert.deepEqual(parseDeviceRef('R100', kvConfig), { kind: 'BIT', base: 'R', channel: 100, contact: 0, bitIndex: 1600 });
});

test('bitIndex逆変換', () => {
  assert.deepEqual(bitIndexToRef('R', 1615), { kind: 'BIT', base: 'R', bitIndex: 1615, channel: 100, contact: 15 });
});

test('数値リテラル', () => {
  assert.equal(parseNumericLiteral('123'), 123);
  assert.equal(parseNumericLiteral('0x7B'), 123);
  assert.equal(formatNumericLiteral(123, 'hex-with-prefix'), '0x7B');
});

test('ST subset parser', () => {
  const st = parseStSubset('A := 1; B := 0x10; C := A;');
  assert.equal(st.statements.length, 3);
  assert.deepEqual(st.statements[1], { type: 'assign', lhs: 'B', rhs: 16 });
});

test('Ladder minimal parser', () => {
  const ir = parseSimpleLadder(['LD R10015', 'OUT MR2809'], kvConfig);
  assert.equal(ir.length, 2);
  assert.equal(ir[0].type, 'LD');
  assert.equal(ir[1].type, 'OUT');
});

test('重複割当バリデーション', () => {
  assert.equal(validateNoDuplicateAssignments([{ device: 'X', address: '0' }, { device: 'Y', address: '1' }]), true);
  assert.throws(() => validateNoDuplicateAssignments([{ device: 'X', address: '0' }, { device: 'X', address: '0' }]));
});

test('project config parser', () => {
  const conf = parseProjectConfig({ name: 'demo', languages: { ladder: true } });
  assert.equal(conf.scanCycleMs, 10);
  assert.equal(conf.serialBaudrate, 921600);
});
