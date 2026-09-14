# Lua Coding Rules & Standards

Applies to **every** Lua project — standalone application, embedded scripting layer, Neovim or game plugin, OpenResty service, or library. Lua is almost always embedded in a host, so **the host's conventions and API win where they conflict with this document**; deviations are stated, not silently taken.

Read [`../CODING.md`](../CODING.md) first — it is the universal baseline. This document adds Lua specifics and never relaxes it.

- **No explanatory comments.** Write code that reads on its own.
- **Fail fast and explicitly.** Return `nil, err` for expected failures; `error()` for broken invariants.
- **`local` by default, always.** Every variable and function is `local` unless the host genuinely requires a global. An accidental global is a process-wide, cross-module data race.

---

## 0. Target Runtime

**State the target runtime and version in the project README, and hold to one.** Lua dialects are not interchangeable and a rule that is correct on one is a syntax error on another:

| Runtime | Notes that change the rules below |
|---|---|
| **Lua 5.1 / LuaJIT** | No integer subtype, no `goto` in 5.1, no `<close>`/`<const>`, `unpack` not `table.unpack`, `setfenv`-era environments. LuaJIT adds FFI and its own performance rules. |
| **Lua 5.2–5.3** | `goto`, `_ENV`, integer subtype in 5.3, `table.unpack`, bitwise operators in 5.3. |
| **Lua 5.4** | `<const>` and `<close>` attributes, integer division `//`, generational GC. Prefer these where available. |

- **Do not use a feature the target runtime lacks**, and do not write compatibility shims for runtimes the project does not support. If the project must span versions, isolate the differences in one compatibility module.

---

## 1. Formatting & Toolchain

- **`stylua` is the single formatting authority.** Configuration lives in `stylua.toml` at the repository root and is never overridden per file. Never hand-format.
- **`luacheck` is a mandatory lint gate**, configured in `.luacheckrc` with the target `std` (`lua51`, `luajit`, `lua54`, `ngx_lua`, or a host-specific list such as Neovim's `vim` global) and an explicit `globals` / `read_globals` allowlist. `selene` is an acceptable alternative; pick one.
- **Undefined and unused globals are errors, not warnings.** This is the single highest-value check in a language with implicit global assignment.
- **Type annotations are required on public functions.** Lua has no static type system, so annotations plus a checker (`lua-language-server` in strict mode, or `Teal` for a genuinely typed dialect) are the only compile-time safety net available. Run the checker in CI.
- **Lint is a ratchet:** 0 errors repo-wide; any modified file must be clean of warnings too.

---

## 2. Naming & Conventions

- **Casing:**
  - `snake_case`: local variables, functions, methods, and module fields. Default choice; a project embedded in a host that uses `camelCase` follows the host instead — consistently, repo-wide.
  - `PascalCase`: class-like tables and constructors.
  - `SCREAMING_SNAKE_CASE`: module-level constants.
  - `snake_case.lua`: file names, matching the module name used in `require`.
- **A single leading underscore marks module-private.** Lua cannot enforce privacy; the convention plus not exporting the field is the enforcement.
- **No single-letter names.** Use `index` not `i`, `key`/`value` not `k`/`v`, `error_message` not `e`.
  - **Only permitted exception:** `self`.
- **Predicates read as questions:** `is_valid`, `has_permission`, `can_retry`, `should_refresh`.
- **Functions are verbs:** `build_request`, `resolve_path`, `fetch_config`.
- **One concept, one word repo-wide.**

---

## 3. Comments & Documentation

- **No explanatory comments in function bodies.**
- **Annotate every public function** with EmmyLua/LuaCATS annotations — they are documentation *and* the input to the language server's type checking:

  ```lua
  ---@class Account
  ---@field id string
  ---@field balance_minor integer

  ---Fetches an account by identifier.
  ---@param account_id string
  ---@return Account|nil account
  ---@return string|nil error_message
  local function fetch_account(account_id) end
  ```

- **Annotate the error return**, not just the success one. An unannotated `nil, err` contract is invisible to callers and to the checker.
- **No commented-out code, no changelog comments.**

---

## 4. Functions & Control Flow

- **Guard clauses and early returns.** Validate at the top; keep the happy path unindented.
- **Maximum nesting depth: 3 levels.**
- **Parameter limit: 3 positional parameters.** Beyond that, take a single options table — which also removes the positional-boolean-flag problem:

  ```lua
  local function create_transfer(opts)
    -- opts.source_account_id, opts.amount_minor, opts.idempotency_key
  end
  ```

- **Validate options-table fields explicitly.** A typo in a caller's key is silently `nil`; check required fields and fail loudly.
- **`ipairs` for sequences, `pairs` for maps.** `pairs` iteration order is undefined and varies between runs — never rely on it for output ordering or serialization.
- **Tables are 1-indexed**, and a `nil` in the middle of a sequence makes `#` undefined. Never store `nil` as a meaningful array element; use a sentinel or a separate presence field.
- **Declare `local` before use, and cache hot lookups.** Locals are register slots; globals and nested table fields are hash lookups per access. In a loop, hoist `local insert = table.insert`.
- **Build strings with `table.concat`, never repeated `..` in a loop** — repeated concatenation is quadratic and produces garbage on every iteration.
- **Multiple returns are a contract, not a convenience.** `select("#", ...)` to count varargs correctly; storing `...` in a table loses embedded `nil`s unless you use `table.pack`.

---

## 5. Size Caps

Soft caps (see §0 of the universal standards on tunable thresholds):

| Unit | Cap |
|---|---|
| Module | 400 lines |
| Class-like table (method set) | 150 lines |
| Function | 60 lines |

Lua 5.1/LuaJIT also caps 200 locals and 60 upvalues per function — hitting either is a hard signal the function should have been several.

---

## 6. Modules & State

- **A module builds one `local` table and returns it.** No globals, no `module()` (removed in 5.2), no side effects at require time — `require` caches, so an import that opens a socket or reads a file runs once, unpredictably, in whatever order the host loads modules.

  ```lua
  local M = {}

  function M.parse(input) end

  return M
  ```

- **Pass state explicitly.** Module-level mutable state is process-global and survives across every consumer; a factory function returning an instance is almost always the right shape.
- **Declare the public surface deliberately.** Everything not on the returned table is private — keep helpers as file-locals rather than exporting and hoping.
- **Metatables are for behavior, not cleverness.** `__index` for method lookup and defaults is idiomatic; `__index`/`__newindex` chains that make a table pretend to be something else make debugging impossible.
- **Set `__name` and a `__tostring` metamethod** on class-like tables so errors and logs identify the object.
- **Never modify tables you do not own** — not the standard library, not the host's globals, not a table received as an argument. Monkey-patching a shared runtime is invisible to every other consumer in the process.

---

## 7. Error Handling

- **Expected failures return `nil, error_message` (or `false, err`).** Callers check the first return; never make them parse a message string to decide what happened. Return a table with a `code` field when callers need to branch.
- **`error()` for broken invariants and programmer errors** — a contract violation, not a runtime condition the caller could reasonably handle. Pass a table for structured errors; pass a level argument so the reported position points at the caller.
- **`assert()` is for invariants, and it is not free.** `assert(fetch())` collapses a `nil, err` contract into a thrown string and loses the error's structure. Handle the `nil` explicitly.
- **`pcall` / `xpcall` only at boundaries** — the host callback, the request handler, the plugin entry point. Wrapping every call in `pcall` reproduces `except: pass`.
- **`xpcall` with a traceback handler** when the traceback matters; plain `pcall` discards it.
- **Never swallow.** A `pcall` whose error result is discarded is a bug; log it or return it.
- **Clean up deterministically.** Lua's GC is not a resource manager: close files, sockets, and handles explicitly on every path, including the error path. On 5.4, `local handle <close> = ...` does this correctly.

---

## 8. Logging & Observability

- **Log through the host's logging facility** (`vim.notify`, `ngx.log`, the game engine's logger, or one project-local logger module) — never `print` outside a CLI's actual stdout output.
- **Structured fields over concatenated strings**, where the host supports it.
- **Never log secrets or PII.**
- **Log once, at the boundary** — return errors upward and log them where they are handled.

