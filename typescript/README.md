# TypeScript Standards & Architecture Blueprint (TypeScript 7.0)

This directory contains the engineering standards, configuration templates, and project blueprints for all TypeScript projects in this repository, targeting **TypeScript 7.0** (with native Go-powered compiler).

## Table of Contents

- [Core Principles](#core-principles)
- [TypeScript 7.0 Highlights](#typescript-70-highlights)
- [Key Language Rules](#key-language-rules)
- [Standard Project Layout](#standard-project-layout)
- [Configuration Templates](#configuration-templates)
- [Verification Checklist](#verification-checklist)

---

## Core Principles

1. **Strict Zero-Any Typing:** `strict: true`, `noImplicitAny: true`, and zero `any` in production code.
2. **Schema-First Data Boundaries:** Zod schemas are the single source of truth for runtime validation and static types.
3. **Pure Logic & Isolated Effects:** Pure business logic separated from side-effect wrappers and UI components.
4. **Predictable Query State:** Single object-style query-key factories for server state management.

---

## TypeScript 7.0 Highlights

- **Native Compiler Performance:** 8x–12x faster compilation and type-checking powered by the native Go-based TypeScript engine.
- **Type-Stripping Safety (`erasableSyntaxOnly`):** Enforces 100% erasable syntax (object-as-const instead of legacy TS `enum`, standard modules instead of `namespace`) for seamless runtime stripping across Node and Bun.
- **Explicit Module Typing (`verbatimModuleSyntax`):** Mandates `import type` to prevent accidental runtime side-effects.
- **Parallel Declaration Emit (`isolatedDeclarations`):** Requires explicit return types on exported boundaries for ultra-fast parallel `.d.ts` generation.
- **Strict Index & Property Checks:** `noUncheckedIndexedAccess: true` and `exactOptionalPropertyTypes: true` to prevent `undefined` runtime access.

---

## Key Language Rules

- **Iteration:** Use `for...of` loops for side effects / operations that do not return data.
- **Transformations:** Use `.map()` strictly when generating new arrays or transformed objects.
- **Hook Extraction:** Any custom hook logic reimplemented more than twice across components must be extracted into a standalone hook file (`use[Feature].ts`).

---

## Standard Project Layout: Feature-Driven Colocation

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

- [`biome.json`](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/biome.json): Formatter and linter configuration with strict rules and VCS integration.
- [`tsconfig.json`](file:///Users/igmrrf/Desktop/tmp/Agentic/typescript/tsconfig.json): Strict TypeScript compiler options with `erasableSyntaxOnly`, `isolatedDeclarations`, and `verbatimModuleSyntax`.

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
