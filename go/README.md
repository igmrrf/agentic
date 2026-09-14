# Go Standards & Architecture Blueprint (Go 1.26)

This directory contains the engineering standards, project layout blueprints, and linter configurations for **every** Go project — library module, CLI, backend service, worker, or operator.

**Baseline: Go 1.26.** [`CODING.md`](CODING.md) marks its version-gated rules and states how to pin lower; everything else holds on any supported Go release.

## Table of Contents

- [Core Principles](#core-principles)
- [Go 1.26 Highlights](#go-126-highlights)
- [Standard Project Layout](#standard-project-layout)
- [Linter & Toolchain Configuration](#linter--toolchain-configuration)
- [Verification Checklist](#verification-checklist)

---

## Core Principles

1. **Simplicity & Explicit Flow:** The happy path stays unindented on the left. Handle errors at every step using explicit wrapping (`%w`).
2. **Context & Concurrency Safety:** Always pass `context.Context` as the first argument in I/O operations. Every spawned goroutine must have an explicit exit lifecycle.
3. **Consumer-Driven Interfaces:** Keep interfaces small (1-3 methods) and define them in the consuming package.
4. **Zero Swallowed Errors:** Never use `_ = fn()` or bare `panic()` in production code.

---

## Go 1.26 Highlights

- **`new(expr)` Direct Pointer Allocation:** Direct pointer initialization without temporary variables (e.g. `new(42)`).
- **Deterministic Concurrency Testing (`testing/synctest`):** Virtualized time bubbles for deterministic testing of concurrent code.
- **Standard Iterators (`iter.Seq`, `iter.Seq2`):** Native `range-over-func` enabling stream iteration without intermediate allocations.
- **Green Tea GC:** Ultra-low latency garbage collector enabled by default.
- **Structured Logging (`log/slog`):** Built-in key-value structured logging with context propagation.
- **Error Aggregation (`errors.Join`):** Native combining of multiple errors across validation and cleanup tasks.

---

## Standard Project Layout

This is the **backend service** layout (hexagonal ports & adapters). Library modules and CLIs use flatter shapes — see [`CODING.md` §10](CODING.md#10-folder--file-design-architecture) for all three.

```
go-service/
├── cmd/
│   └── server/
│       └── main.go          # Application bootstrap & dependency injection
├── internal/                # Private application packages (not importable externally)
│   ├── domain/              # Pure domain entities, value objects, and business errors
│   │   ├── account.go
│   │   └── errors.go
│   ├── service/             # Business use cases and orchestrators
│   │   ├── account_service.go
│   │   └── ports.go         # Interfaces consumed by the service
│   └── adapter/             # Concrete implementations of ports
│       ├── postgres/        # Database repository adapters
│       │   └── account_repo.go
│       └── http/            # HTTP handlers, routing, and middlewares
│           ├── handler.go
│           └── routes.go
├── pkg/                     # Public SDKs — only if third parties genuinely import them
├── api/                     # OpenAPI specs, Protocol Buffer definitions
├── .golangci.yml            # Complete golangci-lint configuration
├── go.mod
└── go.sum
```

---

## Linter & Toolchain Configuration

The [`.golangci.yml`](.golangci.yml) file in this directory configures `golangci-lint` with strict, production-tested linters:
- `govet`, `errcheck`, `staticcheck`, `revive`, `gocritic`, `exhaustive`, `prealloc`, `noctx`, `gosec`, `bodyclose`, `rowserrcheck`.

---

## Verification Checklist

Every pull request and continuous integration pipeline must pass:

```bash
# 1. Format and imports check
gofmt -l -s .
goimports -l .

# 2. Comprehensive linting with zero warnings
golangci-lint run ./...

# 3. Race-detected unit and integration tests
go test -race -cover ./...

# 4. Vet and vulnerability checks
go vet ./...
govulncheck ./...
```
