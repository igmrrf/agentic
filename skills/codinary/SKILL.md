---
name: codinary
description: "Deliver software tasks from acceptance criteria through implementation, independent review, automated tests, live product verification, and production readiness, with at most two fix cycles."
disable-model-invocation: true
---

# Codinary

Own the requested engineering outcome from brief to verified delivery. This is
one entry point for features, bug fixes, refactors, tests, and engineering reviews
across web, mobile, desktop, services, libraries, CLI tools, and infrastructure.
Use repository conventions and available specialist guidance internally; the user
should not have to assemble a workflow from other skills.

You are the **orchestrator**. Discover the project, define the verification plan,
delegate source changes and independent QA, keep durable evidence, and report the
result. Implementation, testing, and running the product are parts of delivery.
A successful build or an empty findings list alone does not establish completion.

## Delivery contract

- Match the user's scope. A review-only request produces a review; a local
  feature request produces a running, verified feature. Deployment, publishing,
  production mutations, and commits require authorization covering that action.
- Preserve unrelated edits and failures. Review against a captured baseline,
  including initial staged, unstaged, and untracked changes.
- Verify every acceptance criterion at the boundary where it can fail. For UI
  work, launch the actual product, interact with it, and inspect its rendering.
- Use evidence from the final source state. Distinguish **pass**, **fail**,
  **blocked**, **waived**, and **not applicable**; missing tools, devices, access,
  or results never count as a pass.
- Continue independent work when a check is blocked. Request the specific
  prerequisite or human check needed; keep dependent work pending.
- An unavailable device or native host is not a failed verification. If the user
  explicitly authorizes proceeding without it, mark only checks requiring that
  unavailable resource **waived**, record that authorization and the unverified scope, and continue
  toward completion. Honor authorization already given; do not repeatedly ask
  for an unavailable resource. Keep available targets, shared automated tests,
  source/contract review, and other independent checks required. Unavailability
  alone does not imply a waiver.

## Run and memory

Create `${TMPDIR:-/tmp}/codinary/<slug>-<UTC timestamp>/` and pass its absolute
path to every agent. Keep logs, screenshots, traces, and build artifacts there
unless the repository defines another artifact location. Redact secrets and use
synthetic data.

| Artifact | Owner | Contents |
|---|---|---|
| `brief.md` | orchestrator | Scope, criteria, baseline, verification plan, release boundary |
| `ledger.md` | all, append-only | Stage, timestamp, source state, result, artifact pointers |
| `handoff-1.md` | implementer | Changed files, decisions, evidence, remaining gaps |
| `review-<n>.json` / `.md` | reviewer | Findings, criteria results, independent evidence |
| `response-<n>.json` / `handoff-fix-<n>.md` | fixer | Resolutions, declines, changed files, verification |
| `release-review-<attempt>.json` / `.md` | reviewer | Post-release checks, retained per release attempt |
| `evidence/` | executing role | Full command logs and runtime/visual artifacts |
| `summary.md` | orchestrator | Delivered outcome, evidence, limitations, release status |

Keep role prompts to paths, responsibility, and commands. Each role starts in a
fresh context and reads inputs from disk. Return artifact pointers and a short
result, rather than transcripts. Reconstruct progress from the ledger after
compaction.

## 1. Discover and define done

Before implementation:

1. Read applicable repository instructions, coding standards, and relevant
   architecture. Prefer the project's code discovery tools. Trace the user entry
   point through changed behavior and its callers, persistence, and external
   boundaries. Identify affected packages and supported runtime targets.
   For defects/performance regressions, reproduce on the baseline and isolate
   the cause with observed evidence before selecting a fix; record any blocked
   reproduction and continue independent investigation.
2. Capture the initial revision and working-tree state. Save the initial diff
   and an inventory of untracked files; use snapshots when needed to distinguish
   pre-existing edits from this task. In a non-Git project, snapshot relevant
   files. Include newly created files in review. Never reset user work.
