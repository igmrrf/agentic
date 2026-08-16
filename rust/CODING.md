# Rust Coding Rules & Standards

Applies to **every** Rust project — library crate, CLI, backend service, embedded or `no_std` firmware, WASM module, or proc-macro. Rules that only apply to a specific project shape carry a scope tag; runtime- and crate-specific guidance is called out as such rather than assumed.

Read [`../CODING.md`](../CODING.md) first — it is the universal baseline. This document adds Rust specifics and never relaxes it.

- **No explanatory comments.** Write code that reads on its own.
- **No backwards-compatibility shims.** Migrations and protocol versions handle compatibility, not runtime `match` branches or deprecated fallback paths.
- **Zero `.unwrap()` or `.expect()` in production.** All failure modes must use typed `Result` or `Option` propagation.
- **Baseline: Rust 2024 Edition (MSRV 1.85.0+).** New projects target the current stable edition. A project pinned to an older edition or a fixed MSRV states the pin and its reason in `Cargo.toml`; edition-gated rules below are marked and simply do not apply there.

---

## 1. Formatting & Toolchain

- **`rustfmt` is the single authority.** Never hand-format or reorder `use` statements. Run `cargo fmt --all`.
- **Formatting config (`rustfmt.toml`):** Set `edition = "2024"` and `style_edition = "2024"`, 4-space indent, max line width 100. Import grouping (`group_imports = "StdExternalCrate"`), comment wrapping, and string formatting are **nightly-only** rustfmt options — stable rustfmt ignores them with a warning instead of failing, so either pin nightly for formatting or accept rustfmt's default import handling. Do not put unstable options in the config and assume they took effect.
- **Clippy is a zero-warning gate.** CI runs `cargo clippy --all-targets --all-features -- -D warnings`.
- **Lint levels are declared once, in `[workspace.lints]` / `[lints]`, not scattered as crate attributes.** Required: `clippy::all` and `clippy::pedantic` at deny. `clippy::nursery` and `clippy::restriction` are opt-in per project — nursery lints are explicitly unstable and churn between toolchains, so a project that enables them must also pin its toolchain in `rust-toolchain.toml`.
- **Suppressions are local and justified.** An `#[allow(...)]` sits on the smallest possible item with a one-line reason. Blanket crate-level `#![allow(...)]` to clear a lint class is forbidden; either fix the code or change the level in the central config where everyone can see it.
- **Security & dependency auditing:** `cargo deny check` runs on every build, covering advisories, licenses, bans, and sources. `cargo audit` alone is acceptable for projects that need advisories only. Vulnerability advisories block merges immediately.
- **Cargo Resolver v3:** Set `resolver = "3"` in the root `Cargo.toml` (workspace) or package manifest for Rust-version aware dependency resolution. Edition 2024 packages get it by default.
- **MSRV is declared and tested.** `[lib]` Set `rust-version` in `Cargo.toml` and run CI against exactly that toolchain, not only against stable.

---

## 2. Naming & Ergonomics

Names are the specification. When names are accurate, structural comments become obsolete.

- **Casing rules:**
  - `snake_case`: functions, methods, modules, local variables, struct fields.
  - `PascalCase`: structs, enums, enum variants, traits, type aliases.
  - `SCREAMING_SNAKE_CASE`: `const` items, `static` items.
- **No single-letter names.** No `e` for error, `p` for payload, `c` for client, or `i` for loop index. Use `error`, `payload`, `http_client`, `index`.
  - **Only permitted exceptions:** `self` and the conventional closure-free math shorthand inside a formula that mirrors published notation. Nothing else.
- **Generic parameter naming:** generic parameters are descriptive `PascalCase` names — `Item`, `Repository`, `Payload` — not single letters. Single-letter generics (`T`, `E`, `R`) are forbidden except in a genuinely universal container or combinator where the parameter has no domain meaning whatsoever, and even there a name is preferred. Do **not** import the `TItem` / `TError` prefix convention from C# or TypeScript: it is non-idiomatic in Rust and reads as a typo to Rust reviewers.
- **Lifetime naming:** Use descriptive lifetimes when more than one is in scope (e.g. `'ctx`, `'req`, `'buf`). Use `'a` only for trivial single-lifetime helper functions.
- **RPIT Lifetime Capture (edition 2024):** In return position `impl Trait`, use the `use<..>` syntax to explicitly specify captured generic parameters and lifetimes when precise bounds are required.
- **Conversion method conventions:**
  - `as_*`: Borrowed to borrowed conversion. Inexpensive, no allocation (e.g. `as_bytes(&self) -> &[u8]`).
  - `to_*`: Borrowed to owned conversion. May allocate or clone (e.g. `to_string(&self) -> String`).
  - `into_*`: Consuming conversion (moves `self`, e.g. `into_inner(self) -> TPayload`).
