# Using Agentic

## First session

After [installation](installation.md), reload your harness and invoke setup:

| Harness | Setup | Delivery |
| --- | --- | --- |
| Claude Code plugin | `/agentic:setup` | `/agentic:codinary <task>` |
| Codex skills | `$setup` | `$codinary <task>` |
| Pi | `/skill:setup` | `/skill:codinary <task>` |
| Antigravity CLI | `/setup` | `/codinary <task>` |
| Other skill-capable harnesses | Ask “Use setup to apply Agentic standards” | Ask “Use codinary to implement this task” |

Plugin namespaces and menus depend on the host version. If a command is absent, inspect its skills list and name the installed skill in your request. OpenCode exposes a native skill tool; Windsurf/Cascade also supports `@skill-name`.

## Project setup

Initialize directly without starting an agent:

```bash
npx -y github:igmrrf/agentic init --lang=go --agent codex --dry-run
npx -y github:igmrrf/agentic init --lang=go --agent codex
```

The initializer copies standards, tool configurations, and CI workflows, preserving existing files. Codex, Pi, OpenCode, agy, Antigravity, Amp, and `agents` select `AGENTS.md`; Claude uses `CLAUDE.md`; other named harnesses use their own rules formats. Omitting `--agent` generates all formats.

```bash
npx -y github:igmrrf/agentic init --lang=python --agent claude,cursor
npx -y github:igmrrf/agentic init --lang=all --no-ci
npx -y github:igmrrf/agentic init --lang=go --skills
npx -y github:igmrrf/agentic init --lang=go --force --backup
```

`--skills` adds shared Claude and `.agents` project skills. Select native skill directories separately with the skills installer. `--force --backup` replaces existing configurations and saves `.bak` copies. `--with-starter` adds sample code. Run `init --help` for all options.

Detection uses project manifests when `--lang` is omitted. Noninteractive scripts should pass it explicitly. See the [standards reference](standards.md) for language baselines and architecture choices.

## Everyday requests

Give the workflow a clear scope and observable result:

```text
Use codinary to add CSV export for the current filtered results.
Keep the existing column order and include a header row.

Use diagnosing-bugs to explain this timeout under load, then fix the
cause and verify it with a regression test.

Use code-review to review my branch against main and the acceptance
criteria in issue 42.
```

Codinary coordinates implementation and verification. TDD guides behavior tests; diagnosing-bugs investigates causes; code-review checks standards and requested behavior. The [skill catalog](../skills/README.md) lists all commands and their prerequisites.

## Requirements and design work

Use `grilling` to clarify uncertain requirements. For substantial architecture work, use `egm-brainstorm` for alternatives, `egm-draft` for a design, and `egm-review` for independent critique. Codinary remains the implementation entry point.

EGM creates and reviews design documentation. A clean review is separate from human approval. Approved-design intake has a signed handoff contract; ordinary implementation requests do not need it. See [architecture](integration/architecture.md) and [handoff requirements](integration/handoff-contract.md).

## Optional workflows

Invoke `caveman` explicitly for a terse conversational voice; `normal mode` disables it. Full technical artifacts and evidence remain complete.

Use `security-audit` for focused guidance, or explicitly request a full audit for its six-phase process. Findings do not authorize fixes. See [the catalog](../skills/README.md#caveman-and-security-audit).

## Verification requirements

Installed files establish availability. Independent reviews need fresh workers; live checks need a browser, device, or relevant runtime. Unavailable required checks are reported as blocked. See [compatibility evidence](integration/compatibility-matrix.md) for host runtime coverage.
