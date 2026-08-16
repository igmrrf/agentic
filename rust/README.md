# Rust Standards & Architecture Blueprint (Rust 2024 Edition)

This directory contains the engineering standards, configuration templates, and architectural patterns for **every** Rust project — library crate, CLI, backend service, `no_std`/embedded firmware, WASM module, or proc-macro.

**Baseline: Rust 2024 Edition (MSRV 1.85.0+).** [`CODING.md`](CODING.md) marks its edition-gated rules and states how to pin lower; everything else holds on any supported toolchain.

## Table of Contents

- [Core Principles](#core-principles)
- [Rust 2024 Edition Highlights](#rust-2024-edition-highlights)
- [Project Layout Blueprint](#project-layout-blueprint)
- [Toolchain & Linter Configuration](#toolchain--linter-configuration)
- [Verification Checklist](#verification-checklist)

---

## Core Principles

1. **Safety & Zero Panics:** Zero `.unwrap()` or `.expect()` calls in production code paths. Handle all errors through strongly typed `Result<T, E>`.
2. **Predictable Performance:** Zero-cost abstractions, minimal heap allocations, and strict avoidance of unnecessary cloning.
3. **Idiomatic Rust 2024:** Strong domain modeling using newtypes, exhaustive enum matching, typestate pattern, and native async trait-driven interfaces.
4. **Structured Concurrency:** Strict async cancellation safety, bounded message queues, and non-blocking worker threads.

---

## Rust 2024 Edition Highlights

- **Style Editions (`style_edition = "2024"`):** Formatter rules decoupled from compiler releases for zero churn across toolchain upgrades.
- **`use<..>` Lifetime Capture:** Explicit lifetime and generic parameter capturing in return position `impl Trait` (RPIT).
- **`unsafe_op_in_unsafe_fn`:** Explicit `unsafe { ... }` blocks required inside `unsafe fn` bodies to isolate unsafe operations.
- **Cargo Resolver v3:** Rust-version aware dependency resolver preventing incompatible dependency selections.

---

## Project Layout Blueprint

The two service-shaped layouts are below. A library or CLI crate uses a flatter shape — see [`CODING.md` §10 Option A](CODING.md#10-folder--file-design-architecture).

### Option B: Modular Clean Architecture (Single Crate)

```
rust-service/
├── Cargo.toml               # Crate configuration (edition = "2024", resolver = "3")
├── clippy.toml              # Clippy configuration
├── rustfmt.toml             # Rustfmt configuration (style_edition = "2024")
├── src/
│   ├── main.rs              # Binary entry point & composition root
│   ├── lib.rs               # Library root and public interface declarations
│   ├── domain.rs            # Module root (2018+ path style — not domain/mod.rs)
│   ├── domain/              # Entities, value objects, domain errors (pure Rust)
│   │   ├── account.rs
│   │   └── errors.rs
│   ├── application.rs
│   ├── application/         # Use cases, orchestrators, repository traits
│   │   ├── transfer_service.rs
│   │   └── ports.rs
│   ├── infrastructure.rs
│   └── infrastructure/      # Concrete DB adapters, HTTP clients, telemetry
│       ├── database.rs
│       ├── database/
│       │   └── postgres_repo.rs
│       ├── web.rs
│       └── web/
│           ├── handlers.rs
│           └── routes.rs
└── tests/                   # Integration and end-to-end test suites
    ├── common/
    │   └── mod.rs           # `tests/` helper modules still require mod.rs
    └── api_integration_test.rs
```

### Option C: Cargo Workspace (Multi-Crate Monorepo)

```
workspace-root/
├── Cargo.toml               # [workspace] with shared dependencies & lints
└── crates/
    ├── domain/              # Pure domain models & business rules (#![no_std] capable)
    ├── application/         # Application services & trait definitions (depends on domain)
    ├── infra-postgres/      # SQLx/PostgreSQL implementation (depends on application, domain)
    ├── infra-http/          # Axum HTTP routes & OpenAPI handlers (depends on application)
    └── server/              # Binary orchestrator (glues all infra crates together)
```

---

## Toolchain & Linter Configuration

The root configuration templates in this directory should be linked or copied to every Rust crate:
- [`rustfmt.toml`](rustfmt.toml): Strict formatting rules with `edition = "2024"` and `style_edition = "2024"`.
- [`clippy.toml`](clippy.toml): Clippy thresholds and banned identifiers.
- [`Cargo.toml`](Cargo.toml): Reference workspace `Cargo.toml` with strict workspace lints and resolver v3.

---

## Verification Checklist

Every pull request and release build must run and pass:

```bash
# 1. Format verification
cargo fmt --all -- --check

# 2. Strict linter audit (zero warnings permitted)
cargo clippy --all-targets --all-features -- -D warnings

# 3. Unit, integration, and doc tests
cargo test --all-targets --all-features

# 4. Security vulnerability scan
cargo audit

# 5. Dependency license and ban policy check
cargo deny check
```
