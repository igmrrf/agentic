# Tests and production readiness

Read during discovery and before implementing, reviewing, or fixing a change.
Select checks from the actual change and repository policy, then record them in
the brief. Apply the same completion standard to code, configuration, schemas,
and infrastructure.

## Behavior tests

Map every changed behavior and acceptance criterion to an observable assertion.
Choose the lowest useful level plus coverage of the boundaries it crosses:

| Change | Evidence to require |
|---|---|
| Business rule | Inputs, outputs, invariants, boundary values, invalid input |
| Bug fix | Reproduction that fails before the fix and passes after |
| Refactor | Characterization before edits; preserved behavior/contracts/layout |
| Serialization/API | Real request/response contract and compatibility checks |
| Persistence | Real supported storage in isolation; constraints and transaction behavior |
| UI journey | User actions through the running client with observable state/results |
| Concurrency/async | Relevant races, cancellation, retries, ordering, cleanup |
| Build/config change | Build and run using the affected configuration/artifact |

Use existing test infrastructure. Add or extend meaningful tests for behavior
changes; avoid tests that merely mirror implementation or assert instruction
wording. Respect an explicit request not to modify tests and document remaining
evidence. A reversible copy/style change may need visual verification without new
unit tests. A missing harness does not waive correctness: use a reproducible
minimal check or introduce the smallest appropriate test setup when needed for
the task, rather than building an unrelated framework.

Prefer real integrations in disposable local/test environments for boundaries
that can break. Mock uncontrollable edges for deterministic tests, and state
which integrations remain simulated. A mocked response proves neither real
authorization nor persistence. Exercise a complete success journey and relevant
failure/recovery paths with synthetic data. Observe both the user-facing result
and persistent/remote effects when they are part of the contract.

Use coverage to locate missed branches, especially error and permission paths;
apply repository thresholds when present. A percentage never substitutes for
acceptance coverage. Do not invent a universal changed-line percentage or weaken,
skip, delete, or endlessly retry tests to obtain green results. Record flakes and
baseline failures with evidence; unexplained failures affecting the change block
completion. Run focused checks during development and required repository/CI
gates before handoff. Broaden checks when shared code or observed failures justify
it; repeated unchanged passes add no evidence.

## Production readiness

For each relevant row, put an executable check or concrete inspection with an
expected result in the matrix. Record justified exclusions. Readiness means the
change is supported by evidence for its intended environment, not a claim that
the entire system has been certified.

| Risk or surface | Required assessment when affected |
|---|---|
| Build and delivery | Repository formatter/linter/type/tests; reproducible production/release build; packaging and artifact startup. Discover commands, do not assume dev and release behave alike. |
| Reachability and wiring | Entry point/route/registration, feature flags, DI, assets, configuration, client and server agree; no placeholder production paths. |
| Security/privacy | Authentication and server-side authorization including denied roles/tenant isolation; untrusted input, injection, secret exposure, sensitive logs, relevant dependency/security checks. |
| Data changes | Migration on disposable representative data, existing-data compatibility, constraints, atomicity, retry/idempotency, backup/restore or forward-recovery plan for irreversible changes. |
| Compatibility | Public API/schema/serialization, supported client/runtime versions, old data and rolling-deploy ordering; explicit breaking changes. |
| Failure behavior | Timeouts, retries/backoff, cancellation, offline/partial failures, empty/loading/error states, resource cleanup, bounded work. |
| Performance | A measured representative scenario for changed hot paths, payloads, startup, rendering, or memory; compare baseline and budget where defined. |
| Accessibility/UX | Keyboard/focus, semantic labels, relevant assistive checks, contrast/readability, reduced motion, responsive layout, input and recovery behavior. |
| Operations | Validated config, useful logs without secrets, relevant metrics/alerts, health/readiness, graceful shutdown, actionable failure diagnosis. |
| Dependencies/docs | Lockfiles, relevant vulnerability/license policy, setup/config/runbook and public contract documentation updated with the change. |
| Rollout | Feature flag/defaults, environment/secrets prerequisites, deployment order, smoke checks, rollback or forward recovery and known limitations. |

Investigate newly introduced warnings, runtime exceptions, failed requests, and
resource leaks. Compare with the baseline before attributing them. Scope findings
to concrete impact; do not turn this matrix into a mandatory unrelated cleanup.

## Evidence and blockers

Each check records: stable ID, linked criteria, phase (`pre_release` or
`post_release`), required/optional, exact command
or interaction steps, source state, environment/target/build, expected and actual
result, status, and artifact paths. Keep full logs outside compact handoffs.
For visual checks, save screenshots of relevant states **and inspect them**;
capture navigation/actions and observed behavior. A screenshot's existence proves
neither correctness nor that a journey works. Mark automated assertions and human
observations distinctly.

Tie evidence to the current revision plus task diff/untracked content fingerprint
or snapshot. Identify the process/build serving that state. After fixes, replace
affected evidence and re-run required checks on the final source; cached screenshots
or a previously installed build cannot verify new code.

When a prerequisite is missing, record the attempted action, exact failure,
impact, and smallest next step. Ask the user for a device/session, credentials via
the appropriate secure mechanism, or specific human verification only when needed.
Continue other checks. Never translate inability to execute into not applicable,
silently waive a required check, or manufacture an observed result. Device
unavailability is a prerequisite gap, never a failed product check. If the user
explicitly says to proceed without the unavailable device, mark those checks
`waived`, with the user's instruction, affected target/criteria, and remaining
verification limits. A waiver permits delivery with notes; it proves no hardware
behavior and cannot erase an observed defect. Honor prior authorization without
asking again. If the user only states unavailability, ask whether to proceed
without that coverage while completing the independent checks.

An unavailable native host (for example an iOS or Windows build/test host) follows
the same resource-waiver rule as an unavailable physical device. An explicit
instruction to proceed without that host's testing can waive build, packaging,
and runtime checks that require it. Enumerate those checks and retain any source,
shared test, or other target verification that can still run. The waiver does not
exclude an entire platform's correctness or observed defects from code review.

For human verification, provide the build/revision, device or host/OS, setup, numbered
actions, expected observations, and evidence to return. Keep the check blocked
until results arrive or the user explicitly waives that device or host check; passing
emulator checks do not imply passing hardware checks.
If a prerequisite arrives, perform the check and refresh review before completion.

When only the user can operate a device or native host, accept returned results from that
protocol as attributed human evidence. The independent reviewer validates the
build identity, steps, observations, and returned artifacts against the criterion;
requests missing evidence; and marks the check passed only when supported. Record
who executed it and that the reviewer validated evidence rather than rerunning
the hardware check. Insufficient evidence remains blocked unless explicitly
waived. A human-reported defect remains a defect even if device access is waived.
