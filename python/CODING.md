# Python Coding Rules & Standards

Applies to **every** Python project — library, CLI, backend service, worker, data pipeline, or notebook-derived module. Rules that only apply to a specific project shape carry a scope tag; framework-specific guidance is called out as such rather than assumed.

Read [`../CODING.md`](../CODING.md) first — it is the universal baseline. This document adds Python specifics and never relaxes it.

- **No explanatory comments.** Write code that reads on its own.
- **Type hints are mandatory.** Every function signature, method signature, and class attribute is annotated. Untyped code is unreviewable and unrefactorable.
- **Fail fast and explicitly.** Never catch `Exception` broadly, never `except: pass`.
- **Baseline: Python 3.11+.** Rules assume `X | Y` unions, `Self`, `ExceptionGroup`, and `tomllib`. A project pinned lower states the pin in `pyproject.toml`; version-gated rules are marked.

---

## 1. Formatting & Toolchain

- **Exactly one formatter/linter authority, configured repository-wide** in `pyproject.toml`. Default choice: **Ruff** (`ruff format` + `ruff check`), which subsumes Black, isort, flake8, pyupgrade, and most plugins. An existing project on Black + isort + flake8 keeps it — one toolchain, one config, enforced in CI.
- **A type checker is a hard CI gate.** `mypy --strict` or `pyright` in strict mode must exit clean. Default choice: **mypy** for libraries (widest ecosystem support), **pyright/basedpyright** where editor feedback speed matters.
- **Required strictness** — enable together, from day one:
  - `disallow_untyped_defs`, `disallow_any_generics`, `warn_return_any`, `warn_unused_ignores`, `no_implicit_optional`, `strict_equality`.
  - Every `# type: ignore` carries a specific error code (`# type: ignore[arg-type]`) and a reason. Bare ignores are forbidden; `warn_unused_ignores` deletes them when they go stale.
- **Lint is a ratchet:** 0 errors repo-wide. Legacy modules may carry per-module type-checker exemptions listed explicitly in `pyproject.toml` with an owner — never a blanket `ignore_errors` on the whole package.
- **One dependency and environment manager, project-wide.** Default choice: **uv**; Poetry, PDM, Hatch, or pip-tools are equally acceptable. Applications commit a lockfile and CI installs from it frozen.
- **No `setup.py`, no `requirements.txt` as the source of truth.** `pyproject.toml` declares everything.

---

## 2. Naming & Conventions

- **Casing (PEP 8):**
  - `snake_case`: variables, functions, methods, modules, packages.
  - `PascalCase`: classes, type aliases, `TypeVar`s, protocols, enums.
  - `SCREAMING_SNAKE_CASE`: module-level constants.
- **No single-letter names.** Use `index` not `i`, `error` not `e`, `item` not `x`.
  - **Only permitted exceptions:** `self` and `cls`, and conventional mathematical symbols inside a formula that mirrors published notation.
  - `TypeVar` names are descriptive `PascalCase` (`ItemT`, `ResponseT`) — not bare `T`.
- **A single leading underscore marks module- or class-private.** Double underscore name mangling is for genuine subclass-collision avoidance only, not privacy theatre.
- **Predicates read as questions:** `is_valid()`, `has_permission()`, `can_retry()`, `should_refresh()`. Never a bare noun, never a negated name (`is_not_ready`).
- **Functions are verbs:** `build_transfer_request`, `resolve_variant`, `fetch_account`. A noun-named callable must be a property or a factory.
- **No type noise in names:** `accounts` not `account_list`, `rates_by_currency` not `rate_dict`.
- **`__all__` declares the public surface** of every package `__init__.py`. `[lib]`

---

## 3. Comments & Documentation

- **No explanatory comments in function bodies.** Structure and naming carry intent.
- **Docstrings on every public module, class, and function** — one consistent style repo-wide (Google or NumPy), enforced by the linter's docstring rules. Document the contract, the exceptions raised, and any invariant a caller must maintain; do not restate the signature, which the annotations already give.
- **Private helpers need a docstring only when the *why* is non-obvious.**
- **Document raised exceptions.** A caller cannot handle what is not declared.

---

## 4. Functions, Control Flow & Data Structures

