#!/usr/bin/env node
import { codinaryIntake, transitionHandoff, validateHandoff } from '../lib/handoff/index.mjs';

const USAGE = 'Usage: agentic handoff <validate|transition|intake> --root <repository> --artifact <relative.json> [--receipt <receipt.json> --trust <external.json>] [--to <state>] [--mode handoff]';

function parseArguments(argv) {
  const [command, ...args] = argv;
  if (command === '--help' || command === 'help' || !command) return { command: 'help' };
  const names = { '--root': 'root', '--artifact': 'artifactPath', '--receipt': 'receiptPath', '--trust': 'trustPath', '--to': 'to', '--mode': 'mode' };
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const name = names[args[index]];
    if (!name || !args[index + 1] || args[index + 1].startsWith('--') || Object.hasOwn(options, name)) throw new Error('invalid, missing or duplicate option');
    options[name] = args[index + 1];
  }
  if (!['validate', 'transition', 'intake'].includes(command)) throw new Error('unknown handoff command');
  const allowed = { validate: ['root', 'artifactPath', 'receiptPath', 'trustPath'], transition: ['root', 'artifactPath', 'receiptPath', 'trustPath', 'to'], intake: ['root', 'artifactPath', 'receiptPath', 'trustPath', 'mode'] };
  if (Object.keys(options).some(key => !allowed[command].includes(key))) throw new Error('unexpected command option');
  return { command, options };
}

try {
  const { command, options } = parseArguments(process.argv.slice(2));
  if (command === 'help') console.log(USAGE);
  else {
    const handlers = { validate: validateHandoff, transition: transitionHandoff, intake: codinaryIntake };
    console.log(JSON.stringify(await handlers[command](options), null, 2));
  }
} catch (error) {
  console.error(JSON.stringify({ error: error.code ?? 'INVALID_INPUT', message: error.message }));
  process.exitCode = 1;
}
