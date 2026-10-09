# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- **`scripts/init.sh`**: split from one 868-line script into a 120-line entry point and focused files under `scripts/lib/init/` (`cli`, `language`, `files`, `toolchains`, `rules`, `run`). The per-language rules headers moved from heredocs into `templates/rules/<language>.md|.mdc`. All 70 characterization scenarios are unchanged.
- **`scripts/init.sh`**: remote runs now execute the downloaded ref's own `init.sh`, so `--ref` always runs that version's code (including `v1.0.0` and `v1.1.0`).
- **`scripts/init.sh`, `scripts/install-skills.sh`**: temporary downloads honour `TMPDIR` on macOS too.

### Fixed
- **`scripts/init.sh`**: existing agent rules files (`CLAUDE.md`, `GEMINI.md`, `.cursor/rules/coding.mdc`, `.clinerules`, `.windsurfrules`, `.github/copilot-instructions.md`) were silently overwritten even without `--force`. They are now kept like every other existing file; pass `--force` (and `--backup` for `.bak` copies) to regenerate them, for example after updating the standards.

### Added
- **`tests/init/`**: 70 characterization scenarios for `scripts/init.sh` (every language, starter, flag, alias, agent selection, conflict, starter-skip and auto-detection path), run in CI under Linux bash and macOS bash 3.2. They pin the current behaviour before `init.sh` is split into smaller files.

## [1.1.0] - 2026-10-09

### Added
- **`/agentic:setup` skill**: applies the standards to the current project from inside Claude Code (dry run first, then write). Plugin version bumped to 1.1.0.
- **`npx -y github:igmrrf/agentic`**: `bin/agentic.js` runs `init` and `skills` from npm without a clone or an npm publish.
- **`scripts/init.sh`**: `--ref <branch|tag|commit>` for remote runs.
- **`scripts/test-init.sh`**: initializer and npx launcher tests, run in CI on Linux and macOS bash 3.2.

### Changed
- **`scripts/init.sh`**: remote runs download the repository once as a tarball instead of one `curl` request per file, and `--skills` uses the downloaded installer.

### Fixed
- **`scripts/init.sh`**: when piped through bash, the language prompt read from the script itself; it now reads from the terminal, or exits asking for `--lang` when there is none.
- **`scripts/init.sh`**: failed downloads and missing standards files now stop the run instead of writing empty agent rules.

## [1.0.0] - 2026-10-09

### Changed
- **Repository renamed** from `igmrrf/Agentic` to `igmrrf/agentic`; all install URLs now use the lowercase name (GitHub redirects the old one).
- **`scripts/init.sh`**: Updated the scaffold script to directly embed the universal and language-specific coding standards into the generated agent files (`CLAUDE.md`, `GEMINI.md`, and `.cursor/rules/coding.mdc`).
- **`scripts/init.sh`**: Stopped generating raw `CODING.md` and `docs/CODING_*.md` files in target repositories, preventing duplicate files and ensuring LLMs natively parse the instructions.
- **Agent Rules**: Removed markdown references and links to the now-deprecated raw `CODING.md` files from the agent rule templates.

### Fixed
- **`scripts/install-skills.sh`**: Remote (`curl | bash`) installs no longer install zero skills while reporting success. Log output was being captured into the skills source path. The downloaded archive is now cleaned up too.
- **`scripts/install-skills.sh`**: Skills now install into `.claude/skills/`, where Claude Code actually reads them, as well as `.agents/skills/`.
- **`scripts/install-skills.sh`**: `--skill all` works; options missing a value, empty inventories, missing target directories, and failed downloads now exit with an error instead of continuing.

### Added
- **Claude Code plugin marketplace** (`.claude-plugin/marketplace.json`): `/plugin marketplace add igmrrf/agentic` then `/plugin install agentic@agentic`.
- **`scripts/install-skills.sh`**: `--agent claude|agents|all`, `--ref <branch|tag|commit>`, `--uninstall`, and `--update`.
- **`scripts/test-install-skills.sh`** and the `skills` CI workflow: installer smoke tests on Linux and macOS bash 3.2, shellcheck, marketplace validation, and a check that the marketplace lists every skill.
- **`scripts/init.sh`**: Added support for generating multiple agent rule files in a single run (e.g. `--claude --gemini` or `-a claude,gemini`).
- **New Agents**: Out-of-the-box support for Cline (`.clinerules`), Windsurf (`.windsurfrules`), and GitHub Copilot (`.github/copilot-instructions.md`). These files automatically embed universal and language-specific coding standards just like Claude and Gemini files.
- **Swift & Kotlin Standards**: Added full standards, toolchain configurations, starter templates, and CI workflows for Swift 6.0+ and Kotlin 2.0+ (K2 compiler).

[Unreleased]: https://github.com/igmrrf/agentic/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/igmrrf/agentic/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/igmrrf/agentic/releases/tag/v1.0.0
