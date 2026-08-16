# Agentic Engineering Standards

Authoritative engineering standards, coding rules, architectural blueprints, and toolchain configurations for multi-language development across Rust, Go, TypeScript, Python, and Lua.

Every language guide is written to hold in **any** project of that language — library, CLI, service, or application — not for one framework. Framework- and runtime-specific guidance is always scoped explicitly (a tagged section or an appendix) so it can be ignored where it does not apply. Named tools are defaults for greenfield projects; the binding requirement is *one* formatter, *one* linter, *one* type checker, enforced in CI.

---

## Quickstart: Scaffolding a New Project

Use the built-in initializer script [`scripts/init.sh`](scripts/init.sh) to bootstrap standards, linter configs, CI workflows, and AI agent rules into any new or existing project.

> **Note:** The setup script directly embeds the coding standards into agent-based instruction files (`CLAUDE.md`, `GEMINI.md`, `.cursor/rules/coding.mdc`, `.clinerules`, `.windsurfrules`, and `.github/copilot-instructions.md`), instead of generating separate raw `CODING.md` files in the target directory. This ensures that LLM agents natively parse and adhere to the guidelines.

```bash
# Interactive setup (auto-detects project language in existing repositories):
./scripts/init.sh

# Target a specific language and project folder:
./scripts/init.sh --lang=rust --target=/path/to/my-service
./scripts/init.sh --lang=go --target=/path/to/my-service
./scripts/init.sh --lang=typescript --target=/path/to/my-service
./scripts/init.sh --lang=python --target=/path/to/my-service
./scripts/init.sh --lang=lua --target=/path/to/my-plugin

# Target a specific AI agent for rules:
./scripts/init.sh --gemini
./scripts/init.sh -a claude
./scripts/init.sh --cursor
./scripts/init.sh --cline
./scripts/init.sh --windsurf
./scripts/init.sh --copilot

# Target multiple AI agents simultaneously:
./scripts/init.sh --claude --gemini --cursor

# Safe adoption on an existing project (preview with dry-run and backup protection):
./scripts/init.sh --target=/path/to/existing-repo --dry-run
./scripts/init.sh --target=/path/to/existing-repo --backup --force

# Multi-language / monorepo setup:
./scripts/init.sh --lang=all --target=.
```

### Remote Initialization via cURL

```bash
curl -fsSL https://raw.githubusercontent.com/igmrrf/Agentic/refs/heads/main/scripts/init.sh | bash -s -- --lang=rust --target=.
```

---

## Language Standards

| Language | Baseline | Standards & Rules | Blueprint & Overview | Toolchain / Configs | CI Workflow |
|---|---|---|---|---|---|
| **Rust** | Rust 2024 (1.85.0+) | [`rust/CODING.md`](rust/CODING.md) | [`rust/README.md`](rust/README.md) | [`rustfmt.toml`](rust/rustfmt.toml), [`clippy.toml`](rust/clippy.toml), [`Cargo.toml`](rust/Cargo.toml) | [`rust-ci.yml`](templates/ci/rust-ci.yml) |
| **Go** | Go 1.26 | [`go/CODING.md`](go/CODING.md) | [`go/README.md`](go/README.md) | [`.golangci.yml`](go/.golangci.yml) | [`go-ci.yml`](templates/ci/go-ci.yml) |
| **TypeScript** | TypeScript 5.5+ | [`typescript/CODING.md`](typescript/CODING.md) | [`typescript/README.md`](typescript/README.md) | [`biome.json`](typescript/biome.json), [`tsconfig.json`](typescript/tsconfig.json) | [`typescript-ci.yml`](templates/ci/typescript-ci.yml) |
| **Python** | Python 3.11+ | [`python/CODING.md`](python/CODING.md) | — | — | — |
| **Lua** | 5.1 / LuaJIT / 5.4 (declared per project) | [`lua/CODING.md`](lua/CODING.md) | — | — | — |

**Baseline** is the version whose idioms the guide assumes, not a hard requirement. Each guide marks its version-gated rules and states how to pin lower.

---

## Universal Foundations

- **Root Rules:** [`CODING.md`](CODING.md) defines universal craft standards across all stacks (no explanatory comments, no backwards-compatibility `if`-branch shims, strict size caps, zero-swallowed errors, parity-first refactoring, folder/file design). Its §0 explains scope tags (`[service]`, `[app]`, `[lib]`), which rules are non-negotiable versus project-tunable, and how to adopt the standards into an existing repository.
- **Architecture Review:** [`standards_review.md`](standards_review.md) contains the review summary, verified research findings, version matrix, and architecture references.
- **Scaffolding Tool:** [`scripts/init.sh`](scripts/init.sh) provides automated project configuration.

---

## Folder & File Architecture Patterns

Each language guide offers several layouts and expects you to pick the one matching the project shape — a library does not inherit a service's layering.

| Project shape | Where the layout lives |
|---|---|
| **Library / SDK** | [Rust §10 Option A](rust/CODING.md#10-folder--file-design-architecture) · [Go §10 Option A](go/CODING.md#10-folder--file-design-architecture) · [TypeScript §12](typescript/CODING.md#12-project-layout) · [Python §10](python/CODING.md#10-project-layout) · [Lua §9](lua/CODING.md#9-project-layout) |
| **CLI** | [Rust §10 Option A](rust/CODING.md#10-folder--file-design-architecture) · [Go §10 Option B](go/CODING.md#10-folder--file-design-architecture) · [TypeScript §12](typescript/CODING.md#12-project-layout) |
| **Backend service** (hexagonal ports & adapters) | [Go §10 Option C](go/CODING.md#10-folder--file-design-architecture) · [Rust §10 Option B](rust/CODING.md#10-folder--file-design-architecture) · [TypeScript §12](typescript/CODING.md#12-project-layout) · [Python §10](python/CODING.md#10-project-layout) |
| **UI application** (feature-driven vertical slices) | [TypeScript §12](typescript/CODING.md#12-project-layout) + [Appendix A](typescript/CODING.md#appendix-a-ui-component-frameworks) |
| **Multi-crate monorepo** | [Rust §10 Option C](rust/CODING.md#10-folder--file-design-architecture) |

The universal rule behind all of them ([`CODING.md` §8](CODING.md#8-module-boundaries-layering--folder-architecture)): dependencies point inward, and the pure core never imports the impure edge.
