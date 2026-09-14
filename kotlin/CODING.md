# Kotlin Coding Rules & Standards (Kotlin 2.0+)

- **No explanatory comments.** Write code that reads on its own.
- **Target Kotlin 2.0+ (K2 Compiler).** Leverage modern compiler checks, fast type inference, and smart cast improvements.
- **Zero force-unwraps (`!!`) in production.** Use safe calls `?.`, the Elvis operator `?:`, or smart casting. Never use `!!`.
- **Immutability by default.** Use `val` for all variables and properties. Favor read-only collections (`List`, `Map`, `Set`) over mutable collections.

---

## 1. Formatting & Toolchain

- **`ktlint` or `detekt` is the single authority.** Code formatting and style must be automated.
- **Detekt Zero-Warning Gate:** Detekt runs in CI with `buildUponDefaultConfig = true` and `allRules = true`. Zero warnings or errors allowed.
- **Compiler Flags:** Enable `-Werror` (warnings as errors), `-Xjsr305=strict`, and explicit API mode for libraries where applicable.
- **Lint as a Ratchet:** Zero new linter warnings allowed on any modified file.

---

## 2. Null Safety & Modeling

- **Zero `!!` Operators:** Using `!!` is an instant CI gate failure. If a value cannot be null, guarantee it by structure or throw a descriptive domain exception:
  ```kotlin
  // CORRECT: Safe unwrap with domain error
  val account = accountRepository.findById(accountId)
      ?: throw AccountNotFoundException(accountId)
  ```
- **Sealed Interfaces for State & Results:** Model domain entities, state transitions, and results using `sealed interface` to enable exhaustive `when` expressions:
  ```kotlin
  sealed interface PaymentResult {
      data class Success(val transactionId: String, val timestamp: Instant) : PaymentResult
      data class InsufficientFunds(val availableMinor: Long, val requiredMinor: Long) : PaymentResult
      data class ProviderError(val cause: Throwable) : PaymentResult
  }
  ```
- **Exhaustive `when` Matching:** Never use an `else` branch on domain sealed hierarchies. Let the compiler verify that all variants are handled.
- **Value Classes (`@JvmInline value class`):** Wrap primitives to enforce type safety without allocation overhead:
  ```kotlin
  @JvmInline
  value class AccountId(val value: String)
  ```

---

## 3. Concurrency & Kotlin Coroutines

- **Structured Concurrency:** Coroutines must always be launched within a managed `CoroutineScope`. Never use `GlobalScope`.
- **Cooperative Cancellation:** Long-running CPU computations must check cancellation periodically via `ensureActive()` or `yield()`.
- **Context Preservation:** Inject dispatchers (`CoroutineDispatcher`) rather than hardcoding `Dispatchers.IO` or `Dispatchers.Default` inside use cases, ensuring unit tests can substitute `StandardTestDispatcher`.
- **Never Block Coroutine Threads:** Never call `Thread.sleep()` or blocking I/O within a suspend function without switching context (`withContext(Dispatchers.IO)`).

---

## 4. Control Flow & Iteration

- **Happy Path to the Left:** Use guard clauses with `return` or `throw` early:
  ```kotlin
  if (!account.isActive) {
      return Result.failure(AccountSuspendedException(account.id))
  }
  ```
- **Iteration Rules:**
  - MUST use `for (item in items)` loops for side effects or operations that return no data.
  - ONLY use `.map` when producing and returning a new transformed list or collection.
- **Maximum Nesting Depth:** 3 levels. Functions exceeding this must be refactored into focused private helper methods.
- **Parameter Limit:** Maximum 3 positional parameters. For 4 or more, create a typed data class parameter object.
- **No Boolean Behavior Flags:** Do not pass `fetchData(userId, true)`. Use distinct functions or an explicit options class.

---

## 5. Size Caps

Soft caps enforced via Detekt:

| Unit | Cap |
|---|---|
| File | 400 lines |
| Class / Interface / Object Body | 150 lines |
| Function / Method | 50 lines |

---

## 6. Naming & Package Conventions

- **Packages:** Lowercase single words or dots (`com.company.service.account`). No underscores or hyphens.
- **Classes, Interfaces, Objects:** `PascalCase`.
- **Functions, Methods, Properties, Variables:** `camelCase`.
- **Constants:** `SCREAMING_SNAKE_CASE` inside `companion object` or top-level.
- **No Single-Letter Names Anywhere:** (`index` not `i`, `error` not `e`, `record` not `r`).
- **Predicate Booleans:** `isActive`, `hasPermission`, `canProceed`, `shouldRetry`.

---

## 7. Folder & File Architecture

Organize Kotlin microservices using Hexagonal Ports & Adapters:

```
src/main/kotlin/com/service/
├── Application.kt               # Entrypoint & DI bootstrap
├── domain/                      # Pure domain models, value classes, and domain errors
│   ├── Account.kt
│   ├── AccountId.kt
│   └── AccountErrors.kt
├── service/                     # Application use cases & ports
│   ├── AccountService.kt
│   └── Ports.kt                 # interface AccountRepository
└── adapter/                     # Concrete I/O adapters
    ├── database/
    │   └── PostgresAccountRepository.kt
    └── http/
        ├── AccountRoutes.kt
        └── dto/
            └── AccountRequests.kt
```

---

## 8. Verification Commands

Before opening a PR or claiming completion, execute and verify:

```bash
# 1. Format and style verification
./gradlew ktlintCheck

# 2. Strict static analysis (zero warnings permitted)
./gradlew detekt

# 3. Unit, integration, and coroutine test suite
./gradlew test
```
