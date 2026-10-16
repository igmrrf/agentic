# Billing recovery fixture

This dependency-free Node.js ESM library and built CLI are the runnable input for
a fixer-loop recovery evaluation. Use Node.js 18 or newer. No installation,
network access, browser, service, or listening port is required.

The initial implementation contains two seeded defects: it rounds fractional
cents down, and it can satisfy a missing required own field from a descriptor-like
entry inherited through `Object.prototype`. The public contract requires rounding
half up and rejecting missing own fields. Preserve the failing starting state in
this repository; perform recovery runs in isolated copies. Tests, build and smoke
scripts, package metadata, and this contract are immutable evaluation inputs.
Fix the production source without weakening assertions or changing the contract.

## Public library contract

```js
import { calculateTotal } from "./src/billing.js";

calculateTotal({ unitCents: 101, quantity: 1, discountPercent: 50 });
```

`calculateTotal(input)` returns one integer number of cents. It calculates the
price times quantity, applies the percentage discount to that complete subtotal,
then rounds once to the nearest cent with exact halves rounded up. The example
must return `51`. No input is mutated, no I/O occurs, and repeated calls with the
same input return the same value.

The input must be a plain object with `Object.prototype` or `null` as its
prototype. Its only permitted own keys are `unitCents`, `quantity`, and
`discountPercent`. Required fields must be own data properties. Accessors are
rejected without being called. Unknown own keys are rejected even when they are
non-enumerable or symbols. Inherited fields, class instances, arrays, dates,
functions, primitives, and null are invalid inputs.

| Field | Required | Accepted values |
| --- | --- | --- |
| `unitCents` | yes | Finite integer from `0` through `100000` inclusive |
| `quantity` | yes | Finite integer from `1` through `1000` inclusive |
| `discountPercent` | no | Finite integer from `0` through `100` inclusive; omitted means `0` |

Values are never coerced. Explicit `undefined` is invalid, including an explicitly
undefined discount. Non-numbers, boxed numbers, fractions, `NaN`, and infinities
throw `TypeError`. A finite integer outside its field's range throws `RangeError`.
JavaScript negative zero is accepted wherever zero is allowed. The largest
subtotal is `100000000` cents; the intermediate integer calculation remains
within JavaScript's exact integer range.

| Condition | Error | Message |
| --- | --- | --- |
| Nonplain object or nonobject input | `TypeError` | `input must be a plain object` |
| Any unknown own key | `TypeError` | `input contains unknown fields` |
| Missing required field or accessor | `TypeError` | `<field> must be an own data property` |
| Wrong numeric type or non-finite/noninteger number | `TypeError` | `<field> must be a finite integer` |
| Finite integer outside its inclusive bounds | `RangeError` | `<field> must be between <minimum> and <maximum>` |

Validation checks object shape, unknown keys, required/data property presence,
then numeric values in `unitCents`, `quantity`, `discountPercent` order.

## Built CLI contract

```sh
npm run build
node dist/cli.js '{"unitCents":101,"quantity":1,"discountPercent":50}'
```

The build copies both source modules into the ignored `dist/` directory. Run the
built entry point directly to observe its streams and status without npm's
script banners. Exactly one JSON argument is required. The CLI applies the same
library contract after parsing; it does not read stdin or environment settings.

Success exits `0`, writes exactly `{"totalCents":51}` plus one LF to stdout for
the example, and leaves stderr empty. A caller error exits `2`, leaves stdout
empty, and writes exactly one JSON object plus one LF to stderr:

```json
{"error":{"code":"OUT_OF_RANGE","message":"quantity must be between 1 and 1000"}}
```

| Condition | Code | Message |
| --- | --- | --- |
| Zero or multiple arguments | `ARGUMENT_COUNT` | `Expected exactly one JSON argument` |
| One malformed JSON argument, including an empty string | `INVALID_JSON` | `Argument must be valid JSON` |
| Library `TypeError` | `INVALID_INPUT` | The library error message above |
| Library `RangeError` | `OUT_OF_RANGE` | The library error message above |

An unexpected internal error exits `1` with code `INTERNAL_ERROR` and message
`Unable to calculate total` using the same JSON shape. Errors never include a
stack trace or extra output. Argument count is checked before JSON parsing;
JSON parsing is checked before billing validation.

## Verification

```sh
npm test
npm run build
npm run smoke
```

`npm test` rebuilds the CLI and runs the immutable `node:test` suite, including
actual separate-process consumers of `dist/cli.js`. `npm run smoke` also rebuilds
and runs a separate-process half-cent consumer. The initial suite has six rounding
failures and two missing-own-field failures; all other tests must pass. The own
field regressions temporarily add descriptor-like prototype entries and restore
the exact original properties in `finally`. The smoke check is intentionally red
because of rounding. A completed fix must make both commands pass. No npm
dependency installation is needed, and no test is skipped or marked as an
expected failure.
