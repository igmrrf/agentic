# TypeScript Coding Rules & Standards

Applies to **every** TypeScript project — library, CLI, backend service, worker, or UI application — on any runtime (Node, Deno, Bun, browser, edge). Rules that only apply to a specific project shape carry a scope tag; UI-framework rules live in [Appendix A](#appendix-a-ui-component-frameworks) and apply only when that framework is in use.

Read [`../CODING.md`](../CODING.md) first — it is the universal baseline. This document adds TypeScript specifics and never relaxes it.

- **No explanatory comments.** Write code that reads on its own.
- **No backwards-compatibility logic.** Schema migrations and API versioning handle compatibility, not runtime `if`-branches.
- **Strict compilation with zero `any`.** All types must be strictly modeled and narrowed; zero `any` in production paths.
- **Baseline:** TypeScript 5.5+. Rules are written to hold across the 5.x and 7.x lines; version-gated options are marked as such.

---

## 1. Formatting & Toolchain

- **Exactly one formatter/linter authority, configured repository-wide.** Never hand-format, never manually sort imports, never disable a rule inline without a written reason. Default choice for a new project: **Biome**. An existing project on ESLint + Prettier (or dprint, or oxlint) keeps it — the requirement is one tool, one config, enforced in CI.
- **Pin the tool's config schema to the version CI installs.** The shipped [`biome.json`](biome.json) targets **Biome 2.x**; a Biome 1.x config is rejected outright by a 2.x binary (`biome migrate` converts it — `organizeImports` moved under `assist`, `rules.recommended` became `rules.preset`). Rules taken from Biome's `nursery` group are unstable across releases: enable them deliberately and pin the Biome version if you do.
- **Style settings are a project decision, made once.** Defaults: 2-space indent, single quotes in code, double quotes in JSX, trailing commas, semicolons. Whatever is chosen is encoded in the config file, never argued per PR.
- **The type checker is a hard CI gate:** `tsc --noEmit` (or the runtime's equivalent) must exit clean. Type errors are never merged, never suppressed with `@ts-ignore`.
- **`@ts-expect-error` over `@ts-ignore`, always with a reason.** `@ts-expect-error` fails once the underlying problem is fixed, so the suppression cannot outlive its cause. Bare `@ts-ignore` is forbidden.
- **Lint is a ratchet:** 0 errors repo-wide. Warnings on untouched legacy files may persist; any modified file must be clean of both.

### Required compiler options (all projects)

```jsonc
{
  "strict": true,                        // implies noImplicitAny, strictNullChecks, and the rest
  "noUncheckedIndexedAccess": true,      // array/record access yields `T | undefined`
  "exactOptionalPropertyTypes": true,    // `?:` means absent, not `| undefined`
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true,
  "noImplicitReturns": true,
  "verbatimModuleSyntax": true,          // forces explicit `import type`
  "isolatedModules": true,               // single-file transpilation safety
  "skipLibCheck": true
}
```

### Conditionally required options

| Option | Required when | Why it is not universal |
|---|---|---|
| `isolatedDeclarations` | `[lib]` — the project publishes `.d.ts` files | Demands an explicit return type on every export; high-churn and low-value for a leaf application |
| `erasableSyntaxOnly` | The project is executed by a type-stripping runtime (Node `--experimental-strip-types`, Deno, Bun) or bundled without a TS-aware emit step | Forbids `enum`, `namespace`, and constructor parameter properties — incompatible with decorator-based frameworks (NestJS, TypeORM) that legitimately depend on emitted runtime constructs |
| `experimentalDecorators` / `emitDecoratorMetadata` | The framework in use requires them | Mutually exclusive with `erasableSyntaxOnly`; a project picks one world and states which |

Whichever set applies, it is enabled repo-wide from day one. Turning a strict option **off** later to unblock a change is forbidden; fix the code.

---

## 2. Naming & Identifiers

Names are the specification. Accurate naming eliminates the need for inline comments.

- **Casing rules:**
  - `camelCase`: variables, functions, methods, object properties.
  - `PascalCase`: types, interfaces, classes, enums, const-object "enum" containers, and components.
  - `SCREAMING_SNAKE_CASE`: module-level constants.
  - **File and directory names use one convention repo-wide.** Default: `kebab-case`. A project whose ecosystem expects otherwise (e.g. `PascalCase.tsx` component files) picks that instead and applies it without exception.
- **No single-letter names.** Variables, parameters, callback parameters, loop variables, `catch` bindings, and generic type parameters must be descriptive (`item` not `i`, `error` not `e`, `TItem` not `T`).
  - **Only permitted exceptions:** none. TypeScript has no idiom that requires a single-letter identifier.
  - Generic parameters are `PascalCase` with a `T` prefix (`TItem`, `TError`, `TResponse`) so they never collide visually with concrete types.
- **Predicate booleans:** `isActive`, `hasPermission`, `canProceed`, `shouldRetry`. Never bare nouns (`active`) or double negatives (`isNotDisabled`).
- **Functions are verbs:** `buildTransferRequest`, `resolveVariant`, `fetchAccountDetails`. A noun-named function must be a value or a getter.
- **No type noise in names:** `userList` not `userArray`, `UserProfile` not `IUserProfile` or `UserProfileInterface`.
- **One concept, one word repo-wide:** choose `beneficiary` or `recipient`, `sender` or `originator`, and remain consistent across every file.

---

## 3. Modules & Syntax

- **ECMAScript modules only.** No `namespace`, no `/// <reference>`, no CommonJS `require` in new code. Interop with a CJS dependency happens at a single wrapper module, not scattered across the codebase.
- **Explicit `import type`:** always use `import type { ... }` / `export type { ... }` for type-only bindings. `verbatimModuleSyntax` makes the distinction load-bearing: an unmarked type import becomes a real runtime import and can drag a module — or a side effect — into the bundle.
- **No default exports** except where a framework's file convention demands them (route files, config files). Named exports are refactor-safe, greppable, and auto-importable.
- **No barrel file over a hot path.** A re-export `index.ts` is acceptable as a deliberate public boundary for a module; it is not acceptable as a convenience aggregator, where it defeats tree-shaking and creates import cycles.
- **Prefer erasable constructs.** Even where `erasableSyntaxOnly` is not enabled, prefer syntax that carries no runtime cost:

  ```typescript
  // Preferred: a const object plus a derived union — erasable, tree-shakeable, and
  // assignable from plain string literals.
  export const PaymentStatus = {
    Pending: 'pending',
    Completed: 'completed',
    Failed: 'failed',
  } as const;

  export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
  ```

  `enum` remains available to projects that have deliberately opted into a decorator/metadata framework; if used, prefer `const enum`-free, string-valued enums for stable serialization.
- **Avoid constructor parameter properties** unless a dependency-injection framework requires them. Declare class fields explicitly.

---

## 4. Functions & Control Flow

- **Single responsibility:** one task per function. A function that fetches, parses, mutates, and renders is four functions.
- **Guard clauses and early returns:** handle errors and base cases first; keep the happy path unindented.
- **Maximum nesting depth:** 3 levels.
- **Parameter limit:** maximum 3 positional parameters. For 4+, accept a single typed options object.
- **No boolean behavior switches:** do not write `fetchUser(userId, true)`. Use two named functions or a typed options object: `fetchUser(userId, { includeTransactions: true })`.
- **Return early, return typed.** Never signal failure by returning `undefined`, `null`, `-1`, or an empty array where the caller cannot distinguish it from a legitimate empty result.

---

## 5. Iteration & Collections

- **`for...of` for side effects.** When iterating to *do* something rather than to *produce* something — logging, network calls, mutation, DOM work — use `for...of`. It supports `await`, `break`, and `continue`; array callbacks do not.

  ```typescript
  // CORRECT: sequential side effects
  for (const recipient of paymentRecipients) {
    await sendNotification(recipient);
  }

  // INCORRECT: forEach cannot await — this fires and forgets, and errors are unhandled
  paymentRecipients.forEach(sendNotification);
  ```

- **`.map()` strictly for transformation.** Use it only when the result is consumed. A `.map()` whose return value is discarded is a `for...of` written wrong.

  ```typescript
  const formattedAmounts = transactions.map((transaction) => ({
    transactionId: transaction.id,
    displayAmount: formatCurrency(transaction.amountMinor),
  }));
  ```

- **Concurrency is explicit.** A `for...of` with `await` is sequential *by choice*. When operations are independent, say so: `await Promise.all(...)` for all-or-nothing, `Promise.allSettled(...)` when partial failure is tolerable — with a bounded concurrency limit for large collections.
- **Prefer `Map` and `Set` over object-as-dictionary** for dynamic keys: no prototype-pollution surface, real key types, and an honest `size`.
- **`noUncheckedIndexedAccess` is not an obstacle.** Handle the `undefined` that indexing genuinely returns; do not silence it with `!`.

---

## 6. Size Caps

Soft caps enforced via CI checks (see §0 of the universal standards on tunable thresholds):

| Unit | Cap |
|---|---|
| File | 400 lines |
| Class / component body | 150 lines |
| Function | 60 lines |

---

## 7. Types, Schemas & Data Modeling

- **Validate at the boundary with a runtime schema, and derive the static type from it.** Every untrusted input — request bodies, query params, `localStorage`, config files, environment variables, third-party API responses — is parsed into a typed value before it reaches interior code. Use one validator repo-wide; **Zod** is the default choice, with Valibot, ArkType, TypeBox, or a JSON-Schema validator as equally acceptable alternatives.

  ```typescript
  export const AccountPayloadSchema = z.object({
    accountId: z.uuid(),
    balanceMinor: z.number().int().nonnegative(),
    currency: z.enum(['USD', 'EUR', 'GBP']),
  });

  export type AccountPayload = z.infer<typeof AccountPayloadSchema>;
  ```

  A single source of truth is the point; hand-writing an interface that mirrors a schema guarantees drift.
- **No `any` in production code.** Use `unknown` at the boundary and narrow with a type guard or a schema parse. `any` in a test fixture or a third-party shim is tolerated only behind an explicit, commented `@ts-expect-error` or a local type declaration.
- **No unchecked assertions.** `as` and `!` bypass the checker. Permitted only where the invariant is genuinely outside the type system's reach (a `const` assertion, a branded-type constructor after validation) — never to silence an error.
- **Discriminated unions over optional soup.** Model states that cannot coexist as separate variants:

  ```typescript
  export type AsyncResult<TData, TError = Error> =
    | { readonly status: 'idle' }
    | { readonly status: 'pending' }
    | { readonly status: 'success'; readonly data: TData }
    | { readonly status: 'error'; readonly error: TError };
  ```

- **Exhaustive matching.** Switch over every variant of a domain union and assert exhaustiveness, so adding a variant becomes a compile error:

  ```typescript
  function assertUnreachable(value: never): never {
    throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
  }
  ```

- **Branded types for primitives** prevent transposing two `string` IDs. Declare the brand symbol once and reuse it through a named helper. An inline `string & { readonly __brand: unique symbol }` per alias does work — each occurrence produces a distinct `unique symbol` — but it repeats the incantation at every declaration and yields the unreadable *"two different types with this name exist"* diagnostic. The helper names the brand instead:

  ```typescript
  declare const brand: unique symbol;

  export type Brand<TValue, TName extends string> = TValue & { readonly [brand]: TName };

  export type AccountId = Brand<string, 'AccountId'>;
  export type UserId = Brand<string, 'UserId'>;
  ```

- **`readonly` by default** on interface properties, arrays (`readonly T[]`), and tuples. Mutability is opt-in and local.
- **`satisfies` over type annotation** when a literal must conform to a type without widening away its precise inferred shape.
- **Explicit return types on exported functions.** Mandatory under `isolatedDeclarations`, and good practice regardless: it pins the contract and stops an internal refactor from silently widening the public API.

---

## 8. Error Handling

- **Never swallow errors.** A `catch` block handles the error, enriches and rethrows it, or converts it into a typed failure value. An empty or log-only `catch` on a path that then continues as if nothing happened is a bug.
- **`catch` bindings are `unknown`.** Narrow before use — anything can be thrown in JavaScript:

  ```typescript
  catch (error: unknown) {
    if (error instanceof PaymentDeclinedError) { /* ... */ }
    throw new TransferFailedError('settling transfer', { cause: error });
  }
  ```

- **Preserve the chain with `cause`.** Wrap with `new Error(message, { cause: error })` rather than discarding the original or interpolating it into a string.
- **Typed errors, not string matching.** Branch on error classes, discriminant fields, or codes — never on `error.message` text.
- **Expected failures are values; unexpected failures are thrown.** Domain outcomes a caller must handle (validation failed, insufficient funds, not found) are returned as a typed result. Programmer errors and unrecoverable states throw.
- **No floating promises.** Every promise is awaited, returned, or explicitly routed to a handler. An unhandled rejection crashes Node by default.
- **Fail loud and early.** Check preconditions at entry boundaries.

---

## 9. Async & Concurrency

- **`async`/`await` over raw `.then()` chains.** Mixing the two hides control flow.
- **Cancellation is a parameter.** Any function performing I/O accepts an `AbortSignal` and forwards it to whatever it calls. Long-running work that cannot be cancelled cannot be shut down cleanly.
- **Every network call has a timeout.** A request without one waits forever.
- **Bound concurrency.** `Promise.all` over an unbounded array of user-supplied items is a self-inflicted load test. Chunk it or use a concurrency limiter.
- **Clean up what you start.** Timers, intervals, event listeners, subscriptions, watchers, and streams are released in the same scope that created them.
- **Never block the event loop.** Move CPU-heavy work to a worker thread or a separate process.

---

## 10. State & Data Access

- **Immutability by default.** Update with spreads, non-mutating array methods (`toSorted`, `toSpliced`, `with`, `filter`, `map`), or `structuredClone`. Never mutate a value owned by a caller.
- **Server/remote state is owned by one layer.** Fetching, caching, retry, and invalidation live behind a single module or client — never re-implemented ad hoc at call sites. `[app]`
- **Cache keys are constructed, never hand-written.** Whatever the caching layer, derive keys from one factory per domain so an invalidation and a read can never disagree:

  ```typescript
  export const accountKeys = {
    all: ['accounts'] as const,
    lists: () => [...accountKeys.all, 'list'] as const,
    detail: (accountId: AccountId) => [...accountKeys.all, 'detail', accountId] as const,
  };
  ```

- **Derive, don't duplicate.** If two pieces of state must stay in sync, store one and compute the other.

---

## 11. Configuration, Logging & Security

- **Validated configuration at startup.** Never read `process.env` / `import.meta.env` / `Deno.env` inline. Parse the entire environment through one schema module at boot and fail startup on invalid config.
- **No secrets in client bundles.** Anything reaching a browser or a shipped binary is public. Client-exposed variables must carry the bundler's explicit public prefix (`NEXT_PUBLIC_`, `VITE_`, `PUBLIC_`, or the equivalent for the tool in use); everything else stays server-side.
- **Structured logging.** Log key-value objects through one logger module, never `console.log` in production code. Levels follow the universal standard (§11 of [`../CODING.md`](../CODING.md)).
- **Never log secrets or PII** — tokens, passwords, full payment identifiers, personal data.
- **Parameterize and escape.** Parameterize every database query; never interpolate user input into SQL, shell commands, `eval`, or raw HTML. Sanitize anything rendered as markup.
- **Validate before trusting, on the server.** Client-side validation is a UX affordance, not a security control.

---

## 12. Project Layout

Pick the layout that matches the project shape. All four obey the universal dependency rule: the pure core never imports the impure edge.

**Library or CLI** — no feature slicing; the package *is* the domain.

```
src/
├── index.ts            # The public API surface, and the only barrel in the project
├── <domain>.ts         # Core logic, pure
├── <domain>/           # Split into a directory only once the file exceeds its cap
└── internal/           # Not exported from index.ts
tests/
```

**Backend service** — layered, dependencies pointing inward.

```
src/
├── main.ts             # Composition root: config, wiring, server start
├── domain/             # Entities, invariants, typed errors — zero I/O imports
├── application/        # Use cases; declares the interfaces it needs
├── infrastructure/     # Adapters implementing those interfaces (db, http clients, queues)
├── delivery/           # Transport: route handlers, DTO parsing, response envelopes
└── config/             # Validated environment schema
```

**UI application** — feature-driven vertical slices.

```
src/
├── app/ (or routes/)   # Thin routing shell; pages orchestrate, they do not implement
├── features/           # Self-contained domain slices
│   └── transfers/
│       ├── index.ts            # Public boundary of the feature
│       ├── components/
│       ├── api/                # Queries & mutations
│       ├── types/
│       └── utils/
├── components/ui/      # Domain-agnostic design-system primitives
├── hooks/              # Shared hooks, promoted only on a second real consumer
├── lib/                # Infrastructure singletons (api client, logger)
└── config/             # Validated environment
```

- **File suffix conventions** (whichever layout): `*.schema.ts` for validation schemas, `*.types.ts` for type-only modules, `*.test.ts` / `*.spec.ts` for tests, `use-*.ts` for hooks.
- **Colocation beats premature abstraction.** A helper lives inside the one feature that uses it and is promoted to a shared location only when a second genuine consumer appears.
- **No `utils/` junk drawer.** Name modules by responsibility: `format-currency.ts`, `date/`, `crypto/`.

---

## 13. Testing

- **One runner, configured repo-wide.** Vitest, Jest, `node:test`, `deno test`, or `bun test` — the choice follows the runtime, and there is only one.
- **Location follows the layout:** colocated `*.test.ts` next to the unit under test, or a `__tests__/` directory adjacent to it. Integration and end-to-end suites live in a top-level `tests/`.
- **Behavior-driven assertions.** Test what a caller or user observes — public exports and rendered output — not private internals.
- **Deterministic suites.** Fake timers for anything time-dependent, a seeded generator for anything random, and a mocked network boundary (MSW, an injected fetch, or a test double). No live network, no sleeps.
- **Type-level tests for public generics.** `[lib]` A library whose value is its types asserts them with `expectTypeOf` / `assertType`, not only at runtime.
- **CI gate:** 100% green before merge.

---

## 14. Verification Commands

Run before completing any task or opening a PR. Substitute the project's package manager (`npm` / `pnpm` / `yarn` / `bun` / `deno task`) — the checks, not the runner, are the standard.

```bash
# 1. Strict type checking
npx tsc --noEmit

# 2. Linter and formatter verification
npm run lint

# 3. Test suite
npm test

# 4. File and function size caps
npm run check:size

# 5. Dependency vulnerability audit
npm audit --audit-level=high
```

---

## Appendix A: UI Component Frameworks

Applies **only** to projects using a component framework (React, Preact, Solid, Vue, Svelte). Nothing here is required of a library, CLI, or backend service. Examples use React naming; translate to the framework in use.

- **Extract shared stateful logic on the second reuse.** Hook/composable logic reimplemented across two or more components moves into a standalone module (`use-<feature>.ts`) — colocated in the feature that owns it, promoted to a shared directory only when consumers span features.
- **Hook conventions:** prefixed `use`, pure during render, and every subscription, listener, timer, and observer torn down on unmount.
- **Separate orchestration from presentation.** Container components fetch and route state; presentational components take props and render. A component doing both is at its size cap for a reason.
- **Component body cap: 150 lines** (§6).
- **Server state belongs to a data-fetching layer** — TanStack Query, SWR, RTK Query, or the framework's own loader. No ad-hoc `useEffect` + `useState` fetching, which reimplements caching, deduplication, retries, and race-condition handling badly.
- **Keys are stable and meaningful.** Never index-as-key on a reorderable or filterable list.
- **Effects are for synchronizing with external systems**, not for deriving values. Anything computable during render is computed during render.
- **Accessibility is not optional:** semantic elements, labelled controls, keyboard-reachable interactions, and visible focus.
