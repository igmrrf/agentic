-- Luacheck Configuration Standard
-- Static analyzer configuration for Lua codebases

max_line_length = 100
max_code_line_length = 100
max_string_line_length = 120
max_comment_line_length = 100

-- Standard library targeting Lua 5.4 and LuaJIT to recognize standard tables
-- (table, string, math, io, os, coroutine) while strictly preventing accidental global leaks
std = "lua54+luajit"

-- Allowed global symbols across application modules
globals = {
  "vim",
  "_G",
}

-- Test files configuration (Busted testing framework globals)
files["spec/**/*"] = {
  globals = {
    "describe",
    "it",
    "before_each",
    "after_each",
    "pending",
    "assert",
  },
}

files["tests/**/*"] = {
  globals = {
    "describe",
    "it",
    "before_each",
    "after_each",
    "pending",
    "assert",
  },
}

-- Display warning codes for ratcheted error gates
codes = true
