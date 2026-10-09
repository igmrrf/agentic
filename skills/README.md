# Agentic Skills Library

Modular, production-grade agent skills designed for autonomous pair programming, multi-agent orchestration, test-driven development, independent QA review, and software architecture.

---

## Included Skills

Skill | Focus | Description
:--- | :--- | :---
[`codinary`](./codinary/SKILL.md) | Multi-Agent Orchestration | Bounded three-step loop: fresh implementer subagent &rarr; independent QA reviewer &rarr; fixer &rarr; re-review. Prevents context degradation across long coding sessions.
[`code-review`](./code-review/SKILL.md) | Independent QA Review | Dual-axis review comparing changes against documented repo standards and issue specs in parallel subagents.
[`tdd`](./tdd/SKILL.md) | Test-Driven Development | Red &rarr; green &rarr; refactor discipline, seam discovery, interface-driven verification, and mock containment.
[`diagnosing-bugs`](./diagnosing-bugs/SKILL.md) | Systematic Debugging | Scientific root-cause isolation, feedback loop construction, and bisection for hard bugs and performance regressions.
[`codebase-design`](./codebase-design/SKILL.md) | Deep Module Architecture | Shared vocabulary for designing deep interfaces, identifying seam locations, and applying "design-it-twice".
[`domain-modeling`](./domain-modeling/SKILL.md) | Domain Models & ADRs | Domain-driven vocabulary generation, Architecture Decision Records (ADRs), and context boundary mapping.

---

## How Others Can Install and Use These Skills

There are multiple ways for other developers, teams, and CI environments to install and use these skills depending on their agent runtime and setup.

### Method 1: One-Line Remote Installer (Fastest)

Anyone can install the skills directly from the remote repository without cloning:

```bash
# Install all skills globally for all agent sessions (~/.agents/skills)
curl -fsSL https://raw.githubusercontent.com/igmrrf/Agentic/refs/heads/main/scripts/install-skills.sh | bash -s -- --global

# Install only the codinary skill globally
curl -fsSL https://raw.githubusercontent.com/igmrrf/Agentic/refs/heads/main/scripts/install-skills.sh | bash -s -- --skill codinary --global

# Install skills into a specific project repository
curl -fsSL https://raw.githubusercontent.com/igmrrf/Agentic/refs/heads/main/scripts/install-skills.sh | bash -s -- --target /path/to/my-project
```

---

### Method 2: Project Bootstrapping via `init.sh`

When bootstrapping standards into a new or existing project, pass `--skills` to scaffold both language rules and engineering skills in one pass:

```bash
# Local execution
./scripts/init.sh --skills

# Remote execution
curl -fsSL https://raw.githubusercontent.com/igmrrf/Agentic/refs/heads/main/scripts/init.sh | bash -s -- --lang=typescript --skills --target .
```

---

### Method 3: Local Installation Script

If the repository is cloned locally:

```bash
# List all available skills
./scripts/install-skills.sh --list

# Install all skills globally
./scripts/install-skills.sh --global

# Install specific skills globally
./scripts/install-skills.sh --skill codinary,tdd --global

# Install as live symlinks (updates automatically when repo pulls)
./scripts/install-skills.sh --global --link

# Install into a local project repository
./scripts/install-skills.sh --target /path/to/my-project
```

---

### Method 4: Workspace Auto-Discovery (Zero-Install for Teams)

For teams sharing a repository:

1. Copy or submodule the `skills/` folder into your repository.
2. Commit `.agents/skills.json` at the repository root:

```json
{
  "entries": [
    {
      "path": "skills"
    }
  ]
}
```

3. Any team member who opens the repository in Antigravity or compatible agents automatically has all skills active without any manual installation.

---

### Method 5: Global Manifest Registration (No Copying Required)

For Antigravity users who have cloned this repository once on their machine and want the skills available in every project without copying files:

Add an entry to `~/.gemini/config/skills.json`:

```json
{
  "entries": [
    {
      "path": "/path/to/Agentic/skills"
    }
  ]
}
```

---

## Agent Runtime Compatibility

Agent Platform | Installation Location | Automatic Discovery
:--- | :--- | :---
**Google Antigravity** | `~/.agents/skills/`, `.agents/skills/`, or `.agents/skills.json` | &check; Native
**Claude Code** | `~/.agents/skills/` or `~/.claude/skills/` | &check; Native
**Cursor** | `.agents/skills/` (referenced via rules) | &check; With rules
**Windsurf / Cline** | `.agents/skills/` (referenced via rules) | &check; With rules
