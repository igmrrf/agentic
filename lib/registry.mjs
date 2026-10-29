import { readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { object, requireCondition, text, list, unique } from './handoff/schema.mjs';
import { isWithin } from './handoff/files.mjs';

const FIELDS = ['id', 'description', 'responsibility', 'invocation', 'modelInvoked', 'inputs', 'outputs', 'prerequisites', 'dependencies', 'sideEffects', 'runtimeCapabilities', 'permissions', 'environments', 'relatedSkills', 'aliases', 'path', 'bundle', 'failureSemantics'];
const ARRAYS = ['inputs', 'outputs', 'prerequisites', 'dependencies', 'sideEffects', 'runtimeCapabilities', 'permissions', 'environments', 'relatedSkills', 'aliases', 'failureSemantics'];

export function parseRegistry(registry) {
  object(registry, ['schemaVersion', 'skills'], 'registry');
  requireCondition(registry.schemaVersion === 1, 'REGISTRY', 'unsupported registry schema');
  list(registry.skills, 'skills');
  requireCondition(registry.skills.length > 0, 'REGISTRY', 'empty registry');
  for (const skill of registry.skills) {
    object(skill, FIELDS, 'skill');
    for (const field of ['id', 'description', 'responsibility', 'invocation', 'path']) text(skill[field], field);
    requireCondition(/^[a-z][a-z0-9-]*$/.test(skill.id) && skill.path === `skills/${skill.id}`, 'REGISTRY', 'invalid skill identity or path');
    requireCondition(typeof skill.modelInvoked === 'boolean' && typeof skill.bundle === 'boolean', 'REGISTRY', 'expected boolean invocation/bundle');
    for (const field of ARRAYS) {
      list(skill[field], field);
      skill[field].forEach(value => text(value, field));
      unique(skill[field], field);
      if (!['dependencies', 'relatedSkills', 'aliases'].includes(field)) requireCondition(skill[field].length > 0, 'REGISTRY', `${field}: meaningful metadata required`);
    }
    requireCondition(skill.aliases.every(alias => /^[a-z][a-z0-9-]*$/.test(alias)), 'REGISTRY', 'invalid alias');
  }
  unique(registry.skills.flatMap(skill => [skill.id, ...skill.aliases]), 'skill IDs and aliases');
  validateDependencies(registry.skills);
  return registry;
}

function validateDependencies(skills) {
  const index = new Map(skills.map(skill => [skill.id, skill]));
  for (const skill of skills) {
    requireCondition([...skill.dependencies, ...skill.relatedSkills].every(id => index.has(id) && id !== skill.id), 'REGISTRY', 'unknown or self dependency/reference');
  }
  const depths = new Map();
  const visit = (id, ancestors) => {
    requireCondition(ancestors.length <= 15, 'REGISTRY', 'dependency depth exceeds installer bound');
    requireCondition(!ancestors.includes(id), 'REGISTRY', 'dependency cycle');
    if (depths.has(id)) return depths.get(id);
    const depth = Math.max(0, ...index.get(id).dependencies.map(dependency => 1 + visit(dependency, [...ancestors, id])));
    requireCondition(depth <= 15, 'REGISTRY', 'dependency depth exceeds installer bound');
    depths.set(id, depth);
    return depth;
  };
  skills.forEach(skill => visit(skill.id, []));
}

export async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const filename = path.join(directory, entry.name);
    requireCondition(!entry.isSymbolicLink(), 'REGISTRY', `symlink in generated input: ${filename}`);
    if (entry.isDirectory()) result.push(...await filesBelow(filename));
    else result.push(filename);
  }
  return result.sort();
}

async function validateReferences(root, filename) {
  const content = (await readFile(filename, 'utf8')).replace(/```[\s\S]*?```/g, '');
  const links = [...content.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map(match => match[1]);
  for (const link of links) {
    if (/^(https?:|mailto:|#|codex:)/.test(link) || link.includes('<') || link.includes('$')) continue;
    const target = decodeURIComponent(link.split('#')[0]);
    if (!target) continue;
    const resolved = await realpath(path.resolve(path.dirname(filename), target));
    requireCondition(isWithin(root, resolved), 'REGISTRY', `reference escapes repository: ${filename}`);
  }
}

export async function validateRegistry(root, registry) {
  parseRegistry(registry);
  const resolvedRoot = await realpath(root);
  const discovered = (await readdir(path.join(root, 'skills'), { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  requireCondition(JSON.stringify(discovered) === JSON.stringify(registry.skills.map(skill => skill.id).sort()), 'REGISTRY', 'skill discovery differs from registry');
  for (const skill of registry.skills) {
    const directory = await realpath(path.join(root, skill.path));
    requireCondition(isWithin(resolvedRoot, directory), 'REGISTRY', 'skill path escapes root');
    const content = await readFile(path.join(directory, 'SKILL.md'), 'utf8');
    requireCondition(content.startsWith('---\n') && content.includes(`\nname: ${skill.id}\n`), 'REGISTRY', 'frontmatter identity mismatch');
    requireCondition(skill.modelInvoked === !content.includes('disable-model-invocation: true'), 'REGISTRY', 'invocation policy mismatch');
    for (const filename of await filesBelow(directory)) {
      if (filename.endsWith('.md') && !filename.includes(`${path.sep}evals${path.sep}`)) await validateReferences(resolvedRoot, filename);
    }
  }
  return registry;
}
