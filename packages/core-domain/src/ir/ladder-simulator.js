import { parseSimpleLadder } from './ladder-parser.js';

function bitKey(ref) {
  if (ref.kind !== 'BIT') throw new Error('BITデバイスのみ対応');
  return `${ref.base}:${ref.bitIndex}`;
}

export function executeLadder(lines, config, initialBits = {}) {
  const instructions = Array.isArray(lines) ? parseSimpleLadder(lines, config) : parseSimpleLadder(String(lines).split('\n'), config);
  const bits = { ...initialBits };
  let acc = false;

  for (const ins of instructions) {
    if (ins.type === 'LD') {
      acc = Boolean(bits[bitKey(ins.operand)]);
      continue;
    }
    if (ins.type === 'LDN') {
      acc = !Boolean(bits[bitKey(ins.operand)]);
      continue;
    }
    if (ins.type === 'OUT') {
      bits[bitKey(ins.operand)] = acc;
      continue;
    }
    if (ins.type === 'SET') {
      if (acc) bits[bitKey(ins.operand)] = true;
      continue;
    }
    if (ins.type === 'RST') {
      if (acc) bits[bitKey(ins.operand)] = false;
      continue;
    }
  }

  return { instructions, bits, acc };
}


export function executeLadderScans(lines, config, inputSequence = [], initialBits = {}) {
  let bits = { ...initialBits };
  const history = [];

  for (let i = 0; i < inputSequence.length; i += 1) {
    const scanInputs = inputSequence[i] ?? {};
    bits = { ...bits, ...scanInputs };
    const result = executeLadder(lines, config, bits);
    bits = { ...result.bits };
    history.push({ scan: i + 1, acc: result.acc, bits: { ...bits } });
  }

  return { finalBits: bits, history };
}
