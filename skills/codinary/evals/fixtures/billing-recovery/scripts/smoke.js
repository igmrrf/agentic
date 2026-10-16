import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const CLI_FILE = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
const INPUT = { unitCents: 101, quantity: 1, discountPercent: 50 };
const result = spawnSync(process.execPath, [CLI_FILE, JSON.stringify(INPUT)], {
  encoding: "utf8",
  timeout: 2000,
  maxBuffer: 65536,
});

assert.equal(result.error, undefined);
assert.equal(result.signal, null);
assert.deepEqual(
  { status: result.status, stdout: result.stdout, stderr: result.stderr },
  { status: 0, stdout: '{"totalCents":51}\n', stderr: "" },
);
process.stdout.write("Built CLI smoke passed\n");
