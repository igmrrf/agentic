# Codinary protected invariants

The audited contract is the baseline plus the user's existing cleanup edits. Sources: `skills/codinary/SKILL.md`, `references/roles.md`, `references/verification.md`, `references/platform-verification.md`, and `evals/TESTING.md`. These obligations remain authoritative when specialists contribute guidance.

| ID | Invariant | Observable protection |
| --- | --- | --- |
| C01 | Codinary alone owns engineering delivery and process; orchestrator does not edit source | Distinct implementation/fix owners; EGM edits design documents only |
| C02 | Scope remains the user's request; review-only starts at review after discovery | No implementer/fixer is launched for review-only; review completion separate from product verdict |
| C03 | Capture revision, staged/unstaged changes, untracked inventory and snapshots before edits | Initial artifacts retained; all new files included in review; no reset of user work |
| C04 | Discover instructions, actual commands, boundaries and baseline failures before selecting work | Brief cites repo tooling/requirements and observed failure evidence |
| C05 | Stable `AC1...` criteria include relevant negative cases and compatibility/operations | Each criterion maps to check IDs and observed evidence; no criterion weakened for a pass |
| C06 | Verification matrix is written before implementation | Criterion/risk, automated/runtime/visual check, target/config, expectation, artifact, required flag and phase |
| C07 | Every affected surface uses its platform reference | Full-stack work includes client and service; real browser/native runtime where affected |
| C08 | Durable run directory is absolute and shared with every role | `${TMPDIR:-/tmp}/codinary/<slug>-<UTC>/`; logs/screenshots/traces redacted, synthetic data |
| C09 | Fresh contexts separate implementer, reviewer and fixer; roles consume disk artifacts | Native fresh/minimal context, never reused author session or user-owned chat |
| C10 | Source responsibility and workspace ownership are explicit | Roles preserve others' edits and coordinate exclusive runtime sessions serially |
| C11 | Implementer delivers a complete vertical slice and executes pre-release matrix | Reachable entry, behavior, wiring, errors, tests, configuration/docs and actual build identity |
| C12 | Reviewer is independent and source read-only | Actual diff/new files traced; reviewer executes required checks, writes only evidence/review artifacts |
| C13 | Evidence describes final source/build, not a stale prior run | Revision plus diff/untracked fingerprint or snapshot and running-process identity; refreshed after fixes |
| C14 | Omitted executable checks enter fix loop; external prerequisites stay blockers | Missing tool/device/credential/service is not a speculative product defect |
| C15 | One implementation pass and at most two fixes over the whole run | `implement → review-1 → [fix-1 → review-2] → [fix-2 → review-3]`; limit does not reset at release |
| C16 | Invalid role artifact gets one fresh retry, then stage failure | Incomplete/inconsistent review never passes; no endless retry loop |
| C17 | Missing delegation means independent QA is unavailable | Report exact gap and prepared brief/next step; never replace with self-review or waiver |
| C18 | Authorization covers the actual external/release action | Local work does not authorize production, deployment, publishing or commits; later release verified independently |
| C19 | Local/pre-release and post-release evidence are separate | Release attempts retain numbered reviews; failed release prevents completion even after local pass |
| C20 | Cleanup preserves deliverables, rollback evidence and all user work | Only task-owned, temporary, unneeded resources removed by exact path/lifecycle tool; removals verified |
| C21 | Append resource records and completion to ledger | Task-created worktrees, processes and build outputs include exact identity/purpose; retain pending investigation resources |
| C22 | Resume after interruption from disk | Ledger, brief, handoffs, review and source state reconstruct progress and fix counts |

## Durable artifact names and owners

| Artifact | Writer | Meaning |
| --- | --- | --- |
| `brief.md` | orchestrator | Scope, ACs, baseline, matrix, release authorization boundary |
| `ledger.md` | all roles, append-only | Timestamp, stage, source state, result, artifact/resource pointers |
| `handoff-1.md` | implementer | Changed paths, decisions, source/build identity, evidence and remaining gaps |
| `review-<n>.json` + `.md` | independent reviewer | Structured checks/criteria/findings plus compact explanation |
| `response-<n>.json` + `handoff-fix-<n>.md` | fixer | Resolved/declined finding IDs, evidence, changed paths, build and blockers |
| `release-review-<attempt>.json` + `.md` | fresh release reviewer | Current deployed/installed revision and post-release evidence, retained per attempt |
| `evidence/` | executing role | Full raw command/runtime/visual evidence, redacted |
| `summary.md` | orchestrator | Final delivered outcome, scope, notes, remaining actions and release/cleanup status |

EGM reports and design state must use distinct namespaces. They cannot overwrite Codinary artifacts or reinterpret their verdicts.

## Review JSON semantics

| Field | Contract |
| --- | --- |
| Top-level identity | `cycle` 1/2/3, `phase`, `source_state`, `verdict`, `criteria`, `findings`, `verification`; release adds `release_attempt` |
| Phases | `pre_release`, `post_release` |
| Criterion result | Stable `id`, `phase`, `status`, linked `checks` |
| Finding | Stable `id`, `severity`, `scope`, nullable `file`, concrete `issue`, reproducible `trigger`, evidence paths, suggested fix |
| Check | Stable `id`, linked `criteria`, `required`, `phase`, `executed_by`, `kind`, target/build, exact steps, expected/actual, status/evidence/blocker |
| Verdict | `fail` if in-scope medium/high/critical findings; else `blocked` if active-phase required evidence/checks missing or blocked; else `pass` |
| Status | Exactly `pass`, `fail`, `blocked`, `waived`, `not_applicable`; N/A has a real reason |
| Check kind | `automated`, `runtime`, `visual`, `readiness`, `release` |
| Severity/scope | `critical`, `high`, `medium`, `low`; `in_scope` or `out_of_scope` |
| Human device evidence | Attributed executor; reviewer validates build, steps, observations and artifacts; insufficient evidence stays blocked |

The orchestrator recomputes completeness and verdict from brief plus evidence; a JSON document with plausible fields alone is insufficient. A failed check without diagnosed defect or prerequisite requires investigation.

## Narrow waiver and completion rules

Only explicit user authorization to proceed without an unavailable physical device or native host can waive those resource-dependent checks. Record resource, instruction, affected check IDs and unverified coverage. Preserve available/shared/source checks. Missing tests, subagents, independent QA, acceptance criteria, ordinary verification or observed defects cannot be waived through this mechanism. A waiver proves no correctness and cannot erase a failure.

`Done` requires requested outcome and all required checks. `Done with notes` allows non-blocking notes and narrow authorized resource waivers. Other unverified required checks remain `Blocked`. Remaining defects or failed role stages produce `Needs human`. A fully executed review with defects may be `Done with notes` while product verdict is `fail`; findings alone do not authorize fixes.

## Verification protection strategy

Keep existing recovery harness, fixture inputs and controlled-decision expectations unchanged. Characterize protected names/statuses/order/waivers before integration. Add tests for approved-design intake without requiring EGM for direct tasks. Native role isolation, reviewer execution, browser/native behavior and deployment are behavioral/runtime checks, not consequences of static schema validation. Final integration results belong in `integration-report.md`; do not infer them from this invariant list.
