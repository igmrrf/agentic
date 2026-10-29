import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { canonical, payloadHash, validateHandoff, transitionHandoff, codinaryIntake } from '../../lib/handoff/index.mjs';
import { fixture, runCli } from './fixtures.mjs';

test('canonical signing representation has stable literal bytes', () => {
  assert.equal(canonical({ z: ['é', 3], a: { y: true, b: null } }), '{"a":{"b":null,"y":true},"z":["é",3]}');
});

test('independently signed approval crosses API, actual CLI and persisted lifecycle boundary', async t => {
  const context = await fixture(t);
  const approved = await transitionHandoff({ ...context.options, to: 'approved' });
  assert.equal(approved.lifecycle.state, 'approved');
  assert.equal(context.artifact.lifecycle.state, 'reviewed');
  await writeFile(path.join(context.root, 'approved.json'), JSON.stringify(approved));
  const options = { ...context.options, artifactPath: 'approved.json', mode: 'handoff' };
  const intake = await codinaryIntake(options);
  assert.equal(intake.approval.authority, 'synthetic-human');
  assert.equal(intake.payloadHash, payloadHash(context.artifact.payload));
  assert.deepEqual(intake.acceptanceCriteria, context.artifact.payload.acceptanceCriteria);
  const args = context.args('intake');
  args[args.indexOf('--artifact') + 1] = 'approved.json';
  const result = runCli([...args, '--mode', 'handoff']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).specId, 'synthetic-spec');
  const implementing = await transitionHandoff({ ...options, to: 'in_implementation' });
  await writeFile(path.join(context.root, 'implementing.json'), JSON.stringify(implementing));
  const resumed = await validateHandoff({ ...options, artifactPath: 'implementing.json' });
  assert.equal(resumed.payloadHash, intake.payloadHash);
});

const edges = { draft: ['in_review', 'superseded'], in_review: ['changes_requested', 'reviewed', 'superseded'], changes_requested: ['draft', 'in_review', 'superseded'], reviewed: ['approved', 'draft', 'superseded'], approved: ['in_implementation', 'superseded'], in_implementation: ['superseded'], superseded: [] };
for (const [from, targets] of Object.entries(edges)) {
  test(`lifecycle ${from}: allowed edges and rejection`, async t => {
    const context = await fixture(t);
    context.artifact.lifecycle.state = from;
    await context.save();
    for (const to of targets) assert.equal((await transitionHandoff({ ...context.options, to })).lifecycle.state, to);
    await assert.rejects(transitionHandoff({ ...context.options, to: from }), { code: 'TRANSITION' });
  });
}

test('selected preset derives required review stages', async t => {
  const context = await fixture(t);
  context.artifact.payload.review.stages.pop();
  await context.save();
  await assert.rejects(validateHandoff(context.options), { code: 'REVIEW_INCOMPLETE' });
  context.artifact.payload.review.preset = 'feature_spec';
  await context.save();
  assert.equal((await validateHandoff(context.options)).artifact.payload.review.stages.length, 4);
  context.artifact.payload.review.preset = '9';
  await context.save();
  await assert.rejects(validateHandoff(context.options), { code: 'SCHEMA' });
});

test('CLI transition emits recoverable output and fails missing/unexpected/duplicate flags', async t => {
  const context = await fixture(t);
  const result = runCli([...context.args('transition'), '--to', 'approved']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).lifecycle.state, 'approved');
  for (const args of [['handoff', 'validate', '--root'], [...context.args('validate'), '--mode', 'handoff'], [...context.args('validate'), '--root', context.root], ['handoff', 'unknown']]) {
    assert.equal(runCli(args).status, 1);
  }
});

test('explicit intake blocks unapproved and superseded documents with no direct fallback', async t => {
  const context = await fixture(t);
  await assert.rejects(codinaryIntake(context.options), { code: 'MODE' });
  for (const state of ['draft', 'reviewed', 'superseded']) {
    context.artifact.lifecycle.state = state;
    await context.save();
    const result = runCli([...context.args('intake'), '--mode', 'handoff']);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.equal(JSON.parse(result.stderr).error, 'NOT_APPROVED');
  }
});

for (const severity of ['blocker', 'major']) {
  for (const status of ['open', 'contested', 'fixed', 'accepted_risk']) {
    test(`${severity}/${status} applies identical readiness guards to supplied and transitioned states`, async t => {
      const context = await fixture(t);
      const finding = { id: 'F1', severity, summary: 'Synthetic finding', disposition: { status, reason: 'Synthetic disposition evidence', authority: 'synthetic-human' } };
      context.artifact.payload.review.stages[0].findings.push(finding);
      context.approveSynthetic();
      const isReady = ['fixed', 'accepted_risk'].includes(status);
      for (const state of ['reviewed', 'approved', 'in_implementation']) {
        context.artifact.lifecycle.state = state;
        await context.save();
        if (isReady) assert.equal((await validateHandoff(context.options)).artifact.lifecycle.state, state);
        else await assert.rejects(validateHandoff(context.options), { code: 'OPEN_FINDINGS' });
      }
      context.artifact.lifecycle.state = 'in_review';
      await context.save();
      if (isReady) assert.equal((await transitionHandoff({ ...context.options, to: 'reviewed' })).lifecycle.state, 'reviewed');
      else await assert.rejects(transitionHandoff({ ...context.options, to: 'reviewed' }), { code: 'OPEN_FINDINGS' });
      finding.disposition.authority = '';
      await context.save();
      await assert.rejects(validateHandoff(context.options), { code: 'SCHEMA' });
    });
  }
}
