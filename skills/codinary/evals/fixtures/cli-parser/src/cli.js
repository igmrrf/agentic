#!/usr/bin/env node

const MAX_COUNT = 5;
const HELP = [
  'Usage: greet [--name NAME] [--count COUNT] [--upper]',
  '',
  'Options:',
  '  --name NAME    Recipient (default: World)',
  '  --count COUNT  Repeat 1 through 5 times (default: 1)',
  '  --upper        Uppercase the greeting',
  '  -h, --help     Show this help',
  '',
].join('\n');

function parseArguments(argumentsList) {
  const options = { name: 'World', count: 1, isUppercase: false };
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === '--help' || argument === '-h') {
      return { kind: 'help' };
    }
    if (argument === '--upper') {
      options.isUppercase = true;
      continue;
    }
    if (argument === '--name') {
      const value = argumentsList[index + 1];
      if (value === undefined || value.trim() === '' || value.startsWith('-')) {
        return { kind: 'error', message: '--name requires a non-empty value' };
      }
      options.name = value;
      index += 1;
      continue;
    }
    if (argument === '--count') {
      const value = argumentsList[index + 1];
      if (value === undefined || !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > MAX_COUNT) {
        return { kind: 'error', message: '--count requires an integer from 1 to 5' };
      }
      options.count = Number(value);
      index += 1;
      continue;
    }
    return { kind: 'error', message: `unknown option: ${argument}` };
  }
  return { kind: 'greeting', options };
}

function run(argumentsList) {
  const result = parseArguments(argumentsList);
  if (result.kind === 'error') {
    process.stderr.write(`error: ${result.message}\n`);
    return 2;
  }
  if (result.kind === 'help') {
    process.stdout.write(HELP);
    return 0;
  }
  const greeting = `Hello, ${result.options.name}!`;
  const output = result.options.isUppercase ? greeting.toUpperCase() : greeting;
  process.stdout.write(`${Array.from({ length: result.options.count }, () => output).join('\n')}\n`);
  return 0;
}

process.exitCode = run(process.argv.slice(2));
