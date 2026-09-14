# Agentic Engineering Standards

Authoritative engineering standards, coding rules, architectural blueprints, and toolchain configurations for multi-language development across **Rust**, **Go**, **TypeScript**, **Python**, **Lua**, **Swift**, and **Kotlin**.

---

## Quickstart: Scaffolding a New Project

Use the built-in initializer script [`scripts/init.sh`](file:///Users/igmrrf/Desktop/tmp/Agentic/scripts/init.sh) to bootstrap standards, linter configs, CI workflows, and AI agent rules into any new or existing project:

```bash
# Interactive setup (auto-detects project language in existing repositories):
./scripts/init.sh

# Target a specific language and project folder:
./scripts/init.sh --lang=rust --target=/path/to/my-service
./scripts/init.sh --lang=go --target=/path/to/my-service
./scripts/init.sh --lang=typescript --target=/path/to/my-service
./scripts/init.sh --lang=python --target=/path/to/my-service
./scripts/init.sh --lang=lua --target=/path/to/my-service
./scripts/init.sh --lang=swift --target=/path/to/my-service
./scripts/init.sh --lang=kotlin --target=/path/to/my-service

# Target a specific AI agent for rules:
./scripts/init.sh --gemini
./scripts/init.sh -a claude
./scripts/init.sh --cursor

# Safe adoption on an existing project (preview with dry-run and backup protection):
# NOTE: By default, init.sh copies ONLY standards, linter/formatter configs, CI workflows,
# and AI agent rules. It NEVER injects dummy code, sample entities, or sample tests.
./scripts/init.sh --target=/path/to/existing-repo --dry-run
./scripts/init.sh --target=/path/to/existing-repo --backup --force

# Greenfield bootstrap with starter domain entities, manifests, and test suites:
./scripts/init.sh --target=/path/to/new-service --lang=go --with-starter

# Multi-language / monorepo setup:
./scripts/init.sh --lang=all --target=.
```

### Remote Initialization via cURL

```bash
curl -fsSL https://raw.githubusercontent.com/igmrrf/Agentic/refs/heads/main/scripts/init.sh | bash -s -- --lang=swift --target=.
```

---

## Language Standards

| Language | Target Version | Standards & Rules | Blueprint & Overview | Toolchain / Configs | CI Workflow |
|---|---|---|---|---|---|
| **Rust** | Rust 2024 (1.85.0+) | [`rust/CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/CODING.md) | [`rust/README.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/README.md) | [`rustfmt.toml`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/rustfmt.toml), [`clippy.toml`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/clippy.toml), [`Cargo.toml`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/Cargo.toml) | [`rust-ci.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/templates/ci/rust-ci.yml) |
| **Go** | Go 1.26 | [`go/CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/go/CODING.md) | [`go/README.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/go/README.md) | [`.golangci.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/go/.golangci.yml) | [`go-ci.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/templates/ci/go-ci.yml) |
| **TypeScript** | TypeScript 7.0 | [`typescript/CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/CODING.md) | [`typescript/README.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/README.md) | [`biome.json`](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/biome.json), [`tsconfig.json`](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/tsconfig.json) | [`typescript-ci.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/templates/ci/typescript-ci.yml) |
| **Python** | Python 3.12+ | [`python/CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/python/CODING.md) | [`python/README.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/python/README.md) | [`pyproject.toml`](file:///Users/igmrrf/Desktop/tmp/Agentic/python/pyproject.toml) | [`python-ci.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/templates/ci/python-ci.yml) |
| **Lua** | LuaJIT / Lua 5.4 | [`lua/CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/lua/CODING.md) | [`lua/README.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/lua/README.md) | [`.stylua.toml`](file:///Users/igmrrf/Desktop/tmp/Agentic/lua/.stylua.toml), [`.luarc.json`](file:///Users/igmrrf/Desktop/tmp/Agentic/lua/.luarc.json), [`.luacheckrc`](file:///Users/igmrrf/Desktop/tmp/Agentic/lua/.luacheckrc) | [`lua-ci.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/templates/ci/lua-ci.yml) |
| **Swift** | Swift 6.0+ | [`swift/CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/swift/CODING.md) | [`swift/README.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/swift/README.md) | [`.swiftlint.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/swift/.swiftlint.yml), [`.swiftformat`](file:///Users/igmrrf/Desktop/tmp/Agentic/swift/.swiftformat), [`Package.swift`](file:///Users/igmrrf/Desktop/tmp/Agentic/swift/Package.swift) | [`swift-ci.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/templates/ci/swift-ci.yml) |
| **Kotlin** | Kotlin 2.0+ (K2) | [`kotlin/CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/kotlin/CODING.md) | [`kotlin/README.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/kotlin/README.md) | [`detekt.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/kotlin/detekt.yml), [`.editorconfig`](file:///Users/igmrrf/Desktop/tmp/Agentic/kotlin/.editorconfig), [`build.gradle.kts`](file:///Users/igmrrf/Desktop/tmp/Agentic/kotlin/build.gradle.kts) | [`kotlin-ci.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/templates/ci/kotlin-ci.yml) |

---

## Universal Foundations

- **Root Rules:** [`CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/CODING.md) defines universal craft standards across all stacks (no explanatory comments, no backwards-compatibility `if`-branch shims, strict size caps, zero-swallowed errors, parity-first refactoring, folder/file design).
- **Architecture Review:** [`standards_review.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/standards_review.md) contains the review summary, verified research findings, version matrix, and architecture references.
- **Audit & Quality Scorecard:** [`code_review.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/code_review.md) documents production-readiness assessments and toolchain verifications.
- **Scaffolding Tool:** [`scripts/init.sh`](file:///Users/igmrrf/Desktop/tmp/Agentic/scripts/init.sh) provides automated project configuration.

---

## Folder & File Architecture Patterns

- [**TypeScript / React Feature-Driven Colocation**](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/README.md#standard-project-layout-feature-driven-colocation): Vertical domain slices (`src/features/[feature]/`), colocated components, hooks, schemas, and tests.
- [**Go Standard Hexagonal Layout**](file:///Users/igmrrf/Desktop/tmp/Agentic/go/README.md#standard-project-layout): Compiler-gated `internal/` encapsulation, pure `domain/`, `service/` use cases, and `adapter/` (postgres/http).
- [**Rust Modular Clean Architecture & Workspace Monorepo**](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/README.md#project-layout-blueprint): Trait-decoupled domain/application layers and multi-crate workspace separation.
- [**Python Clean Hexagonal Layout**](file:///Users/igmrrf/Desktop/tmp/Agentic/python/README.md#standard-project-layout): Domain entities, application service orchestrators, and typed ports/adapters.
- [**Lua Modular Architecture**](file:///Users/igmrrf/Desktop/tmp/Agentic/lua/README.md#standard-project-layout): Local module encapsulation, EmmyLua annotations, and Busted test structure.
- [**Swift Modular Framework Layout**](file:///Users/igmrrf/Desktop/tmp/Agentic/swift/README.md#standard-project-layout): Pure domain value types, actor isolation, protocol port boundaries, and SPM modularization.
- [**Kotlin Hexagonal Layout**](file:///Users/igmrrf/Desktop/tmp/Agentic/kotlin/README.md#standard-project-layout): Domain models (`value class`), Coroutine-based use cases, and Gradle K2 compiler configuration.
