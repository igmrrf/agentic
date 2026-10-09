# Agentic Skills Library

Modular, production-grade agent skills designed for autonomous pair programming, multi-agent orchestration, test-driven development, independent QA review, and software architecture.

---

## Included Skills

Skill | Focus | Description
:--- | :--- | :---
[`setup`](./setup/SKILL.md) | Project Setup | Applies the Agentic standards to the current project: previews with a dry run, picks the language and agent rules, then writes `CLAUDE.md`, linter configs, and CI. Invoke explicitly with `/agentic:setup` (plugin) or `/setup`.
[`codinary`](./codinary/SKILL.md) | Multi-Agent Orchestration | Bounded three-step loop: fresh implementer subagent &rarr; independent QA reviewer &rarr; fixer &rarr; re-review. Prevents context degradation across long coding sessions.
[`code-review`](./code-review/SKILL.md) | Independent QA Review | Dual-axis review comparing changes against documented repo standards and issue specs in parallel subagents.
[`tdd`](./tdd/SKILL.md) | Test-Driven Development | Red &rarr; green &rarr; refactor discipline, seam discovery, interface-driven verification, and mock containment.
[`diagnosing-bugs`](./diagnosing-bugs/SKILL.md) | Systematic Debugging | Scientific root-cause isolation, feedback loop construction, and bisection for hard bugs and performance regressions.
[`codebase-design`](./codebase-design/SKILL.md) | Deep Module Architecture | Shared vocabulary for designing deep interfaces, identifying seam locations, and applying "design-it-twice".
[`domain-modeling`](./domain-modeling/SKILL.md) | Domain Models & ADRs | Domain-driven vocabulary generation, Architecture Decision Records (ADRs), and context boundary mapping.

---

## Installing the Skills

Pick one method. Claude Code reads skills from `~/.claude/skills/` (personal), `<project>/.claude/skills/` (project), or installed plugins — **not** from `~/.agents/skills/`. Every method below puts the skills somewhere Claude Code will find them.

### Method 1: Claude Code Plugin Marketplace (Recommended for Claude Code)

Run this inside Claude Code:

```text
/plugin marketplace add igmrrf/agentic
/plugin install agentic@agentic
```

Or from a shell:

```bash
claude plugin marketplace add igmrrf/agentic
claude plugin install agentic@agentic
```

Plugin skills are namespaced: invoke them as `/agentic:codinary`, `/agentic:tdd`, and so on. Run `/agentic:setup` in a project to apply the coding standards there. Pull updates with `/plugin marketplace update agentic`. To make the skills available to everyone on a team, add the marketplace and plugin to the repo's `.claude/settings.json` (`extraKnownMarketplaces` and `enabledPlugins`).

---

### Method 2: `npx skills` (Any Agent)

The [`skills`](https://github.com/vercel-labs/skills) CLI reads this repository's `skills/` folder and installs each skill wherever your agent looks for it (Claude Code, Cursor, Codex, Antigravity, and others):

```bash
npx skills add igmrrf/agentic                    # interactive: pick skills and agents
npx skills add igmrrf/agentic --skill codinary   # a single skill
npx skills add igmrrf/agentic --list             # list what is available
```

---

### Method 3: One-Line Installer

The same installer runs through `npx` (Node 18+) or `curl` (bash only); options are identical.

```bash
npx -y github:igmrrf/agentic skills --global
npx -y github:igmrrf/agentic#v1.2.0 skills --global --skill codinary,tdd
```

```bash
# All skills, global, for Claude Code (~/.claude/skills) and other agents (~/.agents/skills)
curl -fsSL https://raw.githubusercontent.com/igmrrf/agentic/refs/heads/main/scripts/install-skills.sh | bash -s -- --global

# Only some skills, Claude Code only
curl -fsSL https://raw.githubusercontent.com/igmrrf/agentic/refs/heads/main/scripts/install-skills.sh | bash -s -- --global --skill codinary,tdd --agent claude

# Into a project (writes .claude/skills and .agents/skills; commit them to share)
curl -fsSL https://raw.githubusercontent.com/igmrrf/agentic/refs/heads/main/scripts/install-skills.sh | bash -s -- --target /path/to/my-project

# Pin to a tag, branch, or commit
curl -fsSL https://raw.githubusercontent.com/igmrrf/agentic/refs/heads/main/scripts/install-skills.sh | bash -s -- --global --ref v1.2.0
```

| Option | Effect |
| :--- | :--- |
| `-g, --global` | Install into your home directory instead of a project |
| `-t, --target <dir>` | Project to install into (default: current directory) |
| `-s, --skill <names>` | Comma-separated skills, or `all` (default) |
| `-A, --agent <names>` | `claude` (`.claude/skills`), `agents` (`.agents/skills`), or `all` (default) |
| `-r, --ref <ref>` | Git branch, tag, or commit to download (default `main`) |
| `-f, --force`, `--update` | Replace existing installs — rerun with this to update |
| `-u, --uninstall` | Remove the selected skills |
| `--link` | Symlink to a local clone instead of copying (local clone only) |
| `-l, --list` / `-d, --dry-run` | List skills / preview changes |

Restart Claude Code (or start a new session) after installing, then check with `/skills`.

---

### Method 4: Project Bootstrapping via `init.sh`

`init.sh --skills` runs the installer against the target project alongside the language standards:

```bash
./scripts/init.sh --skills
npx -y github:igmrrf/agentic init --lang=typescript --skills
curl -fsSL https://raw.githubusercontent.com/igmrrf/agentic/refs/heads/main/scripts/init.sh | bash -s -- --lang=typescript --skills --target .
```

---

### Method 5: Local Clone with Live Symlinks

If you cloned this repository and want `git pull` to update your skills:

```bash
./scripts/install-skills.sh --list
./scripts/install-skills.sh --global --link
```

---

### Method 6: Workspace Auto-Discovery (Antigravity)

Antigravity can load skills straight from a repository through `.agents/skills.json`. This repository ships one pointing at `skills/`:

```json
{
  "entries": [
    {
      "path": "skills"
    }
  ]
}
```

To use the skills everywhere without copying, add the absolute path of your clone's `skills/` folder to `~/.gemini/config/skills.json` in the same format. Claude Code ignores this file; use Methods 1–5 for Claude Code.

---

## Agent Runtime Compatibility

Agent Platform | Where Skills Are Read From | How to Install
:--- | :--- | :---
**Claude Code** | `~/.claude/skills/`, `<project>/.claude/skills/`, plugins | Method 1, 2, 3, 4, or 5
**Google Antigravity** | `~/.agents/skills/`, `<project>/.agents/skills/`, `.agents/skills.json` | Method 2, 3, or 6
**Codex** | `~/.agents/skills/`, `<project>/.agents/skills/` (uses `agents/openai.yaml` metadata) | Method 2 or 3
**Cursor / Windsurf / Cline** | Depends on the tool version | Method 2

---

## Maintaining the Skills

- Add a skill as `skills/<name>/SKILL.md` and list it under `skills` in [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json). CI fails if the two disagree.
- Bump `version` in `marketplace.json` when you release changes so plugin users get the update, and tag the release (`git tag vX.Y.Z`) so `--ref` users can pin it.
- Bump `version` in `package.json` alongside `marketplace.json`.
- Run `scripts/test-install-skills.sh` and `scripts/test-init.sh` (set `TEST_BASH=/bin/bash` on macOS to test bash 3.2) and `claude plugin validate --strict .` before pushing.
