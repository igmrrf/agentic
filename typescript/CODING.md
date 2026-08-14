# TypeScript Coding Rules & Standards (TypeScript 7.0)

- **No explanatory comments.** Write code that reads on its own.
- **No backwards-compatibility logic.** Schema migrations and API versioning handle compatibility, not runtime `if`-branches.
- **Strict compilation with zero `any`.** All types must be strictly modeled and narrowed; zero `any` in production paths.
- **TypeScript 7.0 standards:** Native compiler optimizations, strict type-stripping (`erasableSyntaxOnly`), explicit module typing (`verbatimModuleSyntax`), and parallel declarations (`isolatedDeclarations`).

---

## 1. Formatting & Toolchain

- **Biome is the single authority.** Never hand-format or manually sort imports. Run `npm run lint` / `npm run lint:fix`.
- **Config:** 2-space indent, single quotes in code, double quotes in JSX/TSX, trailing commas everywhere.
- **TypeScript 7.0 compiler gate:** `npx tsc --noEmit` is a hard CI check.
- **Compiler flags required:**
  - `strict: true`
  - `noImplicitAny: true`
  - `noUncheckedIndexedAccess: true`
  - `exactOptionalPropertyTypes: true`
  - `noImplicitOverride: true`
  - `verbatimModuleSyntax: true`
  - `isolatedDeclarations: true`
  - `erasableSyntaxOnly: true`
- **Lint is a ratchet:** 0 errors allowed across the repo. Warnings on untouched files are promoted to errors on any modified file.

---

## 2. Iteration & Array Transformation Rules

- **Use `for...of` loops for side effects:** When iterating through items without returning or producing transformed data (e.g. logging, network triggers, mutations, DOM interactions), you **MUST** use a `for...of` loop.
  ```typescript
  // CORRECT: Side-effect execution with for...of
  for (const recipient of paymentRecipients) {
    await sendNotification(recipient);
  }

  // INCORRECT: Never use forEach or map for side effects
  paymentRecipients.forEach(sendNotification);
  ```
- **`.map()` is strictly for data transformation:** Use `.map()` **ONLY** if the loop creates and returns a new array or transformed object. Never use `.map()` for side-effect iteration or discard the returned array.
  ```typescript
  // CORRECT: Data transformation producing a new array
  const formattedAmounts = transactions.map((transaction) => ({
    transactionId: transaction.id,
    displayAmount: formatCurrency(transaction.amountMinor),
  }));
  ```

---

## 3. Custom Hooks & Component Architecture

- **Extract standalone hooks on 2+ uses:** If any hook logic (state management, event listeners, query composition) is reimplemented more than twice across components or pages, it **MUST** be extracted into a standalone hook file (`use[Feature].ts`) under `hooks/` or a colocated `hooks/` directory.
- **Hook conventions:**
  - Prefixed with `use` (e.g. `useDebounce`, `useAccountBalance`, `useKeyPress`).
  - Hooks must be pure in their subscription setups and clean up all listeners/timers on unmount.
- **Component size and role:**
  - Maximum 150 lines per component body.
  - Separate orchestrators/containers (data-fetching, state routing) from pure presentational components.

---

## 4. Folder & File Design Architecture

Organize TypeScript and fullstack React applications by **feature vertical slices**:

```
src/
├── app/                         # Thin routing shell (Next.js / Router)
│   └── (dashboard)/
│       └── transfers/
│           └── page.tsx         # Orchestrator importing from features/transfers
├── features/                    # Domain-specific vertical slices
│   └── transfers/               # Self-contained feature module
│       ├── index.ts             # Public feature export
│       ├── components/          # Feature UI components
│       │   ├── transfer-card.tsx
│       │   └── transfer-form/
│       │       ├── transfer-form.tsx
│       │       ├── use-transfer-form.ts
│       │       ├── transfer-form.schema.ts
│       │       └── __tests__/
│       │           └── transfer-form.test.tsx
│       ├── api/                 # Data queries & mutations
│       │   └── use-transfers-query.ts
│       ├── types/               # Inferred domain types
│       │   └── index.ts
│       └── utils/               # Feature-scoped helpers
│           └── format-status.ts
├── components/ui/               # Domain-agnostic design system primitives (button, modal)
├── hooks/                       # Globally shared extracted hooks (reused >2 times)
├── lib/                         # Infrastructure singletons (api-client, query-client)
└── config/                      # Validated environment configuration (env.ts)
```

- **File Suffix Standards:**
  - `*.schema.ts`: Zod validation schemas
  - `*.test.ts` / `*.test.tsx`: Colocated test files
  - `use-*.ts`: Custom hook modules
  - `*.types.ts`: Domain type definitions
- **Colocation Principle:** Keep subcomponents, hooks, and schemas colocated inside the feature folder. Promote to global `components/ui/` or `hooks/` only when a second genuine consumer requires it.

---

## 5. Naming & Identifiers

Names are the specification. Accurate naming eliminates the need for inline comments.

- **Casing rules:**
  - `camelCase`: variables, functions, methods, object properties.
  - `PascalCase`: types, interfaces, classes, React components, object-as-const types.
  - `SCREAMING_SNAKE_CASE`: module-level constants.
  - `kebab-case`: all file and directory names.
- **No single-letter names anywhere:**
  - Variables, parameters, callback parameters, loop variables, `catch` bindings, and generic type parameters must be fully descriptive (`item` not `i`, `error` not `e`, `TItem` not `T`).
