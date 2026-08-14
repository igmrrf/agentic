# Coding Rules

The single set of technical rules for this repo. General craft standards first, then the rules distilled from `docs/CODEBASE_SIMPLIFICATION.md`, `docs/SIMPLIFICATION_PROGRESS.md` and `docs/ENGINEERING_STANDARDS.md`. Language- and framework-agnostic where possible; tool names are this repo's current implementation of a rule, not the rule itself.

`CLAUDE.md` sits above this file. Two of its rules override everything here:

- **No explanatory comments.** Write code that reads on its own.
- **No backwards-compatibility logic.** Systems (migrations) handle compatibility, not `if`-branches.

---

## 1. Formatting & lint

- The formatter is the authority. Never hand-format, never hand-sort imports. Run `npm run lint` (Biome) / `npm run lint:fix`.
- Config: 2-space indent, single quotes in code, double quotes in JSX, trailing commas everywhere. Changing formatter config is a repo-wide decision, not a per-file one.
- **Lint is a ratchet, not a cleanup task.** Whole-repo errors are a hard CI gate (0 allowed). Warnings may exist in untouched files but are promoted to errors on any file a PR changes (`biome --changed`).
- **Never make lint a zero-warning gate to force a cleanup.** It converts unrelated work into blocked PRs. The changed-files ratchet already stops new debt.
- Autofix only what is mechanically safe. Scope unsafe autofixes to named rules (`--write --unsafe --only=<rules>`); a blanket unsafe pass rewrites types and changes behavior.
- Autofixes can hide dead code: an unused-variable fix that renames to `_name` silences the warning and leaves the body standing. Delete by hand.
- Complexity warnings are not fixable by linting. They fall when a long function is split — treat each one as a small decomposition with the gates in §21.

## 2. Naming

Names are the primary documentation. Get them right and most comments become unnecessary.

- Say what the thing **is**. No abbreviations a newcomer would not know: `countryCode` not `cc`, `beneficiary` not `bnf`.
- **No single-letter names** anywhere — variables, parameters, callback arguments, loop indices, `catch` bindings, generic type parameters. `profile` not `p`, `error` not `e`, `createCache<TEntry>()` not `createCache<T>()`. Existing ones are grandfathered until the file is touched.
- Casing: `camelCase` values and functions, `PascalCase` types and components, `SCREAMING_SNAKE_CASE` module-level constants, `kebab-case` file names.
- Booleans read as predicates: `isActive`, `hasPermission`, `canProceed`, `shouldRetry`. Never a bare noun (`active`) or a negation (`isNotReady` — invert the name, not the reader).
- Functions are verbs: `buildTransactionRequest`, `resolveVariant`, `fetchBeneficiaryDetails`. A function named for a noun should be a value.
- Hooks are `use*`, event handlers `handle*`, the props that receive them `on*`.
- Async functions are named for the result, not the mechanism: `getBalance`, not `doBalanceFetch`.
- No type noise in names: `userList` not `userArray`, `IUser`/`UserInterface` never.
- **One word per concept, repo-wide.** Pick `beneficiary` or `recipient`, `sender` or `originator`, and never alternate. Two words for one thing is a bug factory.
- A module's name must describe what it does **now**. When a refactor removes the behavior the name described, rename it — a "cache" that no longer caches is a store.
- Names carry no scope prefix (`m_`, `_private`) and no Hungarian typing.

## 3. Comments

- Comment only where something is **locally unintuitive**: 1–2 plain lines, no jargon, understandable to someone dropped into the codebase today.
- A comment explains a *why* the code cannot. Never restate what the line already says.
- **No commented-out code.** Version control keeps it. Delete it.
- **No changelog, attribution or ticket-history comments** (`// fixed 2026-08-12 by ...`). That is what `git blame` is.
- **No banner or section-divider comments** to structure a long file. That is a signal the file should be split (§5).
- `TODO`/`FIXME` only with a name and a concrete condition for removal. An anonymous `TODO` is noise that outlives everyone who could act on it.
- Never leave a comment holding a secret, key or credential. If one lands, deleting it does not remove it from history — rotate.
- Doc comments on a public shared helper are allowed and welcome; they document the contract, not the implementation.

## 4. Functions & control flow

