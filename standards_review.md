# Engineering Standards Architecture & Multi-Language Review

## 1. Project Review & Research Summary

The `Agentic` repository establishes an uncompromising, production-ready baseline for multi-language software engineering. All standards and configurations have been researched and verified against the latest language releases (2026):

- **Universal Core ([`CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/CODING.md)):** Truly language-agnostic craft standards (no explanatory comments, no backwards-compatibility shims, pure core / impure edges, failure fast, strict size caps, parity-first refactoring, and ratcheted quality gates).
- **Rust ([`rust/`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/README.md)):** Targets the **Rust 2024 Edition** (stabilized in Rust 1.85.0 on February 20, 2025). Implements `style_edition = "2024"`, Cargo Resolver v3 (`resolver = "3"`), explicit `use<..>` lifetime capturing in RPIT, `unsafe_op_in_unsafe_fn` encapsulation, native async traits, and zero `.unwrap()` in production.
- **Go ([`go/`](file:///Users/igmrrf/Desktop/tmp/Agentic/go/README.md)):** Targets **Go 1.26** (released February 2026). Implements `new(expr)` pointer initialization, Green Tea GC runtime, `testing/synctest` deterministic concurrency testing, `range-over-func` iterators (`iter.Seq`, `iter.Seq2`), `log/slog` structured logging, `errors.Join`, and race-detected testing.
- **TypeScript ([`typescript/`](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/README.md)):** Targets **TypeScript 7.0** (released July 2026 with native Go-powered compiler). Implements `erasableSyntaxOnly: true`, `isolatedDeclarations: true`, `verbatimModuleSyntax: true` (`import type`), strict property checks (`noUncheckedIndexedAccess`), `for...of` for side effects, `.map()` for transformations, standalone extracted hooks, and Biome linting/formatting.

---

## 2. Directory Layout Architecture

```
/Users/igmrrf/Desktop/tmp/Agentic/
├── CODING.md                    # Universal language-agnostic engineering rules
├── README.md                    # Navigation index & standards summary
├── standards_review.md          # Architecture review & research specifications
├── rust/                        # Rust 2024 Edition Standards
│   ├── README.md                # Blueprint & verification guide
│   ├── CODING.md                # Language rules, safety, async & trait patterns
│   ├── rustfmt.toml             # Rustfmt config (style_edition = "2024")
│   ├── clippy.toml              # Strict Clippy complexity & size thresholds
│   └── Cargo.toml               # Reference Cargo workspace (edition = "2024", resolver = "3")
├── go/                          # Go 1.26 Standards
│   ├── README.md                # Standard project layout (cmd/internal/pkg)
│   ├── CODING.md                # Go 1.26 idioms, new(expr), synctest, iterators & error wrapping
│   └── .golangci.yml            # Production golangci-lint configuration
└── typescript/                  # TypeScript 7.0 Standards
    ├── README.md                # Architecture blueprint & layout guide
    ├── CODING.md                # Strict typing, erasableSyntaxOnly, iteration rules, hooks & schemas
    ├── biome.json               # Biome linter/formatter configuration
    └── tsconfig.json            # Strict tsconfig (erasableSyntaxOnly, isolatedDeclarations, verbatimModuleSyntax)
```

---

## 3. Verified Standards Matrix

| Domain | Rust (`rust/`) | Go (`go/`) | TypeScript (`typescript/`) |
|---|---|---|---|
| **Target Version** | Rust 2024 Edition (MSRV 1.85.0+) | Go 1.26 | TypeScript 7.0 (Native Go Compiler) |
| **Formatter** | `rustfmt` (`style_edition = "2024"`) | `gofmt` + `goimports` | `biome` (`indentWidth: 2`, single quotes) |
| **Linter / Checker** | `cargo clippy -- -D warnings` | `golangci-lint run ./...` | `tsc --noEmit` + `biome lint` |
| **Compiler Flags** | `unsafe_op_in_unsafe_fn`, `resolver = "3"` | `govulncheck`, `-race` | `erasableSyntaxOnly`, `isolatedDeclarations`, `verbatimModuleSyntax` |
| **Error Model** | Strongly typed `thiserror` (0 unwrap) | Explicit values wrapped with `%w` / `errors.Join` | Discriminated union envelope + Zod |
| **Iteration Idiom** | Iterators & standard closures | `range-over-func` (`iter.Seq`, `iter.Seq2`) | `for...of` (side effects), `.map` (transforms) |
| **Async / Concurrency** | Tokio with cancellation safety | Goroutines bounded by `context.Context`, `synctest` | Async/await with TanStack Query |
| **Size Caps** | File: 400, Impl: 150, Fn: 60 | File: 400, Type: 200, Fn: 50 | File: 400, Component: 150, Fn: 60 |
| **Security Auditing** | `cargo audit` + `cargo deny` | `govulncheck ./...` | Strict schemas + dependency audit |