- **Predicates:** Functions returning `bool` read as predicates: `is_active`, `has_permission`, `can_proceed`, `should_retry`. Never bare nouns (`active`) or negated names (`is_not_ready`).
- **No type noise in names:** `user_accounts` not `user_vec`, `user_id_map` not `id_hash_map`.

---

## 3. Comments & Documentation

- **No explanatory comments in implementation bodies.** Code must be structured and named so that logic flows transparently.
- **Public API documentation:** All public crates, traits, structs, and functions must have doc comments (`///` and `//!`).
- **Mandatory doc sections for public items:**
  - `# Errors`: Documents all conditions under which the function returns `Err`.
  - `# Panics`: Documents any potential panic states (even if theoretically unreachable).
  - `# Safety`: Mandatory on any `unsafe fn` explaining all preconditions the caller must guarantee.
- **No commented-out code.** Remove dead code immediately; version control tracks history.
- **No changelog comments:** Never add `// modified 2026-08-14 by ...`. Use git commit metadata.

---

## 4. Ownership, Borrowing & Function Signatures

- **Borrow before owning:** Accept borrowed slices rather than owned collections in function signatures:
  - `&str` instead of `&String` or `String` (unless taking ownership).
  - `&[T]` instead of `&Vec<T>` or `Vec<T>`.
  - `&Path` instead of `&PathBuf` or `PathBuf`.
- **Avoid unnecessary clones:** Never call `.clone()` simply to appease the borrow checker. Restructure lifetimes, pass references, or use `std::borrow::Cow` when ownership is conditional.
- **Guard clauses and early exits:** Use `let ... else { return ...; }` or `if ... { return ...; }` to handle errors and boundary conditions early, avoiding deep indentation.
- **Max nesting depth:** 3 levels. Functions exceeding this must be refactored into focused helpers.
- **Parameter count:** Functions should accept 3 or fewer parameters. If more parameters are needed, introduce a typed configuration or request struct.
- **No boolean flags for behavior branching:** Avoid `fetch_account(account_id, true)`. Use distinct functions (`fetch_account_with_history`) or an enum (`FetchStrategy::IncludeHistory`).

---

## 5. Size Caps

Soft caps enforced via CI size validation:

| Unit | Cap |
|---|---|
| File / Module | 400 lines |
| Struct `impl` block | 150 lines |
| Function | 60 lines |

Crossing a cap requires decomposition into cohesive sub-modules or traits. Pure static data tables are exempt if placed in dedicated data files.

---

## 6. Types, Modeling & Invariants

- **Make invalid states unrepresentable:** Model state transitions with enums and the typestate pattern rather than boolean flags on a single giant struct.
- **Newtype Pattern:** Wrap primitive types to enforce domain boundaries and prevent accidental transposition:
  ```rust
  #[derive(Debug, Clone, PartialEq, Eq, Hash)]
  pub struct AccountId(uuid::Uuid);

  #[derive(Debug, Clone, PartialEq, Eq, Hash)]
  pub struct UserId(uuid::Uuid);
  ```
- **Exhaustive Matching:** Avoid wildcard `_ =>` matches on internal domain enums. Every variant must be handled explicitly so adding a variant generates compile-time errors.
- **Derives:** Standard types must implement `Debug`, `Clone`, `PartialEq`, `Eq` where mathematically sound. Implement `Default` only when an intuitive zero/empty state exists.
- **Encapsulation:** Struct fields are private by default. Expose read-only accessors or builder patterns to maintain invariant validation.

---

## 7. Error Handling

- **Libraries and domain modules return typed error enums.** Every error type implements `std::error::Error` (or `core::error::Error` on `no_std`), `Debug`, and `Display`, and exposes its underlying cause via `source()`. A derive macro is the normal way to get there — **`thiserror` is the default choice**; `snafu`, `displaydoc` + manual impls, or a hand-written impl are equally acceptable. The requirement is the shape of the contract, not the crate:
  ```rust
  #[derive(thiserror::Error, Debug)]
  pub enum PaymentError {
      #[error("insufficient balance for account {account_id}: required {required_minor}, available {available_minor}")]
      InsufficientBalance {
          account_id: AccountId,
          required_minor: u64,
          available_minor: u64,
      },
      #[error("payment provider unavailable: {source}")]
      ProviderUnavailable {
          #[source]
          source: std::io::Error,
      },
  }
  ```
