# Universal Coding Rules & Engineering Standards

- **No explanatory comments.** Write code that reads on its own.
- **No backwards-compatibility shims in application logic.** Migrations, versioned schemas, and routing layers handle compatibility—not runtime `if`-branches.
- **Fail fast and explicitly.** Never silently swallow errors or fall back to ambiguous default values.

---

## 0. How to Read These Standards

- **This document is language-agnostic and applies to every project.** Language guides (`rust/`, `go/`, `typescript/`, `python/`, `lua/`) add idioms, toolchains, and carve-outs. They never relax a universal rule; where a language cannot honour one, the language guide states the exception explicitly.
- **Rule scope tags.** Rules apply everywhere unless tagged:
  - `[service]` — applies only to network-facing services (HTTP, gRPC, queue consumers, RPC).
  - `[app]` — applies only to deployed applications, not to reusable libraries.
  - `[lib]` — applies only to libraries and SDKs consumed by third parties.
- **Non-negotiable vs. tunable.** Rules about correctness, safety, and failure handling are non-negotiable. Numeric thresholds (size caps, nesting depth, parameter counts) and named tools are project-configurable defaults: a project may raise or lower them once, in writing, repository-wide — never per file, never ad hoc.
- **Tool names are defaults, not requirements.** Where a specific formatter, linter, or library is named, the requirement is *"exactly one, configured repository-wide, enforced in CI"*. The named tool is the default choice when the project has no existing one.
- **Adopting into an existing repository.** Apply to changed files first (see the lint ratchet in §1). A standard that would require a repo-wide rewrite to land a one-line fix is being applied wrongly.

---

## 1. Automated Formatting & Linting

- **The automated formatter is the sole authority.** Never format code by hand or manually organize imports. Run the repository's configured formatter before committing.
- **Configuration is repository-wide.** Formatter and linter configurations are uniform across the project and are never overridden on a per-file basis.
- **Lint is a ratchet, not an ad-hoc cleanup task.** Whole-repo errors are a hard CI gate (0 allowed). Warnings on untouched legacy files may exist temporarily, but any modified file must be 100% clean of both errors and warnings.
- **Never enforce an unratcheted zero-warning gate to force unrelated cleanup.** Blanket cleanups block focused PRs. The changed-files ratchet prevents new technical debt.
- **Autofix only what is mechanically safe.** Scrutinize automated autofixes; never apply unsafe autofixes that alter types, contracts, or runtime behavior.
- **Delete dead code manually.** Silencing a warning by renaming an unused variable to an ignored prefix retains dead code. Delete unused bindings completely.

---

## 2. Naming & Ubiquitous Language

Names are the primary documentation. Precise naming eliminates the need for inline comments.

- **Say what the thing is.** Avoid cryptic abbreviations that a newcomer would not immediately understand (`countryCode` not `cc`, `beneficiary` not `bnf`).
- **No single-letter names.** Variables, parameters, callback arguments, loop variables, catch bindings, and generic type parameters must have descriptive names (`record` not `r`, `error` not `e`, `index` not `i`).
  - This is a deliberate deviation from the terse-identifier habits of several languages. Each language guide lists the **only** permitted exceptions — conventional idioms whose meaning is universal and which linters expect (`ctx`, `t *testing.T`, Go method receivers, mathematical coordinates in a formula). Anything not on that list is a violation.
