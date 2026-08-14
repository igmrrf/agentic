# Rust Coding Rules & Standards (Rust 2024 Edition)

- **No explanatory comments.** Write code that reads on its own.
- **No backwards-compatibility shims.** Migrations and protocol versions handle compatibility, not runtime `match` branches or deprecated fallback paths.
- **Zero `.unwrap()` or `.expect()` in production.** All failure modes must use typed `Result` or `Option` propagation.
- **Target the Rust 2024 Edition (MSRV 1.85.0+).** Leverage modern Rust 2024 idioms, including `use<..>` lifetime capture syntax and native async trait methods.

---

## 1. Formatting & Toolchain

- **`rustfmt` is the single authority.** Never hand-format or reorder `use` statements. Run `cargo fmt --all`.
- **Formatting config (`rustfmt.toml`):** Set `edition = "2024"` and `style_edition = "2024"`, 4-space indent, max line width 100, trailing commas in multiline structs/enums/matches, imports organized by group (std -> external crates -> local crate).
- **Clippy is a zero-warning gate.** CI runs `cargo clippy --all-targets --all-features -- -D warnings`.
- **Ratcheted lints:** Clippy pedantic and nursery lints are enabled repo-wide. Lints that trigger must be resolved at the source; never add blanket `#![allow(...)]` across crates.
- **Security & Dependency Auditing:** `cargo audit` and `cargo deny check` run on every build. Advisories with vulnerability status block merges immediately.
- **Cargo Resolver v3:** Set `resolver = "3"` in root `Cargo.toml` for Rust-version aware dependency resolution.

---

## 2. Naming & Ergonomics

Names are the specification. When names are accurate, structural comments become obsolete.

- **Casing rules:**
  - `snake_case`: functions, methods, modules, local variables, struct fields.
  - `PascalCase`: structs, enums, enum variants, traits, type aliases.
  - `SCREAMING_SNAKE_CASE`: `const` items, `static` items.
- **No single-letter names anywhere.** No `e` for error, `p` for payload, `c` for client, or `i` for loop index. Use `error`, `payload`, `httpClient`, `index`.
- **Generic parameter naming:** Use descriptive names prefixed with `T`, such as `TItem`, `TError`, `TState`, `TRepository`. Single-letter generics (`T`, `E`, `R`) are forbidden.
- **Lifetime naming:** Use descriptive lifetimes when more than one is in scope (e.g. `'ctx`, `'req`, `'buf`). Use `'a` only for trivial single-lifetime helper functions.
- **RPIT Lifetime Capture (Rust 2024):** In return position `impl Trait`, use the `use<..>` syntax to explicitly specify captured generic parameters and lifetimes when precise bounds are required.
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

- **`thiserror` for domain modules and libraries:** Define strongly typed error enums with clear variant names and error formatting:
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
- **`anyhow` / `eyre` restricted to CLI entry points & main:** Library crates and internal domain layers must return explicit, typed errors.
- **Use `?` for propagation:** Bubble errors naturally; never write verbose manual matches for error forwarding.
- **Zero panics in production paths:** Never use `panic!`, `unwrap()`, or `expect()` in service code.
- **Error inspection:** Use `source()` chaining and `downcast_ref` for error introspection.

---

## 8. Unsafe Code Rules

- **Default is safe Rust:** `#![forbid(unsafe_code)]` is enforced on all high-level business crates.
- **Rust 2024 `unsafe_op_in_unsafe_fn` Compliance:** In the 2024 edition, every unsafe operation inside an `unsafe fn` must be wrapped in an explicit `unsafe { ... }` block to isolate the exact unsafe boundary.
- **Mandatory `// SAFETY:` invariant comment:** If `unsafe` is strictly required in a low-level crate (e.g. FFI, high-performance serialization), every `unsafe` block must be preceded by a comment explaining the mathematical proof of memory safety.
- **Miri validation:** All crates with `unsafe` blocks must pass `cargo miri test` in CI with zero undefined behavior detections.

---

## 9. Async & Concurrency (Tokio Ecosystem)

- **Native Async Traits:** Leverage Rust 2024 native `async fn` in traits without requiring `#[async_trait]` heap allocation macro overhead.
- **Cancellation safety:** Every async function executed inside `tokio::select!` must be cancellation safe. If state mutation across `.await` points cannot be cancelled safely, run it inside a dedicated task.
- **Never block the async runtime:** Never execute blocking I/O, heavy CPU computations, or thread sleep on a Tokio worker thread. Offload to `tokio::task::spawn_blocking`.
- **Bounded channels only:** Always use bounded channels (`tokio::sync::mpsc::channel(capacity)`). Unbounded channels are strictly forbidden to prevent out-of-memory cascades.
- **Structured concurrency:** Use `tokio::task::JoinSet` to manage pools of tasks. Every spawned task must have a lifecycle tied to a cancellation token or shutdown signal.

---

## 10. API & Architecture

- **Clean / Hexagonal Architecture:**
  - `domain`: Pure business rules, entities, and value objects (zero I/O, zero external framework dependencies).
  - `application`: Use cases, orchestrators, and trait interfaces for repositories and gateways.
  - `infrastructure`: Concrete implementations of database clients, HTTP adapters, message queues, and external APIs.
- **Trait-driven dependency injection:** Domain and application layers interact with traits (e.g. `pub trait AccountRepository: Send + Sync + 'static`).
- **Axum / Actix HTTP Handlers:** Handlers parse request payloads via typed extractors (`Json<CreateAccountRequest>`), invoke application services, and return typed responses (`Result<Json<AccountResponse>, AppError>`).

---

## 11. Testing Standards

- **Colocated unit tests:** Unit tests live in the same file inside a `#[cfg(test)] mod tests` module.
- **Integration tests:** Located in `tests/` directory at crate root, testing public interfaces and real boundaries.
- **Deterministic tests:** No dependence on system wall clock (use mock time or injected clocks), no dependence on external live networks.
- **Property testing:** Use `proptest` for parsing, serialization, and critical mathematical/financial calculations.
- **CI Suite:** `cargo test --all-targets --all-features` must pass 100% green.

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