- **One job per function.** A function that fetches, validates, transforms and renders is four functions.
- **Guard clauses and early returns.** Handle the failure and the trivial cases first, then let the main path run unindented.
- **Nesting depth 3 is the ceiling.** Deeper means extracting a helper or inverting a condition — not adding another `if`.
- Prefer 3 parameters or fewer. Past that, take one named object.
- **No boolean flag parameters that select behavior** (`doThing(input, true)`). Either two functions, or one named option object where the flag reads at the call site.
- No output parameters and no mutating an argument the caller still owns. Return the new value.
- Keep a function at one level of abstraction: either it orchestrates named steps, or it does the work — not both.
- Every branch returns a value of the same shape; a `switch` on a closed set is exhaustive, and a `default` that cannot happen fails loudly rather than returning `undefined`.
- Prefer expressions to statements where it stays readable: `map`/`filter`/`reduce` over accumulator loops, ternaries only when both branches are short and neither has side effects.
- Delete dead branches. A ternary with identical branches, or a condition that can never be false, is a defect — investigate which side was intended before removing it.

## 5. Size caps

Soft caps, enforced by `npm run check:size` (`check:size:changed` is the PR gate):

| Unit | Cap |
|---|---|
| File | 400 lines |
| Component body | 150 lines |
| Function | 60 lines |

Crossing a cap is a signal to extract, not a hard error — but a new or changed file must not exceed one without a reason you can say out loud. A recorded exception (a per-corridor lookup table is data, not complexity) is legitimate; write it down.

When splitting, do not create a new offender: if one extracted module would land over the cap, split it again at a real seam.

**Line count is the wrong headline metric.** Decomposition adds files and tests, so the total goes up while the codebase gets better. Track **files over the cap** and **lines deleted**.

## 6. Types

- Types are the specification. Derive them from one source (schema → type, table → type); do not maintain a parallel hand-written copy that can drift.
- **No `any` in production code.** Use `unknown` and narrow, or write the real type. `any` in test mocks is tolerated — typing a mock can make it lie.
- Do not "fix" an `any` by widening to `unknown` and casting at the call site. That trades a warning for a cast and changes nothing. Check what the call sites actually pass.
- Discriminated unions over optional-field soup: a result is `{ ok: true, data }` or `{ ok: false, error }`, not one object with both optional.
- Model impossible states out of existence rather than guarding against them at every read.
- No type assertions to silence the compiler. A cast is a claim you must be able to defend, and it belongs with a note when it preserves a known-loose behavior deliberately.
- One declaration per concept, exported from one module. Nine local copies of the same shape is how a preview and a PDF end up disagreeing.

## 7. State, purity & side effects

- Pure functions by default: same input, same output, no I/O, no clock, no randomness. Pure logic is the part that is cheap to test — push logic into it and keep the shell thin.
- Isolate side effects (network, storage, timers, logging) at the edges, in named units.
- Prefer immutable updates. Never mutate shared or caller-owned data in place.
- Do not declare components, classes or expensive constants inside a render or a hot path — a fresh identity per call remounts subtrees and defeats memoisation.
- Any module-level timer or subscription must be cleanable: unref it on the server, clear it on unmount in the client. A never-cleared handle keeps processes alive and leaks between tests.
- Derive, do not duplicate. Two pieces of state that must agree should be one piece plus a computation.

## 8. Module boundaries & imports

- **Layering is one-directional.** Shared hooks and libraries must not import from application/page directories. If an extraction would invert that, colocate the module with its page instead — colocation beats a back-dependency.
- No circular imports. When recursion or mutual reference is genuinely needed, keep it inside one module.
- Import through the repo's path alias, not deep relative chains.
- Prefer explicit named imports over wildcard imports; they are what makes reference resolution reliable (§13).
- A barrel file is legitimate as a domain's entry point when real consumers import that path. A barrel created so old call sites keep working is a compatibility shim — banned by `CLAUDE.md`.
- Colocate a module with the only thing that uses it. Promote it to shared only when a second real consumer exists.

## 9. Constants & magic values

