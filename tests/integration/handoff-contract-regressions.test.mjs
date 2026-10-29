import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, realpath, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { generateKeyPairSync, sign } from 'node:crypto';
import { codinaryIntake, PRESETS, validateHandoff } from '../../lib/handoff/index.mjs';
import { digest, fixture, runCli, serialize } from './fixtures.mjs';

for (const [name, preset] of [['number', 9], ['array', ['9']], ['object', {}], ['null', null]]) {
  test(`API and CLI reject ${name} review preset`, async context => {
    const sample = await fixture(context);
    sample.artifact.payload.review.preset = preset;
    sample.artifact.payload.review.stages = sample.artifact.payload.review.stages.filter(stage => stage.id === '9');
    await sample.save();
    await assert.rejects(validateHandoff(sample.options), { code: 'SCHEMA' });
    const result = runCli(sample.args('validate'));
    assert.equal(result.status, 1);
    assert.equal(JSON.parse(result.stderr).error, 'SCHEMA');
    assert.equal(result.stdout, '');
  });
}

test('every documented string preset retains exact API and CLI review output', async context => {
  const sample = await fixture(context);
  const stages = structuredClone(sample.artifact.payload.review.stages);
  for (const [preset, required] of Object.entries(PRESETS)) {
    sample.artifact.payload.review = { preset, stages: stages.filter(stage => required.includes(stage.id)) };
    await sample.save();
    const result = await validateHandoff(sample.options);
    assert.deepEqual(result.artifact, sample.artifact);
    const cli = runCli(sample.args('validate'));
    assert.equal(cli.status, 0, cli.stderr);
    assert.deepEqual(JSON.parse(cli.stdout), result);
  }
});

async function attackerFixture(context) {
  const sample = await fixture(context);
  sample.artifact.lifecycle.state = 'approved';
  await sample.save();
  const originalTrust = await readFile(sample.options.trustPath);
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const receipt = { ...sample.receipt, authority: 'attacker-controlled-project', payloadHash: digest(serialize(sample.artifact.payload)) };
  receipt.signature = sign(null, Buffer.from(serialize({ domain: 'agentic.egm.human-approval.v1', schemaVersion: 1, payloadHash: receipt.payloadHash, authority: receipt.authority, approvedAt: receipt.approvedAt })), privateKey).toString('base64');
  const trust = { ...sample.trust, authority: receipt.authority, publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }) };
  await writeFile(path.join(sample.root, 'trust.json'), JSON.stringify(trust));
  const receiptPath = path.join(sample.root, 'attacker-receipt.json');
  await writeFile(receiptPath, JSON.stringify(receipt));
  await mkdir(path.join(sample.root, 'one/two'), { recursive: true });
  await mkdir(path.join(sample.directory, 'safe'), { recursive: true });
  await symlink(path.join(sample.root, 'one/two'), path.join(sample.root, 'redirect'));
  await symlink(sample.options.trustPath, path.join(sample.root, 'exit.json'));
  await symlink(sample.root, path.join(sample.directory, 'external-alias'));
  await symlink(path.join(sample.root, 'trust.json'), path.join(sample.directory, 'external-trust.json'));
  await symlink(sample.options.trustPath, path.join(sample.directory, 'caller-trust-alias.json'));
  return { ...sample, originalTrust, receiptPath };
}

const trustCases = [
  ['project trust', sample => path.join(sample.root, 'trust.json')],
  ['project symlink to external trust', sample => path.join(sample.root, 'exit.json')],
  ['external symlink to project trust', sample => path.join(sample.directory, 'external-trust.json')],
  ['external symlink to external caller trust', sample => path.join(sample.directory, 'caller-trust-alias.json')],
  ['external alias enters project', sample => path.join(sample.directory, 'external-alias/trust.json')],
  ['external alias enters and exits project', sample => path.join(sample.directory, 'external-alias/exit.json')],
  ['symlink before parent traversal', sample => `${sample.root}/redirect/../../trust.json`],
  ['symlink traversal with extra current segment', sample => `${sample.root}/./redirect/../../trust.json`],
  ['parent traversal in external path', sample => `${sample.directory}/safe/../trust.json`],
  ['current segment in external path', sample => `${sample.directory}/./trust.json`],
  ['repeated separator in external path', sample => `${sample.directory}//trust.json`],
  ['relative trust path', sample => path.relative(process.cwd(), sample.options.trustPath)],
];

for (const [name, trustPathFor] of trustCases) {
  test(`API and CLI intake deny ${name} without accepting a project signer`, async context => {
    const sample = await attackerFixture(context);
    const trustPath = trustPathFor(sample);
    const options = { ...sample.options, mode: 'handoff', trustPath, receiptPath: sample.receiptPath };
    await assert.rejects(codinaryIntake(options), { code: 'UNTRUSTED_KEY' });
    const cli = runCli(['handoff', 'intake', '--mode', 'handoff', '--root', sample.root, '--artifact', 'handoff.json', '--receipt', sample.receiptPath, '--trust', trustPath]);
    assert.equal(cli.status, 1);
    assert.equal(JSON.parse(cli.stderr).error, 'UNTRUSTED_KEY');
    assert.equal(cli.stdout, '');
    assert.deepEqual(await readFile(sample.options.trustPath), sample.originalTrust);
  });
}

test('explicit canonical external trust accepts the caller signer and normalized attack selects no attacker key', async context => {
  const sample = await attackerFixture(context);
  const trustPath = await realpath(sample.options.trustPath);
  const normalizedAttack = path.normalize(`${sample.root}/redirect/../../trust.json`);
  assert.equal(await realpath(normalizedAttack), trustPath);
  await assert.rejects(codinaryIntake({ ...sample.options, mode: 'handoff', trustPath: normalizedAttack, receiptPath: sample.receiptPath }), { code: 'AUTHORITY' });
  const denied = runCli(['handoff', 'intake', '--mode', 'handoff', '--root', sample.root, '--artifact', 'handoff.json', '--receipt', sample.receiptPath, '--trust', normalizedAttack]);
  assert.equal(denied.status, 1);
  assert.equal(JSON.parse(denied.stderr).error, 'AUTHORITY');
  assert.equal(denied.stdout, '');
  const options = { ...sample.options, trustPath, mode: 'handoff' };
  const intake = await codinaryIntake(options);
  assert.equal(intake.approval.authority, 'synthetic-human');
  const cli = runCli(['handoff', 'intake', '--mode', 'handoff', '--root', sample.root, '--artifact', 'handoff.json', '--receipt', sample.options.receiptPath, '--trust', trustPath]);
  assert.equal(cli.status, 0, cli.stderr);
  assert.deepEqual(JSON.parse(cli.stdout), intake);
  assert.deepEqual(await readFile(sample.options.trustPath), sample.originalTrust);
});
