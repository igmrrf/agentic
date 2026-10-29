#!/usr/bin/env node
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256, isWithin } from '../lib/handoff/files.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try {
  const manifest = JSON.parse(await readFile(path.join(root, 'docs/integration/upstream-provenance.json'), 'utf8'));
  const records = [...manifest.required_license_notices, ...manifest.file_mappings].filter(record => record.destination);
  const identities = new Set();
  for (const record of records) {
    const identity = `${record.source}:${record.source_path}:${record.destination}`;
    if (identities.has(identity)) throw new Error(`duplicate provenance: ${identity}`);
    identities.add(identity);
    const filename = await realpath(path.join(root, record.destination));
    if (!isWithin(root, filename)) throw new Error(`provenance path escape: ${record.destination}`);
    if (sha256(await readFile(filename)) !== record.destination_sha256) throw new Error(`stale provenance digest: ${record.destination}`);
    if (!/^[a-f0-9]{64}$/.test(record.source_sha256)) throw new Error(`invalid source digest: ${identity}`);
  }
  console.log(`Provenance valid: ${records.length} source/destination mappings`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