- No magic numbers or bare string literals in logic. Name them: `RETRY_LIMIT`, `ONE_WEEK_MS`, `RATE_LIMITS.FINANCIAL_PAYOUT`.
- A string that appears in more than one file (a cookie name, a status value, a queue key) becomes one exported constant. Twelve hardcoded copies is one typo away from a silent outage.
- Tests may keep the literal deliberately: a test that reads the same constant as the code under test proves nothing.
- Units live in the name — `timeoutMs`, `amountMinor`, `sizeBytes`.
- Data tables (country lists, sort codes, corridor maps) are data, not code: keep them in their own module, in a shape the formatter cannot re-expand into thousands of lines.

## 10. Errors & failure handling

- **Never swallow an error.** A `catch` either handles it meaningfully, enriches and rethrows, or logs and converts it into a typed failure.
- No empty `catch` blocks and no `catch` that only logs when the caller needed to know.
- Fail fast and loudly at boundaries; degrade gracefully only where a degraded result is genuinely useful to the user.
- Throw typed errors carrying what a handler needs to branch on (a numeric status, a stable code). Prose alone is not a contract.
- Error mapping must key off something the source actually guarantees. A loose `code`-only check here matched database errors and returned raw table and column names to clients.
- Distinguish "no data" from "failed to load". A cached-last-value result that still carries an error flag will report success if you branch on the data.

## 11. Logging

- Use the shared logger, never bare `console.*` in production paths.
- Log levels mean something: `error` = someone must act, `warn` = degraded but handled, `info` = a real lifecycle event. Everything else does not ship.
- **Never log PII, credentials, tokens, full account numbers or raw provider payloads.** Log identifiers, not contents.
- No debug prints in merged code. Structured context beats string interpolation.
- Log at the point of decision, once. The same failure logged at four layers is four times the noise and no more information.

## 12. Duplication & reuse

- **Reuse before invent.** Consult the repo's reuse map before writing a helper; promote the existing good pattern rather than forking a new one.
- **Do not build an abstraction with one call site.** A factory that invents methods nobody calls is worse than the duplication it replaces.
- **Deletion beats abstraction.** Before deduplicating a family, check how many members are still live. Three of four "79% identical" caches here were dead — the answer was `rm`, not a factory.
- **Measure the overlap before deduping.** Two 800-line files that "look the same" shared 16 lines of real logic; unifying them would have needed parameters for every divergent colour, tag and label. Count shared lines first and say no on evidence.
- Parameterising two things that differ in their *options* (retry policy, staleness, cache lifetime) is the classic trap. Near-identical bodies with genuinely different configuration stay separate.
- Do dedupe exact copy-paste: byte-identical signers, message maps and type declarations belong in one module.
- Two occurrences is a coincidence; three is a pattern. Wait for the third before generalising.

## 13. Dead code & reachability

- **Check reachability before you work on anything** — components as well as pages. A test written for dead code is worse than no test: it makes the dead code look maintained.
- **Resolve references by parsing import bindings, not by grepping symbol names.** Word-boundary grep produced false "live caller" verdicts repeatedly here: local re-declarations, same-named-but-different modules, and substring matches (`regenerateReceiptHTML` matching `generateReceiptHTML`).
- Reachability for a UI surface = a navigation entry, a link, a programmatic navigation, or an external callback path. Permission maps and route matchers gate a path if you reach it; they are not evidence you can.
- An unreachable parent with reachable children survives. An unreachable subtree with no reachable descendant is deleted **together with its API routes and exclusive dependencies**.
- **"No caller in this repo" is not proof an endpoint is dead.** Provider webhooks, externally-reachable auth endpoints and emailed links have zero in-repo callers by design. Confirm with the external consumer before deleting anything that moves money or receives callbacks.
- Delete dead config, feature keys, route matchers, fixtures and dependencies in the same change as the code they served.
- Deleting a database enum value or table is a data migration, not a code change. Leave it and record why.

## 14. API endpoints

One shape, in this order:

1. Auth guard (feature + level).
2. Rate limit — required on financial/write endpoints, skipped on plain reads.
3. Schema-parse the body/query (§15).
4. Call the provider / DB.
5. Return a typed envelope (§16).

Compose these with the shared handler wrapper rather than hand-rolling the skeleton per route.

**Deviations are allowed but must be written down.** Legitimate ones seen here: a webhook that must answer a bare `200` on every path; a provider proxy whose raw error body is rendered copy; a client that throws errors with no numeric status, so the shared catch would downgrade them to 500; responses whose payload has siblings of `data`.

