import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { fingerprint, injectFault, recordIdentity, recordRole, verifyImmutable } from "./recovery.mjs";

async function createContext(cleanup) {
  const run = await mkdtemp(path.join(os.tmpdir(), "codinary-harness-"));
  cleanup.after(() => rm(run, { recursive: true, force: true }));
  const project = path.join(run, "project");
  await mkdir(path.join(project, "src"), { recursive: true });
  await writeFile(path.join(project, "src/billing.js"), "export const value = 1;\n");
  await writeFile(path.join(project, "README.md"), "immutable\n");
  const context = { run, project, initial: await fingerprint(project) };
  await writeFile(path.join(run, "control.json"), JSON.stringify(context));
  await writeFile(path.join(run, "events.json"), "[]\n");
  return context;
}

for (const filename of ["constructor", "__proto__", "src/dist/hidden.js", "src/.git/hidden.js"]) {
  test(`rejects unowned ${filename}`, async cleanup => {
    const context = await createContext(cleanup);
    const target = path.join(context.project, filename);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, "unowned\n");
    await assert.rejects(verifyImmutable(context), /Unowned project files created/);
  });
}

test("ignores only generated root directories and detects immutable edits", async cleanup => {
  const context = await createContext(cleanup);
  for (const name of ["dist", ".git"]) {
    await mkdir(path.join(context.project, name));
    await writeFile(path.join(context.project, name, "generated"), "generated\n");
  }
  assert.deepEqual(await verifyImmutable(context), context.initial);
  await writeFile(path.join(context.project, "README.md"), "changed\n");
  await assert.rejects(verifyImmutable(context), /Immutable input changed/);
});

test("fault injection preserves actual repairs and does not perform them", async () => {
  const anchor = 'requireInteger(quantity, { name: "quantity", min: 1, max: 1000 });\n';
  const repaired = `${anchor}export const repair = Math.round(10.5);\n`;
  const injected = injectFault(repaired, "quantity-zero");
  assert.match(injected, /min: 0, max: 1000/);
  assert.match(injected, /export const repair = Math.round\(10.5\)/);
  const unrepaired = `${anchor}export const value = Math.floor(10.5);\n`;
  assert.match(injectFault(unrepaired, "quantity-zero"), /Math.floor\(10.5\)/);
  const discount = 'requireInteger(discountPercent, { name: "discountPercent", min: 0, max: 100 });\n';
  assert.match(injectFault(discount, "discount-overflow"), /max: 101/);
  assert.throws(() => injectFault("missing anchor", "quantity-zero"), /must match once/);
});

test("retains source and hash evidence for repeated role attempts", async cleanup => {
  const context = await createContext(cleanup);
  const first = await recordRole(context.run, "reviewer", "1");
  await writeFile(path.join(context.project, "src/billing.js"), "export const value = 2;\n");
  const second = await recordRole(context.run, "reviewer", "1");
  assert.notEqual(first.snapshot, second.snapshot);
  assert.notEqual(first.source_state, second.source_state);
  const firstSource = path.join(context.run, "snapshots/reviewer-1.source/src/billing.js");
  assert.equal(await readFile(firstSource, "utf8"), "export const value = 1;\n");
  assert.equal(JSON.parse(await readFile(first.snapshot)).aggregate, first.source_state);
  await assert.rejects(recordRole(context.run, "fixer", "3"), /exceeds recovery budget/);
  const events = JSON.parse(await readFile(path.join(context.run, "events.json")));
  assert.equal(events.filter(entry => entry.type === "role_attempt").length, 3);
});

test("records actual identities only once per attempt and requires fresh agents", async cleanup => {
  const context = await createContext(cleanup);
  await assert.rejects(recordIdentity(context.run, "reviewer-1", "agent-first"), /no unregistered role/);
  await recordRole(context.run, "reviewer", "1");
  await recordIdentity(context.run, "reviewer-1", "agent-first");
  await assert.rejects(recordIdentity(context.run, "reviewer-1", "agent-second"), /no unregistered role/);
  await recordRole(context.run, "fixer", "1");
  await assert.rejects(recordIdentity(context.run, "fixer-1", "agent-first"), /fresh agent/);
  await recordIdentity(context.run, "fixer-1", "agent-second");
});

test("documented identity CLI registers a role and rejects split cycle arguments", async cleanup => {
  const context = await createContext(cleanup);
  await recordRole(context.run, "reviewer", "1");
  const script = fileURLToPath(new URL("./recovery.mjs", import.meta.url));
  const wrong = spawnSync(process.execPath, [script, "identity", context.run, "reviewer", "1", "agent-real"], { encoding: "utf8" });
  assert.equal(wrong.status, 1);
  assert.match(wrong.stderr, /Usage:.*identity RUN reviewer-N\|fixer-N AGENT/);
  const correct = spawnSync(process.execPath, [script, "identity", context.run, "reviewer-1", "agent-real"], { encoding: "utf8" });
  assert.equal(correct.status, 0);
  assert.deepEqual(JSON.parse(correct.stdout), { recorded: true });
});

test("setup exposes neutral task inputs and preserves the seeded source", async cleanup => {
  const context = await createContext(cleanup);
  const run = path.join(context.run, "fresh-run");
  const script = fileURLToPath(new URL("./recovery.mjs", import.meta.url));
  const setup = spawnSync(process.execPath, [script, "setup", run, "17"], { encoding: "utf8" });
  assert.equal(setup.status, 0, setup.stderr);
  const input = JSON.parse(await readFile(path.join(run, "input.json")));
  assert.deepEqual(Object.keys(input).sort(), ["id", "prompt"]);
  const source = await readFile(path.join(run, "project/src/billing.js"), "utf8");
  assert.match(source, /Math.floor\(/);
  const duplicate = spawnSync(process.execPath, [script, "setup", run, "17"], { encoding: "utf8" });
  assert.equal(duplicate.status, 1);
  assert.equal(await readFile(path.join(run, "project/src/billing.js"), "utf8"), source);
});
