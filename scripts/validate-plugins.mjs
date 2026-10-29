#!/usr/bin/env node
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command}: ${result.stderr}\n${result.stdout}`);
  return result.stdout;
}

async function validate() {
  if (process.argv.slice(2).some((argument) => argument !== '--agy'))
    throw new Error('Usage: validate-plugins.mjs [--agy]');
  const directory = await mkdtemp(path.join(tmpdir(), 'agentic-plugins-'));
  try {
    const packed = JSON.parse(
      run('npm', ['pack', '--json', '--pack-destination', directory], {
        cwd: ROOT,
        env: { ...process.env, npm_config_cache: path.join(directory, 'npm-cache') },
      }),
    );
    run('tar', ['-xzf', path.join(directory, packed[0].filename), '-C', directory]);
    const packageRoot = path.join(directory, 'package');
    const metadata = JSON.parse(await readFile(path.join(packageRoot, 'plugin.json'), 'utf8'));
    console.log(`Validating packaged ${metadata.name} ${metadata.version}`);
    console.log(run('claude', ['plugin', 'validate', '--strict', packageRoot]));
    if (process.argv.includes('--agy'))
      console.log(run('agy', ['plugin', 'validate', packageRoot, '--strict', '--json']));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

validate().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
