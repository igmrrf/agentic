import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateLegacyTotal } from '../src/legacy.js';

test('legacy total includes its processing fee', () => {
  assert.equal(calculateLegacyTotal(20, 5), 25);
});
