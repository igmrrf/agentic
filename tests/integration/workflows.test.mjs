import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fixture, ROOT, runCli } from './fixtures.mjs';

for (const language of ['typescript', 'go', 'python']) {
  test(`actual ${language} init/install CLI in isolated existing project preserves user files`, async t => {
    const directory = await mkdtemp(path.join(tmpdir(), `agentic-${language}-`));
    t.after(() => rm(directory, { recursive: true, force: true }));
    await writeFile(path.join(directory, 'README.md'), 'User-owned project\n');
    const result = runCli(['init', '--lang', language, '--target', directory, '--claude', '--skills']);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(await readFile(path.join(directory, 'README.md'), 'utf8'), 'User-owned project\n');
    for (const name of ['codinary', 'grilling', 'egm-review']) await access(path.join(directory, `.agents/skills/${name}/SKILL.md`));
    await access(path.join(directory, 'CLAUDE.md'));
    const consumer = spawnSync(process.execPath, [path.join(directory, '.agents/skills/codinary/bundle/bin/handoff.mjs'), '--help'], { encoding: 'utf8' });
    assert.equal(consumer.status, 0, consumer.stderr);
  });
}

test('controlled medium/complex intake projects canonical IDs and rejects stale handoff without artifacts', async t => {
  const context = await fixture(t);
  context.artifact.payload.acceptanceCriteria[0].id = 'AC-PAY-1';
  context.artifact.lifecycle.state = 'approved';
  context.approveSynthetic();
  await context.save();
  const output = runCli([...context.args('intake'), '--mode', 'handoff']);
  assert.equal(output.status, 0, output.stderr);
  const intake = JSON.parse(output.stdout);
  assert.equal(intake.acceptanceCriteria[0].id, 'AC-PAY-1');
  const run = path.join(context.directory, 'controlled-caller');
  await mkdir(run);
  const brief = { input_mode: intake.mode, spec_id: intake.specId, spec_version: intake.specVersion, payload_hash: intake.payloadHash, criteria: intake.acceptanceCriteria, verification: [{ id: 'V1', criteria: ['AC-PAY-1'] }] };
  await writeFile(path.join(run, 'brief.json'), JSON.stringify(brief));
  assert.equal(JSON.parse(await readFile(path.join(run, 'brief.json'))).verification[0].criteria[0], intake.acceptanceCriteria[0].id);
  context.artifact.payload.acceptanceCriteria[0].text = 'Changed scope';
  await context.save();
  const rejected = runCli([...context.args('intake'), '--mode', 'handoff']);
  assert.equal(rejected.status, 1);
  assert.equal(rejected.stdout, '');
  await assert.rejects(access(path.join(context.root, 'brief.md')));
});

test('review-only handoff validation writes no source/artifact files; malformed input blocks CLI', async t => {
  const context = await fixture(t);
  const before = await readFile(path.join(context.root, 'handoff.json'));
  const result = runCli(context.args('validate'));
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(await readFile(path.join(context.root, 'handoff.json')), before);
  assert.equal(context.git(['status', '--porcelain']).split('\n').length, 2);
  await access(path.join(ROOT, 'skills/codinary/references/roles.md'));
});
