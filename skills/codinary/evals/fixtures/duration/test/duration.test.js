import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDuration } from '../src/duration.js';

const DURATION_CASES = [
  ['2h', 7200],
  ['45m', 2700],
  ['1h30m', 5400],
  ['12h5m', 43500],
  ['90m', 5400],
  ['0h', 0],
  ['0m', 0],
  ['0h0m', 0],
  ['1h0m', 3600],
];

for (const [duration, seconds] of DURATION_CASES) {
  test(`parses ${duration} as ${seconds} seconds`, () => {
    assert.equal(parseDuration(duration), seconds);
  });
}
