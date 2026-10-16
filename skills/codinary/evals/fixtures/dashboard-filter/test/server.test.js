import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../packages/api/server.js';

test('health and isolated settings transport', async () => {
  const dataDirectory = await mkdtemp(join(tmpdir(), 'codinary-web-'));
  const server = createApp({ publicDirectory: 'packages/web', dataDirectory });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(`${base}/health`)).status, 200);
    assert.equal((await fetch(`${base}/api/settings`)).status, 401);
    const response = await fetch(`${base}/api/settings`, {
      headers: { authorization: 'Bearer session-demo' }
    });
    assert.deepEqual(await response.json(), { displayName: 'Demo User' });
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(dataDirectory, { recursive: true, force: true });
  }
});
