# CLI parser fixture — scenario 9

Use Node.js 18 or newer. No installation or external dependency is needed.
The CLI already works. Refactor its parser without changing public behavior.
There is intentionally no automated test harness and no `npm test` script.
Capture characterization against the original built CLI before editing source.

```sh
npm run build
node dist/cli.js --name Ada --count 2
```

The build copies the current source entry point to `dist/cli.js`. Rebuild before
checking changed code. Invoke the built entry point directly when comparing
stdout, stderr, and exit codes; `npm start` adds npm's own output.

## Contract

The CLI accepts `--name NAME`, `--count COUNT`, `--upper`, `--help`, and `-h`.
It accepts no positional arguments, equals-form options, or `--` terminator.
The default name is `World`, and the default count is 1. Count is one through
five inclusive, written with ASCII digits; leading zeroes are accepted. A name
must contain a nonwhitespace character and must not begin with `-`. Valid names
are preserved exactly, including internal and outer spaces and Unicode.

Options may appear in any order. Repeated name/count options use the last valid
value. Repeating `--upper` has no extra effect. Help takes effect when reached
and ignores later arguments, but an earlier invalid option/value wins. A value
position consumes its next argument before the parser can treat it as help.

Success writes one greeting per line to stdout, ends with one LF, leaves stderr
empty, and exits 0. `--upper` uppercases the entire greeting. Invalid input
writes exactly one error line to stderr, leaves stdout empty, and exits 2.
All error lines end with one LF. Help writes the exact text below to stdout,
ends with one LF, leaves stderr empty, and exits 0:

```text
Usage: greet [--name NAME] [--count COUNT] [--upper]

Options:
  --name NAME    Recipient (default: World)
  --count COUNT  Repeat 1 through 5 times (default: 1)
  --upper        Uppercase the greeting
  -h, --help     Show this help
```

## Characterization cases

Arguments below follow `node dist/cli.js`. The table uses JSON string notation
for exact stream content. `HELP` means the preceding help block with final LF.
Each row runs in its own process; shell quotes delimit one argument.

| Arguments | stdout | stderr | Exit |
| --- | --- | --- | --- |
| none | `"Hello, World!\n"` | `""` | 0 |
| `--name Ada --count 2` | `"Hello, Ada!\nHello, Ada!\n"` | `""` | 0 |
| `--upper --name Ada` | `"HELLO, ADA!\n"` | `""` | 0 |
| `--count 5 --name X` | `"Hello, X!\nHello, X!\nHello, X!\nHello, X!\nHello, X!\n"` | `""` | 0 |
| `--count 01` | `"Hello, World!\n"` | `""` | 0 |
| `--name Ada --name Grace --count 2 --count 1` | `"Hello, Grace!\n"` | `""` | 0 |
| `--upper --upper` | `"HELLO, WORLD!\n"` | `""` | 0 |
| `--name ' Ada Lovelace '` | `"Hello,  Ada Lovelace !\n"` | `""` | 0 |
| `--name Héllo --upper` | `"HELLO, HÉLLO!\n"` | `""` | 0 |
| `--help` | HELP | `""` | 0 |
| `-h` | HELP | `""` | 0 |
| `--help --unknown` | HELP | `""` | 0 |
| `--unknown` | `""` | `"error: unknown option: --unknown\n"` | 2 |
| `Ada` | `""` | `"error: unknown option: Ada\n"` | 2 |
| `--name=Ada` | `""` | `"error: unknown option: --name=Ada\n"` | 2 |
| `--` | `""` | `"error: unknown option: --\n"` | 2 |
| `--name` | `""` | `"error: --name requires a non-empty value\n"` | 2 |
| `--name ''` | `""` | `"error: --name requires a non-empty value\n"` | 2 |
| `--name '   '` | `""` | `"error: --name requires a non-empty value\n"` | 2 |
| `--name --upper` | `""` | `"error: --name requires a non-empty value\n"` | 2 |
| `--name --help` | `""` | `"error: --name requires a non-empty value\n"` | 2 |
| `--count` | `""` | `"error: --count requires an integer from 1 to 5\n"` | 2 |
| `--count 0` | `""` | `"error: --count requires an integer from 1 to 5\n"` | 2 |
| `--count 6` | `""` | `"error: --count requires an integer from 1 to 5\n"` | 2 |
| `--count -1` | `""` | `"error: --count requires an integer from 1 to 5\n"` | 2 |
| `--count 1.5` | `""` | `"error: --count requires an integer from 1 to 5\n"` | 2 |
| `--count nope` | `""` | `"error: --count requires an integer from 1 to 5\n"` | 2 |
| `--count --help` | `""` | `"error: --count requires an integer from 1 to 5\n"` | 2 |
| `--unknown --help` | `""` | `"error: unknown option: --unknown\n"` | 2 |
