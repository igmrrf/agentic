# Lua Standards & Architecture Blueprint

This directory contains the engineering standards, configuration templates, and architectural patterns for all Lua libraries and modules within this repository, targeting **LuaJIT / Lua 5.4**.

## Table of Contents

- [Core Principles](#core-principles)
- [EmmyLua & Static Typing](#emmylua--static-typing)
- [Standard Project Layout](#standard-project-layout)
- [Toolchain & Linter Configuration](#toolchain--linter-configuration)
- [Verification Checklist](#verification-checklist)

---

## Core Principles

1. **Local by Default:** Every variable, function, and imported module must be declared with `local`. Never leak symbols into the global namespace.
2. **Explicit Error Returns:** Functions returning errors return `nil, err_message` (or a structured error table). Use `error()` exclusively for unrecoverable state corruption.
3. **EmmyLua Annotations:** Document all public functions with `---@param`, `---@return`, and `---@class` annotations for LuaLS validation.
4. **StyLua Formatter Authority:** Code formatting is fully automated via `stylua`. Manual formatting is prohibited.

---

## EmmyLua & Static Typing

Every exported module must provide complete EmmyLua type declarations:

```lua
---@class Account
---@field id string Unique account identifier
---@field balance_minor integer Account balance in minor currency units
---@field is_active boolean Whether the account is permitted to transact

local M = {}

---Creates and validates a new Account instance.
---@param id string
---@param initial_balance integer
---@return Account|nil account The initialized account, or nil on failure
---@return string|nil error Error message if validation fails
function M.new(id, initial_balance)
  if not id or id == "" then
    return nil, "account id cannot be empty"
  end
  if initial_balance < 0 then
    return nil, "initial balance must be non-negative"
  end

  ---@type Account
  local account = {
    id = id,
    balance_minor = initial_balance,
    is_active = true,
  }
  return account, nil
end

return M
```

---

## Standard Project Layout

Modular layout for standalone Lua modules or Neovim plugins:

```
lua-project/
├── .stylua.toml                 # StyLua code formatter configuration
├── .luarc.json                  # Lua Language Server (LuaLS) type-checking settings
├── .luacheckrc                  # Luacheck static analysis and lint rules
├── README.md
├── lua/
│   └── mymodule/
│       ├── init.lua             # Package entrypoint & public API export
│       ├── config.lua           # Validated configuration table
│       ├── domain/              # Pure domain logic & invariant checks
│       │   └── account.lua
│       └── utils/               # Scoped helper functions
│           └── string.lua
└── spec/                        # Busted test suite
    ├── spec_helper.lua
    └── account_spec.lua
```

---

## Toolchain & Linter Configuration

The configurations in this directory enforce quality across editors and CI:
- [`.stylua.toml`](.stylua.toml): 2-space indentation, 100-character line width, double quote preferences, required call parentheses.
- [`.luarc.json`](.luarc.json): LuaLS diagnostic configuration with strict undefined-global error levels.
- [`.luacheckrc`](.luacheckrc): Luacheck configuration restricting globals and enforcing zero-warning gates.

---

## Verification Checklist

Every pull request and CI pipeline must execute and pass:

```bash
# 1. Format check
stylua --check .

# 2. Static analysis and linting (zero warnings permitted)
luacheck .

# 3. Test execution (Busted)
busted .
```
