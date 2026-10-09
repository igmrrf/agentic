# Repository Coding Standards (TypeScript & React)

- **Zero Explanatory Comments:** Write self-documenting code. Never explain what code does.
- **Fail Fast & Explicitly:** Never swallow errors; avoid empty catches.
- **Iteration Rules:**
  - MUST use `for...of` loops for side effects or operations that return no data.
  - ONLY use `.map()` when creating and returning a new array or transformed object.
- **Custom Hooks & Component Architecture:**
  - For any custom hook logic reimplemented more than twice, extract into a standalone hook (`use*.ts`) under `hooks/`.
  - Component body size cap: <= 150 lines.
- **Strict Typing & Modern Syntax:**
  - Zero `any` in production code (use `unknown` and narrow).
  - Schema-first validation with Zod at all external boundaries.
  - Always use `import type` for type-only imports (`verbatimModuleSyntax`).
  - Use `object-as-const` instead of TypeScript `enum` (`erasableSyntaxOnly`).
- **Size Caps:** File <= 400 lines, Component <= 150 lines, Function <= 60 lines.
- **Refactoring:** Zero behavior/layout changes without characterization tests.
