import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { parseRegistry, validateRegistry } from '../../lib/registry.mjs';
import { ROOT, runCli } from './fixtures.mjs';

const registry = JSON.parse(await readFile(path.join(ROOT, 'registry/skills.json'), 'utf8'));

test('all canonical metadata, complete bundles and marketplace agree', async () => {
  const result = runCli(['registry', 'check']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(registry.skills.length, 15);
  await validateRegistry(ROOT, registry);
});

const mutations = [
  ['duplicate ID', value => { value.skills[1].id = value.skills[0].id; }],
  ['ambiguous alias', value => { value.skills[0].aliases = [value.skills[1].id]; }],
  ['unknown dependency', value => { value.skills[0].dependencies = ['missing']; }],
  ['dependency cycle', value => { value.skills[0].dependencies = [value.skills[1].id]; value.skills[1].dependencies = [value.skills[0].id]; }],
  ['unexpected field', value => { value.skills[0].autoDeploy = true; }],
  ['invalid path', value => { value.skills[0].path = '../escape'; }],
];
for (const [name, mutate] of mutations) {
  test(`registry rejects ${name}`, () => {
    const modified = structuredClone(registry);
    mutate(modified);
    assert.throws(() => parseRegistry(modified));
  });
}

function dependencyChain(edges) {
  return Array.from({ length: edges + 1 }, (_, index) => ({ ...structuredClone(registry.skills[0]), id: `probe-${index}`, path: `skills/probe-${index}`, aliases: [], relatedSkills: [], dependencies: index ? [`probe-${index - 1}`] : [] }));
}

for (const order of ['dependency-first', 'dependent-first']) {
  test(`registry enforces the 15-edge dependency boundary in ${order} order`, () => {
    for (const edges of [15, 16, 17]) {
      const skills = dependencyChain(edges);
      const value = { schemaVersion: 1, skills: order === 'dependency-first' ? skills : skills.reverse() };
      if (edges === 15) assert.equal(parseRegistry(value), value);
      else assert.throws(() => parseRegistry(value), { code: 'REGISTRY' });
    }
  });
}

test('registry counts shared cached dependency paths and preserves cycle and missing-reference rejection', () => {
  const skills = dependencyChain(15);
  const extra = { ...structuredClone(skills[0]), id: 'shared', path: 'skills/shared', dependencies: ['probe-15', 'probe-0'] };
  assert.throws(() => parseRegistry({ schemaVersion: 1, skills: [...skills, extra] }), { code: 'REGISTRY' });
  skills[0].dependencies = ['probe-15'];
  assert.throws(() => parseRegistry({ schemaVersion: 1, skills }), { code: 'REGISTRY' });
  skills[0].dependencies = ['missing'];
  assert.throws(() => parseRegistry({ schemaVersion: 1, skills }), { code: 'REGISTRY' });
});

test('missing paths and broken real document references fail', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'agentic-registry-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const skill = { ...structuredClone(registry.skills[0]), id: 'example', path: 'skills/example', dependencies: [], relatedSkills: [], aliases: [] };
  const minimal = { schemaVersion: 1, skills: [skill] };
  await mkdir(path.join(directory, 'skills/example'), { recursive: true });
  await assert.rejects(validateRegistry(directory, minimal));
  await writeFile(path.join(directory, 'skills/example/SKILL.md'), `---\nname: example\ndisable-model-invocation: ${!skill.modelInvoked}\n---\n[Missing](missing.md)\n`);
  await assert.rejects(validateRegistry(directory, minimal));
});

test('generated bundle, metadata and marketplace drift is detected in isolated copy', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'agentic-generated-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const folder of ['registry', 'scripts', 'lib', 'framework', 'skills', 'docs', '.claude-plugin', 'bin', 'licenses', 'LICENSE']) await cp(path.join(ROOT, folder), path.join(directory, folder), { recursive: true });
  const check = () => spawnSync(process.execPath, [path.join(directory, 'scripts/registry.mjs'), 'check'], { encoding: 'utf8' });
  const baseline = check();
  assert.equal(baseline.status, 0, baseline.stderr);
  for (const filename of ['skills/egm-review/bundle/agents/comprehension.md', 'skills/egm-review/agents/openai.yaml', '.claude-plugin/marketplace.json']) {
    const target = path.join(directory, filename);
    const original = await readFile(target);
    await writeFile(target, 'drift');
    assert.equal(check().status, 1);
    await writeFile(target, original);
  }
});
