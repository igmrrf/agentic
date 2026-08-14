# Go Coding Rules & Standards (Go 1.26)

- **No explanatory comments.** Write code that reads on its own.
- **No backwards-compatibility shims.** Database migrations, schema versioning, and API routing handle compatibility—not runtime `if`-branches.
- **Errors are values; never ignore them.** Check every returned error immediately. Swallowing errors with `_ = fn()` is forbidden.
- **Leverage Go 1.26 idioms:** Use `new(expr)` pointer initialization, `range-over-func` (`iter.Seq`, `iter.Seq2`), `testing/synctest`, `log/slog`, and `errors.Join`.

---

## 1. Formatting & Toolchain

- **`gofmt` and `goimports` are the single authority.** Code must be formatted with standard tabs. Never hand-format or hand-sort imports.
- **Unified Linter Gate:** `golangci-lint` is mandatory. CI runs `golangci-lint run ./...` with zero allowed errors.
- **Mandatory Enabled Linters:**
  - `govet`, `errcheck`, `staticcheck`, `revive`, `gocritic`, `exhaustive`, `prealloc`, `noctx`, `gosec`, `bodyclose`, `rowserrcheck`.
- **Lint as a Ratchet:** Zero new linter warnings allowed on any modified file. Clean code at every commit.
- **Vulnerability Checks:** `govulncheck ./...` runs in CI on every push to detect known dependency CVEs.
- **Modernized `go fix`:** Use Go 1.26 modernized `go fix` to upgrade legacy idioms to modern language standards.

---

## 2. Naming & Package Conventions

- **Package Names:**
  - Single, lowercase word only (e.g. `account`, `postgres`, `auth`, `http`).
  - No underscores, no hyphens, and no `mixedCaps` in package names.
  - Avoid generic/stuttering names: avoid `util`, `common`, `helpers`, `models`. Name packages by domain responsibility.
- **Identifiers & Scope:**
  - `camelCase` for unexported identifiers, `PascalCase` for exported identifiers.
  - No single-letter names in multi-line scopes. `ctx` for `context.Context` and `t` for `*testing.T` are standard idioms. For domain variables, use `account`, `invoice`, `customer`, `index` instead of `a`, `i`, `c`.
- **Avoid Stuttering:**
  - Do not repeat package name in type names: inside package `account`, use `Entity` or `Service`, not `AccountEntity` or `AccountService` (which becomes `account.AccountService` at call sites).
- **Interface Naming:**
  - Single-method interfaces are named by method name plus `-er` suffix: `Reader`, `Writer`, `Validator`, `Closer`.
  - Multi-method interfaces describe a concrete domain role: `PaymentGateway`, `AccountRepository`.
- **Constructor Functions:**
  - Return concrete structs and accept interfaces: `NewClient(config Config) (*Client, error)` or `New(...)`.
- **Direct Pointer Initialization (Go 1.26):** Use `new(expression)` (e.g. `new(42)`, `new("active")`) for concise pointer initialization without temporary variables.
- **Predicates:** Functions returning `bool` start with a predicate verb: `IsValid()`, `HasPermission()`, `CanRetry()`.

---

## 3. Comments & Documentation

- **No explanatory comments in function bodies.** Code must be clear and self-documenting.
- **Exported Item Comments:** Every exported package, struct, interface, function, and constant must begin with a doc comment that starts with the item's name:
  ```go
  // FetchAccount retrieves an account by ID from the persistent store.
  // It returns ErrAccountNotFound if no account matches the given ID.
  func (service *Service) FetchAccount(ctx context.Context, accountID string) (*Account, error) {
  ```
- **No commented-out code.** Delete dead code immediately.
- **No changelog/ticket comments.** Use Git metadata and commit history.

---

## 4. Control Flow & Iteration

- **Happy Path to the Left:** Align the main success path with the left margin. Use guard clauses and early returns for errors and boundary conditions:
  ```go
  user, err := repo.FindUser(ctx, userID)
  if err != nil {
      return nil, fmt.Errorf("finding user %s: %w", userID, err)
  }

  if !user.IsActive {
      return nil, ErrUserSuspended
  }

  return user, nil
  ```
- **Standard Iterators (`iter.Seq` / `iter.Seq2`):** For custom collections, streams, or large data sets, use Go standard iterator functions (`iter.Seq[V]` or `iter.Seq2[K, V]`) with `range-over-func` rather than allocating intermediate slices.
- **Maximum Nesting Depth:** 3 levels. Deeper nesting requires extracting helper functions.
- **Function Parameter Limit:** Maximum 3 parameters. Beyond 3, use a typed parameters/options struct:
  ```go
  type CreateTransferParams struct {
      SourceAccountID      string
      DestinationAccountID string
      AmountMinor          int64
      IdempotencyKey       string
  }
  ```
- **No Boolean Behavior Flags:** Do not pass `doTransfer(source, dest, 100, true)`. Provide distinct methods (`TransferWithNotification`) or an explicit configuration option.

---

## 5. Size Caps

Soft caps enforced via CI size validation:

| Unit | Cap |
|---|---|
| File | 400 lines |
| Struct Method Set / Type file | 200 lines |
| Function | 50 lines |

Crossing a cap requires decomposing the package into smaller domain-focused subpackages or files.

---

## 6. Interfaces & Struct Design

- **Accept Interfaces, Return Structs:**
  - Functions and methods should accept interfaces to decouple from specific implementations.
  - Constructors and factories should return concrete pointer or value structs (`*Service`, `Client`).