---

## 9. Project Layout

```
my-project/
├── .luacheckrc              # std, globals allowlist, lint config
├── stylua.toml
├── my-project-dev-1.rockspec  # [lib] LuaRocks packaging
├── lua/                     # or src/ — one root, matching the host's require path
│   └── my_project/
│       ├── init.lua         # Public API surface only
│       ├── config.lua       # Validated settings, parsed once
│       ├── errors.lua       # Shared error constructors / codes
│       └── <domain>/        # Cohesive units
└── spec/                    # or tests/ — mirrors the source tree
```

- **`init.lua` re-exports; it does not implement.** `require("my_project")` should be cheap and side-effect free.
- **The directory layout *is* the `require` path.** Renaming a file renames a public identifier — treat it as an API change.
- **No `utils.lua` junk drawer.** Name modules by responsibility: `string_util` becomes `formatting`, `helpers` becomes `retry`.
- **Isolate host API calls behind one adapter module** so the domain logic stays testable without the host running.

---

## 10. Testing

- **`busted` is the default choice** (`luassert`, `luacov` for coverage); `luaunit` or the host's own harness are acceptable where the embedding requires it. One runner per project.
- **Specs mirror the source tree** under `spec/`, named `*_spec.lua`.
- **Deterministic:** inject the clock and the random source, seed anything stochastic, and stub host and network calls. No `os.time()` or `math.random()` read directly in logic under test.
- **Test the public module table**, not file-locals. A test that needs a private function is telling you the module has two responsibilities.
- **Assert on the full `nil, err` contract**, both returns, not just truthiness.
- **Every bug fix ships with a regression test.**
- **CI gate:** green on every supported runtime version the project claims (§0).

---

## 11. Verification Commands

```bash
# 1. Format
stylua .

# 2. Lint (undefined/unused globals are errors)
luacheck .

# 3. Type/annotation check
lua-language-server --check . --checklevel=Error

# 4. Test suite
busted --coverage
```
