import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, symlink, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { generateKeyPairSync } from 'node:crypto';
import { validateHandoff } from '../../lib/handoff/index.mjs';
import { fixture, runCli } from './fixtures.mjs';

const mutations = [
  ['unexpected artifact key', context => { context.artifact.approved = true; }, 'SCHEMA'],
  ['unknown schema', context => { context.artifact.schemaVersion = 2; }, 'SCHEMA_VERSION'],
  ['unknown payload key', context => { context.artifact.payload.signerKey = 'forged'; }, 'SCHEMA'],
  ['empty requirement', context => { context.artifact.payload.requirements = []; }, 'SCHEMA'],
  ['unknown requirement link', context => { context.artifact.payload.acceptanceCriteria[0].requirementIds = ['unknown']; }, 'TRACEABILITY'],
  ['duplicate criterion', context => { context.artifact.payload.acceptanceCriteria.push(context.artifact.payload.acceptanceCriteria[0]); }, 'SCHEMA'],
  ['duplicate stage', context => { context.artifact.payload.review.stages.push(context.artifact.payload.review.stages[0]); }, 'SCHEMA'],
  ['unknown preset', context => { context.artifact.payload.review.preset = 'auto-approve'; }, 'SCHEMA'],
  ['stale reviewed design', context => { context.artifact.payload.review.stages[0].reviewedDesignSha256 = 'a'.repeat(64); }, 'STALE_REVIEW'],
  ['unresolved blocker', context => { context.artifact.payload.review.stages[0].findings.push({ id: 'B1', severity: 'blocker', summary: 'Data loss', disposition: { status: 'open', reason: 'Unresolved', authority: 'author' } }); }, 'OPEN_FINDINGS'],
  ['parent traversal', context => { context.artifact.payload.design.path = '../outside.md'; }, 'PATH_ESCAPE'],
  ['absolute path', context => { context.artifact.payload.design.path = path.join(context.root, 'design/spec.md'); }, 'PATH_ESCAPE'],
  ['wrong source revision', context => { context.artifact.payload.repository.revision = '0'.repeat(40); }, 'REPOSITORY'],
  ['wrong repository', context => { context.artifact.payload.repository.url = 'https://attacker.invalid'; }, 'REPOSITORY'],
  ['edited criterion', context => { context.artifact.payload.acceptanceCriteria[0].text += ' malicious change'; }, 'STALE_APPROVAL'],
  ['old version', context => { context.trust.current.specVersion = 2; }, 'STALE_APPROVAL'],
  ['wrong expected current hash', context => { context.trust.current.payloadHash = 'b'.repeat(64); }, 'STALE_APPROVAL'],
  ['forged signature', context => { context.receipt.signature = Buffer.alloc(64).toString('base64'); }, 'SIGNATURE'],
  ['forged authority', context => { context.receipt.authority = 'attacker'; }, 'AUTHORITY'],
  ['malformed signature', context => { context.receipt.signature = 'invalid'; }, 'SIGNATURE'],
  ['unexpected trust field', context => { context.trust.autoApprove = true; }, 'SCHEMA'],
  ['unexpected receipt field', context => { context.receipt.approved = true; }, 'SCHEMA'],
];

for (const [name, mutate, code] of mutations) {
  test(`API and CLI deny ${name}`, async t => {
    const context = await fixture(t);
    context.artifact.lifecycle.state = 'approved';
    mutate(context);
    await context.save();
    await assert.rejects(validateHandoff(context.options), { code });
    const result = runCli(context.args('validate'));
    assert.equal(result.status, 1);
    assert.equal(JSON.parse(result.stderr).error, code);
    assert.equal(result.stdout, '');
  });
}

test('design/report byte edits including editorial whitespace invalidate approval', async t => {
  for (const filename of ['design/spec.md', 'design/review-5.md']) {
    const context = await fixture(t);
    context.artifact.lifecycle.state = 'approved';
    await context.save();
    await writeFile(path.join(context.root, filename), 'Editorial correction\n');
    await assert.rejects(validateHandoff(context.options), { code: 'STALE_CONTENT' });
  }
});

test('missing approval, repository trust and wrong key algorithms fail closed', async t => {
  const context = await fixture(t);
  context.artifact.lifecycle.state = 'approved';
  await context.save();
  await assert.rejects(validateHandoff({ root: context.root, artifactPath: 'handoff.json' }), { code: 'APPROVAL_REQUIRED' });
  const insideTrust = path.join(context.root, 'trust.json');
  await copyFile(context.options.trustPath, insideTrust);
  await assert.rejects(validateHandoff({ ...context.options, trustPath: insideTrust }), { code: 'UNTRUSTED_KEY' });
  const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  context.trust.publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });
  await context.save();
  await assert.rejects(validateHandoff(context.options), { code: 'KEY_TYPE' });
});

test('symlink artifact/design/trust escape, malformed JSON and oversized input reject', async t => {
  const context = await fixture(t);
  const outside = path.join(context.directory, 'outside.md');
  await writeFile(outside, 'Untrusted external content');
  await symlink(outside, path.join(context.root, 'design/escape.md'));
  context.artifact.payload.design.path = 'design/escape.md';
  await context.save();
  await assert.rejects(validateHandoff(context.options), { code: 'PATH_ESCAPE' });
  await symlink(context.options.receiptPath, path.join(context.root, 'outside.json'));
  await assert.rejects(validateHandoff({ ...context.options, artifactPath: 'outside.json' }), { code: 'PATH_ESCAPE' });
  await writeFile(path.join(context.root, 'handoff.json'), '{malformed');
  assert.equal(runCli(context.args('validate')).status, 1);
  await writeFile(path.join(context.root, 'handoff.json'), ' '.repeat(2 * 1024 * 1024 + 1));
  await assert.rejects(validateHandoff(context.options), { code: 'FILE_SIZE' });
});

test('caller trust path cannot be redirected through an attacker-editable in-root symlink', async t => {
  const context = await fixture(t);
  context.artifact.lifecycle.state = 'approved';
  await context.save();
  const link = path.join(context.root, 'trust-link.json');
  await symlink(context.options.trustPath, link);
  await assert.rejects(validateHandoff({ ...context.options, trustPath: link }), { code: 'UNTRUSTED_KEY' });
});