3. Write concrete acceptance criteria with stable IDs (`AC1`, ...). Include
   relevant negative cases, compatibility constraints, and operational outcomes.
   Ask only for ambiguity that would change the deliverable; proceed with useful
   independent work while awaiting an answer.
4. Discover real commands and environment requirements from manifests, CI,
   runbooks, and tool help. Record baseline failures with logs where feasible.
   Identify applicable build, formatting, lint, type, test, security, and
   packaging gates. Mark unavailable checks rather than inventing commands.
5. Read [verification.md](references/verification.md) to choose behavior tests
   and production readiness checks. Read the relevant sections of
   [platform-verification.md](references/platform-verification.md) for **every
   affected product surface**, including clients and services in a full-stack
   change. These are execution requirements, not optional suggestions.
6. Put the verification matrix in `brief.md`: criterion/risk, automated check,
   runtime or visual check, target/configuration, expected observation, evidence
   location, phase (`pre_release` or `post_release`), and whether it is required.
   Assign release-only criteria to `post_release` so local QA can finish before
   deployment. Explain each not-applicable decision
   and record explicit user-authorized device or host waivers.
   Include startup commands, test accounts/data, ports, target devices, teardown,
   production build commands, and prerequisites. Require checks justified by the
   change or repository policy; do not expand into an unrelated audit.
7. State the release boundary: local delivery, preview/staging, or authorized
   production release. Record rollout/rollback needs and external actions already
   authorized. Seed the ledger with baseline, brief, and run directory.

This step ends when the brief makes a pass distinguishable from a defect or a
missing prerequisite. Update it when discovery reveals a necessary check; record
the reason, and never lower an acceptance criterion to obtain a pass.

## 2. Implement, exercise, and verify

Use a fresh, full-tools implementer with the brief, ledger, repository paths, and
the implementer instructions in [roles.md](references/roles.md). Assign explicit
file/module ownership. Tell agents they share the workspace and must accommodate
others' edits. The orchestrator owns the process and does not edit source.

The implementer delivers a complete vertical slice: reachable entry point,
business behavior, data/integration wiring, error handling, tests, and necessary
configuration/docs. It runs the pre-release matrix, launches the product on
applicable targets, inspects rendering, and fixes observed failures before handoff.
Record blocked checks separately and continue the remaining checks.

## 3. Independent review and QA

Start a fresh reviewer with the brief, baseline, current diff including untracked
files, latest handoff, and reviewer instructions in [roles.md](references/roles.md).
The reviewer may run tests and the application and write evidence in the run
directory, but does not edit source or weaken checks.

Require independent execution of the required `pre_release` matrix against
current source, including platform interaction and visual inspection. The reviewer checks the
diff, behavior tests, acceptance criteria, integration boundaries, and production
readiness. Prior evidence helps locate checks; it does not replace the reviewer's
observations. For device or host checks only the user can perform, the reviewer validates
attributed human evidence using the protocol in [verification.md](references/verification.md)
instead of claiming personal execution. Share exclusive browser/device sessions
serially and verify which build is running before each role uses them.

Read `review-<n>.json` and recompute:

- **Blocking defects:** findings with `scope: in_scope` and severity medium,
  high, or critical.
- **Verification blockers:** required checks or criteria in the active phase
  marked blocked, or missing evidence/results. These prevent completion even
  with zero findings.
- **Phase pass:** no blocking defects; every required check and criterion in
  that phase passed or has an explicit user-authorized device or host waiver;
  each not-applicable entry has a valid reason. Waived coverage is disclosed,
  never claimed as verified.
  Pending post-release checks do not prevent pre-release QA passing; all required
  phases must be resolved before the requested delivery is complete.

