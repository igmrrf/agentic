import path from 'node:path';
import { createPublicKey, verify } from 'node:crypto';
import { realpath } from 'node:fs/promises';
import { canonical, isWithin, readJson, sha256 } from './files.mjs';
import { checksum, object, requireCondition, text } from './schema.mjs';

export function payloadHash(payload) {
  return sha256(canonical(payload));
}

export function approvalMessage(receipt) {
  return Buffer.from(canonical({ domain: 'agentic.egm.human-approval.v1', schemaVersion: receipt.schemaVersion, payloadHash: receipt.payloadHash, authority: receipt.authority, approvedAt: receipt.approvedAt }), 'utf8');
}

function parseReceipt(receipt) {
  object(receipt, ['schemaVersion', 'payloadHash', 'authority', 'approvedAt', 'signature'], 'receipt');
  requireCondition(receipt.schemaVersion === 1, 'SCHEMA_VERSION', 'unsupported receipt schema');
  checksum(receipt.payloadHash);
  text(receipt.authority, 'authority');
  text(receipt.signature, 'signature');
  requireCondition(typeof receipt.approvedAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(receipt.approvedAt) && Number.isFinite(Date.parse(receipt.approvedAt)) && new Date(receipt.approvedAt).toISOString() === receipt.approvedAt, 'SCHEMA', 'approvedAt must be UTC ISO timestamp');
  requireCondition(/^[A-Za-z0-9+/]{86}==$/.test(receipt.signature), 'SIGNATURE', 'expected base64 Ed25519 signature');
}

function parseTrust(trust) {
  object(trust, ['schemaVersion', 'authority', 'publicKeyPem', 'current', 'repository'], 'trust');
  requireCondition(trust.schemaVersion === 1, 'SCHEMA_VERSION', 'unsupported trust schema');
  text(trust.authority, 'authority');
  text(trust.publicKeyPem, 'publicKeyPem');
  object(trust.current, ['specId', 'specVersion', 'payloadHash'], 'trust.current');
  text(trust.current.specId, 'trust.specId');
  requireCondition(Number.isSafeInteger(trust.current.specVersion) && trust.current.specVersion > 0, 'SCHEMA', 'invalid trusted version');
  checksum(trust.current.payloadHash);
  object(trust.repository, ['url', 'revision'], 'trust.repository');
  text(trust.repository.url, 'trust.repository.url');
  text(trust.repository.revision, 'trust.repository.revision');
}

async function resolveExternalTrust(root, trustPath) {
  requireCondition(typeof trustPath === 'string' && path.isAbsolute(trustPath) && !trustPath.split(/[\\/]/).some(segment => ['.', '..'].includes(segment)) && path.normalize(trustPath) === trustPath, 'UNTRUSTED_KEY', 'trust path must be canonical and absolute without traversal');
  const resolvedRoot = await realpath(root);
  const resolvedTrust = await realpath(trustPath);
  requireCondition(!isWithin(resolvedRoot, resolvedTrust), 'UNTRUSTED_KEY', 'trust must remain outside artifact root');
  let ancestor = trustPath;
  while (true) {
    const resolvedAncestor = await realpath(ancestor);
    requireCondition(resolvedAncestor === ancestor && !isWithin(resolvedRoot, resolvedAncestor), 'UNTRUSTED_KEY', 'trust path and ancestors must be canonical outside artifact root without symlink aliases');
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    ancestor = parent;
  }
  return resolvedTrust;
}

export async function verifyApproval({ root, payload, receiptPath, trustPath }) {
  requireCondition(receiptPath && trustPath, 'APPROVAL_REQUIRED', 'receipt and external caller-pinned trust required');
  const resolvedTrust = await resolveExternalTrust(root, trustPath);
  const trust = await readJson(resolvedTrust);
  const receipt = await readJson(receiptPath);
  parseTrust(trust);
  parseReceipt(receipt);
  const digest = payloadHash(payload);
  requireCondition(receipt.payloadHash === digest && trust.current.payloadHash === digest && trust.current.specId === payload.specId && trust.current.specVersion === payload.specVersion, 'STALE_APPROVAL', 'approval or expected-current binding mismatch');
  requireCondition(trust.authority === receipt.authority, 'AUTHORITY', 'approval authority mismatch');
  requireCondition(trust.repository.url === payload.repository.url && trust.repository.revision === payload.repository.revision, 'REPOSITORY', 'trusted repository binding mismatch');
  requireCondition(/^-----BEGIN PUBLIC KEY-----[\s\S]+-----END PUBLIC KEY-----\s*$/.test(trust.publicKeyPem), 'KEY_TYPE', 'expected public key PEM, never a private key');
  const publicKey = createPublicKey(trust.publicKeyPem);
  requireCondition(publicKey.asymmetricKeyType === 'ed25519', 'KEY_TYPE', 'only Ed25519 verification keys supported');
  requireCondition(verify(null, approvalMessage(receipt), publicKey, Buffer.from(receipt.signature, 'base64')), 'SIGNATURE', 'invalid human approval signature');
  return { authority: receipt.authority, approvedAt: receipt.approvedAt, payloadHash: digest };
}
