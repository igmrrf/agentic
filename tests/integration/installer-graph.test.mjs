import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, readlink, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './fixtures.mjs';

const modes = [[], ['--link'], ['--dry-run'], ['--link', '--dry-run']];

function dependencyChain(edges) {
  return Object.fromEntries(Array.from({ length: edges + 1 }, (_, index) => [`dep-${index}`, index ? [`dep-${index - 1}`] : []]));
}

async function installerFixture(context, graph) {
  const directory = await mkdtemp(path.join(tmpdir(), 'agentic-installer-graph-'));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const source = path.join(directory, 'source');
  const target = path.join(directory, 'target');
  await mkdir(path.join(source, 'scripts'), { recursive: true });
  await cp(path.join(ROOT, 'scripts/install-skills.sh'), path.join(source, 'scripts/install-skills.sh'));
  for (const [name, dependencies] of Object.entries(graph)) {
    const skill = path.join(source, 'skills', name);
    await mkdir(skill, { recursive: true });
    await writeFile(path.join(skill, 'SKILL.md'), `---\nname: ${name}\ndescription: Synthetic installer graph\n---\n`);
    await writeFile(path.join(skill, 'dependencies.txt'), dependencies.join('\n') + '\n');
  }
  for (const agent of ['agents', 'claude']) {
    await mkdir(path.join(target, `.${agent}/skills/unrelated`), { recursive: true });
    await writeFile(path.join(target, `.${agent}/skills/unrelated/SKILL.md`), 'Keep unrelated skill');
  }
  await writeFile(path.join(target, '.agents/skills.json'), '{"caller":"preserve"}\n');
  const run = (selected, flags = []) => spawnSync('/bin/bash', [path.join(source, 'scripts/install-skills.sh'), '--target', target, ...selected.flatMap(name => ['--skill', name]), ...flags], { encoding: 'utf8', timeout: 15000 });
  return { directory, source, target, run };
}

async function snapshot(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = {};
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const filename = path.join(directory, entry.name);
    result[entry.name] = entry.isDirectory() ? await snapshot(filename) : entry.isSymbolicLink() ? { link: await readlink(filename) } : await readFile(filename, 'utf8');
  }
  return result;
}

async function assertRejected(fixture, selected, flags) {
  const before = await snapshot(fixture.target);
  const result = fixture.run(selected, flags);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /dependency depth exceeded|not found/);
  assert.equal(result.stdout, '');
  assert.doesNotMatch(result.stderr, /Installed |Linked |Selected Skills|Paths that would change/);
  assert.deepEqual(await snapshot(fixture.target), before);
}

async function assertAccepted(fixture, selected, flags, expected) {
  const before = await snapshot(fixture.target);
  const result = fixture.run(selected, flags);
  assert.equal(result.status, 0, result.stderr);
  const plan = result.stderr.match(/Selected Skills : ([^\n]+)/)?.[1].trim().split(' ');
  assert.deepEqual(plan, expected);
  if (flags.includes('--dry-run')) {
    assert.deepEqual(await snapshot(fixture.target), before);
    return;
  }
  for (const agent of ['agents', 'claude']) {
    const installed = path.join(fixture.target, `.${agent}/skills`);
    assert.deepEqual((await readdir(installed)).sort(), [...expected, 'unrelated'].sort());
    for (const skill of expected) {
      if (flags.includes('--link')) assert.equal(await readlink(path.join(installed, skill)), path.join(fixture.source, 'skills', skill));
      assert.match(await readFile(path.join(installed, skill, 'SKILL.md'), 'utf8'), new RegExp(`name: ${skill}\\n`));
    }
  }
  assert.equal(await readFile(path.join(fixture.target, '.agents/skills.json'), 'utf8'), '{"caller":"preserve"}\n');
}

for (const flags of modes) {
  for (const edges of [15, 16, 17]) {
    test(`installer validates ${edges} edges before writes with ${flags.join(' ') || 'copy'}`, async context => {
      const fixture = await installerFixture(context, dependencyChain(edges));
      const root = `dep-${edges}`;
      const selectedOrders = [[root], [`dep-${edges - 1},${root}`], [`${root},dep-${edges - 1}`], ['all'], []];
      for (const selected of selectedOrders) {
        if (edges > 15) await assertRejected(fixture, selected, flags);
        else {
          const expected = Object.keys(dependencyChain(edges));
          if (selected[0] === 'all' || selected.length === 0) expected.sort();
          await assertAccepted(fixture, selected, [...flags, '--update'], expected);
        }
      }
      if (edges > 15) await assertRejected(fixture, [], [...flags, '--all']);
      else await assertAccepted(fixture, [], [...flags, '--all', '--update'], Object.keys(dependencyChain(edges)).sort());
    });
  }

  test(`installer counts shared cached suffixes with ${flags.join(' ') || 'copy'}`, async context => {
    const graph = { ...dependencyChain(14), 'leaf-a': ['dep-14'], 'leaf-b': ['dep-14'] };
    const valid = await installerFixture(context, graph);
    await writeFile(path.join(valid.source, 'skills/aliases.tsv'), 'branch\tleaf-a\n');
    await assertAccepted(valid, ['branch,leaf-b,branch'], flags, [...Object.keys(dependencyChain(14)), 'leaf-a', 'leaf-b']);
    const invalid = await installerFixture(context, { ...graph, 'too-deep': ['leaf-a', 'leaf-b'] });
    for (const selected of [['too-deep'], ['leaf-a,leaf-b,too-deep'], ['too-deep,leaf-b,leaf-a'], ['all'], []]) await assertRejected(invalid, selected, flags);
  });

  for (const [name, graph, root] of [
    ['cycle', { 'cycle-a': ['cycle-b'], 'cycle-b': ['cycle-a'] }, 'cycle-a'],
    ['missing dependency', { owner: ['absent'] }, 'owner'],
  ]) {
    test(`installer rejects ${name} with ${flags.join(' ') || 'copy'}`, async context => {
      const fixture = await installerFixture(context, graph);
      for (const selected of [[root], ['all'], []]) await assertRejected(fixture, selected, flags);
    });
  }
}