- **Single responsibility, guard clauses, early returns.** Handle validation and error cases first; keep the happy path unindented.
- **Maximum nesting depth: 3 levels.**
- **Parameter limit: 3 positional parameters.** Beyond that, take a dataclass or use keyword-only arguments.
- **Keyword-only for optional behavior.** Put `*` in the signature so callers must name optional arguments: `def fetch(account_id: AccountId, *, include_history: bool = False) -> Account:`. This also removes the boolean-positional-flag problem the universal standard forbids.
- **Never use a mutable default argument.** `def f(items: list[str] = [])` shares one list across every call. Use `None` and construct inside, or `field(default_factory=list)` on a dataclass.
- **Comprehensions for transformation, `for` loops for side effects.** A comprehension whose result is discarded is a loop written wrong. A comprehension that needs two levels of nesting plus a condition is a loop that needs to be a loop.
- **Generators for large or unbounded sequences.** Do not materialize a list to iterate over it once. `yield from` for delegation.
- **Context managers for every acquired resource** — files, sockets, locks, transactions, temp directories. `with`, not try/finally by hand. Expose `contextlib.contextmanager` or `__enter__`/`__exit__` for resources the module owns.
- **`pathlib.Path` over `os.path` string manipulation.**
- **`enumerate`, `zip`, `itertools`** instead of manual index arithmetic.
- **Never mutate a caller's argument.** Return a new value.

---

## 5. Size Caps

Soft caps (see §0 of the universal standards on tunable thresholds):

| Unit | Cap |
|---|---|
| Module | 400 lines |
| Class body | 150 lines |
| Function / method | 60 lines |

Enforce mechanically where possible: Ruff's `PLR0913` (argument count), `PLR0912` (branches), `C901` (complexity).

---

## 6. Types & Data Modeling

- **Annotate everything, including returns.** `-> None` is an annotation and is required.
- **Modern syntax:** `list[str]`, `dict[str, int]`, `str | None` — not `List`, `Dict`, `Optional`. `from __future__ import annotations` where the target version needs it.
- **`Any` is forbidden in production paths.** Use `object` when the type is genuinely unknown and narrow it, or a `Protocol` when only a shape matters. `Any` at a third-party boundary is contained in one adapter module.
- **Model data with `@dataclass(frozen=True, slots=True)`** for internal value objects — immutable by default, cheap, and typed. Reach for a validating model (Pydantic, attrs) at *boundaries*, where runtime validation of untrusted input is the point.
- **Validate untrusted input into a typed object at the boundary.** Request bodies, config files, environment variables, CLI arguments, and third-party responses are parsed once and never passed around as raw `dict[str, Any]`.
- **`Enum` / `StrEnum` for closed sets** of values — never bare string literals compared across modules. `Literal` types for small fixed unions.
- **`NewType` for identifiers** to stop transposing two `str` IDs: `AccountId = NewType("AccountId", str)`.
- **Exhaustive matching.** `match` over a closed union with an `assert_never(value)` in the fallback, so adding a variant becomes a type error.
- **`Protocol` over ABC inheritance** for structural interfaces — it decouples the implementer from the definition.
- **`TypedDict` only for genuine external JSON shapes**; internal data gets a dataclass.

---

## 7. Error Handling

- **Catch the narrowest exception that can actually occur.** Bare `except:` catches `KeyboardInterrupt` and `SystemExit`; `except Exception:` is permitted **only** at a top-level boundary (request handler, task runner, `main`) that logs and converts, and it re-raises or returns a typed failure — it never continues silently.
- **Define a package-root exception and derive from it.** One base per package (`class TransferError(Exception)`) lets callers catch everything from this library without catching everything in the process.
- **Preserve the chain.** `raise NewError(...) from original` when translating, `raise ... from None` only when the original is genuinely noise. Never interpolate the original into a message and drop it.
- **Never use exceptions for control flow across a module boundary.** Expected domain outcomes are return values; exceptional ones are raised.
- **Never `return None` to signal failure** where `None` is also a legitimate value. Return an explicit result type or raise.
- **`finally` and context managers for cleanup**, never cleanup code duplicated on every exit path.
- **`ExceptionGroup` / `except*`** for concurrent operations that can fail independently.
- **`assert` is not validation.** It is removed under `python -O`. Use it for internal invariants in tests and development only.

---

## 8. Concurrency & Async

