#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const COMMANDS = {
  init: path.join(ROOT, 'scripts', 'init.sh'),
  skills: path.join(ROOT, 'scripts', 'install-skills.sh'),
  handoff: path.join(ROOT, 'bin', 'handoff.mjs'),
  registry: path.join(ROOT, 'scripts', 'registry.mjs'),
};

const USAGE = `Usage: agentic <command> [options]

Commands:
  init      Apply coding standards, linter configs, CI, and agent rules to a project
  skills    Install skills for Claude, Codex, Pi, OpenCode, Antigravity and more
  handoff   Validate design artifacts and approved Codinary intake
  registry  List, validate or generate canonical skill metadata
  help      Show this message

Run "agentic <command> --help" for command options.

Examples:
  npx -y github:igmrrf/agentic init --lang=go --claude
  npx -y github:igmrrf/agentic skills --global --agent codex
  npx -y github:igmrrf/agentic skills --agent pi,opencode`;

function run(script, args) {
  const result = spawnSync(script.endsWith('.mjs') ? process.execPath : 'bash', [script, ...args], {
    stdio: 'inherit',
  });
  if (result.error) {
    const reason =
      result.error.code === 'ENOENT' ? 'bash was not found on PATH' : result.error.message;
    console.error(`agentic: ${reason}`);
    return 1;
  }
  if (result.signal) {
    process.kill(process.pid, result.signal);
  }
  return result.status ?? 1;
}

function main(argv) {
  const [command, ...args] = argv;
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(USAGE);
    return 0;
  }
  const script = COMMANDS[command];
  if (!script) {
    console.error(`agentic: unknown command "${command}"\n\n${USAGE}`);
    return 1;
  }
  return run(script, args);
}

process.exitCode = main(process.argv.slice(2));
