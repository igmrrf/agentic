import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { filesBelow } from '../../lib/registry.mjs';
import { ROOT } from './fixtures.mjs';
import { assertInstalledSpecialist, runSpecialist, validateSyntheticBlocker } from './specialist-fixtures.mjs';

async function workspace(context) {
  const directory = await mkdtemp(path.join(tmpdir(), 'agentic-specialists-'));
  context.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

for (const name of ['caveman', 'security-audit']) {
  for (const agent of ['claude', 'agents']) {
    test(`${name} installs alone for ${agent}, preserves configuration, updates and uninstalls`, async context => {
      const directory = await workspace(context);
      await mkdir(path.join(directory, '.agents'));
      const config = '{"entries":[{"path":"my-skills"}],"custom":true}\n';
      await writeFile(path.join(directory, '.agents/skills.json'), config);
      const args = [path.join(ROOT, 'scripts/install-skills.sh'), '--target', directory, '--agent', agent, '--skill', name];
      runSpecialist('bash', args);
      const destination = path.join(directory, `.${agent}/skills`, name);
      assert.deepEqual(await readdir(path.dirname(destination)), [name]);
      await assertInstalledSpecialist(destination, name);
      await writeFile(path.join(destination, 'local.txt'), 'User change');
      runSpecialist('bash', args);
      assert.equal(await readFile(path.join(destination, 'local.txt'), 'utf8'), 'User change');
      runSpecialist('bash', [...args, '--update']);
      await assert.rejects(readFile(path.join(destination, 'local.txt')));
      runSpecialist('bash', [...args, '--uninstall']);
      await assert.rejects(readFile(path.join(destination, 'SKILL.md')));
      assert.equal(await readFile(path.join(directory, '.agents/skills.json'), 'utf8'), config);
    });
  }

  test(`${name} remains standalone in a plain directory copy and local link`, async context => {
    const directory = await workspace(context);
    const copied = path.join(directory, 'standalone');
    await cp(path.join(ROOT, 'skills', name), copied, { recursive: true });
    await assertInstalledSpecialist(copied, name);
    runSpecialist('bash', [path.join(ROOT, 'scripts/install-skills.sh'), '--target', directory, '--agent', 'agents', '--skill', name, '--link']);
    assert.equal(await realpath(path.join(directory, '.agents/skills', name)), path.join(ROOT, 'skills', name));
  });
}

test('vendored audit resources retain pinned bytes and provenance covers every upstream file', async () => {
  const manifest = JSON.parse(await readFile(path.join(ROOT, 'docs/integration/upstream-provenance.json'), 'utf8'));
  const mappings = manifest.file_mappings.filter(record => record.source === 'security-audit-skill');
  assert.equal(mappings.length, 20);
  for (const record of mappings) {
    const content = await readFile(path.join(ROOT, record.destination));
    const digest = createHash('sha256').update(content).digest('hex');
    assert.equal(digest, record.destination_sha256, record.destination);
    if (record.source_path !== 'skills/security-audit/SKILL.md') assert.equal(digest, record.source_sha256, record.destination);
  }
  const paths = mappings.map(record => path.basename(record.source_path)).sort();
  const actual = (await readdir(path.join(ROOT, 'skills/security-audit'))).filter(name => /\.(cjs|json)$/.test(name) || /^[A-Z][A-Z-]+\.md$/.test(name) && name !== 'INTEGRATION.md').sort();
  assert.deepEqual(actual, paths);
});

test('Caveman ships only core presentation, notices and generated discovery with explicit invocation', async () => {
  const directory = path.join(ROOT, 'skills/caveman');
  const paths = (await filesBelow(directory)).map(filename => path.relative(directory, filename));
  assert.deepEqual(paths, ['LICENSE-Agentic.txt', 'LICENSE-Upstream-Apache-2.0.txt', 'LICENSE-Upstream-MIT.txt', 'NOTICE.txt', 'SKILL.md', 'agents/openai.yaml', 'dependencies.txt']);
  const content = await readFile(path.join(directory, 'SKILL.md'), 'utf8');
  assert.doesNotMatch(content, /ultracave|megacave|caveman-compress|\/caveman (ultra|wenyan)/);
  assert.match(content, /disable-model-invocation: true/);
  assert.match(await readFile(path.join(directory, 'agents/openai.yaml'), 'utf8'), /allow_implicit_invocation: false/);
  const registry = JSON.parse(await readFile(path.join(ROOT, 'registry/skills.json'), 'utf8'));
  assert.deepEqual(registry.skills.find(skill => skill.id === 'caveman').aliases, []);
});

test('installed findings validator preserves sandbox blockers without unsupported severity or confirmation', async context => {
  const directory = await workspace(context);
  const installed = path.join(directory, 'security-audit');
  await cp(path.join(ROOT, 'skills/security-audit'), installed, { recursive: true });
  await validateSyntheticBlocker(installed, directory);
});

test('specialist integration preserves protected delivery contracts byte for byte', async () => {
  const records = JSON.parse(await readFile(path.join(ROOT, 'tests/integration/specialist-protected.json'), 'utf8'));
  for (const [filename, expected] of Object.entries(records)) {
    const digest = createHash('sha256').update(await readFile(path.join(ROOT, filename))).digest('hex');
    assert.equal(digest, expected, `delivery contract changed: ${filename}`);
  }
});
