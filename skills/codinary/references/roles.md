# Role contracts and review format

The orchestrator sends a fresh role the run directory, repository roots, owned
files/modules, baseline/diff instructions, and the section below that applies.
Use a fresh-context subagent tool available in the harness. Launch roles serially;
each consumes its predecessor's artifacts. Do not use a user-owned chat as an
internal worker or reuse a session across roles. If the harness supports choosing
context inheritance, select fresh/minimal context rather than the full transcript.

Every role reads `brief.md`, relevant repository instructions, and `ledger.md`.
Implementers/reviewers/fixers also read the test/readiness reference and applicable
platform sections named in the brief. Agents share a workspace: preserve others'
edits, work within assigned ownership, and coordinate access to runtime sessions.
Append a compact timestamped ledger entry on finishing. Store detailed evidence in
the run directory and return status plus paths in at most 120 words.

## Implementer prompt

> Implement the brief's complete scoped outcome in the assigned modules. You are
> not alone in the workspace; accommodate others' changes and never revert them.
> Establish regression/characterization checks before bug fixes/refactors as
> applicable. Add meaningful tests for changed behavior, respecting explicit test
> constraints. Run the required pre-release matrix, including actual product
> launch, interaction, visual inspection, and production build checks for affected
> platforms. Fix observed in-scope failures before handoff. Record environmental
> blockers accurately and finish independent work.
>
> Write `handoff-1.md`: implementation status; changed/created paths and why;
> criterion-to-evidence mapping; test/build/runtime results and evidence paths;
> source/build identity; remaining gaps and task-owned runtime sessions. Keep it
> compact and link full logs rather than truncating evidence. Append a ledger
> entry and return status, changed paths, and the handoff path.

## Reviewer prompt

> Independently verify the requested outcome against the brief and baseline.
> Treat the handoff as claims to test. Read the actual diff and new files; trace
> affected callers, contracts, and runtime wiring. Do not edit source. Temporary
> probes and evidence may be written in the run directory; preserve test data and
> sessions belonging to others.
>
> Execute every required matrix check in the active phase against current source/build,
> including runtime interactions and visual inspection. Examine test assertions
> for meaningful coverage of changed behavior, error paths, and boundaries. Check
> applicable repository standards and production readiness. Validate attributed
> human device or host evidence under the verification reference when personal execution
> is unavailable; clearly identify its provenance. Investigate failures
> rather than inferring correctness from an exit code or coverage number alone.
>
> Write `review-<n>.json` using the contract below, plus a compact
> `review-<n>.md` (or `release-review-<attempt>.json` / `.md` for post-release QA). Every
> criterion and required check in the active phase needs a result. Give defects
> a reproducible trigger, impact, scope, and evidence. Mark unavailable execution
> blocked and state the prerequisite; do not invent a code finding to explain it.
> Append the verdict, blocking defect count, and blocked check IDs to the ledger.
> Return the verdict, counts, and review path.

## Review JSON contract

The example illustrates field types; replace values with observed results.
Use `null` for a finding's file when it concerns behavior without a source line.

```json
{
  "cycle": 1,
  "phase": "pre_release",
  "source_state": "baseline SHA + current diff/untracked fingerprint or snapshot",
  "verdict": "pass",
  "criteria": [
    {"id": "AC1", "phase": "pre_release", "status": "pass", "checks": ["V1"]}
  ],
  "findings": [
    {
      "id": "R1-1", "severity": "low", "scope": "in_scope",
      "file": "path:line", "issue": "Concrete defect or optional improvement",
      "trigger": "Reproduction steps", "evidence": ["evidence/path"],
      "suggested_fix": "Action addressing the observed cause"
    }
  ],
  "verification": [
    {
      "id": "V1", "criteria": ["AC1"], "required": true,
      "phase": "pre_release", "executed_by": "reviewer",
      "kind": "runtime", "target": "OS/device/browser and build configuration",
      "command_or_steps": "Exact command or interaction sequence",
      "expected": "Expected observation", "actual": "Observed result",
      "status": "pass", "evidence": ["evidence/path"],
      "blocker": null
    }
  ]
}
```

Allowed values:

- Phase: `pre_release | post_release`; assess required checks/criteria for the
  active phase. Post-release verification follows passing pre-release QA and
  authorized release; final delivery requires both phases when release is in scope.
- `cycle` is the local review number (`1|2|3`). For post-release reviews, use the
  latest local review number and add `release_attempt` starting at 1; increment
  for each actual release attempt and retain its numbered review artifacts.
- Verdict: `pass | fail | blocked`. Fail when blocking defects exist; otherwise
  blocked when active-phase required verification is blocked/missing; otherwise pass. Explicit
  user-authorized device or host waivers permit a pass with a Done with notes summary.
- Criterion/check status: `pass | fail | blocked | waived | not_applicable`. Explain
  not-applicable decisions in `actual`; criteria remain required unless the brief
  explicitly defines a condition that does not apply. For `waived`, include the
  user's authorization and unverified resource scope in `actual`; only checks
  requiring an unavailable device or native host and explicitly excluded by the
  user qualify. Split criteria/checks as needed so tested behavior and waived
  coverage remain distinguishable.
  A host waiver covers only checks requiring that unavailable host, including
  native builds/packages when applicable; available/shared/source checks remain
  required. Record resource, user authorization, and exact waived check IDs.
- Severity: `critical | high | medium | low`; scope: `in_scope | out_of_scope`.
- Check kind: `automated | runtime | visual | readiness | release`.
- `executed_by` identifies reviewer execution or attributed human device/host evidence;
  record the human protocol/artifacts and the reviewer's validation in `actual`.
- A blocker states the missing prerequisite and next action. A failed check
  without a diagnosed defect or prerequisite needs investigation before verdict.

The orchestrator validates completeness against the brief, not merely these
fields: reject missing criteria/checks, missing evidence, stale source state, or
an inconsistent verdict. An executable check omitted by the role must be run;
an externally blocked check remains blocked until the prerequisite is supplied
or the user explicitly waives the affected device or host check. A waiver never resolves
an observed defect. Verify existing authorization before requesting it again.

For a review-only request, this JSON verdict describes the product under review.
The orchestrator reports review completion separately: a completed review with
product findings may be Done with notes while its product verdict remains fail.
Missing non-waived required review checks still block review completion. Findings
do not authorize an implementer/fixer or consume fix cycles in review-only work.

## Fixer prompt

> Read the latest review and fix only its in-scope medium/high/critical findings
> in the assigned modules. Preserve others' edits. Add/strengthen regression
> checks where needed; never weaken tests or acceptance criteria for a pass.
> Resolve an omitted executable verification check by performing it. For disputed
> findings, record evidence and a reason instead of speculative edits. Finish
> independent work around prerequisite blockers.
>
> Re-run required pre-release verification, refresh affected runtime/visual evidence against
> the updated build, and write `response-<n>.json`:
> `{"cycle": 1, "resolved": {"R1-1": "fix and evidence"}, "declined": {}, "files_changed": []}`.
> Write `handoff-fix-<n>.md` with changes, source/build identity, criterion/check
> results and evidence paths, blocked prerequisites, and runtime sessions. Append
> resolved/declined IDs and changed paths to the ledger; return their pointers.

After fix 1 use review 2; after fix 2 use review 3. A fixer claim does not resolve
a finding until the next independent review verifies it.
