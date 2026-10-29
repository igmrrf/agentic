import { mkdtemp, mkdir, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { generateKeyPairSync, sign, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const CLI = path.join(ROOT, 'bin/agentic.js');
export const digest = value => createHash('sha256').update(value).digest('hex');
export const serialize = value => Array.isArray(value) ? `[${value.map(serialize).join(',')}]` : value !== null && typeof value === 'object' ? `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${serialize(value[key])}`).join(',')}}` : JSON.stringify(value);

export function runCli(args, options = {}) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', ...options });
}

export async function fixture(t) {
  const directory = await realpath(await mkdtemp(path.join(tmpdir(), 'agentic-handoff-')));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const root = path.join(directory, 'project');
  await mkdir(path.join(root, 'design'), { recursive: true });
  const git = args => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git(['init', '-q']);
  git(['config', 'user.name', 'Synthetic Test']);
  git(['config', 'user.email', 'test@example.invalid']);
  git(['remote', 'add', 'origin', 'https://example.invalid/team/project.git']);
  git(['-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-qm', 'synthetic baseline']);
  const design = '# Synthetic design\nRecover exactly once.\n';
  await writeFile(path.join(root, 'design/spec.md'), design);
  const stages = [];
  for (const id of ['5', '6', '7', '8', '9']) {
    const report = `Stage ${id}: completed synthetic review\n`;
    await writeFile(path.join(root, `design/review-${id}.md`), report);
    stages.push({ id, report: { path: `design/review-${id}.md`, sha256: digest(report) }, reviewedDesignSha256: digest(design), findings: [] });
  }
  const payload = { specId: 'synthetic-spec', specVersion: 1, repository: { url: git(['remote', 'get-url', 'origin']), revision: git(['rev-parse', 'HEAD']) }, design: { path: 'design/spec.md', sha256: digest(design) }, requirements: [{ id: 'R1', text: 'Recover once' }], acceptanceCriteria: [{ id: 'AC1', requirementIds: ['R1'], text: 'Repeated callback recovers once', verification: 'Send duplicate callback through API' }], architecturalDecisions: ['Idempotent callback'], technicalConstraints: [], interfaces: ['POST /callback'], dataModelChanges: [], failureScenarios: ['Duplicate callback'], securityRequirements: [], migrationConsiderations: [], operationalRequirements: [], unresolvedRisks: [], review: { preset: 'uninterrupted', stages } };
  const artifact = { schemaVersion: 1, payload, lifecycle: { state: 'reviewed' } };
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const receipt = { schemaVersion: 1, payloadHash: digest(serialize(payload)), authority: 'synthetic-human', approvedAt: '2026-10-28T12:00:00.000Z', signature: '' };
  const signedBytes = JSON.stringify({ approvedAt: receipt.approvedAt, authority: receipt.authority, domain: 'agentic.egm.human-approval.v1', payloadHash: receipt.payloadHash, schemaVersion: 1 });
  receipt.signature = sign(null, Buffer.from(signedBytes), privateKey).toString('base64');
  const trust = { schemaVersion: 1, authority: receipt.authority, publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }), current: { specId: payload.specId, specVersion: 1, payloadHash: receipt.payloadHash }, repository: payload.repository };
  const options = { root, artifactPath: 'handoff.json', receiptPath: path.join(directory, 'receipt.json'), trustPath: path.join(directory, 'trust.json') };
  const save = async () => {
    await writeFile(path.join(root, options.artifactPath), JSON.stringify(artifact));
    await writeFile(options.receiptPath, JSON.stringify(receipt));
    await writeFile(options.trustPath, JSON.stringify(trust));
  };
  const approveSynthetic = () => {
    receipt.payloadHash = digest(serialize(artifact.payload));
    trust.current = { specId: artifact.payload.specId, specVersion: artifact.payload.specVersion, payloadHash: receipt.payloadHash };
    const bytes = JSON.stringify({ approvedAt: receipt.approvedAt, authority: receipt.authority, domain: 'agentic.egm.human-approval.v1', payloadHash: receipt.payloadHash, schemaVersion: 1 });
    receipt.signature = sign(null, Buffer.from(bytes), privateKey).toString('base64');
  };
  await save();
  const args = command => ['handoff', command, '--root', root, '--artifact', options.artifactPath, '--receipt', options.receiptPath, '--trust', options.trustPath];
  return { directory, root, artifact, receipt, trust, options, save, args, git, approveSynthetic };
}
