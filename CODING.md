# Universal Coding Rules & Engineering Standards

- **No explanatory comments.** Write code that reads on its own.
- **No backwards-compatibility shims in application logic.** Migrations, versioned schemas, and routing layers handle compatibility—not runtime `if`-branches.
- **Fail fast and explicitly.** Never silently swallow errors or fall back to ambiguous default values.

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
- **No single-letter names anywhere.** Variables, parameters, callback arguments, loop variables, catch bindings, and generic type parameters must have descriptive names (`record` not `r`, `error` not `e`, `index` not `i`).
- **Standard casing:**
  - Lowercase / camelCase / snake_case for values, variables, and functions (per language standard).
  - Upper / PascalCase for types, structs, interfaces, classes, and traits.
  - Screaming snake_case for module-level constants and static globals.
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

Crossing a cap is a signal to decompose. Pure static data tables (e.g. ISO codes, mapping tables) are exempt if placed in dedicated data files.

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
- **Deterministic lifecycle management:** Any spawned background worker, timer, subscription, or connection pool must have an explicit teardown mechanism to prevent resource leaks.
- **Derive state; do not duplicate:** If two values must remain synchronized, store one canonical value and compute the second on demand.

---

## 8. Module Boundaries, Layering & Folder Architecture

- **One-directional dependency flow:** Higher-level application and delivery modules may depend on domain and shared utility modules, but shared libraries and core domain code must never import from outer feature directories:
  $$\text{Delivery (HTTP/CLI/UI)} \longrightarrow \text{Application (Use Cases)} \longrightarrow \text{Domain (Entities/Invariants)} \longleftarrow \text{Infrastructure (Adapters/DB)}$$
- **Feature-driven vertical slices ("Screaming Architecture"):** Organize folders by business domain features (e.g. `features/billing/`, `features/transfers/`) rather than pure technical groupings (`controllers/`, `views/`).
- **"Delete with one keystroke" cohesion:** A feature folder must be self-contained so that deleting it cleanly removes all its UI, state, API queries, types, and tests without leaving orphaned files.
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

## 14. Boundaries & Service Contracts

All boundary endpoints and service handlers follow a consistent execution sequence:
1. **Authentication & Authorization:** Verify identity and permissions.
2. **Rate Limiting & Throttling:** Protect write and sensitive endpoints.
3. **Input Validation:** Parse and validate the incoming request schema.
4. **Domain Execution:** Invoke business use cases and infrastructure ports.
5. **Standardized Response:** Return a typed success or error envelope.

---

## 15. Validation at System Boundaries

- **Strict schema validation:** All untrusted external inputs (HTTP bodies, query strings, message queue payloads, environment variables) must pass schema validation.
- **Centralized validation error formatting:** Format validation failures through a consistent error structure.
- **Reject unexpected fields:** Enforce strict payload parsing to prevent parameter injection and unintended field assignment.

---

## 16. Response Envelopes & Error Contracts

- **Standard envelope format:** Expose consistent top-level response contracts across all services:
  - Success: `{ success: true, data: ... }`
  - Failure: `{ success: false, error: { code: ..., message: ... } }`
- **Never leak internal stack traces:** Stack traces, internal server IPs, and database schemas must be omitted from production client responses.

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

- **Colocated or standard test suites:** Place unit tests in standard test directories adjacent to or associated with the source code.
- **Behavior-driven assertions:** Assert against observable behavior and public contracts rather than internal private state.
- **Deterministic and isolated:** Tests must be deterministic, order-independent, and free of external network or unmocked clock dependencies.
- **Continuous Integration gate:** The test suite must pass 100% green before any change can be merged.

---

## 21. Dependency Hygiene

- **Minimal external dependencies:** Favor standard library capabilities and existing dependencies before adding new third-party packages.
- **Audit and security checks:** Every dependency must pass license compliance and vulnerability auditing in CI.
- **Remove orphaned dependencies:** When removing a feature, remove its unique dependencies immediately.

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
  - [**Rust Standards**](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/CODING.md)
  - [**Go Standards**](file:///Users/igmrrf/Desktop/tmp/Agentic/go/CODING.md)
  - [**TypeScript Standards**](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/CODING.md)
  - [**Python Standards**](file:///Users/igmrrf/Desktop/tmp/Agentic/python/CODING.md)
  - [**Lua Standards**](file:///Users/igmrrf/Desktop/tmp/Agentic/lua/CODING.md)
  - [**Swift Standards**](file:///Users/igmrrf/Desktop/tmp/Agentic/swift/CODING.md)
  - [**Kotlin Standards**](file:///Users/igmrrf/Desktop/tmp/Agentic/kotlin/CODING.md)
