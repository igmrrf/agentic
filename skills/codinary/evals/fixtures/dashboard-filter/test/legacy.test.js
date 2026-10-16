import test from 'node:test';
import assert from 'node:assert/strict';
import { legacyValue } from '../legacy.js';
test('known legacy failure', () => assert.equal(legacyValue, 'legacy-correct'));
