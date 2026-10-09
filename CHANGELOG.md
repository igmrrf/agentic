# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
