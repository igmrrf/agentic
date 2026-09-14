# Swift Coding Rules & Standards (Swift 6.0+)

- **No explanatory comments.** Write code that reads on its own.
- **Target Swift 6 with Complete Concurrency Safety.** Data-race safety is enforced at compile time.
- **Zero force-unwraps in production.** Never use `!` on optionals or `try!`. Safely unwrap via `guard let`, `if let`, or throw typed errors.
- **Value types by default.** Use `struct` and `enum` with immutable `let` properties. Restrict `class` to reference identity, `actor` for isolated state, or UI frameworks where required.

---

## 1. Formatting & Toolchain

- **`swift-format` or `swiftlint` is the single authority.** Code must be formatted automatically. Never manually format code.
- **SwiftLint Gate:** CI runs `swiftlint --strict` with zero allowed warnings or errors.
- **Compiler Flags:** Enable complete concurrency checking (`-strict-concurrency=complete` / `swiftLanguageModes: [.v6]`) and `-warnings-as-errors`.
- **Lint as a Ratchet:** Zero new linter warnings allowed on any modified file. Clean code at every commit.

---

## 2. Concurrency & Swift 6 Data-Race Safety

- **Structured Concurrency:** Use `async`/`await`, `withTaskGroup`, and `Task` with explicit lifecycle tracking. Never launch detached tasks (`Task.detached`) without documented cancellation justification.
- **Actors for Shared Mutable State:** Protect shared mutable state using `actor` or `@MainActor` for UI-bound state rather than raw locks (`NSLock`, `os_unfair_lock`).
- **Sendable Conformance:** All types crossing concurrency boundaries must be `@Sendable` closures or conform to `Sendable`.
- **Modern Observation:** In SwiftUI/UI applications, use the `@Observable` macro (Observation framework). Do not use legacy `ObservableObject` or `@Published` in new code.

---

## 3. Naming & Ergonomics

Follow the official **Swift API Design Guidelines**:
- **Clarity at the Point of Use:** Names should read fluently as English phrases at the call site (`account.transfer(amount, to: recipient)`).
- **Casing:**
  - `lowerCamelCase`: functions, methods, properties, variables, enum cases.
  - `UpperCamelCase`: types, protocols, structs, classes, actors, enums.
  - `SCREAMING_SNAKE_CASE` is discouraged; use `lowerCamelCase` static constants within a type namespace.
- **No Single-Letter Names Anywhere:** Parameters, loop variables, catch blocks, and generic constraints must be descriptive (`element` not `e`, `error` not `err`, `TElement` not `T`).
- **Predicate Booleans:** `isActive`, `hasPermission`, `canProceed`, `shouldRetry`. Avoid bare nouns (`active`) or inverted negatives (`isNotReady`).
- **No Type Noise in Names:** `users` not `userArray`, `accounts` not `accountDictionary`.
- **Protocols Describing Capabilities:** Named with `-able`, `-ible`, or `-ing` suffixes (`Sendable`, `Validatable`, `Formatting`). Protocols describing what a thing is are nouns (`AccountRepository`).

---

## 4. Control Flow & Unwrapping

- **Happy Path to the Left:** Use `guard` statements for early validation, preconditions, and unwrapping. Keep the main success path unindented:
  ```swift
  guard let account = repository.findAccount(id: accountId) else {
      throw AccountError.notFound(id: accountId)
  }
  guard account.isActive else {
      throw AccountError.suspended(id: accountId)
  }
  return account
  ```
- **Zero Force Unwraps:** `!` on optionals, implicitly unwrapped optionals (`var x: String!`), and `try!` are strictly forbidden in production code.
- **Iteration Rules:**
  - MUST use `for item in items` loops for side effects or operations that return no data.
  - ONLY use `.map` when producing and returning a new transformed array or collection.
- **Maximum Nesting Depth:** 3 levels. Functions exceeding this must be refactored into focused helpers.
- **Parameter Limit:** Maximum 3 positional parameters. Beyond 3, pass a typed options struct or configuration object.
- **No Boolean Behavior Flags:** Avoid `processOrder(order, notify: true)`. Provide separate named methods or an explicit options enum.

---

## 5. Size Caps

Soft caps enforced via CI size validation:

| Unit | Cap |
|---|---|
| File | 400 lines |
| Type / Struct / Class / Actor Body | 150 lines |
| Function / Method | 50 lines |

Crossing a cap requires decomposing the type into extensions or smaller domain components.

---

## 6. Types, Modeling & Error Handling

- **Make Invalid States Unrepresentable:** Use `enum` with associated values to model finite state machines instead of structs with multiple optional fields:
  ```swift
  enum PaymentStatus: Sendable {
      case pending
      case processing(transactionId: String)
      case completed(timestamp: Date)
      case failed(reason: String)
  }
  ```
- **Typed Error Handling:** Define domain errors conforming to `Error` and `Sendable`. Throw and catch explicit domain errors:
  ```swift
  enum TransferError: Error, Sendable {
      case insufficientFunds(availableMinor: Int64, requiredMinor: Int64)
      case accountNotFound(accountId: String)
  }
  ```
- **Never Swallow Errors in `catch` Blocks:** Always handle, log with context, or convert into typed failure results.

---

## 7. Folder & File Architecture

Organize Swift services, frameworks, and apps into domain-focused directories:

```
Sources/
└── AccountFeature/
    ├── Domain/                  # Pure domain entities, value objects & protocols
    │   ├── Account.swift
    │   ├── AccountId.swift
    │   └── Errors.swift
    ├── Application/             # Use cases & business services
    │   ├── AccountService.swift
    │   └── Ports.swift          # Protocol boundaries (AccountRepository)
    └── Infrastructure/          # Concrete adapters (Postgres, HTTP, Apple frameworks)
        ├── Database/
        │   └── PostgresAccountRepository.swift
        └── Web/
            └── AccountEndpoints.swift
```

---

## 8. Verification Commands

Before opening a PR or marking work complete, all checks must pass cleanly:

```bash
# 1. Format check
swift-format lint --recursive Sources Tests

# 2. Strict linter audit (zero warnings permitted)
swiftlint --strict

# 3. Test suite with strict concurrency
swift test --enable-code-coverage
```
