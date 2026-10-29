import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { requireCondition } from './schema.mjs';

const MAX_BYTES = 2 * 1024 * 1024;

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  requireCondition(value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value)), 'CANONICAL', 'unsupported canonical value');
  return JSON.stringify(value);
}

export function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export async function readBounded(filename) {
  const info = await stat(filename);
  requireCondition(info.isFile() && info.size <= MAX_BYTES, 'FILE_SIZE', 'expected file no larger than 2 MiB');
  const bytes = await readFile(filename);
  requireCondition(bytes.length <= MAX_BYTES, 'FILE_SIZE', 'file changed beyond size bound');
  return bytes;
}

export async function readJson(filename) {
  return JSON.parse((await readBounded(filename)).toString('utf8'));
}

export async function resolveArtifactPath(root, filename) {
  requireCondition(typeof filename === 'string' && filename.length > 0 && !path.isAbsolute(filename) && !filename.split(/[\\/]/).includes('..'), 'PATH_ESCAPE', 'artifact path must be relative without traversal');
  const resolvedRoot = await realpath(root);
  const resolved = await realpath(path.resolve(resolvedRoot, filename));
  requireCondition(isWithin(resolvedRoot, resolved), 'PATH_ESCAPE', 'artifact symlink escapes root');
  return resolved;
}

export async function verifyFile(root, reference) {
  const filename = await resolveArtifactPath(root, reference.path);
  requireCondition(sha256(await readBounded(filename)) === reference.sha256, 'STALE_CONTENT', `checksum mismatch: ${reference.path}`);
}

export function repositoryIdentity(root) {
  return {
    url: execFileSync('git', ['-C', root, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim(),
    revision: execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  };
}
