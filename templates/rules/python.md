# Repository Coding Standards (Python 3.12+)

Always adhere to `CODING.md` and `docs/CODING_PYTHON.md`:
- **Zero Explanatory Comments:** Write self-documenting code.
- **Mandatory Static Typing:** Modern Python 3.12+ type hints (`str | None`, `type Alias = ...`) on all signatures. Zero untyped escapes.
- **Fail Fast & Explicitly:** Never catch broad `Exception` or swallow errors. Use granular custom domain exceptions.
- **Toolchain Authority:** Ruff is the sole authority for formatting and linting (`ruff format`, `ruff check`). Mypy strict mode enforced.
- **Size Caps:** File <= 400 lines, Function <= 50 statements, Max 3 positional arguments.
- **Architecture:** Pure core domain logic separated from impure I/O adapters.
