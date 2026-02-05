import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const PORT = 4174;
const BASE = `http://127.0.0.1:${PORT}`;

function waitForServer(proc) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('server start timeout')), 5000);
    proc.stdout.on('data', (chunk) => {
      if (String(chunk).includes('Ladduino UI server')) {
        clearTimeout(timeout);
        resolve();
      }
    });
    proc.on('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`server exited: ${code}`));
    });
  });
}

let proc;

test.before(async () => {
  proc = spawn('node', ['apps/ide-ui/server.js'], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForServer(proc);
});

test.after(() => {
  if (proc && !proc.killed) proc.kill('SIGTERM');
});

test('meta endpoint', async () => {
  const res = await fetch(`${BASE}/api/meta`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(Array.isArray(json.boards));
  assert.ok(json.boards.length >= 3);
});

test('device parse and convert endpoints', async () => {
  const config = {
    profile: 'kv-like',
    bitContactNotation: 'kv-decimal-2',
    allowContactOmission: true,
    bitDeviceUpperBound: 50000,
    wordDeviceUpperBound: 4096
  };

  const parseRes = await fetch(`${BASE}/api/parse-device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'R10015', config })
  });
  const parsed = await parseRes.json();
  assert.equal(parsed.bitIndex, 1615);

  const convRes = await fetch(`${BASE}/api/convert-device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'R10015', config, toNotation: 'mitsubishi-hex-1' })
  });
  const converted = await convRes.json();
  assert.equal(converted.value, 'R100F');
});

test('new project and monitor endpoints', async () => {
  const create = await fetch(`${BASE}/api/new-project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'demo',
      category: 'ESP32',
      boardId: 'board-esp32-devkitc',
      languages: { ladder: true, st: true, customArduinoCpp: true },
      settings: { scanCycleMs: 10, serialBaudrate: 921600, deviceProfile: 'kv-like', bitContactNotation: 'kv-decimal-2' }
    })
  });
  const created = await create.json();
  assert.equal(created.project.name, 'demo');
  assert.ok(created.files['project.json']);

  const run = await fetch(`${BASE}/api/monitor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: 'RUN' })
  });
  const runJson = await run.json();
  assert.equal(runJson.state.run, true);
});


test('ladder compile endpoint', async () => {
  const config = {
    profile: 'kv-like',
    bitContactNotation: 'kv-decimal-2',
    allowContactOmission: true,
    bitDeviceUpperBound: 50000,
    wordDeviceUpperBound: 4096
  };

  const res = await fetch(`${BASE}/api/ladder/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'LD R10015\nOUT MR28009',
      config,
      initialBits: { 'R:1615': true }
    })
  });
  const json = await res.json();
  assert.equal(json.instructionCount, 2);
  assert.equal(json.bits['MR:4489'], true);
});


test('ladder simulate endpoint for self-hold', async () => {
  const config = {
    profile: 'generic',
    bitContactNotation: 'kv-decimal-2',
    allowContactOmission: true,
    bitDeviceUpperBound: 50000,
    wordDeviceUpperBound: 4096
  };

  const res = await fetch(`${BASE}/api/ladder/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'LD X00000\nSET Y00000\nLD X00001\nRST Y00000',
      config,
      initialBits: { 'Y:0': false },
      inputSequence: [
        { 'X:0': true, 'X:1': false },
        { 'X:0': false, 'X:1': false },
        { 'X:0': false, 'X:1': true }
      ]
    })
  });
  const json = await res.json();
  assert.equal(json.history[0].bits['Y:0'], true);
  assert.equal(json.history[1].bits['Y:0'], true);
  assert.equal(json.history[2].bits['Y:0'], false);
});


test('arduino generate endpoint', async () => {
  const config = {
    profile: 'kv-like',
    bitContactNotation: 'kv-decimal-2',
    allowContactOmission: true,
    bitDeviceUpperBound: 50000,
    wordDeviceUpperBound: 4096
  };

  const res = await fetch(`${BASE}/api/arduino/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'LD R10015\nOUT MR28009',
      config,
      scanCycleMs: 10
    })
  });
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.ok(String(json.sketch).includes('void ladderScan()'));
  assert.ok(String(json.sketch).includes('setBit("MR:4489", acc);'));
});

test('arduino compile endpoint returns compile result or warning', async () => {
  const config = {
    profile: 'kv-like',
    bitContactNotation: 'kv-decimal-2',
    allowContactOmission: true,
    bitDeviceUpperBound: 50000,
    wordDeviceUpperBound: 4096
  };

  const res = await fetch(`${BASE}/api/arduino/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      boardId: 'board-avr-uno',
      source: 'LD R10015\nOUT MR28009',
      config,
      scanCycleMs: 10
    })
  });
  const json = await res.json();
  assert.ok(typeof json.ok === 'boolean');
  if (json.compiled) {
    assert.equal(json.ok, true);
    assert.ok(String(json.stdout).length >= 0);
  } else {
    assert.ok(String(json.warning).includes('arduino-cli'));
  }
});
