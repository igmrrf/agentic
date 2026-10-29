#!/usr/bin/env node
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { filesBelow, parseRegistry, validateRegistry } from '../lib/registry.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let registry;
const command = process.argv[2] ?? 'check';
const generated = new Map();

async function includeTree(source, destination) {
  for (const filename of await filesBelow(path.join(ROOT, source))) {
    generated.set(
      path.join(destination, path.relative(path.join(ROOT, source), filename)),
      await readFile(filename),
    );
  }
}

async function buildPackages(agents) {
  const metadata = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const identity = {
    name: 'agentic',
    version: metadata.version,
    description: metadata.description,
    author: { name: 'igmrrf' },
    homepage: metadata.homepage,
    repository: 'https://github.com/igmrrf/agentic',
    license: metadata.license,
  };
  const serialize = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
  generated.set('.claude-plugin/plugin.json', serialize({ ...identity, agents }));
  generated.set(
    'plugin.json',
    serialize({
      $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
      ...identity,
      keywords: metadata.keywords,
      extensions: {
        'com.openai': {
          interface: {
            displayName: 'Agentic',
            shortDescription: 'Engineering standards and repeatable coding workflows.',
            longDescription: metadata.description,
            developerName: 'igmrrf',
            category: 'Developer Tools',
            websiteURL: 'https://github.com/igmrrf/agentic',
            defaultPrompt: [
              'Use setup to apply Agentic standards to this project.',
              'Use codinary to implement this task.',
            ],
          },
          onboardingSkill: './skills/setup/SKILL.md',
        },
      },
    }),
  );
  generated.set(
    '.agents/plugins/marketplace.json',
    serialize({
      name: 'agentic',
      interface: { displayName: 'Agentic' },
      plugins: [
        {
          name: 'agentic',
          source: { source: 'local', path: './' },
          policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
          category: 'Developer Tools',
        },
      ],
    }),
  );
}

async function buildOutputs() {
  const marketplace = JSON.parse(
    await readFile(path.join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'),
  );
  const adapters = await filesBelow(path.join(ROOT, 'framework/egm/adapters/claude'));
  await buildPackages(
    adapters.map((filename) => `./.claude-plugin/agents/${path.basename(filename)}`),
  );
  delete marketplace.plugins[0].skills;
  delete marketplace.plugins[0].agents;
  marketplace.plugins[0].strict = true;
  const metadata = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  marketplace.metadata.version = metadata.version;
  marketplace.plugins[0].version = metadata.version;
  for (const filename of adapters)
    generated.set(`.claude-plugin/agents/${path.basename(filename)}`, await readFile(filename));
  marketplace.plugins[0].description =
    'Agentic standards, Codinary delivery, EGM design review, optional Caveman voice and Security Audit.';
  generated.set(
    '.claude-plugin/marketplace.json',
    Buffer.from(`${JSON.stringify(marketplace, null, 2)}\n`),
  );
  generated.set(
    'skills/aliases.tsv',
    Buffer.from(
      registry.skills
        .flatMap((skill) => skill.aliases.map((alias) => `${alias}\t${skill.id}`))
        .join('\n') + '\n',
    ),
  );
  for (const skill of registry.skills) await buildSkillMetadata(skill);
}

async function buildSkillMetadata(skill) {
  generated.set(`${skill.path}/LICENSE-Agentic.txt`, await readFile(path.join(ROOT, 'LICENSE')));
  generated.set(
    `${skill.path}/dependencies.txt`,
    Buffer.from(skill.dependencies.join('\n') + (skill.dependencies.length ? '\n' : '')),
  );
  const title = skill.id
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
  const policy = skill.modelInvoked ? '' : 'policy:\n  allow_implicit_invocation: false\n';
  generated.set(
    `${skill.path}/agents/openai.yaml`,
    Buffer.from(
      `interface:\n  display_name: ${JSON.stringify(title)}\n  short_description: ${JSON.stringify(skill.responsibility.slice(0, 64))}\n${policy}`,
    ),
  );
  if (skill.bundle) await buildSkillBundle(skill);
}

async function buildSkillBundle(skill) {
  await includeTree('framework/egm', `${skill.path}/bundle`);
  await includeTree('lib/handoff', `${skill.path}/bundle/lib/handoff`);
  generated.set(
    `${skill.path}/bundle/bin/handoff.mjs`,
    await readFile(path.join(ROOT, 'bin/handoff.mjs')),
  );
  await includeTree('licenses', `${skill.path}/bundle/licenses`);
  for (const doc of ['handoff-contract', 'security-model'])
    generated.set(
      `${skill.path}/bundle/docs/${doc}.md`,
      await readFile(path.join(ROOT, `docs/integration/${doc}.md`)),
    );
}

async function checkOutputs() {
  for (const [filename, expected] of generated) {
    const actual = await readFile(path.join(ROOT, filename));
    if (!actual.equals(expected))
      throw new Error(
        `generated file differs: ${filename}; run node scripts/registry.mjs generate`,
      );
  }
  for (const skill of registry.skills.filter((item) => item.bundle)) {
    for (const filename of await filesBelow(path.join(ROOT, skill.path, 'bundle'))) {
      if (!generated.has(path.relative(ROOT, filename)))
        throw new Error(`unexpected bundle file: ${filename}`);
    }
  }
}

try {
  if (process.argv.length > 3)
    throw new Error('registry commands accept no flags or extra arguments');
  registry = parseRegistry(
    JSON.parse(await readFile(path.join(ROOT, 'registry/skills.json'), 'utf8')),
  );
  if (command === 'list') console.log(JSON.stringify(registry, null, 2));
  else {
    if (!['check', 'generate'].includes(command))
      throw new Error('Usage: agentic registry <list|check|generate>');
    await buildOutputs();
    if (command === 'generate') {
      for (const skill of registry.skills.filter((item) => item.bundle))
        await rm(path.join(ROOT, skill.path, 'bundle'), { recursive: true, force: true });
      for (const [filename, content] of generated) {
        await mkdir(path.dirname(path.join(ROOT, filename)), { recursive: true });
        await writeFile(path.join(ROOT, filename), content);
      }
    }
    await checkOutputs();
    await validateRegistry(ROOT, registry);
    console.log(
      `Registry ${command}: ${registry.skills.length} canonical skills, generated metadata and bundles valid`,
    );
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
