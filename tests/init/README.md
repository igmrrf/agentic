# `init.sh` Characterization Tests

These tests pin down what `scripts/init.sh` does today, so it can be refactored without changing behaviour.

Each scenario runs `init.sh` in a temporary project and compares the result with `golden/<scenario>.txt`:

- **exit code** and the warning, error, and detection log lines
- **every file written**, as one of:
  - `[copy of <repo path>]`: byte-identical to a file in this repo
  - `[untouched pre-existing]`: a file the scenario created beforehand that `init.sh` left alone
  - `[generated]`: written by `init.sh` itself; its full text is recorded below the file list
- **installed skills**, collapsed to `[every skill in skills/]`

Generated rules files embed `CODING.md` and the language guides. Those are recorded as `<<embedded go/CODING.md>>` placeholders, so editing the standards docs does not break the tests. Changing what `init.sh` writes does.

## Running

```bash
python3 tests/init/test_characterization.py          # all scenarios
python3 tests/init/test_characterization.py -k go    # scenarios whose name contains "go"
TEST_BASH=/bin/bash python3 tests/init/test_characterization.py   # macOS bash 3.2
```

## When a golden fails

- **During a refactor:** the refactor changed behaviour. Fix the code, not the golden.
- **For an intended behaviour change:** run with `--update`, review the golden diff in `git diff tests/init/golden`, and commit it with the change.

Alias scenarios (`alias-ts`, `alias-golang`, …) have no golden of their own; they must match their canonical language's golden.

## Known behaviour captured here

`existing-no-force` records that agent rules files (`CLAUDE.md`, `GEMINI.md`, `.cursor/rules/coding.mdc`, …) are overwritten even without `--force`, unlike linter and CI configs, which are kept.
