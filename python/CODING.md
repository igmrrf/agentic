# Python Coding Rules & Standards

- **No explanatory comments.** Write code that reads on its own.
- **Type Hinting is Mandatory.** Use modern Python type hints (`typing` module, `|` for Unions in 3.10+) for all function signatures and class attributes.
- **Fail fast and explicitly.** Do not catch `Exception` broadly.

---

## 1. Formatting & Toolchain

- **Ruff or Black/Isort is the single authority.** Code must be formatted by an automated formatter.
- **Unified Linter Gate:** `ruff` or `flake8` is mandatory. Zero allowed errors.
- **Type Checking:** `mypy` or `pyright` must run in CI with strict settings.
- **Lint as a Ratchet:** Zero new linter warnings allowed on any modified file. Clean code at every commit.

---

## 2. Naming & Conventions

- **Variables, Functions, Methods:** `snake_case`.
- **Classes:** `PascalCase`.
- **Constants:** `SCREAMING_SNAKE_CASE`.
- **Protected/Private:** Use a single leading underscore `_` for internal methods/variables.
- **Predicates:** Functions returning `bool` start with a predicate verb: `is_valid()`, `has_permission()`.

---

## 3. Comments & Documentation

- **Docstrings:** Use docstrings (`"""`) for modules, classes, and public functions. Follow a consistent style (e.g., Google or NumPy).
- **No explanatory comments in function bodies.** Code must be clear and self-documenting.

---

## 4. Control Flow & Data Structures

- **Happy Path to the Left:** Use guard clauses and early returns for errors and boundary conditions.
- **List Comprehensions:** Prefer list/dict comprehensions over simple `for` loops with `.append()`, unless the logic is complex.
- **Generators:** Use generators for large collections to save memory.
- **Maximum Nesting Depth:** 3 levels.

---

## 5. Error Handling

- **Specific Exceptions:** Catch specific exceptions (`ValueError`, `KeyError`) rather than bare `except:` or `except Exception:`.
- **Custom Exceptions:** Define custom exception classes for domain-specific errors.

---

## 6. Project Structure

- Follow standard package layouts. Keep a clear separation between `src/` (or package directory) and `tests/`.
- Use `pyproject.toml` for configuration.

---

## 7. Verification Commands

Before opening a PR, execute and verify:

```bash
# 1. Format & Lint
ruff check . --fix
ruff format .

# 2. Type Checking
mypy .
```
