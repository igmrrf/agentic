import assert from 'node:assert/strict';
import { readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { filesBelow } from '../../lib/registry.mjs';
import { ROOT } from './fixtures.mjs';

export function runSpecialist(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 30000, ...options });
  assert.equal(result.status, 0, `${command}: ${result.stderr}\n${result.stdout}`);
  return result;
}

export async function assertLocalReferences(directory) {
  const root = await realpath(directory);
  for (const filename of await filesBelow(directory)) {
    if (!filename.endsWith('.md')) continue;
    const content = (await readFile(filename, 'utf8')).replace(/```[\s\S]*?```/g, '');
    for (const match of content.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(match[1])) continue;
      const resolved = await realpath(path.resolve(path.dirname(filename), match[1].split('#')[0]));
      assert.ok(resolved.startsWith(`${root}${path.sep}`), `${filename}: escaping reference ${match[1]}`);
    }
  }
}

export async function assertInstalledSpecialist(directory, name) {
  const source = path.join(ROOT, 'skills', name);
  const expected = (await filesBelow(source)).map(filename => path.relative(source, filename));
  const actual = (await filesBelow(directory)).map(filename => path.relative(directory, filename));
  assert.deepEqual(actual, expected);
  for (const filename of expected) {
    assert.deepEqual(await readFile(path.join(directory, filename)), await readFile(path.join(source, filename)), filename);
  }
  assert.equal(await readFile(path.join(directory, 'dependencies.txt'), 'utf8'), '');
  await assertLocalReferences(directory);
  if (name === 'security-audit') {
    const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => name !== 'NODE_TEST_CONTEXT'));
    const result = runSpecialist(process.execPath, ['--test', path.join(directory, 'validate-findings.test.cjs'), path.join(directory, 'validate-coverage-ledger.test.cjs')], { env });
    assert.match(result.stdout, /pass [1-9][0-9]*/);
  }
}

export async function validateSyntheticBlocker(directory, scratch) {
  const filename = path.join(scratch, 'findings.json');
  const record = {
    verdict: 'needs_validation', fingerprint: 'src-invoices-tenant-scope', title: 'Tenant scope unresolved',
    description: 'The store scope is not visible in source.', claimed_root_cause: 'readInvoice delegates tenant scope to store.get.',
    trace: [{ kind: 'entrypoint', file: 'src/invoices.js', line: 1, scope: 'readInvoice', description: 'The caller supplies an invoice identifier.' }],
    evidence: [{ file: 'src/invoices.js', line: 3, description: 'The store receives the identifier without a tenant argument.' }],
    blockers: ['No OS-enforced external-network isolation or memory/disk limits are available.'],
    validation_plan: { local: 'On an approved isolated host, use two dummy tenants to observe the store scope.' },
  };
  await writeFile(filename, JSON.stringify([record]));
  const validator = path.join(directory, 'validate-findings.cjs');
  runSpecialist(process.execPath, [validator, filename]);
  for (const change of [{ severity: { overall_severity: 'high' } }, { verdict: 'confirmed' }, { blockers: [] }]) {
    await writeFile(filename, JSON.stringify([{ ...record, ...change }]));
    const result = spawnSync(process.execPath, [validator, filename], { encoding: 'utf8', timeout: 5000 });
    assert.equal(result.status, 1, `unsupported record accepted: ${JSON.stringify(change)}`);
  }
}
