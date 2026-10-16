import assert from 'node:assert/strict';
import test from 'node:test';
import { slugify } from '../src/slugify.js';

test('lowercases the title', () => {
  assert.equal(slugify('HELLO World'), 'hello-world');
});

test('trims outer whitespace and collapses mixed whitespace', () => {
  assert.equal(slugify(' \t Hello\n\t world  again \n'), 'hello-world-again');
});

test('removes punctuation without inserting extra word boundaries', () => {
  assert.equal(slugify("It's really... great, yes!"), 'its-really-great-yes');
});

test('collapses consecutive hyphens', () => {
  assert.equal(slugify('one---two -- three'), 'one-two-three');
});

test('strips composed and decomposed diacritics', () => {
  assert.equal(slugify('Héllo Crème brûlée Cafe\u0301'), 'hello-creme-brulee-cafe');
});

test('preserves digits', () => {
  assert.equal(slugify('Release 2026 Version 2'), 'release-2026-version-2');
});

test('returns an empty slug for empty or whitespace-only titles', () => {
  assert.equal(slugify(''), '');
  assert.equal(slugify(' \t\n '), '');
});

test('returns an empty slug for punctuation-only titles', () => {
  assert.equal(slugify('!?.,'), '');
});

test('never ends with a hyphen', () => {
  assert.equal(slugify('Hello world---'), 'hello-world');
});

test('does not truncate a slug with exactly forty characters', () => {
  const title = `${'a'.repeat(35)} tail`;
  assert.equal(slugify(title), `${'a'.repeat(35)}-tail`);
});

test('truncates a long slug at the last whole word within forty characters', () => {
  const title = 'alpha bravo charlie delta echo foxtrot golf';
  assert.equal(slugify(title), 'alpha-bravo-charlie-delta-echo-foxtrot');
});

test('drops a word that would cross the forty-character boundary', () => {
  const title = `${'a'.repeat(35)} longerword`;
  assert.equal(slugify(title), 'a'.repeat(35));
});

test('keeps a whole word ending exactly at the forty-character boundary', () => {
  const title = `${'a'.repeat(35)} tail next`;
  assert.equal(slugify(title), `${'a'.repeat(35)}-tail`);
});

test('removes a hyphen on the forty-character boundary', () => {
  const title = `${'a'.repeat(39)} overflow`;
  assert.equal(slugify(title), 'a'.repeat(39));
});

test('truncates an unbroken word to exactly forty characters', () => {
  assert.equal(slugify('A'.repeat(55)), 'a'.repeat(40));
});
