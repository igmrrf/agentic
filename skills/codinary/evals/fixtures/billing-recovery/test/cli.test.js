import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const CLI_FILE = fileURLToPath(new URL("../dist/cli.js", import.meta.url));

function runCli(argumentsList) {
  const result = spawnSync(process.execPath, [CLI_FILE, ...argumentsList], {
    encoding: "utf8",
    timeout: 2000,
    maxBuffer: 65536,
  });

  assert.equal(result.error, undefined);
  assert.equal(result.signal, null);
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

const SUCCESS_CASES = [
  ["default discount", { unitCents: 250, quantity: 2 }, 500],
  ["zero price", { unitCents: 0, quantity: 1000 }, 0],
  ["maximum total", { unitCents: 100000, quantity: 1000 }, 100000000],
  ["full discount", { unitCents: 100000, quantity: 1000, discountPercent: 100 }, 0],
  ["half-cent rounding", { unitCents: 101, quantity: 1, discountPercent: 50 }, 51],
  ["rounding after quantity", { unitCents: 101, quantity: 3, discountPercent: 50 }, 152],
];

for (const [name, input, totalCents] of SUCCESS_CASES) {
  test(`built CLI handles ${name}`, () => {
    assert.deepEqual(runCli([JSON.stringify(input)]), {
      status: 0,
      stdout: `${JSON.stringify({ totalCents })}\n`,
      stderr: "",
    });
  });
}

const FAILURE_CASES = [
  ["missing argument", [], "ARGUMENT_COUNT", "Expected exactly one JSON argument"],
  ["extra argument", ["{}", "{}"], "ARGUMENT_COUNT", "Expected exactly one JSON argument"],
  ["malformed JSON", ["{"], "INVALID_JSON", "Argument must be valid JSON"],
  ["empty argument", [""], "INVALID_JSON", "Argument must be valid JSON"],
  ["null input", ["null"], "INVALID_INPUT", "input must be a plain object"],
  ["array input", ["[]"], "INVALID_INPUT", "input must be a plain object"],
  ["string input", ['"billing"'], "INVALID_INPUT", "input must be a plain object"],
  ["unknown field", ['{"unitCents":100,"quantity":1,"currency":"USD"}'], "INVALID_INPUT", "input contains unknown fields"],
  ["missing fields", ["{}"], "INVALID_INPUT", "unitCents must be an own data property"],
  ["string price", ['{"unitCents":"100","quantity":1}'], "INVALID_INPUT", "unitCents must be a finite integer"],
  ["fractional quantity", ['{"unitCents":100,"quantity":1.5}'], "INVALID_INPUT", "quantity must be a finite integer"],
  ["null discount", ['{"unitCents":100,"quantity":1,"discountPercent":null}'], "INVALID_INPUT", "discountPercent must be a finite integer"],
  ["negative price", ['{"unitCents":-1,"quantity":1}'], "OUT_OF_RANGE", "unitCents must be between 0 and 100000"],
  ["zero quantity", ['{"unitCents":100,"quantity":0}'], "OUT_OF_RANGE", "quantity must be between 1 and 1000"],
  ["excessive discount", ['{"unitCents":100,"quantity":1,"discountPercent":101}'], "OUT_OF_RANGE", "discountPercent must be between 0 and 100"],
];

for (const [name, argumentsList, code, message] of FAILURE_CASES) {
  test(`built CLI rejects ${name}`, () => {
    assert.deepEqual(runCli(argumentsList), {
      status: 2,
      stdout: "",
      stderr: `${JSON.stringify({ error: { code, message } })}\n`,
    });
  });
}
