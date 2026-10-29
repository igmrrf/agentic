import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, access, rm, realpath, symlink } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { ROOT } from './fixtures.mjs';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  assert.equal(result.status, 0, `${command}: ${result.stderr}\n${result.stdout}`);
  return result;
}

async function workspace(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'agentic-package-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const project = path.join(directory, 'project');
  await mkdir(project);
  return { directory, project };
}

async function assertInstalledBundle(skill) {
  for (const filename of ['SKILL.md', 'LICENSE-Agentic.txt', 'bundle/licenses/Agentic-MIT.txt', 'bundle/agents/comprehension.md', 'bundle/agents/bootstrap_orchestrator.md', 'bundle/resources/document_standards/zoom-out-standard.md', 'bundle/resources/document_standards/implementation-readiness-standard.md', 'bundle/docs/runtime.md', 'bundle/licenses/Google-EGM-Apache-2.0.txt', 'bundle/licenses/Matt-Pocock-MIT.txt']) await access(path.join(skill, filename));
  const output = run(process.execPath, [path.join(skill, 'bundle/bin/handoff.mjs'), '--help']);
  assert.match(output.stdout, /Usage:/);
  run(process.execPath, ['--input-type=module', '-e', `const api = await import(${JSON.stringify(`file://${path.join(skill, 'bundle/lib/handoff/index.mjs')}`)}); if (typeof api.codinaryIntake !== 'function') process.exit(1);`]);
}

test('selected EGM copy survives repeat/upgrade/uninstall with config preserved and dependencies complete', async t => {
  const { project } = await workspace(t);
  await mkdir(path.join(project, '.agents'));
  const config = '{"entries":[{"path":"custom-skills"}],"custom":true}\n';
  await writeFile(path.join(project, '.agents/skills.json'), config);
  const args = [path.join(ROOT, 'scripts/install-skills.sh'), '--target', project, '--agent', 'agents', '--skill', 'egm-review'];
  run('bash', args);
  const skill = path.join(project, '.agents/skills/egm-review');
  await assertInstalledBundle(skill);
  await writeFile(path.join(skill, 'local-change.txt'), 'preserve until explicit update');
  run('bash', args);
  await access(path.join(skill, 'local-change.txt'));
  run('bash', [...args, '--update']);
  await assert.rejects(access(path.join(skill, 'local-change.txt')));
  assert.equal(await readFile(path.join(project, '.agents/skills.json'), 'utf8'), config);
  run('bash', [...args, '--uninstall']);
  await assert.rejects(access(skill));
  assert.equal(await readFile(path.join(project, '.agents/skills.json'), 'utf8'), config);
});

test('local link, alias and dependency closure install without duplicate commands', async t => {
  const { project } = await workspace(t);
  const args = [path.join(ROOT, 'scripts/install-skills.sh'), '--target', project, '--agent', 'agents'];
  run('bash', [...args, '--skill', 'egm-draft', '--link']);
  assert.equal(await realpath(path.join(project, '.agents/skills/egm-draft')), path.join(ROOT, 'skills/egm-draft'));
  run('bash', [...args, '--skill', 'grill-me,tdd']);
  for (const name of ['grilling', 'tdd', 'codebase-design']) await access(path.join(project, `.agents/skills/${name}/SKILL.md`));
  await assert.rejects(access(path.join(project, '.agents/skills/grill-me')));
  run('bash', [...args, '--skill', 'tdd', '--uninstall']);
  await access(path.join(project, '.agents/skills/codebase-design/SKILL.md'));
});

test('remote tar selected EGM and npm package retain complete installed consumers', async t => {
  const { directory, project } = await workspace(t);
  const archive = path.join(directory, 'source.tar.gz');
  run('tar', ['-czf', archive, '--exclude=.git', '--exclude=.ruff_cache', '-C', path.dirname(ROOT), path.basename(ROOT)]);
  const installer = await readFile(path.join(ROOT, 'scripts/install-skills.sh'), 'utf8');
  run('bash', ['-s', '--', '--target', project, '--agent', 'agents', '--skill', 'egm-review'], { input: installer, env: { ...process.env, AGENTIC_TARBALL_URL: `file://${archive}` } });
  await assertInstalledBundle(path.join(project, '.agents/skills/egm-review'));
  const packed = run('npm', ['pack', '--json', '--pack-destination', directory], { cwd: ROOT, env: { ...process.env, npm_config_cache: path.join(directory, 'npm-cache') } });
  const filename = JSON.parse(packed.stdout)[0].filename;
  run('tar', ['-xzf', path.join(directory, filename), '-C', directory]);
  const packageRoot = path.join(directory, 'package');
  run(process.execPath, [path.join(packageRoot, 'bin/agentic.js'), 'registry', 'check']);
  const consumer = path.join(directory, 'consumer');
  await mkdir(consumer);
  run(process.execPath, [path.join(packageRoot, 'bin/agentic.js'), 'skills', '--target', consumer, '--skill', 'egm-bootstrap', '--agent', 'agents']);
  const namespace = path.join(consumer, 'node_modules/@igmrrf');
  await mkdir(namespace, { recursive: true });
  await symlink(packageRoot, path.join(namespace, 'agentic'));
  run(process.execPath, ['--input-type=module', '-e', `import { canonical } from '@igmrrf/agentic/lib/handoff/index.mjs'; import { parseRegistry } from '@igmrrf/agentic/lib/registry.mjs'; import { createRequire } from 'node:module'; const require = createRequire(import.meta.url); if (canonical({b:2,a:1}) !== '{"a":1,"b":2}' || typeof parseRegistry !== 'function' || require('@igmrrf/agentic/package').version !== '1.2.0' || require.resolve('@igmrrf/agentic/typescript/biome') !== require.resolve('@igmrrf/agentic/typescript/biome.json') || require.resolve('@igmrrf/agentic/package') !== require.resolve('@igmrrf/agentic/package.json') || require.resolve('@igmrrf/agentic/bin/agentic') !== require.resolve('@igmrrf/agentic/bin/agentic.js')) process.exit(1);`], { cwd: consumer });
  const skill = path.join(consumer, '.agents/skills/egm-bootstrap');
  await assertInstalledBundle(skill);
  await access(path.join(skill, 'references/templates.md'));
  const modulePath = `file://${path.join(packageRoot, 'lib/handoff/index.mjs')}`;
  run(process.execPath, ['--input-type=module', '-e', `const api = await import(${JSON.stringify(modulePath)}); if (api.canonical({z:1,a:2}) !== '{"a":2,"z":1}') process.exit(1);`]);
});
