---
name: codinary
description: "Orchestrate a coding task through a bounded three-step loop — implement, independent review (QA), then fix only the in-scope medium/high/critical issues — with at most two fix cycles before reporting back. Use whenever the user invokes /codinary, or hands over a ticket, task, or prompt to implement and wants it implemented, independently reviewed, and auto-fixed without babysitting."
disable-model-invocation: true
---

# Codinary

You are the **orchestrator**. Your job is to turn a ticket into reviewed code by
delegating to short-lived subagents in a bounded loop, then report back. You do
**not** write or edit the code yourself. You hold the loop, keep the shared
memory, and own the final summary.

The whole point of this skill is that each subagent starts fresh and sees only
the minimum it needs. That is what keeps a long implementation cheap and sharp:
no agent drags along the previous agent's transcript.

## The loop

```
   brief.md  ──►  1. IMPLEMENTER (fresh agent)
                        │
                        ▼
                   2. REVIEWER (fresh agent)          ← independent QA
                        │
              blocking findings?
                    │            │
                   no           yes
                    │            ▼
                    │      3. FIXER (fresh agent)  ──► loop 1
                    │            │
                    │            ▼
                    │      2. REVIEWER (fresh)      ← re-review
                    │            │
                    │      blocking findings?
                    │         │          │
                    │        no         yes
                    │         │          ▼
                    │         │     3. FIXER ──► loop 2
                    │         │          │
                    │         │          ▼
                    │         │     2. REVIEWER (fresh)   ← final look
                    │         │          │
                    ▼         ▼          ▼
                  FINAL SUMMARY  (success / success-with-notes / needs-human)
```

There is exactly one implement pass, then at most **2 fix cycles**. A fix cycle
is: fixer → re-review. Do not add a third. If the final review still has
blocking findings, stop and hand the summary to the user.

Cycle numbers, so every file lines up:

| Stage | Artifact | Cycle |
|---|---|---|
| implement | `handoff-1.md` | — |
| first review | `review-1.json` | 1 |
| first fix | `response-1.json`, `handoff-fix-1.md` | 1 |
| second review | `review-2.json` | 2 |
| second fix (only if still blocking) | `response-2.json`, `handoff-fix-2.md` | 2 |
| final review | `review-3.json` | 3 |

Stop right after a review whose blocking set is empty; skip later cycles.

## Severity and what blocks

Only these force another fix cycle:

- **critical** — broken build, data loss, security hole, crash on the happy path.
- **high** — a stated acceptance criterion is unmet, or a likely-fatal bug.
- **medium** — a real defect or missing edge case that is **in scope** for this
  ticket, **including changed behavior left untested when the brief declared an
  existing test setup** (or coverage of the changed lines clearly below ~70%).

Everything else is **reported, never looped on**:

- **low** — style, naming, nice-to-haves, "could be cleaner".
- **any severity that is out of scope** — a pre-existing bug, a different
  subsystem, or work the ticket did not ask for. Note it for the user; do not
  make the fixer chase it.

When the ticket is ambiguous about scope, in-scope means "the ticket's stated
acceptance criteria and the code paths they touch". If something is genuinely
borderline, treat it as out-of-scope so the loop stays bounded.

## The memory protocol (read this before spawning anything)

Subagents don't share your conversation. They share a run directory on disk.
Pass **paths and commands, never pasted code or transcripts**.

Run directory: `${TMPDIR:-/tmp}/codinary/<slug>-<UTC timestamp>/`
(e.g. `/var/folders/.../codinary/fix-auth-timeout-20260929T1431Z/`).

| File | Written by | Purpose |
|---|---|---|
| `brief.md` | you (once) | The single source of truth: task, scope, acceptance criteria, how to verify |
| `ledger.md` | everyone (append-only) | One compact entry per step: who, what, status. Never rewritten. |
| `handoff-1.md` | implementer | What it changed and how it verified it |
| `review-<n>.json` | reviewer | Structured findings + verification evidence |
| `review-<n>.md` | reviewer | Human-readable summary |
| `response-<n>.json` | fixer | Finding id → fixed / why not, plus changed files |
| `handoff-fix-<n>.md` | fixer | Compact handoff for the next reviewer |
| `summary.md` | you (once, at the end) | The report to the user |

