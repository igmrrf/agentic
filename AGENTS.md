# Repository Coding Standards (Multi-Language)

Always follow the root `CODING.md` and the language-specific standards under `docs/`:
- **Universal Standards:** `CODING.md`
- **Zero Explanatory Comments:** Write self-documenting code.
- **Fail Fast & Explicitly:** Never swallow errors or use empty catches.
- **Strict Size Caps:** File <= 400 lines, Component/Struct <= 150 lines, Function <= 50-60 lines.
- **Pure Core, Impure Edges:** Decouple business entities from delivery and persistence layers.
- **Refactoring:** Zero behavior/contract changes without characterization tests.
