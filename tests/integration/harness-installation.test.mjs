import test from 'node:test';
import assert from 'node:assert/strict';
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './fixtures.mjs';

const TARGETS = [
  ['claude', '.claude/skills', '.claude/skills'],
  ['codex', '.agents/skills', '.agents/skills'],
  ['pi', '.pi/skills', '.pi/agent/skills'],
  ['opencode', '.opencode/skills', 'config/opencode/skills'],
  ['agy', '.agents/skills', '.gemini/antigravity-cli/skills'],
  ['antigravity', '.agents/skills', '.gemini/config/skills'],
  ['gemini', '.gemini/skills', '.gemini/skills'],
  ['cursor', '.cursor/skills', '.cursor/skills'],
  ['copilot', '.github/skills', '.copilot/skills'],
  ['cline', '.cline/skills', '.cline/skills'],
  ['windsurf', '.windsurf/skills', '.codeium/windsurf/skills'],
  ['amp', '.agents/skills', 'config/agents/skills'],
];

async function fixture(context) {
  const directory = await mkdtemp(path.join(tmpdir(), 'agentic-harness-'));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const project = path.join(directory, 'project with spaces');
  const home = path.join(directory, 'home with spaces');
  await mkdir(project);
  await mkdir(home);
  const env = { ...process.env, HOME: home, XDG_CONFIG_HOME: path.join(home, 'config') };
  const run = (args) =>
    spawnSync(process.execPath, [path.join(ROOT, 'bin/agentic.js'), ...args], {
      cwd: project,
      env,
      encoding: 'utf8',
      timeout: 30000,
    });
  return { project, home, run };
}

function accept(result) {
  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  return result;
}

for (const [harness, projectPath, globalPath] of TARGETS) {
  for (const scope of ['project', 'global']) {
    test(`${harness} ${scope}: preview, install, preserve, update and uninstall`, async (context) => {
      const workspace = await fixture(context);
      const destination = path.join(
        scope === 'global' ? workspace.home : workspace.project,
        scope === 'global' ? globalPath : projectPath,
      );
      const args = [
        'skills',
        '--agent',
        harness,
        '--skill',
        'tdd',
        ...(scope === 'global' ? ['--global'] : ['--target', workspace.project]),
      ];
      accept(workspace.run([...args, '--dry-run']));
      await assert.rejects(access(destination));
      accept(workspace.run(args));
      for (const skill of ['tdd', 'codebase-design']) {
        await access(path.join(destination, skill, 'SKILL.md'));
        await access(path.join(destination, skill, 'LICENSE-Agentic.txt'));
      }
      const marker = path.join(destination, 'tdd', 'local.txt');
      await writeFile(marker, 'keep until update');
      await mkdir(path.join(destination, 'unrelated'));
      accept(workspace.run(args));
      assert.equal(await readFile(marker, 'utf8'), 'keep until update');
      accept(workspace.run([...args, '--update']));
      await assert.rejects(access(marker));
      accept(workspace.run([...args, '--uninstall']));
      assert.deepEqual((await readdir(destination)).sort(), ['codebase-design', 'unrelated']);
    });
  }
}

test('overlapping aliases install once and reject unknown targets before any writes', async (context) => {
  const workspace = await fixture(context);
  const result = accept(
    workspace.run(['skills', '--agent', 'codex,agents,AGY,antigravity,amp', '--skill', 'caveman']),
  );
  assert.equal((result.stderr.match(/Installed caveman ->/g) ?? []).length, 1);
  const empty = await fixture(context);
  assert.equal(empty.run(['skills', '--agent', 'all,unknown', '--skill', 'caveman']).status, 1);
  assert.deepEqual(await readdir(empty.project), []);
});

test('all covers each harness location and local links resolve to the canonical skills', async (context) => {
  const workspace = await fixture(context);
  accept(workspace.run(['skills', '--global', '--agent', 'all', '--skill', 'caveman', '--link']));
  for (const [, , globalPath] of TARGETS) {
    assert.equal(
      await realpath(path.join(workspace.home, globalPath, 'caveman')),
      path.join(ROOT, 'skills/caveman'),
    );
  }
});

for (const [alias, harness] of [
  ['claude-code', 'claude'],
  ['antigravity-cli', 'agy'],
  ['gemini-cli', 'gemini'],
  ['github-copilot', 'copilot'],
]) {
  test(`${alias} resolves to ${harness}`, async (context) => {
    const workspace = await fixture(context);
    const args = ['skills', '--global', '--skill', 'caveman', '--dry-run', '--agent'];
    assert.equal(
      accept(workspace.run([...args, alias])).stderr,
      accept(workspace.run([...args, harness])).stderr,
    );
  });
}

test('OpenCode and Amp use the default config directory when XDG_CONFIG_HOME is absent', async (context) => {
  const workspace = await fixture(context);
  const result = spawnSync(
    '/bin/bash',
    [
      path.join(ROOT, 'scripts/install-skills.sh'),
      '--global',
      '--agent',
      'opencode,amp',
      '--skill',
      'caveman',
    ],
    {
      encoding: 'utf8',
      env: { PATH: process.env.PATH, HOME: workspace.home },
    },
  );
  accept(result);
  for (const harness of ['opencode', 'agents'])
    await access(path.join(workspace.home, '.config', harness, 'skills/caveman/SKILL.md'));
});

for (const harness of ['codex', 'pi', 'opencode', 'agy', 'antigravity', 'amp']) {
  test(`init selects AGENTS.md for ${harness} and preserves existing project instructions`, async (context) => {
    const workspace = await fixture(context);
    const args = ['init', '--lang=go', '--agent', harness, '--no-ci'];
    accept(workspace.run(args));
    const instructions = path.join(workspace.project, 'AGENTS.md');
    assert.match(await readFile(instructions, 'utf8'), /Go Coding Rules/);
    await assert.rejects(access(path.join(workspace.project, 'CLAUDE.md')));
    await writeFile(instructions, 'Project instructions');
    accept(workspace.run(args));
    assert.equal(await readFile(instructions, 'utf8'), 'Project instructions');
  });
}

test('init rejects unknown harnesses before writing toolchain files', async (context) => {
  const workspace = await fixture(context);
  assert.equal(workspace.run(['init', '--lang=go', '--agent', 'unknown']).status, 1);
  assert.deepEqual(await readdir(workspace.project), []);
});
