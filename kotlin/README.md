# Kotlin Standards & Architecture Blueprint (Kotlin 2.0+)

This directory contains the engineering standards, configuration templates, and architectural blueprints for all Kotlin services and applications within this repository, targeting **Kotlin 2.0+** (with the K2 compiler).

## Table of Contents

- [Core Principles](#core-principles)
- [Kotlin 2.0+ Highlights](#kotlin-20-highlights)
- [Standard Project Layout](#standard-project-layout)
- [Toolchain & Linter Configuration](#toolchain--linter-configuration)
- [Verification Checklist](#verification-checklist)

---

## Core Principles

1. **Zero Force Unwraps:** Absolute ban on `!!`. Enforce null safety through the type system, Elvis operator (`?:`), smart casts, and domain exceptions.
2. **Immutable Domain Core:** All domain models use `val` and read-only collections. State transitions produce new immutable values.
3. **Structured Concurrency:** Coroutines must run within an explicit, managed `CoroutineScope`. Zero unmanaged `GlobalScope` usage.
4. **Happy Path to the Left:** Guard clauses at method entry; unindented main execution logic.

---

## Kotlin 2.0+ Highlights

- **K2 Compiler:** Drastically faster compilation, enhanced smart casting across closures, and unified compiler frontend.
- **Sealed Hierarchies for Modeling:** Model all states and errors with `sealed interface` for compiler-verified exhaustive `when` matching.
- **Value Classes (`@JvmInline value class`):** Zero-overhead type safety for domain primitives (e.g. `AccountId`, `Money`).
- **Strict Coroutine Discipline:** Injected dispatchers, cooperative cancellation checks, and non-blocking suspend functions.

---

## Standard Project Layout

Standard hexagonal layout for Kotlin backend services and microservices:

```
kotlin-service/
├── build.gradle.kts             # Gradle build script with K2 compiler & Detekt/Ktlint
├── detekt.yml                   # Detekt static analysis rules & thresholds
├── .editorconfig                # Ktlint formatting standards
├── README.md
└── src/
    ├── main/
    │   └── kotlin/com/agentic/service/
    │       ├── Application.kt   # Bootstrap entrypoint & dependency injection
    │       ├── domain/          # Pure domain models & value classes
    │       │   ├── Account.kt   # Immutable data class
    │       │   ├── AccountId.kt # @JvmInline value class
    │       │   └── Errors.kt    # sealed interface DomainError
    │       ├── service/         # Application use cases & ports
    │       │   ├── TransferService.kt
    │       │   └── Ports.kt     # interface AccountRepository
    │       └── adapter/         # Concrete I/O adapters
    │           ├── database/
    │           │   └── PostgresAccountRepository.kt
    │           └── http/
    │               └── AccountController.kt
    └── test/
        └── kotlin/com/agentic/service/
            ├── domain/
            │   └── AccountTest.kt
            └── service/
                └── TransferServiceTest.kt
```

---

## Toolchain & Linter Configuration

The configurations in this directory enforce rigorous quality standards:
- [`detekt.yml`](file:///Users/igmrrf/Desktop/tmp/Agentic/kotlin/detekt.yml): Strict static analysis banning `!!`, `GlobalScope`, `Thread.sleep` in coroutines, and enforcing size caps (50 lines/fn, 150 lines/class, max 3 parameters).
- [`.editorconfig`](file:///Users/igmrrf/Desktop/tmp/Agentic/kotlin/.editorconfig): Official Ktlint formatting rules (4-space indent, 100-character line width).
- [`build.gradle.kts`](file:///Users/igmrrf/Desktop/tmp/Agentic/kotlin/build.gradle.kts): Gradle build script with `allWarningsAsErrors = true` and `-Xjsr305=strict`.

---

## Verification Checklist

Every pull request and CI pipeline must execute and pass:

```bash
# 1. Format and style verification
./gradlew ktlintCheck

# 2. Comprehensive static analysis (zero warnings permitted)
./gradlew detekt

# 3. Unit, integration, and coroutine test suite
./gradlew test
```