- **Opaque error types (`anyhow`, `eyre`) are restricted to binaries** — `main`, CLI entry points, and integration tests, where the only consumer is a human reading a message. A library that returns an opaque error robs every caller of the ability to match on failure.
- **Use `?` for propagation:** Bubble errors naturally; never write verbose manual matches for error forwarding. Add context when crossing a layer boundary rather than at every frame.
- **Zero panics in production paths:** Never use `panic!`, `unwrap()`, or `expect()` in library or service code. Prefer `let ... else`, `ok_or_else`, and `?`.
  - **Permitted:** `expect()` in tests, benchmarks, build scripts, and `main` where a failed precondition genuinely means the program cannot start — and only with a message stating the invariant, not `"should not happen"`.
  - Indexing (`slice[i]`), integer division, and `unwrap_or_default()` on a semantically meaningful `None` are panics and silent-default bugs in disguise. Use `get()`, `checked_*`, and explicit handling.
- **Document panics and errors:** every public fallible function has `# Errors`, every public function that can panic has `# Panics` (§3).
- **Error inspection:** Use `source()` chaining and `downcast_ref` for introspection. Never match on the `Display` string of an error.
- **`no_std` note:** use `core::error::Error` and a `Display` impl without allocation; `thiserror` supports `no_std`, `anyhow` and `eyre` generally do not.

---

## 8. Unsafe Code Rules

- **Default is safe Rust:** `#![forbid(unsafe_code)]` is enforced on all high-level business crates.
- **Rust 2024 `unsafe_op_in_unsafe_fn` Compliance:** In the 2024 edition, every unsafe operation inside an `unsafe fn` must be wrapped in an explicit `unsafe { ... }` block to isolate the exact unsafe boundary.
- **Mandatory `// SAFETY:` invariant comment:** If `unsafe` is strictly required in a low-level crate (e.g. FFI, high-performance serialization), every `unsafe` block must be preceded by a comment explaining the mathematical proof of memory safety.
- **Miri validation:** All crates with `unsafe` blocks must pass `cargo miri test` in CI with zero undefined behavior detections.

---

## 9. Concurrency & Async

These rules hold for any executor. Where a crate is named it is an example of the mechanism, not a mandate — **Tokio** is the default runtime choice for services, with `smol`, `async-std`, `embassy` (embedded), or `wasm-bindgen-futures` (WASM) equally valid where they fit better.

### Threads and shared state

- **Prefer message passing and ownership transfer to shared mutable state.** Reach for a channel before a `Mutex`.
- **Guards are never held across an `.await` or an I/O call.** A `std::sync::MutexGuard` held across `.await` makes the future `!Send` and can deadlock the executor; scope the lock tightly and drop it before awaiting.
- **`Arc<Mutex<T>>` is a design decision, not a default.** Justify shared ownership; consider `Arc<T>` with interior immutability, a single owning task, or `RwLock` when reads dominate.
- **Every thread and task has a join handle and a shutdown path.** Detached work that nobody can wait for or cancel is a leak.

### Async

- **Native `async fn` in traits** (edition 2024 / Rust 1.75+) — no `#[async_trait]` heap-allocation overhead. Add `+ Send` bounds explicitly where the future must cross threads; use `#[async_trait]` only when dyn-compatibility genuinely requires it.
- **Cancellation safety:** any future that may be dropped mid-poll — anything inside `select!` — must leave state consistent when cancelled. If a state mutation across `.await` points cannot be cancelled safely, move it into a dedicated task that owns the state.
- **Never block the executor.** Blocking I/O, heavy CPU work, and thread sleeps must not run on an async worker thread. Offload to the runtime's blocking pool (`spawn_blocking`) or a dedicated thread pool.
- **Bounded channels only.** Unbounded channels convert a slow consumer into an out-of-memory crash. Choose a capacity and document what backpressure means at that boundary.
- **Structured concurrency.** Group related tasks under a scope that can await or abort them together (`JoinSet`, a task scope, a supervisor). Every spawned task's lifetime is tied to a cancellation token or shutdown signal.
- **Timeouts on every external call.** Wrap network and IPC futures in the runtime's timeout combinator.
- **One runtime, one version.** Mixing executors — or two major versions of the same one — in a single binary causes subtle "no reactor running" panics. Pin it at the workspace level.

---

## 9b. Logging & Observability

- **Structured, leveled, and behind a facade.** Emit key-value fields through `tracing` (default choice for async and service code) or `log` (sufficient for simple libraries) — never `println!`/`eprintln!` outside a CLI's actual stdout output.
- **Libraries log through the facade and never install a subscriber.** `[lib]` Choosing the output format and destination is the binary's decision.
- **Spans carry context.** Instrument request- and task-scoped work so log lines inherit identifiers instead of repeating them by hand.
- **Never log secrets or PII.** Types holding credentials implement `Debug` manually to redact — a `#[derive(Debug)]` on a config struct will happily print the database password.
- **Log once, at the boundary.** Propagate errors upward with context and log them at the top-level handler, not at every frame.

