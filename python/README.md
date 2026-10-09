# Python Standards & Architecture Blueprint (Python 3.12+)

This directory contains the engineering standards, configuration templates, and architectural blueprints for all Python applications and services within this repository, targeting **Python 3.12+**.

## Table of Contents

- [Core Principles](#core-principles)
- [Python 3.12+ Highlights](#python-312-highlights)
- [Standard Project Layout](#standard-project-layout)
- [Toolchain & Linter Configuration](#toolchain--linter-configuration)
- [Verification Checklist](#verification-checklist)

---

## Core Principles

1. **Static Typing & Invariants:** 100% type-annotated code with strict `mypy` enforcement. Zero untyped escapes or bare `Any` in production paths.
2. **Fail Fast & Explicitly:** Zero broad `except Exception:` catches. Catch explicit, granular exceptions; raise domain-specific custom exceptions.
3. **Ruff as Single Authority:** Automated formatting and comprehensive linting enforced by Ruff. Hand-formatting and manual import sorting are prohibited.
4. **Pure Core, Impure Edges:** Business rules encapsulated in pure domain classes and functions without third-party framework or database dependencies.

---

## Python 3.12+ Highlights

- **Native Type Syntax:** Use `type` alias statements (`type AccountMap = dict[str, Account]`) and pipe union syntax (`str | None`, `int | float`).
- **Granular Error Handling:** Leverage Exception Groups and `except*` for concurrent task failure handling.
- **Ruff Unified Toolchain:** Sub-second formatting, import sorting, and 30+ lint rules replacing Flake8, Black, isort, and Bandit.
- **Strict Pylint / McCabe Caps:** Automated ceiling on function length (50 statements) and parameter count (max 3 positional).

---

## Standard Project Layout

Standard hexagonal / clean architecture layout for Python backend services:

```
python-service/
├── pyproject.toml               # Single source of truth for build, Ruff, Mypy & Pytest
├── README.md
├── src/
│   └── service/
│       ├── __init__.py
│       ├── main.py              # Composition root & dependency wiring
│       ├── domain/              # Pure business entities & custom exceptions
│       │   ├── __init__.py
│       │   ├── account.py       # Dataclass entities, validation invariants
│       │   └── exceptions.py    # Custom domain exceptions (DomainError)
│       ├── service/             # Application use cases & orchestrators
│       │   ├── __init__.py
│       │   ├── transfer.py      # Business workflow orchestration
│       │   └── ports.py         # Abstract protocols (typing.Protocol)
│       ├── adapter/             # Concrete I/O implementations
│       │   ├── __init__.py
│       │   ├── database/        # SQLAlchemy / asyncpg repositories
│       │   │   ├── __init__.py
│       │   │   └── postgres.py
│       │   └── web/             # FastAPI / Litestar endpoints
│       │       ├── __init__.py
│       │       ├── routes.py
│       │       └── schemas.py   # Pydantic v2 input/output schemas
│       └── config/              # Validated environment configuration
│           ├── __init__.py
│           └── settings.py      # pydantic-settings initialization
└── tests/
    ├── conftest.py              # Shared fixtures & test container hooks
    ├── unit/                    # Fast, deterministic in-memory tests
    │   └── test_account.py
    └── integration/             # Boundary and database adapter tests
        └── test_postgres.py
```

---

## Toolchain & Linter Configuration

All settings are centralized in [`pyproject.toml`](pyproject.toml):
- **Ruff Linter & Formatter:** Line length 100, double quotes, automated import organization, and strict security / complexity rules.
- **Mypy Strict Mode:** `strict = true`, `disallow_untyped_defs = true`, `warn_return_any = true`.
- **Pytest:** Strict markers and automatic `src/` path resolution.

---

## Verification Checklist

Every pull request and CI pipeline must execute and pass:

```bash
# 1. Format check
ruff format --check .

# 2. Comprehensive lint audit (zero warnings permitted)
ruff check .

# 3. Strict type checking
mypy src

# 4. Deterministic test suite with coverage
pytest --cov=src --cov-report=term-missing
```
