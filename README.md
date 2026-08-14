# Agentic Engineering Standards

Authoritative engineering standards, coding rules, architectural blueprints, and toolchain configurations for multi-language development across Rust, Go, and TypeScript.

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

# Safe adoption on an existing project (preview with dry-run and backup protection):
./scripts/init.sh --target=/path/to/existing-repo --dry-run
./scripts/init.sh --target=/path/to/existing-repo --backup --force

# Multi-language / monorepo setup:
./scripts/init.sh --lang=all --target=.
```

### Remote Initialization via cURL

```bash
curl -fsSL https://raw.githubusercontent.com/igmrrf/Agentic/main/scripts/init.sh | bash -s -- --lang=rust --target=.
```

---

## Language Standards

| Language | Target Version | Standards & Rules | Blueprint & Overview | Toolchain / Configs | CI Workflow |
|---|---|---|---|---|---|
| **Rust** | Rust 2024 (1.85.0+) | [`rust/CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/CODING.md) | [`rust/README.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/README.md) | [`rustfmt.toml`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/rustfmt.toml), [`clippy.toml`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/clippy.toml), [`Cargo.toml`](file:///Users/igmrrf/Desktop/tmp/Agentic/rust/Cargo.toml) | [`rust-ci.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/templates/ci/rust-ci.yml) |
| **Go** | Go 1.26 | [`go/CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/go/CODING.md) | [`go/README.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/go/README.md) | [`.golangci.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/go/.golangci.yml) | [`go-ci.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/templates/ci/go-ci.yml) |
| **TypeScript** | TypeScript 7.0 | [`typescript/CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/CODING.md) | [`typescript/README.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/README.md) | [`biome.json`](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/biome.json), [`tsconfig.json`](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/tsconfig.json) | [`typescript-ci.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/templates/ci/typescript-ci.yml) |

---

## Universal Foundations

- **Root Rules:** [`CODING.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/CODING.md) defines universal craft standards across all stacks (no explanatory comments, no backwards-compatibility `if`-branch shims, strict size caps, zero-swallowed errors, parity-first refactoring).
- **Architecture Review:** [`standards_review.md`](file:///Users/igmrrf/Desktop/tmp/Agentic/standards_review.md) contains the review summary, verified research findings, and version matrix.
- **Scaffolding Tool:** [`scripts/init.sh`](file:///Users/igmrrf/Desktop/tmp/Agentic/scripts/init.sh) provides automated project configuration.