- **Pick one concurrency model per subsystem and state why:** `asyncio` for I/O-bound concurrency, threads for blocking I/O in libraries that have no async API, processes for CPU-bound work. The GIL means threads do not speed up CPU work.
- **Never block the event loop.** Blocking I/O and CPU work inside a coroutine stalls every other task. Offload with `asyncio.to_thread` or a process pool.
- **Structured concurrency:** `asyncio.TaskGroup` over bare `create_task`, so failures propagate and nothing is orphaned. Every task must be awaited or explicitly cancelled.
- **Keep a reference to every task you spawn.** `asyncio.create_task` results that nobody holds can be garbage-collected mid-flight.
- **Cancellation propagates:** never swallow `asyncio.CancelledError`; re-raise after cleanup.
- **Timeouts on every external call:** `asyncio.timeout` or the client's own deadline. No unbounded waits.
- **Bounded concurrency:** a `Semaphore` or a queue with a maximum size around any fan-out over caller-supplied input.
- **No shared mutable module-level state.** Module globals are process-wide and are the usual cause of "works locally, corrupt under load".

---

## 9. Logging & Observability

- **Use the `logging` module (or a structured wrapper such as `structlog`) — never `print`** outside a CLI's actual stdout output.
- **One logger per module:** `logger = logging.getLogger(__name__)`.
- **Libraries never configure logging.** `[lib]` No `basicConfig`, no handlers, no level setting — attach a `NullHandler` and let the application decide.
- **Lazy, structured arguments:** `logger.info("transfer settled", extra={"account_id": account_id})`. Never f-string the message when the level may be disabled; never build a log string by concatenation.
- **`logger.exception(...)` inside an `except` block** so the traceback is captured.
- **Never log secrets or PII.** Redact in `__repr__` for any type holding credentials — a dataclass will otherwise print the password.
- **Log once, at the boundary.** Propagate the exception and log it at the top-level handler.

---

## 10. Project Layout

**`src/` layout is required** — it makes the installed package, not the working directory, what tests import, which catches packaging errors before release.

```
my-project/
├── pyproject.toml           # Single source of config: deps, ruff, mypy, pytest
├── uv.lock                  # Committed for applications
├── src/
│   └── my_package/
│       ├── __init__.py      # Public API + __all__
│       ├── py.typed         # [lib] Marks the package as typed for consumers
│       ├── config.py        # Validated settings, parsed once at startup
│       ├── errors.py        # Package exception hierarchy
│       ├── domain/          # Pure logic: no I/O, no framework imports
│       ├── services/        # Use cases orchestrating domain + adapters
│       ├── adapters/        # DB, HTTP clients, queues — the impure edge
│       └── api/             # [service] Transport layer: routes, schemas, DTOs
└── tests/
    ├── conftest.py
    ├── unit/
    └── integration/
```

- **A library or small CLI collapses the inner layers** — `domain/services/adapters` is for projects that have all three, not a mandatory ceremony.
- **`__init__.py` files stay thin:** re-exports and `__all__`, no logic, no import side effects. An import must never open a connection, read a file, or start a thread.
- **No `utils.py` junk drawer.** Name modules by responsibility: `formatting.py`, `retry.py`, `currency.py`.
- **Absolute imports only.** No implicit relative imports; explicit relative (`from .errors import ...`) is acceptable within a package.

---

## 11. Testing

- **`pytest` is the default choice**, with `unittest` acceptable where the ecosystem requires it. One runner per project.
- **Tests mirror the source tree** under `tests/`, split into `unit/` (fast, no I/O) and `integration/` (real boundaries).
- **Fixtures over setup methods**, with the narrowest scope that works. A `session`-scoped mutable fixture is a hidden dependency between tests.
- **Deterministic:** freeze time (`freezegun`, `time-machine`, or an injected clock), seed randomness, and mock the network at the transport boundary (`responses`, `respx`, a fake). No `sleep`, no live network.
- **Parametrize instead of duplicating** test bodies across inputs.
- **Test behavior, not internals.** Patch at the boundary you own; `monkeypatch` reaching into another module's private attribute breaks on every refactor.
- **Property-based tests** (`hypothesis`) for parsers, serialization round-trips, and financial or mathematical invariants.
- **Every bug fix ships with a regression test.**
- **CI gate:** 100% green before merge, on every supported Python version. `[lib]`

---

## 12. Verification Commands

Run before completing any task or opening a PR. Substitute the project's runner (`uv run`, `poetry run`, `hatch run`) — the checks, not the runner, are the standard.

```bash
# 1. Format & lint (fix, then verify clean)
ruff format .
ruff check . --fix
ruff check .

# 2. Strict type checking
mypy src/

# 3. Test suite
pytest

# 4. Dependency vulnerability audit
uv pip audit        # or: pip-audit
```
