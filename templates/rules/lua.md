# Repository Coding Standards (Lua)

Always adhere to `CODING.md` and `docs/CODING_LUA.md`:
- **Zero Explanatory Comments:** Write self-documenting code.
- **Local by Default:** Every variable, function, and import must be explicitly `local`. Zero accidental globals.
- **Error Handling:** Return `nil, err` on recoverable failures; `error()` strictly for unrecoverable state corruption.
- **EmmyLua Type Annotations:** Annotate public APIs and types (`---@class`, `---@param`, `---@return`).
- **Formatting & Linting:** StyLua is the sole formatting authority; Luacheck zero-warning gate.
- **Control Flow:** 1-based indexing awareness, `ipairs` for arrays, `pairs` for tables, max nesting depth 3.
