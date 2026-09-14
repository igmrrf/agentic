# Swift Standards & Architecture Blueprint (Swift 6.0+)

This directory contains the engineering standards, configuration templates, and architectural patterns for all Swift packages and applications within this repository, targeting **Swift 6.0+**.

## Table of Contents

- [Core Principles](#core-principles)
- [Swift 6 Highlights](#swift-6-highlights)
- [Standard Project Layout](#standard-project-layout)
- [Toolchain & Linter Configuration](#toolchain--linter-configuration)
- [Verification Checklist](#verification-checklist)

---

## Core Principles

1. **Compile-Time Data-Race Safety:** Swift 6 strict concurrency mode with zero data races. All mutable state shared across threads must be actor-isolated or explicitly protected.
2. **Zero Force Unwraps:** Absolute ban on `!` and `try!` in production code paths. Handle all optionals through `guard let`, `if let`, or typed errors.
3. **Value Semantics First:** Prefer `struct` and `enum` with immutable `let` properties. Restrict `class` to reference identity or UI framework requirements.
4. **Happy Path to the Left:** Guard clauses at the top of functions; unindented main execution paths.

---

## Swift 6 Highlights

- **Complete Concurrency Checking:** Data races prevented at compile time via `Sendable` validation and actor boundaries.
- **Modern Observation (`@Observable`):** The Observation macro replaces legacy `ObservableObject` and `@Published` with fine-grained tracking and zero boilerplate.
- **Typed Throws:** Explicit error types in function signatures (`throws(AccountError)`) for exhaustive, type-safe error handling.
- **Swift Package Manager Standard:** Declarative dependency and module definitions with `swiftLanguageModes: [.v6]`.

---

## Standard Project Layout

Hexagonal / modular architecture for Swift services and frameworks:

```
SwiftService/
├── Package.swift                # Swift 6 package manifest with strict concurrency
├── .swiftlint.yml               # Strict SwiftLint rules & size caps
├── .swiftformat                 # Automated code formatting options
├── README.md
├── Sources/
│   └── SwiftService/
│       ├── Domain/              # Pure domain entities, value objects & protocols
│       │   ├── Account.swift    # Sendable immutable structs
│       │   ├── AccountId.swift  # Type-safe newtype wrapper
│       │   └── Errors.swift     # Domain error enums
│       ├── Application/         # Business use cases & orchestration
│       │   ├── TransferService.swift
│       │   └── Ports.swift      # Protocol boundaries (AccountRepository)
│       └── Infrastructure/      # Concrete implementations of ports
│           ├── Database/
│           │   └── PostgresAccountRepository.swift
│           └── Web/
│               └── HTTPHandlers.swift
└── Tests/
    └── SwiftServiceTests/
        ├── AccountTests.swift
        └── TransferServiceTests.swift
```

---

## Toolchain & Linter Configuration

The configurations in this directory enforce quality across Xcode, VS Code, and CI:
- [`.swiftlint.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/swift/.swiftlint.yml): Strict lint rules with zero-warning threshold, banning force unwraps and enforcing size caps (50 lines/fn, 150 lines/type).
- [`.swiftformat`](file:///Users/igmrrf/Desktop/tmp/Agentic/swift/.swiftformat): Automated formatter configuration (4-space indent, 100-character line width).
- [`Package.swift`](file:///Users/igmrrf/Desktop/tmp/Agentic/swift/Package.swift): Package manifest enforcing Swift 6 language mode and warnings-as-errors.

---

## Verification Checklist

Every pull request and CI pipeline must execute and pass:

```bash
# 1. Format check
swift-format lint --recursive Sources Tests

# 2. Strict linter audit (zero warnings permitted)
swiftlint --strict

# 3. Test suite with strict concurrency validation
swift test --enable-code-coverage
```
