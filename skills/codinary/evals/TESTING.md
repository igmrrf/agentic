# Codinary evaluations

`evals.json` contains 20 prompts and 60 observable assertions. Eleven cases use
dependency-free projects under `fixtures/`, including three executable recovery
runs. Nine are controlled decision tests of device, evidence, review-only, and
release state transitions.

## Executable cases

| ID | Fixture | Expected starting state |
|---|---|---|
| 0 | `duration` | 5 tests pass, 4 fail; existing tests must remain unchanged |
| 1 | `paginate` | 13 tests fail against an explicit stub |
| 2 | `slugify` | 15 scoped failures; a separate unrelated legacy failure |
| 3 | `ascii` | 10 tests pass, 9 fail on missing special-letter mappings |
| 4 | `account-settings` | Existing API test passes; requested form is absent |
| 8 | `scheduled-service` | Two mocked route tests pass; feature is absent |
| 9 | `cli-parser` | Build and 29 documented process cases pass; no test harness |
| 10 | `dashboard-filter` | Transport test passes; filter absent; legacy test fails |

Copy each input project into a separate temporary workspace and create a Git
baseline there. Keep the original fixture deliberately incomplete. Never solve
or weaken its tests to make the evaluation inputs green.

For case 10, after creating the baseline, stage a change to `user-settings.json`,
leave a change to `experiment.js` unstaged, and create an untracked
`user-design.svg`. Snapshot their contents and the initial index before dispatch.
Their content and staging state must survive the task.

Give a fresh implementer the prompt, project path, task-specific brief, and
current skill references. Exclude `expected_output`, assertions, and other agents'
conclusions from its prompt. Start a fresh read-only reviewer after handoff;
require independent execution and actual artifacts. Use the bounded fix loop for
real in-scope findings, recording each source state and review. The evaluator
grades the final project, review, and evidence against the assertions.

Run Node fixtures with the installed Node runtime and Python fixtures with the
standard library. No dependency installation is required. Discover test/build
commands from each manifest/runbook. Real HTTP tests need local socket access;
if the sandbox prevents it, use the normal permission mechanism and keep the
environment failure distinct from the fixture's product behavior.

Web cases require actual browser interaction, inspection of rendered screenshots,
and production-preview checks. Case 8 requires actual HTTP, isolated SQLite
migration/data checks, and a worker process; passing the initial mocked tests
cannot satisfy it. Case 9 must characterize the original CLI before refactoring.

## Executable fixer recovery

Cases 17–19 share the unsolved `billing-recovery` project. They resume a synthetic
initial implementation handoff before review-1; no initial implementer execution
is claimed. They exercise real source edits, failing/passing assertions, rebuilt
CLI processes and fresh agents. The initial source rounds fractional cents down.
Independent QA also reproduced an inherited-descriptor bypass of the own-field
contract; the original unit suite is starting coverage rather than proof of the
whole contract. Keep that seed intact and retain reviewer-owned regression
consumers when repairing it in an isolated run.

Set up each case in an unused absolute run directory:

```sh
node skills/codinary/evals/scripts/recovery.mjs setup /tmp/codinary-recovery-17 17
```

Give a fresh orchestrator only that run's `brief.md`, ledger, input prompt and
current skill. Exclude catalog outcomes, expectations and `control.json`. Allow
it to dispatch fresh reviewer/fixer agents. Before each dispatch, it records
`role <run> reviewer|fixer N`; after dispatch, it records
`identity <run> reviewer-N|fixer-N <actual-agent-id>`. Each role retains actual
command logs and current source/build hashes under the run directory.

After every fixer handoff, the orchestrator executes
`checkpoint <run> N` before dispatching the next reviewer. This explicitly models
an external handoff regression; it archives source before/after injection and
leaves the prior build stale. It never changes tests or acceptance criteria.
Case 17 injects nothing. Case 18 injects acceptance of quantity zero after fix 1;
case 19 additionally injects acceptance of a discount over 100 after fix 2.
These are deliberately injected failures, not evidence that a fixer naturally
introduced those bugs. Each injection changes only the current fixer's bound;
it never supplies a repaired implementation. A missing anchor fails visibly.
Fresh QA must rebuild and observe the actual new state.

The expected terminal states are one-fix pass, two-fix pass, and two-fix stop with
a real remaining defect. The last run passes its evaluation by honestly stopping
Needs human with product verdict fail. A third-fixer attempt is retained in the
audit even when rejected by the harness. The evaluator grades actual dispatch
identities, role order, source changes, immutable inputs, raw checks and final
decision; a manufactured decision or counting an injected write as a fixer is a
failure. Keep source snapshots and findings for the intentionally failing run.

`node --test skills/codinary/evals/scripts/recovery.test.mjs` verifies harness
immutability, fault preservation, retained source snapshots and identity audits.
CI runs these checks on Linux and macOS; it does not simulate agent dispatches.

## Controlled decision cases

Cases 5–7 and 11–16 contain scenario state rather than native source projects,
device sessions, deployed targets, or human recordings. Evaluate them with the
current skill and prompt in an independent context. Produce criteria, required
checks/phase/target, next role/action, current and conditional completion status,
waiver/blocker treatment, and authorization limits.

Treat the prompt's state as scenario input and label it as assumed. Do not claim
the evaluator operated a device, inspected unavailable recordings, deployed code,
or completed product checks. Grade the resulting decisions against the expected
outcome/assertions. Record instruction gaps instead of silently substituting a
preferred engineering process. Include a findings-bearing branch in case 11 to
distinguish review completion from the reviewed product's quality verdict.

## Results and iteration

Keep inputs, skill snapshots, per-case outputs/evidence, and grading in a run
directory outside the shipped skill. Each assertion receives pass/fail plus
specific evidence, and each case identifies executable or controlled mode.
Separate a product failure from a skill/evaluation failure or missing capability.

Fix demonstrated instruction defects, preserve the initial outputs, then rerun
affected cases with fresh evaluators. Re-run all assertions against the final
results and identify any unchanged executable evidence reused after a purely
instructional change. Report executable and decision results separately; a
decision pass does not establish real mobile/desktop or deployment readiness.