for (const [name, graph, root] of [
  ['depth', dependencyChain(17), 'dep-17'],
  ['cycle', { 'cycle-a': ['cycle-b'], 'cycle-b': ['cycle-a'] }, 'cycle-a'],
  ['missing dependency', { owner: ['absent'] }, 'owner'],
]) {
  test(`explicit uninstall recovers from invalid ${name} metadata without dependency removal`, async context => {
    const fixture = await installerFixture(context, graph);
    await writeFile(path.join(fixture.source, 'skills/aliases.tsv'), `remove-me\t${root}\n`);
    for (const skill of Object.keys(graph)) {
      await mkdir(path.join(fixture.target, '.agents/skills', skill), { recursive: true });
      await writeFile(path.join(fixture.target, '.agents/skills', skill, 'SKILL.md'), skill);
    }
    const before = await snapshot(fixture.target);
    const preview = fixture.run(['remove-me'], ['--agent', 'agents', '--uninstall', '--dry-run']);
    assert.equal(preview.status, 0, preview.stderr);
    assert.deepEqual(await snapshot(fixture.target), before);
    const result = fixture.run(['remove-me'], ['--agent', 'agents', '--uninstall']);
    assert.equal(result.status, 0, result.stderr);
    delete before['.agents'].skills[root];
    assert.deepEqual(await snapshot(fixture.target), before);
  });
}

test('all uninstall recovers cyclic metadata and preserves caller configuration', async context => {
  const fixture = await installerFixture(context, { 'cycle-a': ['cycle-b'], 'cycle-b': ['cycle-a'] });
  const before = await snapshot(fixture.target);
  for (const skill of ['cycle-a', 'cycle-b']) {
    await mkdir(path.join(fixture.target, '.agents/skills', skill), { recursive: true });
    await writeFile(path.join(fixture.target, '.agents/skills', skill, 'SKILL.md'), skill);
  }
  const result = fixture.run(['all'], ['--uninstall']);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(await snapshot(fixture.target), before);
});

for (const [name, graph, root] of [
  ['depth', dependencyChain(16), 'dep-16'],
  ['cycle', { 'cycle-a': ['cycle-b'], 'cycle-b': ['cycle-a'] }, 'cycle-a'],
  ['missing dependency', { owner: ['absent'] }, 'owner'],
]) {
  test(`unterminated dependency metadata rejects ${name} before writes`, async context => {
    const fixture = await installerFixture(context, graph);
    for (const [skill, dependencies] of Object.entries(graph)) await writeFile(path.join(fixture.source, 'skills', skill, 'dependencies.txt'), dependencies.join('\n'));
    for (const selected of [[root], ['all'], []]) await assertRejected(fixture, selected, []);
  });
}

test('selected valid closure ignores unrelated invalid metadata', async context => {
  const fixture = await installerFixture(context, { safe: [], broken: ['absent'] });
  await assertAccepted(fixture, ['safe'], [], ['safe']);
});

test('piped current installer supports old-ref archives without helpers or dependency metadata', async context => {
  const fixture = await installerFixture(context, { legacy: [] });
  await rm(path.join(fixture.source, 'skills/legacy/dependencies.txt'));
  await rm(path.join(fixture.source, 'scripts'), { recursive: true });
  const archive = path.join(fixture.directory, 'old-ref.tar.gz');
  const packed = spawnSync('tar', ['-czf', archive, '-C', fixture.directory, 'source'], { encoding: 'utf8' });
  assert.equal(packed.status, 0, packed.stderr);
  const script = await readFile(path.join(ROOT, 'scripts/install-skills.sh'), 'utf8');
  const result = spawnSync('/bin/bash', ['-s', '--', '--ref', 'old-tag', '--target', fixture.target, '--skill', 'legacy'], { input: script, encoding: 'utf8', env: { ...process.env, AGENTIC_TARBALL_URL: `file://${archive}` } });
  assert.equal(result.status, 0, result.stderr);
  assert.match(await readFile(path.join(fixture.target, '.agents/skills/legacy/SKILL.md'), 'utf8'), /name: legacy/);
});