- **Standard casing follows the language's own convention, not a cross-language one.** Use the casing the language's formatter and standard library use; do not import another language's style:
  - Values, variables, functions: `camelCase` or `snake_case` per language standard.
  - Types, structs, interfaces, classes, traits, enums: `PascalCase` (or the language's equivalent).
  - Module-level constants and static globals: `SCREAMING_SNAKE_CASE` where the language has the concept.
- **Booleans read as predicates:** `isActive`, `hasPermission`, `canProceed`, `shouldRetry`. Never a bare noun (`active`) or an inverted negative (`isNotReady`).
- **Functions are verbs:** `buildTransactionRequest`, `resolveVariant`, `fetchBeneficiaryDetails`. Functions named for a noun must be values or getters.
- **No type noise in names:** `userList` not `userArray`, `accountMap` not `accountHashMap`, `Account` not `IAccount` or `AccountInterface`.
- **One concept, one word repository-wide.** Pick `beneficiary` or `recipient`, `sender` or `originator`, and never alternate. Synonyms for the same domain entity create ambiguity.
- **Names reflect current responsibility.** When a refactor alters a module's behavior, update its name immediately.

---

## 3. Comments & Documentation

- **No explanatory comments in implementation bodies.** Code structure, variable naming, and function decomposition must convey intent.
- **Document the "why", never the "what".** A comment is permitted only when explaining an external constraint, hardware limitation, or unintuitive business quirk that cannot be expressed in code.
- **No commented-out code.** Version control preserves history. Delete unused code completely.
- **No changelog or attribution comments.** Version control metadata tracks authorship and dates.
- **No section-divider banners.** Banners (`// === SECTION ===`) indicate that a file is too large and should be decomposed.
- **TODO/FIXME requirements:** Must include an owner and a concrete condition for resolution. Anonymous TODOs are technical debt and must not ship.
- **Public API contracts:** Public libraries, shared modules, and exported interfaces must document their contracts, error conditions, and invariants.

---

## 4. Functions & Control Flow

- **Single responsibility:** One task per function. A function that fetches, validates, transforms, and persists represents four distinct functions.
- **Guard clauses and early exits:** Handle validation, errors, and base cases at the beginning of the function, allowing the happy path to remain unindented.
- **Nesting depth ceiling:** Maximum 3 levels of indentation. Deeper nesting requires decomposing logic into helper functions.
- **Parameter limit:** Maximum 3 positional parameters. If more parameters are required, pass a typed configuration or request object.
- **No boolean behavior flags:** Avoid functions with flag parameters that alter control flow (`processOrder(order, true)`). Provide separate named functions or an explicit enum/options object.
- **No mutating caller-owned arguments:** Functions must not mutate inputs passed by the caller unless explicitly designed as an in-place buffer with a clear contract. Return new transformed values.
- **Single level of abstraction:** A function either coordinates high-level workflow steps or performs low-level operations—never both.

---

## 5. Size Caps & Modular Decomposition

Soft caps enforced to ensure readability and maintainability:

| Unit | Cap |
|---|---|
| File / Module | 400 lines |
| Type / Struct / Component Body | 150 lines |
| Function / Method | 60 lines |

Crossing a cap is a signal to decompose, not an automatic failure — see §0 on tunable thresholds.

**Exempt** (never counted, never hand-edited): generated code, vendored code, lockfiles, database migrations, and pure static data tables (ISO codes, mapping tables) placed in dedicated data files.

**Never satisfy a cap by making the code worse.** Splitting a cohesive unit into fragments that must be read together to be understood trades one readability problem for a harder one. If decomposition has no natural seam, record the justification and keep the unit whole.

---

## 6. Types & Data Invariants

- **Derive types from a single source of truth.** Schemas, database definitions, or protobuf specifications define the contract; do not maintain parallel manually written types that can drift.
- **Make invalid states unrepresentable.** Use discriminated unions, tagged enums, and the typestate pattern to model valid state transitions instead of structs with optional fields.
- **Zero untyped escapes in production code.** Never use untyped dynamic escapes (e.g. `any`, raw unchecked pointers) in production paths. Narrow untyped inputs at the system boundary.
- **Exhaustive matching:** Match all variants of domain enums explicitly without fallthrough catch-alls so that new variants trigger compile-time validation.
- **One declaration per concept:** Define and export domain entities from their owning module. Do not duplicate identical type shapes across subsystems.

---

## 7. State, Purity & Side Effects

- **Pure core, impure edges:** Business logic should be pure functions (deterministic output given the same input, zero I/O, zero clock dependency). Confine side effects (network, storage, timers, logging) to the application boundary.
- **Immutable updates:** Prefer immutable data structures and transformations over in-place state mutation.
- **Deterministic lifecycle management:** Any spawned background worker, timer, subscription, file handle, or connection pool must have an explicit teardown mechanism to prevent resource leaks. Acquire and release in the same scope using the language's scoped-release construct (`defer`, `with`, RAII/`Drop`, `try`-with-resources).
- **Derive state; do not duplicate:** If two values must remain synchronized, store one canonical value and compute the second on demand.
- **Inject time, randomness, and identity.** Clock reads, random number generation, and ID/UUID creation are I/O. Pass them in at the boundary so business logic stays deterministic and testable.
- **Bounded queues and explicit backpressure:** Every buffer, work queue, and channel between producers and consumers has a documented capacity limit. Unbounded buffering converts a slow consumer into an out-of-memory crash.
- **Cancellation propagates:** Long-running and I/O-bound operations accept and honour a cancellation or deadline signal from their caller, and pass it down to everything they call.
- **No shared mutable state without a documented discipline:** Concurrent access is guarded by ownership, immutability, or an explicit lock whose scope is as small as possible. Locks are never held across an I/O or `await` boundary unless the invariant demands it and the code says why.

---

## 8. Module Boundaries, Layering & Folder Architecture

- **One-directional dependency flow:** Dependencies point inward. Delivery and infrastructure code may depend on the domain; the domain must never import from delivery, infrastructure, or outer feature directories.

  ```
  Delivery (HTTP / CLI / UI / consumer)  ──┐
                                           ├──▶  Application (use cases)  ──▶  Domain (entities, invariants)
  Infrastructure (DB / network adapters) ──┘                                            ▲
                                                                                        │
                              infrastructure implements interfaces owned by ────────────┘
  ```

  The layer *names* are a template, not a mandate — a library or CLI may collapse them. The **direction** is the rule: the pure core never imports the impure edge.
- **Feature-driven vertical slices ("Screaming Architecture"):** Organize folders by business domain features (e.g. `billing/`, `transfers/`) rather than pure technical groupings (`controllers/`, `views/`, `models/`). Projects with a single cohesive domain (most libraries and CLIs) skip this layer rather than inventing artificial features.
- **"Delete with one keystroke" cohesion:** A feature folder must be self-contained so that deleting it cleanly removes all its UI, state, queries, types, and tests without leaving orphaned files.
- **No generic junk drawers:** Banish catch-all `utils/` or `common/` directories. Name utility modules by concrete responsibility (`date/`, `crypto/`, `formatting/`).
- **Shallow hierarchy ceiling:** Keep directory nesting shallow (maximum 3 to 4 levels). Over-nested hierarchies impede discovery and refactoring.
- **Colocation beats premature abstraction:** Keep a helper, hook, or sub-component colocated within the single feature that uses it. Promote to global shared modules only when a second genuine consumer exists.
- **No circular dependencies:** Circular dependencies indicate improper separation of concerns. Break cycles by introducing a shared interface boundary or consolidating colocated logic.
- **Explicit exports:** Expose only the minimal necessary public API from a module. Keep internal implementation helpers private.

---

## 9. Constants & Magic Values

- **No magic literals in business logic.** Extract numeric thresholds, timeout durations, and string constants into named identifiers (`MAX_RETRY_ATTEMPTS`, `SESSION_TIMEOUT_SECONDS`).
- **Shared constants:** Strings or codes used across multiple modules (status strings, header keys, event names) must be exported from a single definition.
- **Units in identifier names:** Always include measurement units in variable names (`timeoutMs`, `intervalSeconds`, `fileSizeBytes`, `amountMinor`).

---

## 10. Errors & Failure Handling

- **Never swallow an error.** A catch or error-handling block must handle the error meaningfully, enrich and rethrow it, or log and convert it into a typed failure object.
- **Fail fast and loud at boundaries:** Validate inputs and preconditions immediately upon entry.
- **Typed errors over prose:** Error handling must be based on typed error structures, error codes, or domain enums—never by parsing error message strings.
- **Distinguish empty data from failure:** A missing resource (`None`, `NotFound`) is distinct from a network/database execution failure. Do not conflate the two.

---

## 11. Logging & Observability

- **Use structured logging:** Log with structured key-value pairs rather than unstructured string concatenation.
- **Semantic log levels:**
  - `ERROR`: System failure requiring operational intervention.
  - `WARN`: Recovered or degraded state that warrants investigation.
  - `INFO`: Significant lifecycle milestone (service started, batch completed).
  - `DEBUG`: Verbose diagnostic data for local troubleshooting (disabled in production).
- **Never log sensitive data:** Passwords, API tokens, cryptographic keys, full payment identifiers, and PII must never appear in logs.
- **Log at the decision point once:** Do not log an error at every layer of the call stack. Return the error upwards and log it once at the entry boundary.

---

## 12. Duplication, Abstraction & Reuse

- **Reuse before inventing:** Check existing shared libraries and domain modules before creating new utilities.
- **No single-use abstractions:** Do not build complex generic factories or speculative frameworks for a single call site.
- **Deletion beats abstraction:** Before unifying duplicate modules, check if the duplicate copies are still actively reachable. Delete obsolete code before refactoring.
- **Three occurrences rule:** Two similar implementations are a coincidence; three establish a pattern. Wait for the third concrete use case before extracting a shared abstraction.

---

## 13. Dead Code & Reachability

- **Verify reachability before modifying code:** Confirm that an endpoint, function, or component has active callers before writing tests or refactoring.
- **Resolve references via AST/imports:** Verify symbol usage through compiler bindings and import resolution, not simple substring text search.
- **Clean up associated artifacts:** When deleting an obsolete module, delete its tests, route registrations, configuration keys, and dedicated dependencies in the same change.
- **Verify external integrations:** External webhooks, public APIs, and background queue workers may have zero in-repo callers. Verify external consumers before removing integration points.

---

## 14. Boundaries & Service Contracts `[service]`

Every request handler follows the same execution sequence. Steps that do not apply to a given transport (a queue consumer has no rate limiter) are omitted deliberately, not forgotten.

1. **Authentication & Authorization:** Verify identity and permissions.
2. **Rate Limiting & Throttling:** Protect write and sensitive endpoints.
3. **Input Validation:** Parse and validate the incoming request schema.
4. **Domain Execution:** Invoke business use cases and infrastructure ports.
5. **Standardized Response:** Return a typed success or error result.

- **Idempotency for non-idempotent operations:** Any handler that creates or moves state and can be retried by a client, proxy, or queue must be idempotent — via an idempotency key, a natural unique constraint, or a conditional write.

---

## 15. Validation at System Boundaries

- **Strict schema validation:** All untrusted external input (request bodies, query strings, headers, message queue payloads, file uploads, environment variables, CLI arguments, deserialized cache entries) must be parsed and validated into a typed value at the boundary. Interior code receives validated types only, never raw input.
- **Parse, don't validate:** Validation returns a narrowed type. A function that returns `bool` and leaves the caller holding the raw value invites re-validation drift.
- **Centralized validation error formatting:** Format validation failures through a consistent error structure.
- **Reject unexpected fields:** Enforce strict payload parsing to prevent parameter injection and unintended field assignment.
- **Bound every input:** Enforce maximum body size, collection length, string length, and numeric range. Unbounded input is a denial-of-service vector.

---

## 16. Response Envelopes & Error Contracts `[service]`

- **One response contract per project, applied everywhere.** Whatever shape is chosen, every endpoint uses it and every client can rely on it. The default for a JSON/HTTP API with no existing convention:
  - Success: `{ success: true, data: ... }`
  - Failure: `{ success: false, error: { code: ..., message: ... } }`

  Projects bound to an existing contract — RFC 9457 Problem Details, gRPC status codes, GraphQL `errors`, JSON:API — use that contract instead. Do not wrap a standard envelope inside a second custom one.
- **Stable machine-readable error codes:** Clients branch on `code`, never on the human-readable message. Message text may change without a breaking-change bump; codes may not.
- **Never leak internals:** Stack traces, internal hostnames and IPs, SQL, and schema details must be omitted from responses in production. Correlate instead: return an opaque request ID that appears in the server-side log.

---

## 17. Configuration & Secrets Management

- **Validated configuration at startup:** Parse and validate all required environment variables and configuration files at application initialization. Fail startup immediately if configuration is invalid.
- **Zero raw inline environment reads:** Centralize environment access in dedicated, validated configuration modules.
- **Strict secrets isolation:** Secrets must never be hardcoded in source files, committed in fixtures, or stored in version control.

---

## 18. Security Baseline

- **Server-side authorization:** Always enforce access control on the server against verified session identity, never trusting client claims.
- **Parameterized queries:** Prevent injection attacks by parameterizing all database queries, command executions, and template interpolations.
- **Fail closed:** Security gates and signature verifications must default to denying access on unexpected errors.
- **Synthetic test data:** Use synthetic, anonymized data for test suites and snapshots. Never commit real customer data.

---

## 19. Refactoring Protocol: Parity is Absolute

Refactoring is strictly structural. A refactor must introduce **zero behavior, layout, or contract changes**.

1. **Characterization Tests First:** Write characterization tests against the existing implementation to pin current behavior before modifying code.
2. **Incremental Extraction:** Refactor in small, verified steps.
3. **Preserve Interface Contracts:** Keep public interfaces and serialization formats identical.
4. **Preserve Branch Order:** Maintain condition evaluation order when branches are not mutually exclusive.
5. **Separate Bug Fixes:** If a bug is uncovered during refactoring, document and pin it with a test first; fix the bug in a separate, dedicated change.

---

## 20. Testing Standards

- **Colocated or standard test suites:** Place unit tests where the language's ecosystem expects them — colocated with the source or in the conventional test directory. Follow the language guide; do not invent a third location.
- **Behavior-driven assertions:** Assert against observable behavior and public contracts rather than internal private state. A test that breaks on a pure refactor was testing the implementation.
- **Deterministic and isolated:** Tests must be deterministic, order-independent, parallel-safe, and free of external network, real wall-clock, and unseeded randomness. Each test creates the state it needs and cleans up after itself.
- **Test at the boundary that can break:** Cover business rules and edge cases at the unit level, and cover each system boundary (serialization, persistence, transport) with at least one integration test that exercises the real thing.
- **Every bug fix ships with a regression test** that fails before the fix and passes after.
- **Coverage is a diagnostic, not a target.** Use it to find untested branches; never write assertions solely to move the number.
- **Continuous Integration gate:** The test suite must pass 100% green before any change can be merged. Skipped, quarantined, or flaky-retried tests are tracked with an owner and a removal date, never left silently disabled.

---

## 21. Dependency Hygiene

- **Minimal external dependencies:** Favor standard library capabilities and existing dependencies before adding new third-party packages.
- **Audit and security checks:** Every dependency must pass license compliance and vulnerability auditing in CI.
- **Committed lockfile, reproducible builds:** Applications commit an exact lockfile and CI installs from it without resolving. Libraries declare permissive version ranges and test against the lowest supported version.
- **Remove orphaned dependencies:** When removing a feature, remove its unique dependencies immediately.

---

## 21b. Public API Stability `[lib]`

- **The public surface is the smallest thing that works.** Anything exported is a contract; anything not exported can change freely. Default new items to private.
- **Semantic versioning is binding:** Removing or narrowing a public item, adding a required parameter, or changing a serialization format is a major version. Additive changes are minor.
- **Deprecate before deleting:** Mark the old item deprecated with the replacement named in the message, keep it working for at least one minor release, and remove it in the next major.
- **Document contracts, error conditions, and invariants** for every public item (see §3).

---

## 22. Verification Checklist Before Completion

Before declaring any task complete or submitting a pull request, verify:

1. **Formatting:** Automated formatter ran cleanly with zero modifications.
2. **Linting:** Zero linter errors and zero linter warnings on modified files.
3. **Type Checking:** Strict type checker runs with zero errors.
4. **Test Suite:** 100% of unit and integration tests pass.
5. **Size Validation:** No file or function exceeds repository size caps without documented justification.

---

## 23. Working Protocol

- **One logical change per commit:** Commits must be focused and reversible.
- **Accurate commit descriptions:** Commit messages must describe the motivation and scope of the change.
- **Language-specific standards:** For language-specific idioms, toolchains, and configurations, consult:
  - [**Rust Standards**](rust/CODING.md)
  - [**Go Standards**](go/CODING.md)
  - [**TypeScript Standards**](typescript/CODING.md)
  - [**Python Standards**](python/CODING.md)
  - [**Lua Standards**](lua/CODING.md)
  - [**Swift Standards**](swift/CODING.md)
  - [**Kotlin Standards**](kotlin/CODING.md)
