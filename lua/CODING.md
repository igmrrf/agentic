# Lua Coding Rules & Standards

- **No explanatory comments.** Write code that reads on its own.
- **Fail fast and explicitly.** Use `assert` or explicitly return `nil, err`.
- **Local by default.** Always declare variables and functions as `local` unless explicitly required in the global scope.

---

## 1. Formatting & Toolchain

- **StyLua is the single authority.** Code must be formatted with `stylua`. Never format by hand.
- **Unified Linter Gate:** `luacheck` is mandatory. Zero allowed errors.
- **Lint as a Ratchet:** Zero new linter warnings allowed on any modified file. Clean code at every commit.

---

## 2. Naming & Conventions

- **Variables & Functions:** `snake_case` or `camelCase` depending on project standards, but be consistent. Generally prefer `snake_case`.
- **Constants:** `SCREAMING_SNAKE_CASE` for global or module-level constants.
- **Classes/Modules:** `PascalCase` for objects mimicking classes or returning modules.
- **Predicates:** Start with `is_`, `has_`, `can_`.

---

## 3. Comments & Documentation

- **LDoc or EmmyLua:** Use EmmyLua annotations (`---@param`, `---@return`, `---@type`) for type checking and documentation.
- **No explanatory comments in function bodies.** Code must be clear and self-documenting.

---

## 4. Control Flow & Data Structures

- **1-Based Indexing:** Remember that Lua tables are 1-indexed.
- **Use `ipairs` for arrays and `pairs` for dictionaries.**
- **Guard Clauses:** Handle validation and errors at the beginning of the function, allowing the happy path to remain unindented.
- **Maximum Nesting Depth:** 3 levels. Deeper nesting requires extracting helper functions.

---

## 5. Modules & State

- **Return a local table.** Modules should populate a local table and return it at the end of the file. Avoid relying on the deprecated `module()` function.
- **Avoid global state.** Passing state explicitly is preferred.

---

## 6. Error Handling

- **Return `nil, err_message` on expected errors.** Similar to Go, handle expected failures via multiple return values.
- **Use `error()` for unrecoverable errors.**

---

## 7. Verification Commands

Before opening a PR, execute and verify:

```bash
# 1. Format
stylua .

# 2. Linting
luacheck .
```
