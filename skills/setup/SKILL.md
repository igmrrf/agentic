---
name: setup
description: Apply the Agentic engineering standards to the current project — agent rules (CLAUDE.md and others), linter/formatter configs, and CI workflows for Rust, Go, TypeScript, Python, Lua, Swift, or Kotlin. Use when the user invokes /setup or /agentic:setup, or asks to adopt or bootstrap these coding standards in a repository.
disable-model-invocation: true
---

# Setup

Run the Agentic initializer against a project, previewing before writing.

## 1. Locate the initializer

Use the first that works:

1. `<this skill's base directory>/../../scripts/init.sh` — present when installed as the Claude Code plugin or from a clone. Run it with `bash`.
2. `npx -y github:igmrrf/agentic init` — needs Node 18+.
3. `curl -fsSL https://raw.githubusercontent.com/igmrrf/agentic/main/scripts/init.sh | bash -s --`

Below, `INIT` means whichever command you picked.

## 2. Decide the flags

| Flag | How to decide |
| :--- | :--- |
| `--target=<dir>` | The directory the user named, else the current working directory. |
| `--lang=<lang>` | **Always pass it** — the interactive prompt cannot be answered from here. Infer from manifests: `Cargo.toml` → `rust`, `go.mod` → `go`, `package.json`/`tsconfig.json` → `typescript`, `pyproject.toml`/`requirements.txt` → `python`, `*.rockspec`/`.luarc.json` → `lua`, `Package.swift` → `swift`, `build.gradle(.kts)` → `kotlin`, several → `all`. Ask if there is nothing to infer from. |
| Agent rules | `--claude` by default. Add `--gemini`, `--cursor`, `--cline`, `--windsurf`, `--copilot` only for agents the user names; `--agent all` writes every rules file. |
| `--no-ci` | When the user does not want GitHub Actions workflows, or the repo does not use GitHub. |
| `--with-starter` | Only for an empty, brand-new project and only when asked — it adds sample code. |
| `--skills` | Only when asked. Plugin users already have the skills. |

## 3. Preview, confirm, apply

1. Run `INIT <flags> --dry-run` and show the user which files would be created or skipped.
2. Files that already exist, including `CLAUDE.md` and other agent rules files, are skipped. If the user wants them replaced, add `--force --backup` (keeps `.bak` copies). Never add `--force` without their agreement.
3. Run `INIT <flags>` without `--dry-run`.
4. Report the files written and skipped, and suggest reviewing `CLAUDE.md` before committing.