---

## 10. Folder & File Design Architecture

Pick the shape that matches the crate. A library does not get a `domain/application/infrastructure` split because a service template has one.

### Option A: Library or CLI Crate

The crate *is* the domain; layers are collapsed until there is a reason for them.

```
my-crate/
├── Cargo.toml
├── src/
│   ├── lib.rs               # Public API surface + `mod` declarations only
│   ├── main.rs              # `[bin]` Thin: arg parsing, config, call into lib.rs
│   ├── error.rs             # The crate's public error enum
│   ├── config.rs
│   ├── parser.rs            # A cohesive unit of the domain
│   └── parser/              # Submodules, added only when parser.rs hits its cap
│       └── tokenizer.rs
├── tests/                   # Integration tests against the public API
├── benches/                 # `[lib]` Criterion benchmarks for performance-critical paths
└── examples/                # `[lib]` Compilable usage examples, checked by CI
```

### Option B: Modular Clean Architecture (Single Crate)

```
rust-service/
├── Cargo.toml                   # edition = "2024", resolver = "3"
├── src/
│   ├── main.rs                  # Composition root: config parsing & dependency wiring
│   ├── lib.rs                   # Crate root exporting public module interface
│   ├── domain.rs                # Module root (2018+ path style — not domain/mod.rs)
│   ├── domain/                  # Pure domain logic (entities, newtypes, errors)
│   │   ├── account.rs           # AccountId newtype, state enums
│   │   └── errors.rs            # Typed error enum definitions
│   ├── application.rs
│   ├── application/             # Use cases & port traits
│   │   ├── transfer_service.rs  # Business workflows
│   │   └── ports.rs             # pub trait AccountRepository: Send + Sync
│   ├── infrastructure.rs
│   └── infrastructure/          # Concrete adapters
│       ├── database.rs
│       ├── database/
│       │   └── postgres_repo.rs # Implements AccountRepository
│       ├── web.rs
│       └── web/
│           ├── handlers.rs      # Extractors & typed responses
│           └── routes.rs        # Router wiring
└── tests/                       # External integration tests
    ├── common/
    │   └── mod.rs               # `tests/` helper modules still require mod.rs
    └── api_integration_test.rs
```

### Option C: Cargo Workspace (Multi-Crate Monorepo)

For large systems requiring strict compile-time boundary enforcement:

```
workspace-root/
├── Cargo.toml                   # [workspace] with shared dependencies & lints
└── crates/
    ├── domain/                  # Pure domain models & business rules (#![no_std] capable)
    ├── application/             # Application services & trait definitions (depends on domain)
    ├── infra-postgres/          # SQLx/PostgreSQL implementation (depends on application, domain)
    ├── infra-http/              # Axum HTTP routes & OpenAPI handlers (depends on application)
    └── server/                  # Binary orchestrator (glues all infra crates together)
```

- **File Naming Standards:**
  - `snake_case` for all `.rs` files and directory names.
  - **Module roots use `foo.rs` alongside `foo/`, not `foo/mod.rs`.** The 2018+ path style keeps the module's own code out of a directory full of identically named `mod.rs` tabs. An existing codebase on `mod.rs` stays consistent with itself rather than mixing both.
  - Colocated unit tests inside `#[cfg(test)] mod tests` in the same file.
- **The composition root is the only place that knows about concrete adapters.** `main.rs` wires implementations to interfaces; nothing below it names a concrete database or transport type.
- **`src/lib.rs` declares the public API deliberately.** Re-export the crate's surface explicitly; keep everything else `pub(crate)`. `[lib]`

---

## 11. Testing Standards

- **Colocated unit tests:** Unit tests live in the same file inside a `#[cfg(test)] mod tests` module.
- **Integration tests:** Located in `tests/` directory at crate root, testing public interfaces and real boundaries.
- **Deterministic tests:** No dependence on system wall clock (use mock time or injected clocks), no dependence on external live networks, no unseeded randomness.
- **Doc tests are tests.** `[lib]` Examples in `///` doc comments compile and run in CI; a doc example that has drifted is a broken promise to callers.
- **Property testing for parsers, serialization round-trips, and financial or mathematical invariants.** `proptest` and `quickcheck` are both fine; the requirement is that these areas get property coverage, not that a specific crate provides it.
- **Miri for `unsafe`, sanitizers for FFI.** Any crate containing `unsafe` runs `cargo miri test` in CI (§8).
- **CI Suite:** `cargo test --all-targets --all-features` must pass 100% green. Crates with meaningful feature combinations also verify them — at minimum `--no-default-features`.

---

## 12. Verification Commands

Before opening a PR or marking work complete, all checks must pass cleanly:

```bash
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets --all-features
cargo audit
cargo deny check
```
