import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

import { createNewProject } from '../../packages/app-usecases/src/index.js';
import { parseDeviceRef, convertBitNotation } from '../../packages/core-domain/src/index.js';
import { InMemorySerialTransport } from '../../packages/infra/src/serial-transport.js';

const PORT = Number(process.env.PORT ?? 4173);
const PUBLIC_DIR = resolve('apps/ide-ui/public');
const transport = new InMemorySerialTransport();

const boardProfiles = {
  'board-avr-uno': JSON.parse(await readFile(resolve('plugins/board-avr-uno/profile.json'), 'utf8')),
  'board-esp32-devkitc': JSON.parse(await readFile(resolve('plugins/board-esp32-devkitc/profile.json'), 'utf8')),
  'board-m5-core2': JSON.parse(await readFile(resolve('plugins/board-m5-core2/profile.json'), 'utf8'))
};

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function parseJson(req) {
  return new Promise((resolvePromise, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolvePromise({});
      try {
        resolvePromise(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function serveStatic(pathname, res) {
  const target = pathname === '/' ? '/index.html' : pathname;
  const filePath = join(PUBLIC_DIR, target);
  const data = await readFile(filePath);
  const ext = extname(filePath);
  const type =
    ext === '.html'
      ? 'text/html; charset=utf-8'
      : ext === '.css'
        ? 'text/css; charset=utf-8'
        : ext === '.js'
          ? 'application/javascript; charset=utf-8'
          : ext === '.json'
            ? 'application/json; charset=utf-8'
            : 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  res.end(data);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/api/meta') {
      return json(res, 200, {
        categories: ['AVR', 'ESP32', 'M5', 'Other'],
        boards: Object.values(boardProfiles),
        defaults: {
          scanCycleMs: 10,
          serialBaudrate: 921600,
          languages: { ladder: true, st: false, customArduinoCpp: false }
        }
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/new-project') {
      const body = await parseJson(req);
      const board = boardProfiles[body.boardId] ?? { id: body.boardId, category: body.category ?? 'Other' };
      const result = createNewProject({
        name: body.name,
        category: body.category,
        board,
        languages: body.languages,
        ioMap: body.ioMap,
        settings: body.settings
      });
      return json(res, 200, result);
    }

    if (req.method === 'POST' && url.pathname === '/api/parse-device') {
      const body = await parseJson(req);
      const ref = parseDeviceRef(body.input, body.config);
      return json(res, 200, ref);
    }

    if (req.method === 'POST' && url.pathname === '/api/convert-device') {
      const body = await parseJson(req);
      const value = convertBitNotation(body.input, body.config, body.toNotation);
      return json(res, 200, { value });
    }

    if (req.method === 'POST' && url.pathname === '/api/monitor') {
      const body = await parseJson(req);
      const result = await transport.request(body);
      return json(res, 200, result);
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/')) {
      return json(res, 404, { message: 'APIが見つかりません。' });
    }

    return await serveStatic(url.pathname, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : '不明なエラー';
    json(res, 400, { message });
  }
});

server.listen(PORT, () => {
  console.log(`Ladduino UI server: http://localhost:${PORT}`);
});