**Never add a rate limit to an endpoint that had none as part of a refactor** — it invents failures that could not happen before.

## 15. Validation

- Every request body or query carrying input goes through a **schema**. No manual `if (!body.x)` checks, no trusting the parsed body as typed.
- Surface schema failures through one shared flattener so error text is consistent.
- Derive shared shapes from a base schema instead of retyping.
- Use a pass-through schema when a payload is spread into a signed provider request — a strict object silently strips unknown keys and breaks the signature.
- Typing an existing loose value can reveal that unvalidated input reaches a database enum. Preserve current behavior with a documented cast and file it; adding validation starts rejecting requests that work today.

## 16. Responses & errors

- Two shapes only: `{ success: true, data }` and `{ success: false, error, code? }`. Build them with the shared helpers; do not hand-roll the envelope.
- The shared client fetch layer keys off `success`/`error` — an ad-hoc shape breaks every generic consumer.
- **Never leak internal error detail to a client in production.** Attach details only outside production.
- Unknown errors: log server-side, return a generic 500.

## 17. Data layer & client state

- **The query library owns all server state.** No fetching into local state + effects.
- **One object-style query-key factory per domain.** No inline key literals.
- **When migrating keys onto a factory, emit byte-identical arrays.** Query defaults, prefix invalidations and manual cache writes are registered against the existing literals; "improving" the key shape silently orphans the cache with no test failure. Pin the output with assertions and treat a failure there as a factory bug, never a stale expectation.
- **One shared `getJson`/`postJson`.** Keep a raw fetch only where the response genuinely cannot go through it — and write the reason on the line.
- Retry and error policy is chosen once, globally. Per-hook overrides need a stated reason; `retry: false` plus no refetch-on-mount can strand a page with no data until reload.
- Do not hand-write a browser-side cache class. If a second genuine cache ever appears, build the factory then, with both call sites in hand.

## 18. Forms

- Country- or corridor-varying forms are **field definitions as data + one small render control**. Adding a field or a country is a data edit, not new JSX.
- No new ad-hoc controlled mega-forms. A form library is allowed only where already adopted.
- Apply the field-definition pattern only where it is DOM-safe. Where a generic control would change rendered markup, leave the bespoke inputs and dedupe the repeated *blocks* instead.

## 19. Configuration & secrets

- All environment access goes through the schema-validated config modules. **Never read `process.env` inline** — inline reads skip startup validation and surface as `undefined` deep inside a request.
- Adding a variable means extending the schema. Removing one changes what startup demands: a coordinated deployment concern, not a refactor.
- An edge/middleware-runtime module may read the environment directly rather than pull in the full config schema; that is the one exception and it needs a note.
- Local development must not point at live production provider accounts. Confirm which credentials a machine uses before capturing any artifact from it.

## 20. Security baseline

- Every endpoint states its authorization explicitly. A missing guard is a bug even when the surface is "internal".
- Authorize on the server against the session, never on a value the client supplied.
- Validate and bound all external input: type, range, and size. Reject early.
- Verify webhook signatures and fail **closed** in production; a skip path may exist for sandbox only, and it must be impossible to enable in production.
- Secrets live in the validated config, never in source, comments, fixtures, logs or committed snapshots. A leaked value is rotated, not deleted — history keeps it.
- Signing keys and provider credentials stay server-side. An endpoint that signs caller-supplied payloads is a signing oracle: it needs its own narrow permission, not a general one.
- Never widen a permission to make something work. Add the specific one.
- Escape or parameterise anything interpolated into HTML, SQL or a shell command.
- Committed test artifacts (snapshots, fixtures, seeds) must be synthetic. Real customer data in git history is permanent.

## 21. Refactoring: parity is absolute

Every refactor is a pure restructuring. **No behavior change, no copy change, no layout change.** If a change would alter output, stop — it is a separate, deliberate change with its own tests.

Order for any risky file:

1. Write the characterization test **first** and verify it green against the **unchanged** file.
2. Commit the visual baseline for that surface (where the surface is capturable).
3. Refactor.
4. Test still green, zero snapshot diff.

Extraction rules:

