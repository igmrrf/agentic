import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CATALOG = fileURLToPath(new URL("../evals.json", import.meta.url));
const FIXTURE = fileURLToPath(new URL("../fixtures/billing-recovery/", import.meta.url));
const SKILL = fileURLToPath(new URL("../../SKILL.md", import.meta.url));

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function writeJson(filename, value) {
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, `${JSON.stringify(value, null, 2)}\n`);
}

async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (prefix === "" && entry.isDirectory() && [".git", "dist"].includes(entry.name)) continue;
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(path.join(directory, entry.name), relative));
    else if (entry.isFile()) result.push(relative);
    else throw new Error(`Unsupported fixture entry: ${relative}`);
  }
  return result;
}

export async function fingerprint(project) {
  const files = Object.create(null);
  for (const filename of await listFiles(project)) {
    files[filename] = hash(await readFile(path.join(project, filename)));
  }
  return { source: files, aggregate: hash(JSON.stringify(files)) };
}

function includeSource(root) {
  return filename => ![".git", "dist"].includes(path.relative(root, filename));
}

function runGit(project, args) {
  const result = spawnSync("git", args, { cwd: project, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`git ${args[0]} failed: ${result.stderr}`);
  return result.stdout.trim();
}

function createBrief(context, prompt) {
  return `# Recovery evaluation ${context.id}\n\n${prompt}\n\n` +
    `Project: ${context.project}\nSkill: ${SKILL}\nBaseline: ${context.baseline}\n\n` +
    "This starts at a seeded implementation handoff, before review-1. The seed is synthetic, not an observed implementer execution. Do not start a new implementation pass.\n\n" +
    "## Acceptance criteria\n\n" +
    "- AC1: calculateTotal honors the complete README contract, rounding and input rejection.\n" +
    "- AC2: Built CLI exposes the same public behavior and stable failure contract.\n" +
    "- AC3: Original tests/configuration remain unchanged; fixes stay in src/billing.js.\n\n" +
    "## Required pre_release matrix\n\n" +
    "- V1: npm test; retain complete logs and diagnose actual assertion failures.\n" +
    "- V2: npm run build followed by npm run smoke, plus a reviewer-owned direct built CLI consumer covering findings.\n" +
    "- V3: Read current diff/new files and source, verify immutable input hashes and current source/build identity; no configured external lint/type tool or dependencies.\n" +
    "Use the immutable suite plus small focused public consumers for findings and relevant boundaries. Retain raw output; repeat passing checks only for a fresh review/source state or a new concern.\n" +
    "UI/runtime devices and deployment are not applicable to this local library/CLI fixture. No network, installs, commits, publication or deployment authorized.\n\n" +
    "Read the skill and references/roles.md, verification.md and library/CLI platform section. Use fresh minimal-context roles serially. Preserve other agents' changes; each fixer owns only src/billing.js. Reviewers are read-only.\n\n" +
    "## Harness protocol\n\n" +
    `Before each actual role dispatch, run node ${context.harness} role ${context.run} reviewer|fixer N and retain the returned source snapshot. After dispatch run node ${context.harness} identity ${context.run} reviewer-N|fixer-N ACTUAL_AGENT_ID (one hyphenated role-cycle argument).\n` +
    `After EVERY fixer completes and before its fresh reviewer starts, run node ${context.harness} checkpoint ${context.run} N. It models an external handoff regression; inspect returned state, refresh checks/builds and disclose injections. Do not edit or bypass harness/control/checkpoints, read expected catalog outcomes, or count a pre-checkpoint build as final evidence.\n` +
    "Derive the next role and completion status from actual reviews and Codinary. Record role calls, handoffs, responses, fresh reviews and summary. The harness does not supply the desired final verdict. Write final-decision.json with status, product_verdict, fix_cycles_used, final_review, unresolved_ids, role_agents and reason.\n";
}

async function setup(run, id) {
  const catalog = await readJson(CATALOG);
  const evaluation = catalog.evals.find(entry => entry.id === Number(id));
  if (evaluation?.evaluation_mode !== "executable_recovery") throw new Error("Unknown recovery scenario");
  await mkdir(run, { recursive: true });
  const project = path.join(run, "project");
  await mkdir(project);
  await cp(FIXTURE, project, { recursive: true, filter: includeSource(FIXTURE) });
  runGit(project, ["init", "-q"]);
  runGit(project, ["add", "."]);
  runGit(project, ["-c", "user.name=Codinary Evaluation", "-c", "user.email=codinary-eval@example.invalid", "commit", "-qm", "Seed recovery fixture"]);
  const context = { id: evaluation.id, run, project, baseline: runGit(project, ["rev-parse", "HEAD"]), harness: fileURLToPath(import.meta.url) };
  const initial = await fingerprint(project);
  await writeJson(path.join(run, "control.json"), { ...context, faults: evaluation.recovery_faults, checkpoints: 0, initial });
  await writeFile(path.join(run, "brief.md"), createBrief(context, evaluation.prompt));
  await writeFile(path.join(run, "ledger.md"), `# Recovery ledger\n\n${new Date().toISOString()} Seeded handoff, baseline ${context.baseline}; no fixes used.\n`);
  await writeFile(path.join(run, "handoff-1.md"), "# Seeded implementation handoff\n\nSynthetic initial implementation is ready for independent review. Source and public tests are in the project; no executed checks or pass are claimed. No runtime processes exist.\n");
  await writeJson(path.join(run, "events.json"), []);
  await writeJson(path.join(run, "input.json"), { id: evaluation.id, prompt: evaluation.prompt });
  return context;
}

async function event(run, value) {
  const filename = path.join(run, "events.json");
  const entries = await readJson(filename);
  entries.push({ timestamp: new Date().toISOString(), ...value });
  await writeJson(filename, entries);
}

export async function verifyImmutable(context) {
  const current = await fingerprint(context.project);
  for (const [filename, expected] of Object.entries(context.initial.source)) {
    if (filename !== "src/billing.js" && current.source[filename] !== expected) {
      throw new Error(`Immutable input changed: ${filename}`);
    }
  }
  const added = Object.keys(current.source).filter(filename => !Object.hasOwn(context.initial.source, filename));
  if (added.length) throw new Error(`Unowned project files created: ${added.join(", ")}`);
  return current;
}

export async function recordRole(run, role, number) {
  const context = await readJson(path.join(run, "control.json"));
  const cycle = Number(number);
  const current = await verifyImmutable(context);
  await event(run, { type: "role_attempt", role, cycle, source: current.aggregate });
  if (!Number.isInteger(cycle) || !["reviewer", "fixer"].includes(role)) throw new Error("Invalid role request");
  if (cycle < 1 || cycle > (role === "fixer" ? 2 : 3)) throw new Error("Role exceeds recovery budget");
  const attempts = (await readJson(path.join(run, "events.json")))
    .filter(entry => entry.type === "role_attempt" && entry.role === role && entry.cycle === cycle).length;
  const label = `${role}-${cycle}${attempts > 1 ? `-attempt-${attempts}` : ""}`;
  const filename = path.join(run, "snapshots", `${label}.json`);
  await writeJson(filename, current);
  await cp(context.project, path.join(run, "snapshots", `${label}.source`), { recursive: true, filter: includeSource(context.project) });
  return { role, cycle, source_state: current.aggregate, snapshot: filename };
}

function replaceOnce(source, pattern, replacement) {
  const matches = source.match(new RegExp(pattern.source, "g"));
  if (matches?.length !== 1) throw new Error(`Fault seed anchor must match once: ${pattern}`);
  return source.replace(pattern, replacement);
}

export function injectFault(source, name) {
  const fields = {
    "quantity-zero": [/name: "quantity", min: 1, max: 1000/, 'name: "quantity", min: 0, max: 1000'],
    "discount-overflow": [/name: "discountPercent", min: 0, max: 100/, 'name: "discountPercent", min: 0, max: 101'],
  };
  if (!Object.hasOwn(fields, name)) throw new Error(`Unknown fault: ${name}`);
  return replaceOnce(source, ...fields[name]);
}

async function checkpoint(run, number) {
  const controlFile = path.join(run, "control.json");
  const context = await readJson(controlFile);
  const cycle = Number(number);
  if (!Number.isInteger(cycle) || cycle !== context.checkpoints + 1 || cycle > 2) throw new Error("Invalid checkpoint sequence");
  const before = await verifyImmutable(context);
  const directory = path.join(run, "checkpoints", `fix-${cycle}`);
  await mkdir(directory, { recursive: true });
  const filename = path.join(context.project, "src/billing.js");
  await cp(filename, path.join(directory, "before.js"));
  const fault = context.faults[cycle - 1];
  if (fault) await writeFile(filename, injectFault(await readFile(filename, "utf8"), fault));
  const after = await verifyImmutable(context);
  await cp(filename, path.join(directory, "after.js"));
  const result = { cycle, fault, before, after, build_must_be_refreshed: Boolean(fault) };
  await writeJson(path.join(directory, "checkpoint.json"), result);
  context.checkpoints = cycle;
  await writeJson(controlFile, context);
  await event(run, { type: "checkpoint", cycle, fault, before: before.aggregate, after: after.aggregate });
  return result;
}

export async function recordIdentity(run, label, agent) {
  const entries = await readJson(path.join(run, "events.json"));
  await event(run, { type: "identity_attempt", role_cycle: label, agent });
  if (!/^(reviewer-[1-3]|fixer-[1-2])$/.test(label) || !agent?.trim()) throw new Error("Invalid role identity");
  const [role, number] = label.split("-");
  const attempts = entries.filter(entry => entry.type === "role_attempt" && entry.role === role && entry.cycle === Number(number));
  const identities = entries.filter(entry => entry.type === "agent_identity" && entry.role_cycle === label);
  if (identities.length >= attempts.length) throw new Error("Identity has no unregistered role attempt");
  if (entries.some(entry => entry.type === "agent_identity" && entry.agent === agent)) throw new Error("Role requires a fresh agent identity");
  await event(run, { type: "agent_identity", role_cycle: label, attempt: identities.length + 1, agent });
  return { recorded: true };
}

async function main() {
  const args = process.argv.slice(2);
  const [command, directory, value, identity] = args;
  const lengths = { setup: 3, checkpoint: 3, role: 4, identity: 4, state: 2 };
  if (!Object.hasOwn(lengths, command) || args.length !== lengths[command]) {
    throw new Error("Usage: setup RUN ID | role RUN reviewer|fixer N | identity RUN reviewer-N|fixer-N AGENT | checkpoint RUN N | state RUN");
  }
  if (!directory || !path.isAbsolute(directory)) throw new Error("An absolute run directory is required");
  const run = path.resolve(directory);
  if (command === "setup") return setup(run, value);
  if (command === "checkpoint") return checkpoint(run, value);
  if (command === "role") return recordRole(run, value, identity);
  if (command === "identity") return recordIdentity(run, value, identity);
  if (command === "state") return verifyImmutable(await readJson(path.join(run, "control.json")));
  throw new Error("Expected setup, role, checkpoint, identity or state command");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(result => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)).catch(error => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
