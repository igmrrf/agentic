# Repository Coding Standards (Swift 6.0+)

Always adhere to `CODING.md` and `docs/CODING_SWIFT.md`:
- **Zero Explanatory Comments:** Write self-documenting code.
- **Swift 6 Strict Concurrency:** Compile-time data-race safety. All shared mutable state must be actor-isolated or `@Sendable`.
- **Zero Force-Unwraps:** Never use `!` on optionals or `try!`. Unwind safely via `guard let` or typed throws.
- **Value Semantics First:** Prefer `struct` and `enum` with immutable `let` properties. Restrict `class` to identity requirements.
- **Modern Observation:** Use `@Observable` macro; do not use legacy `ObservableObject` in new code.
- **Size Caps:** File <= 400 lines, Type <= 150 lines, Function <= 50 lines, Max 3 parameters.
- **Refactoring:** Zero behavior/layout changes without characterization tests.
