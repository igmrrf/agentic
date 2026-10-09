# Repository Coding Standards (Rust 2024)

- **Zero Explanatory Comments:** Write self-documenting code.
- **Zero Panics in Production:** Zero `.unwrap()` or `.expect()` calls in production paths. Propagate all errors via `Result<T, E>`.
- **Rust 2024 Idioms:**
  - Explicit `unsafe { ... }` blocks inside `unsafe fn` bodies (`unsafe_op_in_unsafe_fn`).
  - Use `use<..>` syntax for precise lifetime capturing in RPIT.
  - Native `async fn` in traits.
- **Error Modeling:** Strongly typed `thiserror` for libraries/domain; `anyhow` restricted to CLI/main.
- **Borrowing & Invariants:** Borrowed slices (`&str`, `&[T]`, `&Path`) over owned allocations; typestate pattern and newtypes (`AccountId(Uuid)`).
- **Size Caps:** File <= 400 lines, Struct `impl` <= 150 lines, Function <= 60 lines.
- **Refactoring:** Parity-first refactoring with characterization tests.
