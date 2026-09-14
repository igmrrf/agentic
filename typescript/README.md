# TypeScript Standards & Architecture Blueprint

This directory contains the engineering standards, configuration templates, and project blueprints for all TypeScript projects — library, CLI, backend service, or UI application — on any runtime (Node, Deno, Bun, browser, edge).

**Baseline: TypeScript 5.5+.** The rules in [`CODING.md`](CODING.md) are written to hold across the 5.x and 7.x lines; version- and project-shape-gated options are marked there. The 7.0 material below is the forward path, not a prerequisite.

## Table of Contents

- [Core Principles](#core-principles)
- [TypeScript 7.0 Highlights](#typescript-70-highlights)
- [Key Language Rules](#key-language-rules)
- [Standard Project Layout](#standard-project-layout-feature-driven-colocation)
- [Configuration Templates](#configuration-templates)
- [Verification Checklist](#verification-checklist)

---

## Core Principles

1. **Strict Zero-Any Typing:** `strict: true`, `noImplicitAny: true`, and zero `any` in production code.
2. **Schema-First Data Boundaries:** a runtime schema validator is the single source of truth for validation *and* static types at every untrusted boundary. Zod is the default choice; Valibot, ArkType, and TypeBox are equally acceptable.
3. **Pure Logic & Isolated Effects:** pure business logic separated from side-effect wrappers, transport code, and UI.
4. **Explicit Failure & Cancellation:** typed errors with preserved `cause`, no floating promises, `AbortSignal` and a timeout on every I/O call.

---

## TypeScript 7.0 Highlights

- **Native Compiler Performance:** 8x–12x faster compilation and type-checking powered by the native Go-based TypeScript engine.
- **Type-Stripping Safety (`erasableSyntaxOnly`):** Enforces 100% erasable syntax (object-as-const instead of legacy TS `enum`, standard modules instead of `namespace`) for seamless runtime stripping across Node and Bun.
- **Explicit Module Typing (`verbatimModuleSyntax`):** Mandates `import type` to prevent accidental runtime side-effects.
- **Parallel Declaration Emit (`isolatedDeclarations`):** Requires explicit return types on exported boundaries for ultra-fast parallel `.d.ts` generation.
- **Strict Index & Property Checks:** `noUncheckedIndexedAccess: true` and `exactOptionalPropertyTypes: true` to prevent `undefined` runtime access.

---

## Key Language Rules

- **Iteration:** Use `for...of` loops for side effects / operations that do not return data — it is the only form that supports `await`, `break`, and `continue`.
- **Transformations:** Use `.map()` strictly when generating new arrays or transformed objects.
- **Concurrency is explicit:** sequential `await` in a loop is a choice; independent work uses `Promise.all` / `allSettled` with a bounded limit.
- **Hook Extraction** *(UI frameworks only — see [Appendix A](CODING.md#appendix-a-ui-component-frameworks))*: stateful logic reimplemented across two or more components is extracted into a standalone module.

---

## Standard Project Layout: Feature-Driven Colocation

This is the **UI application** layout. Libraries, CLIs, and backend services use a different shape — see [`CODING.md` §12](CODING.md#12-project-layout) for all four.

```
ts-project/
├── biome.json                   # Linter & formatter configuration
├── tsconfig.json                # Strict TypeScript compiler options
├── package.json
├── src/
│   ├── app/                     # Routing shell (Next.js App Router / React Router)
│   │   ├── layout.tsx
│   │   └── (dashboard)/
│   │       └── transfers/
│   │           └── page.tsx     # Thin orchestrator (imports from features/transfers)
│   │
│   ├── features/                # Self-contained domain vertical slices
│   │   └── transfers/           # Business feature module
│   │       ├── index.ts         # Public feature export boundary
│   │       ├── components/      # Feature UI & form components
│   │       │   ├── transfer-card.tsx
│   │       │   └── transfer-form/
│   │       │       ├── transfer-form.tsx
│   │       │       ├── use-transfer-form.ts
│   │       │       ├── transfer-form.schema.ts
│   │       │       └── __tests__/
│   │       │           └── transfer-form.test.tsx
│   │       ├── api/             # TanStack Query hooks & API fetchers
│   │       │   └── use-transfers-query.ts
│   │       ├── types/           # Schema-inferred domain types
│   │       │   └── index.ts
│   │       └── utils/           # Feature-specific helpers
│   │           └── format-status.ts
│   │
│   ├── components/              # Domain-agnostic design system primitives
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── modal.tsx
│   │       └── input.tsx
│   │
│   ├── hooks/                   # Globally shared custom hooks (reused >2 times)
│   │   ├── use-debounce.ts
│   │   └── use-media-query.ts
│   │
│   ├── lib/                     # Infrastructure singletons & clients
│   │   ├── api-client.ts
│   │   ├── query-client.ts
│   │   └── query-keys.ts
│   │
│   └── config/                  # Validated runtime environment
│       └── env.ts
```

---

## Configuration Templates

- [`biome.json`](biome.json): Formatter and linter configuration with strict rules and VCS integration.
- [`tsconfig.json`](tsconfig.json): Strict TypeScript compiler options with `erasableSyntaxOnly`, `isolatedDeclarations`, and `verbatimModuleSyntax`.

---

## Verification Checklist

Every pull request and CI pipeline must execute:

```bash
# 1. Type validation with no emit
npx tsc --noEmit

# 2. Formatter and linter checks
npm run lint

# 3. Unit and integration test suites
npm test

# 4. Size cap checks
npm run check:size
```