**The context budget** — this is the discipline that makes the skill work:

- Each agent gets a **fresh context**. Never resume a prior subagent's session
  for the next role; that would replay its entire history and defeat the whole
  design. (Only exception: if an agent failed to return a usable artifact, you
  may re-spawn that *same role* once with the same minimal prompt — not resume
  it.)
- Each agent's prompt is roughly one screen. It contains paths, the diff
  command, and the verification commands.
- Each agent reads the few files it needs itself.
- Each agent returns a **pointer + a few lines**, capped as specified below —
  not a dump of its thinking.
- **You keep memory, not your context window.** After each step, append a
  one-line entry to `ledger.md`. When you write the final summary, reconstruct it
  from `ledger.md` + the latest `review-<n>.json` + the handoffs — not from
  anything the agents said in passing. If your own context gets long, the ledger
  is the durable source of truth and the run can survive you being compacted.

## Setting up the run (you, before any subagent)

1. **Slug + run dir.** Build a short slug from the ticket (e.g. `fix-auth-timeout`),
   create the run dir, and capture its absolute path. Every prompt gets this path.

2. **Write `brief.md`.** Keep it tight and unambiguous. Include:
   - The task and the ticket id/title.
   - Repo root(s). If the project has several (monorepo packages), name each one
     the change may touch.
   - **Acceptance criteria** — concrete and checkable. If the user gave none, derive
     them from the request; if you genuinely can't, ask the user once before starting.
   - **How to verify** — the real commands, discovered by looking at the repo
     (`package.json` scripts, `Makefile`, `pyproject.toml`, `justfile`, CI config).
     Do not guess. Include test, typecheck, and lint commands that exist.
   - **Testing** — whether the repo already has a test setup, and what it is
     (test runner, where tests live, coverage tool such as `jest --coverage`,
     `pytest --cov`, `go test -cover`, `c8`/`nyc`, and its command). Decide this
     by looking at the repo, not by assumption. State explicitly:
     - if test infrastructure exists and the ticket doesn't forbid touching
       tests → add this acceptance criterion: *"New and changed behavior is
       exercised by tests, covering at least 70% of the lines this ticket adds
       or changes."* The 70% is a floor and a proxy for "the changed behavior is
       actually tested" — if the repo has no coverage tool, the implementer
       satisfies it by testing each changed behavior/path, not by guessing a
       percentage;
     - if it doesn't exist → say so, and don't force the implementer to invent a
       whole test harness unless the ticket asks for one;
     - if the ticket explicitly says not to change tests (e.g. "make the existing
       suite pass, do not change the tests") → record that, and skip the
       coverage criterion.
   - **Out of scope** — anything you are deliberately excluding.
   - The diff command to review (below).

3. **Capture the baseline.** If the repo is a git repo, the diff command is
   `git -C <root> diff HEAD` plus the untracked files (`git status --porcelain`).
   Record `HEAD`'s sha in `brief.md` so review is against a fixed point.
   If it is **not** a git repo, say so in the brief and require the implementer
   to list every changed/created file in its handoff; the reviewer reads those files.

4. **Seed `ledger.md`** with a header: ticket, run dir, baseline, timestamp.
   Add one entry: `orchestrator: run started`.

## Spawning agents

Use your harness's subagent/Task tool. Each role is a **new agent, full tools**
(it must be able to read files, edit, and run commands):

- **opencode** — `Task` with `subagent_type: "general"`.
- **Claude Code** — the `Task` tool's general-purpose agent.

**Codinary needs a delegation-capable session.** In opencode the `general`
subagent cannot itself spawn agents — it has no `task` tool. So run codinary from
the **top-level session** (the one you're in now), never from inside a subagent.
If the `task`/subagent tool is not in your toolset, stop and tell the user to
run `/codinary` from the main session rather than doing the work yourself.

Launch one agent per step; the sequence is inherently serial (each step consumes
the previous step's artifact), so do not parallelize the roles. After each
agent returns, append your own one-line orchestrator entry to the ledger and move
on.

If the harness gives you a task id for an agent, still start the next role
fresh — reuse the id **only** to retry the same failed role.

## Step 1 — Implementer

Spawn a fresh general agent with this prompt (fill the `<...>` slots):

> You are the **IMPLEMENTER** for one ticket. Work alone; you will not be asked
> follow-ups.
>
> Read first: `<run-dir>/brief.md` and `<run-dir>/ledger.md`. The brief is
> authoritative. Repo root: `<root>`.
>
> Implement the ticket exactly as scoped. Do not do unrelated refactors or
> "while I'm here" changes. Explore only what you need.
>
> Tests: if the brief declares an existing test setup (and does not forbid
> touching tests), add or extend tests so the change is covered — target at
> least 70% of the lines you add or change, following the repo's existing test
> layout and conventions. Use the project's coverage tooling, scoped to the
> files you touched, to check where it exists; otherwise make sure each changed
> behavior or code path has a test, which is what the 70% stands in for. Never
> delete, skip, or weaken existing tests to reach the number. If there is no
> test setup, do not build one unless the ticket asks.
>
> Then verify your own work: run every command in the brief's *How to verify*
> section and fix your own failures before finishing.
>
> Write, in this order:
> 1. `<run-dir>/handoff-1.md` — max 250 words: status (implemented / partially
>    implemented); files changed (path + one-line why); tests added/changed and
>    the coverage result or per-path rationale (if test infra exists); for each
>    verification command the command and the observed result; known gaps / open
>    questions.
> 2. Append to `<run-dir>/ledger.md`:
>    `## <ISO timestamp> implementer — status; files: <paths>; verify: <pass/fail per command>`
>
> Return only: status, the list of changed file paths, and the handoff path.
> Under 120 words.

## Step 2 — Reviewer (independent QA)

Spawn a **new** general agent. It must be told to be adversarial and read-only:

> You are the **REVIEWER**, independent QA. You did not write this code. Do not
> trust the implementer's summary — assume the change is wrong until you have
> proven otherwise against the brief.
>
> Read first: `<run-dir>/brief.md`, `<run-dir>/ledger.md`, and the implementer's
> `handoff-1.md` (or `handoff-fix-<n>.md` on re-review).
> Repo root: `<root>`. The change under review: `<diff command>` (include the
> untracked files listed in the ledger).
>
> Do **not** edit any source file. You are auditing, not fixing.
>
> Verify independently:
> - Re-run every command in the brief's *How to verify* section yourself and
>   record the raw result. Never trust a claimed pass.
> - Read the diff against the acceptance criteria; check the change actually does
>   what was asked.
> - If the brief declares an existing test setup, check the tests: run the
>   project's coverage tool scoped to the changed files when one exists;
>   otherwise read the added tests and map them onto the changed lines. Changed
>   behavior that no test exercises — or coverage of the changed lines clearly
>   below ~70% — is an in-scope finding (medium normally; high if the ticket
>   explicitly required tests). Treat deleting, skipping, or weakening existing
>   tests to inflate the number as at least medium.
> - Hunt for: unmet criteria, regressions, unhandled edge cases, security or
>   correctness bugs, new failures, scope creep, and clear violations of the
>   repo's documented standards.
> - Try to falsify the implementer's claims.
>
> Write `<run-dir>/review-<n>.json` in exactly this shape:
> ```json
> {
>   "cycle": <n>,
>   "verdict": "pass" | "fail",
>   "findings": [
>     {"id": "R<n>-1", "severity": "critical|high|medium|low",
>      "scope": "in_scope|out_of_scope", "file": "path:line",
>      "issue": "one sentence", "evidence": "test output / diff hunk / reason",
>      "suggested_fix": "one sentence"}
>   ],
>   "verification": [
>     {"command": "...", "result": "short observed output", "passed": true}
>   ]
> }
> ```
> Severity: critical = broken build/data loss/security/crash; high = acceptance
> criterion unmet or likely-fatal bug; medium = real defect, missing in-scope
> edge case, or changed behavior left untested / below ~70% changed-line
> coverage when the brief declared a test setup; low = style/nice-to-have.
> Scope: in_scope if the ticket's criteria
> and the touched code paths cover it, else out_of_scope. A `verdict` of `pass`
> means **no** in-scope medium/high/critical findings remain.
>
> Then write `<run-dir>/review-<n>.md` (≤200 words, human summary) and append one
> ledger line: `## <ISO> reviewer cycle <n> — verdict; blocking: <count>`.
>
> Return only: verdict, count of blocking findings (severity medium/high/critical
> AND in_scope), and the review path. Under 80 words.

After it returns, **you** compute blocking as: `severity in {medium,high,critical}`
**and** `scope == in_scope`. Treat the reviewer's count as advisory; recompute from
the JSON so out-of-scope issues can never sneak into a fix cycle.

If the reviewer couldn't produce a valid `review-<n>.json`, re-spawn the reviewer
once (this does not consume a fix cycle). If it still fails, stop and summarize —
an unverifiable change is not a passing change.

## Step 3 — Fixer (only when there are blocking findings)

Spawn a **new** general agent:

> You are the **FIXER** for cycle `<n>`. Read first: `<run-dir>/brief.md`,
> `<run-dir>/ledger.md`, and `<run-dir>/review-<n>.json`.
>
> Fix **only** the blocking findings — severity medium/high/critical **and**
> scope in_scope. Touch nothing else; do not address low or out-of-scope findings
> and do not refactor around the problem. If you believe a blocking finding is
> wrong, say so in your response instead of making a speculative change. When a
> finding is missing/insufficient test coverage, resolve it by adding or
> strengthening tests — never by deleting, skipping, or weakening existing ones.
>
> Re-run the brief's verification commands afterwards.
>
> Write:
> 1. `<run-dir>/response-<n>.json`:
>    `{"cycle": <n>, "resolved": {"<finding id>": "<how fixed>"},
>      "declined": {"<finding id>": "<why not>"}, "files_changed": ["..."]}`
> 2. `<run-dir>/handoff-fix-<n>.md` — ≤200 words: what changed and the new
>    verification results.
> 3. Append to `<run-dir>/ledger.md`:
>    `## <ISO> fixer cycle <n> — resolved: <ids>; declined: <ids>; files: <paths>`
>
> Return only: resolved ids, declined ids, changed paths, and the response path.
> Under 100 words.

When the fixer returns, re-run Step 2 as `review-<n+1>` on the same run dir.
So the first fix (cycle 1) is followed by `review-2.json`, and the second fix
(cycle 2) by `review-3.json`. After `review-3.json`, stop regardless of verdict.

## Stopping and the final summary

Stop and write `summary.md` when either:

- the latest review has **no blocking findings** → success; or
- you have used **2 fix cycles** and blocking findings remain → needs human; or
- you are forced to stop for any other reason (review couldn't be produced, agent
  failure) → say so explicitly.

Write `summary.md` and then present it to the user. Use exactly this structure:

```markdown
# Codinary: <ticket>
**Status:** Done | Done with notes | Needs human

## What changed
- <path>: <one line>            (from the ledger / handoffs)

## Verification
- `<command>` → <result>        (the final reviewer's raw evidence)

## Resolution
- Fix cycles used: <0|1|2>
- Blocking findings resolved: <n>
- Blocking findings still open: <n>   (list id + one line each, if any)

## Not fixed (reported, non-blocking)
- [low | out_of_scope] <file> — <issue>   (one line each)

## Notes
- Run directory: <run-dir>
- Recommended next action: <one line — e.g. "merge" / "human decision on R3-2">
```

Keep the summary to what a reviewer needs; link to the run dir for depth. **Do
not commit** unless the user asked you to in the original request.

## Hard rules

- You (the orchestrator) never edit source files. If you're tempted to "quickly
  fix" something, spawn a fixer instead.
- Never resume a subagent across roles; every step is a fresh context.
- Never paste code, diffs, or transcripts into a subagent prompt. Pass paths and
  commands; let the agent open them.
- Never exceed 2 fix cycles, and never loop on low or out-of-scope findings.
- The reviewer always re-runs verification itself. A claimed pass is not a pass.
- When the brief declares an existing test setup, tests are part of the change:
  the implementer writes them, the reviewer checks changed-line coverage, and the
  fixer may add them. Never satisfy the bar by weakening existing tests, and
  never enforce coverage when the ticket forbade changing tests.
- If the ticket is too ambiguous to write acceptance criteria, ask the user once,
  then proceed.