- **Consumer-Driven Interfaces:**
  - Define interfaces in the package where they are *consumed*, not where they are implemented.
  - Keep interfaces small (1 to 3 methods). Large interfaces make testing and mocking painful.
- **Pointer vs. Value Receivers:**
  - Use pointer receivers (`func (s *Service)`) if the method mutates state, if the struct contains synchronization primitives (`sync.Mutex`), or if the struct is large.
  - Be consistent: do not mix pointer and value receivers across the method set of the same type.
- **Zero Values Must Be Useful:**
  - Design types such that the zero-value is safe and ready to use where practical (e.g. `bytes.Buffer`, `sync.Mutex`). If initialization is mandatory, enforce constructor creation.

---

## 7. Error Handling

- **Wrap Errors with `%w`:** Always add contextual information when bubbling errors up the call stack:
  ```go
  if err := db.Exec(ctx, query, accountID); err != nil {
      return fmt.Errorf("updating balance for account %s: %w", accountID, err)
  }
  ```
- **Join Multiple Errors:** Use `errors.Join(errA, errB)` when aggregating multiple validation or cleanup errors.
- **Sentinel Errors:** Declare standard errors using `errors.New` at the package level with the `Err` prefix:
  ```go
  var (
      ErrAccountNotFound  = errors.New("account not found")
      ErrInsufficientFunds = errors.New("insufficient funds")
  )
  ```
- **Error Inspection:** Use `errors.Is` and `errors.As`. Never compare error strings (`err.Error() == "..."`):
  ```go
  if errors.Is(err, ErrAccountNotFound) {
      // Handle not found
  }
  ```
- **Zero Panics in Services:** Never call `panic()` or `log.Fatal()` in library or application logic. Recover panics only at top-level HTTP/gRPC middleware boundaries.

---

## 8. Concurrency, Context & Goroutines

- **Context Propagation:**
  - Pass `ctx context.Context` as the **first parameter** to all functions performing I/O, database queries, network operations, or long-running computation.
  - Never store `context.Context` inside a struct field.
- **Goroutine Lifecycles & Leaks:**
  - Every goroutine MUST have a deterministic lifetime and explicit exit condition.
  - Never spawn unmanaged `go func() { ... }()`. Use `sync.WaitGroup`, `errgroup.Group`, or monitor `ctx.Done()`.
- **Channel Rules:**
  - Always close channels from the sender side, never from the receiver.
  - Use buffered channels with explicit, documented capacity limits or unbuffered channels for direct synchronization.
- **Mutex Hygiene:**
  - Immediately follow `mu.Lock()` with `defer mu.Unlock()`. Keep critical sections short.

---

## 9. Structured Logging & Telemetry

- **Use Standard `log/slog`:** All application logging must use structured key-value pairs via `log/slog`:
  ```go
  slog.InfoContext(ctx, "processed transfer",
      "account_id", accountID,
      "amount_minor", amountMinor,
      "status", "completed",
  )
  ```
- **No Sensitive Data in Logs:** Never log passwords, API secrets, full payment card numbers, or personally identifiable information (PII).
- **Log at Decision Point Once:** Do not log an error at every level of the call stack; return the wrapped error and log it once at the top-level handler.

---

## 10. API & Layered Architecture

- **Standard Go Directory Structure:**
  - `cmd/`: Binary entrypoints (`cmd/server/main.go`).
  - `internal/`: Private application and domain code (cannot be imported by external projects).
    - `internal/domain/`: Pure entities and business invariants.
    - `internal/service/`: Business use cases and application orchestration.
    - `internal/adapter/`: Database repositories, external clients, HTTP/gRPC handlers.
  - `pkg/`: Public library code intended for external consumption.
  - `api/`: OpenAPI specs, Protobuf definitions, JSON schemas.
- **HTTP Handlers:**
  - Parse request body/query -> validate schema -> invoke service -> return standardized JSON response envelope.

---

## 11. Testing Standards

- **Deterministic Concurrency Testing (`testing/synctest`):** Use the `testing/synctest` package in Go 1.26 to deterministically test concurrent code without sleeping or race flakes.
- **Table-Driven Tests:** Structure unit and integration tests using table-driven test cases with `t.Run()`:
  ```go
  func TestValidateAccountID(t *testing.T) {
      testCases := []struct {
          name        string
          input       string
          expectedErr error
      }{
          {
              name:        "valid uuid",
              input:       "123e4567-e89b-12d3-a456-426614174000",
              expectedErr: nil,
          },
          {
              name:        "empty string",
              input:       "",
              expectedErr: ErrInvalidAccountID,
          },
      }

      for _, tc := range testCases {
          t.Run(tc.name, func(t *testing.T) {
              t.Parallel()
              err := ValidateAccountID(tc.input)
              if !errors.Is(err, tc.expectedErr) {
                  t.Fatalf("expected error %v, got %v", tc.expectedErr, err)
              }
          })
      }
  }
  ```
- **Race Detection:** Always run tests with the `-race` flag enabled: `go test -race ./...`.
- **Deterministic Tests:** Injected clocks and mocked network/DB adapters. No flaky wall-clock sleeps (`time.Sleep`).

---

## 12. Verification Commands

Before opening a PR or claiming completion, execute and verify:

```bash
# 1. Format and imports check
gofmt -l -s .
goimports -l .

# 2. Comprehensive linting with zero warnings
golangci-lint run ./...

# 3. Race-detected tests and coverage
go test -race -cover ./...

# 4. Vet and vulnerability checks
go vet ./...
govulncheck ./...
```
