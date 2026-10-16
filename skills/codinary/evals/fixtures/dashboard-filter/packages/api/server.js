import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const items = [
  { id: 'job-1', title: 'First job', status: 'open' },
  { id: 'job-2', title: 'Second job', status: 'closed' },
  { id: 'job-3', title: 'Third job', status: 'open' }
];

function sendJson(response, status, data) {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(data));
}

async function loadSettings(dataDirectory) {
  try {
    return JSON.parse(await readFile(join(dataDirectory, 'settings.json'), 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { displayName: 'Demo User' };
  }
}

async function saveSettings(request, response, dataDirectory) {
  let content = '';
  for await (const chunk of request) {
    content += chunk;
    if (content.length > 4096) return sendJson(response, 413, { error: 'Too large' });
  }
  let settings;
  try {
    settings = JSON.parse(content);
  } catch {
    return sendJson(response, 400, { error: 'Invalid JSON' });
  }
  if (typeof settings.displayName !== 'string' || !settings.displayName.trim()) {
    return sendJson(response, 422, { error: 'Display name is required' });
  }
  const saved = { displayName: settings.displayName.trim() };
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(join(dataDirectory, 'settings.json'), JSON.stringify(saved));
  return sendJson(response, 200, saved);
}

async function route(request, response, options) {
  const address = new URL(request.url, 'http://localhost');
  if (address.pathname === '/health') return sendJson(response, 200, { ok: true });
  if (address.pathname === '/api/items') {
    return sendJson(response, 200, items);
  }
  if (address.pathname === '/api/settings') {
    if (request.headers.authorization !== 'Bearer session-demo') {
      return sendJson(response, 401, { error: 'Session expired. Sign in again.' });
    }
    if (request.method === 'GET') {
      return sendJson(response, 200, await loadSettings(options.dataDirectory));
    }
    if (request.method === 'PUT') {
      return saveSettings(request, response, options.dataDirectory);
    }
    return sendJson(response, 405, { error: 'Method not allowed' });
  }
  if (address.pathname === '/' || address.pathname === '/settings') {
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end(await readFile(join(options.publicDirectory, 'index.html')));
    return;
  }
  return sendJson(response, 404, { error: 'Not found' });
}

export function createApp(options) {
  return createServer((request, response) => {
    route(request, response, options).catch(error => {
      console.error(error);
      sendJson(response, 500, { error: 'Unexpected server failure' });
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const publicDirectory = process.env.PUBLIC_DIR || 'public';
  const dataDirectory = process.env.DATA_DIR || 'data';
  const port = Number(process.env.PORT || 17804);
  createApp({ publicDirectory, dataDirectory }).listen(port, '127.0.0.1', () => {
    console.log(`Ready on http://127.0.0.1:${port}`);
  });
}
