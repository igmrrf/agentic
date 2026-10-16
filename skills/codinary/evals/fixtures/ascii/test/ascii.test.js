import assert from 'node:assert/strict';
import test from 'node:test';
import { toAscii } from '../src/ascii.js';

const LETTER_CASES = [
  ['e acute', 'éÉ', 'ee'],
  ['n tilde', 'ñÑ', 'nn'],
  ['u umlaut', 'üÜ', 'uu'],
  ['sharp s', 'ßẞ', 'ssss'],
  ['o slash', 'øØ', 'oo'],
  ['ae ligature', 'æÆ', 'aeae'],
  ['oe ligature', 'œŒ', 'oeoe'],
  ['l stroke', 'łŁ', 'll'],
  ['d stroke', 'đĐ', 'dd'],
  ['thorn', 'þÞ', 'thth'],
  ['eth', 'ðÐ', 'dd'],
  ['a ring', 'åÅ', 'aa'],
  ['c cedilla', 'çÇ', 'cc'],
];

for (const [name, input, expected] of LETTER_CASES) {
  test(`transliterates lowercase and uppercase ${name}`, () => {
    assert.equal(toAscii(input), expected);
  });
}

test('lowercases ASCII and preserves ASCII punctuation, digits, and whitespace', () => {
  assert.equal(toAscii('Hello, WORLD! 123\n\t'), 'hello, world! 123\n\t');
});

test('strips already decomposed accents', () => {
  assert.equal(toAscii('e\u0301 n\u0303 u\u0308'), 'e n u');
});

test('removes remaining non-ASCII letters and symbols', () => {
  assert.equal(toAscii('東京🙂 Καλημέρα'), ' ');
});

test('removes non-ASCII punctuation after transliteration', () => {
  assert.equal(toAscii('“Héllo”—world…'), 'helloworld');
});

test('combines special letters and decomposable accents in words', () => {
  assert.equal(toAscii('Straße Æsir Œuvre Łódź Þing Ðelta Đak Øre'), 'strasse aesir oeuvre lodz thing delta dak ore');
});

test('returns an empty string for empty input', () => {
  assert.equal(toAscii(''), '');
});
