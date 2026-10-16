import assert from 'node:assert/strict';
import test from 'node:test';
import { paginate } from '../src/paginate.js';

const ITEMS = Object.freeze(Array.from({ length: 150 }, (_, index) => index + 1));

test('defaults to ten items from the beginning', () => {
  assert.deepEqual(paginate(ITEMS), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('uses the explicit limit and offset', () => {
  assert.deepEqual(paginate(ITEMS, 3, 4), [5, 6, 7]);
});

test('keeps the default limit when only the offset is supplied', () => {
  assert.deepEqual(paginate(ITEMS, undefined, 5), [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
});

test('clamps a negative offset to zero', () => {
  assert.deepEqual(paginate(ITEMS, 3, -7), [1, 2, 3]);
});

test('returns an empty page at the end', () => {
  assert.deepEqual(paginate(ITEMS, 5, ITEMS.length), []);
});

test('returns an empty page beyond the end', () => {
  assert.deepEqual(paginate(ITEMS, 5, ITEMS.length + 10), []);
});

test('returns an empty page for a zero limit', () => {
  assert.deepEqual(paginate(ITEMS, 0, 3), []);
});

test('returns an empty page for a negative limit', () => {
  assert.deepEqual(paginate(ITEMS, -5, -3), []);
});

test('accepts the maximum limit', () => {
  assert.deepEqual(paginate(ITEMS, 100), ITEMS.slice(0, 100));
});

test('clamps a limit above one hundred', () => {
  assert.deepEqual(paginate(ITEMS, 1000, 5), ITEMS.slice(5, 105));
});

test('returns only remaining items at the tail', () => {
  assert.deepEqual(paginate(ITEMS, 100, 148), [149, 150]);
});

test('returns a new array without cloning or mutating its elements', () => {
  const firstItem = Object.freeze({ id: 'first' });
  const secondItem = Object.freeze({ id: 'second' });
  const original = Object.freeze([firstItem, secondItem]);
  const page = paginate(original, 10);
  assert.notEqual(page, original);
  assert.equal(page[0], firstItem);
  assert.equal(page[1], secondItem);
  page.pop();
  assert.deepEqual(original, [firstItem, secondItem]);
});

test('returns a fresh empty array for empty input', () => {
  const original = Object.freeze([]);
  const page = paginate(original);
  assert.deepEqual(page, []);
  assert.notEqual(page, original);
});