- Extract by moving: data-fetch → a hook, form sections → field definitions, presentational pieces → subcomponents. **Never change markup, classes or DOM while extracting.**
- Extract and wire in small increments. Never leave files that only import each other — that is how a half-finished decomposition ships as orphaned dead code.
- Keep the public interface byte-identical so no consumer needs editing.
- Preserve branch **order** when the branches are not mutually exclusive; an "equivalent-looking" reordering changes what an unexpected input does.
- Keep key insertion order where an object is serialized into a response or a signed payload.
- Move wire-facing string literals verbatim, indentation included.

**Prove parity, do not assert it.** Strongest first: a temporary DOM-parity harness diffing old and new renders across every state; a scripted comparison of every string literal and class name; a byte-comparison of generated output across input shapes. **Negative-control the harness** — perturb one word or one class and confirm it goes red. Then delete the harness and its baseline copy; never ship a permanent duplicate of the pre-refactor file.

**Defects found during a refactor are preserved, pinned and filed** — not fixed in the same change. Pin the current (wrong) behavior with a test named for the defect so nobody "corrects" it by accident, and record it with its blast radius. Fixing it later is a normal behavior change with sign-off.

**Editing a characterization test is almost always wrong.** The one sanctioned case is an approved behavior change, where the test is inverted deliberately, in the same commit, with a negative control.

## 22. Testing

- Tests are **colocated** in `__tests__/` next to the code.
- Interactive components get behavior tests: assert what the user sees and does, not internals.
- One behavior per test, named for the behavior. No assertion-free tests, no snapshot-everything tests standing in for real assertions.
- Tests are deterministic and order-independent: no shared mutable state between cases, no reliance on wall-clock time, no network.
- Pages get a visual snapshot (light + dark) where the surface is capturable. Where it is not — a live-token flow, an IP-allowlisted provider — say so explicitly and fall back to a characterization-test-only gate plus a manual smoke. **Never fake a baseline.**
- **A characterization test is required before decomposing an untested file** — and only after §13's reachability check passes.
- **Negative-control every new assertion.** A test that passes both before and after a change is a parity pin, not a proof; label it honestly.
- The stronger check: the final, unedited test also passes against a copy of the pre-refactor file. That proves it pins old behavior rather than describing new code.
- `npm test` must stay 100% green and gates every PR. Never mark work done against a red suite.
- Snapshot harnesses need deterministic input: freeze the clock, disable animations, wait for every loading and progress indicator to settle, pin seeded timestamps. A flake here is usually a real settling bug, not noise to retry around.

## 23. Dependencies

- Adding a dependency is a decision with a cost: audit surface, upgrade burden, bundle size. Prefer the standard library, then something already in the tree.
- Never add a package for something small and stable you can write and test in a few lines.
- Pin versions the toolchain depends on for reproducibility (container images, test runners) and derive them from the lockfile rather than hardcoding twice.
- Remove a dependency in the same change that removes its last consumer, and check what became a true orphan as a side effect.

## 24. Verification before "done"

Run all of these and read the output before claiming completion:

```bash
npm test                # 0 failures
npm run test:visual     # 0 snapshot diff
npm run lint            # 0 errors; clean on changed files
npx tsc --noEmit        # clean
npm run check:size      # no new offenders
```

Plus a manual smoke on the touched flow — mandatory for anything that moves money.

Report outcomes faithfully. State which checks ran, which were skipped and why, and which new assertions are pins rather than proofs.

## 25. Working protocol

- **One reversible step per PR.** Green tests and unchanged snapshots are the merge condition.
- Commits are scoped and describe what changed and why; the message must cover everything in the diff and nothing that is not.
- **Check your base commit** before starting in a worktree. Work started from the wrong base produces a diff that looks correct and silently discards other people's work.
- **Never stage by directory when a checkout is shared.** `git add -A` / `git commit -a` sweeps someone else's in-progress edits into your commit. Stage explicit paths, or take your own worktree.
- Prove any pre-existing failure is pre-existing (stash and re-run) before chasing it. A fresh worktree with no dependencies or environment file fails suites you did not break.
- Claim a task before starting; record the decision and its evidence in the same change that does the work.
- **Decisions made out of band do not survive.** If a question was answered in chat, get the answer restated before writing code against it.
- When a documented plan and the code disagree, the code is the truth — fix the doc, do not restore functions to match it.