- **Predicate booleans:** `isActive`, `hasPermission`, `canProceed`, `shouldRetry`. Never bare nouns (`active`) or double negatives (`isNotDisabled`).
- **No type noise in names:** `userList` not `userArray`, `UserProfile` not `IUserProfile`.
- **One concept, one word repo-wide:** Choose `beneficiary` or `recipient`, `sender` or `originator`, and remain 100% consistent across files.

---

## 5. Modern Syntax & Erasability (`erasableSyntaxOnly`)

TypeScript 7.0 and modern runtimes (Node, Bun) support native type stripping. To ensure 100% runtime compatibility and high performance:

- **No non-standard TypeScript runtime syntax:**
  - Avoid TypeScript `enum` keywords (which emit runtime objects). Use object-as-const literals instead:
    ```typescript
    // CORRECT: Erasable type-safe enum pattern
    export const PaymentStatus = {
      Pending: 'pending',
      Completed: 'completed',
      Failed: 'failed',
    } as const;

    export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
    ```
  - Avoid TypeScript `namespaces`. Use standard ECMAScript modules (`import`/`export`).
  - Avoid parameter properties in class constructors (explicitly declare class fields).
- **Explicit `import type`:** Always use `import type { ... }` when importing types (enforced by `verbatimModuleSyntax` and Biome).

---

## 6. Functions & Control Flow

- **Single responsibility:** One task per function. Functions doing fetch, parse, mutate, and render must be decomposed.
- **Guard clauses and early returns:** Handle errors and base cases first; avoid deep indentation.
- **Maximum nesting depth:** 3 levels.
- **Parameter limit:** Maximum 3 positional parameters. For 4+, accept a single named object with typed properties.
- **No boolean behavior switches:** Do not write `fetchUser(userId, true)`. Use two named functions or a typed options object: `fetchUser(userId, { includeTransactions: true })`.

---

## 7. Size Caps

Soft caps enforced via CI checks:

| Unit | Cap |
|---|---|
| File | 400 lines |
| Component body | 150 lines |
| Function | 60 lines |

---

## 8. Types, Schemas & Data Modeling

- **Schema-First as Single Source of Truth:** Validate all external boundaries (API bodies, query params, local storage, environment variables) with Zod schemas. Derive TypeScript types directly from schemas:
  ```typescript
  export const AccountPayloadSchema = z.object({
    accountId: z.string().uuid(),
    balanceMinor: z.number().int().nonnegative(),
    currency: z.enum(['USD', 'EUR', 'GBP']),
  });

  export type AccountPayload = z.infer<typeof AccountPayloadSchema>;
  ```
- **Explicit Export Types (`isolatedDeclarations`):** All exported functions and constants must declare explicit return types to enable fast parallel declaration generation in TypeScript 7.0.
- **Discriminated Unions over Optional Soup:**
  ```typescript
  export type AsyncResult<TData, TError = Error> =
    | { readonly status: 'idle' }
    | { readonly status: 'pending' }
    | { readonly status: 'success'; readonly data: TData }
    | { readonly status: 'error'; readonly error: TError };
  ```
- **No `any` in production code:** Use `unknown` and narrow with type guards or Zod parsing.
- **Branded Types for Primitives:** Prevent accidental string/ID transposition:
  ```typescript
  export type AccountId = string & { readonly __brand: unique symbol };
  export type UserId = string & { readonly __brand: unique symbol };
  ```

---

## 9. Error Handling & Standard API Envelopes

- **Never swallow errors in `catch` blocks.** Always handle, log with context, or convert into typed failure objects.
- **Standard API Response Envelopes:**
  ```typescript
  export type ApiResponse<TData> =
    | { readonly success: true; readonly data: TData }
    | { readonly success: false; readonly error: { readonly code: string; readonly message: string } };
  ```
- **Fail loud and early:** Check preconditions at entry boundaries. Never return `undefined` silently from a failed operation.

---

## 10. Data Layer & State Management

- **Server State:** Owned by TanStack Query / SWR. No ad-hoc fetching into raw `useEffect` + `useState`.
- **Query Key Factories:** One key factory per domain with pinned, byte-identical arrays:
  ```typescript
  export const accountKeys = {
    all: ['accounts'] as const,
    lists: () => [...accountKeys.all, 'list'] as const,
    detail: (accountId: string) => [...accountKeys.all, 'detail', accountId] as const,
  };
  ```
- **Immutability:** Avoid in-place mutation. Use immutable updates via spreads, array methods (`.filter()`, `.map()`), or `structuredClone()`.

---

## 11. Configuration & Security

- **Validated Environment Configuration:** Never read `process.env` or `import.meta.env` inline across components. Parse and validate environment variables at startup using a typed schema module.
- **Sanitization & Escaping:** Always parameterize database queries and sanitize any user inputs interpolated into DOM or templates.
- **No Secrets in Client Bundles:** Public variables must use explicit prefixes (`NEXT_PUBLIC_`, `VITE_`). Never expose server-side credentials to client code.

---

## 12. Testing Standards

- **Colocation:** Tests live in `__tests__/` directories adjacent to the code under test.
- **Behavior-Driven Assertions:** Test what the user or caller observes, not internal private states or implementation details.
- **Deterministic Suites:** Freeze timers, mock network boundaries with MSW (Mock Service Worker), and eliminate flakiness.
- **CI Gate:** 100% green test run required before merge.

---

## 13. Verification Commands

Before completing any task or opening a PR, run and verify:

```bash
# 1. Strict type checking
npx tsc --noEmit

# 2. Linter and formatter verification
npm run lint

# 3. Test suite
npm test

# 4. File and function size caps
npm run check:size
```