Severity: **critical** = data loss, exploitable security failure, unusable build,
or happy-path crash; **high** = unmet acceptance criterion or major regression;
**medium** = concrete in-scope defect, missing required behavior test, or omitted
required verification; **low** = optional polish or preference. Classify actual
impact rather than applying examples mechanically. Give findings evidence and a
reproducible trigger. Report pre-existing/out-of-scope defects separately; if one
prevents a required check, that check remains blocked.

An omitted executable check belongs in the fix loop. A missing device, credential,
tool capability, or external service is a prerequisite blocker, not a speculative
code defect. Request what is needed without spending fix cycles on blind retries.

## 4. Bounded fix loop

Run exactly one implementation pass, then at most **two fix cycles**:

`implement → review-1 → [fix-1 → review-2] → [fix-2 → review-3]`

Start a fresh fixer with the brief, ledger, latest review, and fixer instructions
in [roles.md](references/roles.md). Fix only in-scope medium/high/critical findings;
record declined findings with evidence. Re-run affected checks, then require a
fresh reviewer to verify the final state. Refresh stale runtime/screenshots after
changes; re-run the required pre-release matrix on re-review and examine new regressions.

Stop the local fix loop after a passing pre-release review and proceed to release
when in scope. After two fix cycles, report remaining defects for
human action. Retry a role once with fresh context if its artifact is unusable;
if that fails, report the stage failure. Never count an invalid review as a pass.
When only external prerequisites remain, finish independent checks and report
blocked verification with exact next steps. For device or host checks, honor an existing
waiver or request the missing device/test session or authorization to proceed
without it. Resume from the ledger when prerequisites or authorization arrive.

For review-only requests, start at review after discovery; do not implement or
auto-fix unless requested. Report completion of the requested review separately
from the reviewed product's `pass | fail | blocked` verdict. A fully executed
review may finish Done with notes when it finds defects; retain the product's
fail verdict and actionable findings. Missing non-waived review checks keep the
review Blocked. A findings-bearing review does not consume fix cycles or require
fixing the product to finish the requested review.

If delegation is unavailable, explain that independent
QA cannot be completed in this session; provide the prepared brief and next step
instead of silently claiming independent review.

## 5. Release within scope and report

When release is requested and authorized, apply the release plan after pre-release
QA passes. Use a fresh reviewer to verify the deployed/installed revision and run
the required `post_release` matrix in its target environment, recording
`release-review-<attempt>.json` and `.md` using the same evidence/verdict contract.
Retain each attempt and link the latest from the ledger. Capture
rollout and recovery results. A failed release is not done because local QA passed.
Release-only criteria are assessed here, not used to block deployment beforehand.

If release exposes an in-scope code defect, use any remaining fix cycles, repeat
pre-release QA, then release and verify the corrected build within authorization.
The two-fix limit is run-wide and never resets at release. Follow the authorized
recovery plan for failed rollouts; avoid blind deployment retries. If release is
outside scope, provide the verified artifact/local result and remaining steps.

Write `summary.md` from the final review and ledger, then give the user a concise
report with links to evidence:

- **Status:** Done / Done with notes / Blocked / Needs human. Done requires the
  requested deliverable and all required checks to pass. Done with notes allows
  non-blocking notes and explicit user-authorized device or host waivers; disclose the
  unverified targets and resulting limits. Other unverified required checks
  remain Blocked. Needs human identifies unresolved defects or a failed stage.
  For review-only work, apply the separate review-completion rule above and show
  the product verdict alongside it; a product defect is an output of the review.
- **Outcome:** what works now, changed files, and acceptance criteria results.
- **Verification:** automated results, runtime targets/builds, interactions,
  visual evidence, and production build/readiness results; state what was not run.
- **Resolution:** fix cycles used (`0|1|2`), open/resolved findings, and low or
  out-of-scope findings left unchanged.
- **Release:** built / locally verified / staged / deployed as actually observed;
  remaining rollout, rollback, or human verification steps and exact prerequisites.
- **Artifacts:** run directory, final review, and deliverable locations. Record
  whether task-owned processes were stopped or intentionally left running.
