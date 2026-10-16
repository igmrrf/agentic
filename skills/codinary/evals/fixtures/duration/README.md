# Duration fixture — scenario 0

Use Node.js 18 or newer. No installation or external dependency is needed.

```sh
npm test
```

The starting implementation has a duration conversion bug. The existing test
file is immutable for this evaluation. Only valid nonnegative integer hour and
minute strings are in scope: hours only, minutes only, or hours then minutes.
Minutes may exceed 59. Zero values are valid.

The expected initial result is 5 passing and 4 failing tests. The requested fix
must make all 9 pass without changing tests.
