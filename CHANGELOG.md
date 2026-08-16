# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- **`scripts/init.sh`**: Updated the scaffold script to directly embed the universal and language-specific coding standards into the generated agent files (`CLAUDE.md`, `GEMINI.md`, and `.cursor/rules/coding.mdc`).
- **`scripts/init.sh`**: Stopped generating raw `CODING.md` and `docs/CODING_*.md` files in target repositories, preventing duplicate files and ensuring LLMs natively parse the instructions.
- **Agent Rules**: Removed markdown references and links to the now-deprecated raw `CODING.md` files from the agent rule templates.
