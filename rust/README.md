# Rust Standards & Architecture Blueprint (Rust 2024 Edition)

This directory contains the engineering standards, configuration templates, and architectural patterns for all Rust crates and services within this repository, targeting the **Rust 2024 Edition** (MSRV 1.85.0+).

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

Standard layout for Rust microservices and modular crates:

```
crate-root/
├── Cargo.toml               # Crate configuration (edition = "2024", resolver = "3")
├── clippy.toml              # Clippy configuration
├── rustfmt.toml             # Rustfmt configuration (style_edition = "2024")
├── src/
│   ├── main.rs              # Binary entry point (CLI/server bootstrap)
│   ├── lib.rs               # Library root and public interface declarations
│   ├── domain/              # Entities, value objects, domain errors (pure Rust)
│   │   ├── mod.rs
│   │   ├── models.rs
│   │   └── errors.rs
│   ├── application/         # Use cases, orchestrators, repository traits
│   │   ├── mod.rs
│   │   ├── services.rs
│   │   └── ports.rs
│   └── infrastructure/      # Concrete DB adapters, HTTP clients, telemetry
│       ├── mod.rs
│       ├── persistence.rs
│       └── web/
│           ├── mod.rs
│           ├── handlers.rs
│           └── routes.rs
└── tests/                   # Integration and end-to-end test suites
    ├── common/
    │   └── mod.rs
    └── api_integration_test.rs
```

---

## Toolchain & Linter Configuration

The root configuration templates in this directory should be linked or copied to every Rust crate:
- [`rustfmt.toml`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/rustfmt.toml): Strict formatting rules with `edition = "2024"` and `style_edition = "2024"`.
- [`clippy.toml`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/clippy.toml): Clippy thresholds and banned identifiers.
- [`Cargo.toml`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/Cargo.toml): Reference workspace `Cargo.toml` with strict workspace lints and resolver v3.

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
