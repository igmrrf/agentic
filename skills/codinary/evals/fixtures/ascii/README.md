# ASCII fixture — scenario 3

Use Node.js 18 or newer. No installation or external dependency is needed.

```sh
npm test
```

The starting public `toAscii(text)` implementation only uses lowercase and NFD
accent removal. Keep that initial defect until the evaluation begins.

The 19 tests exercise lowercase and uppercase versions of every required
mapping, composed and decomposed accents, mixed words, ASCII preservation, and
removal of remaining non-ASCII characters. The expected initial result is
10 passing and 9 failing tests. The requested implementation must pass all 19.
