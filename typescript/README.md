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

## Standard Project Layout

### Next.js / Fullstack Application
```
ts-project/
├── biome.json               # Formatter and linter configuration
├── tsconfig.json            # Strict TypeScript compiler options (TypeScript 7.0)
├── package.json
├── src/
│   ├── app/                 # Routes and page components
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Base design system primitives
│   │   └── features/        # Domain-specific composite components
│   ├── hooks/               # Extracted standalone reusable hooks
│   │   ├── use-debounce.ts
│   │   └── use-account.ts
│   ├── lib/                 # Shared utilities, client factories, query keys
│   │   ├── query-keys.ts
│   │   └── api-client.ts
│   ├── schemas/             # Zod validation schemas and derived types
│   │   └── account.ts
│   └── server/              # Server-side services, repositories, DB clients
│       ├── services/
│       └── db/
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
