# Agentic

Agentic is a portable engineering system for AI-assisted software development: coding standards, project setup, requirements discovery, architecture and design review, implementation, testing, security audits, and production verification.

It brings together **17 reusable agent skills**, standards and toolchains for **Rust, Go, TypeScript, Python, Lua, Swift, and Kotlin**, and installation paths for **12 coding harnesses**. Use the standards in an existing repository, install individual skills, or follow the connected workflow from an idea through verified delivery.

## What Agentic covers

| Area | What it provides | Entry point |
| --- | --- | --- |
| Engineering foundations | Universal coding rules, language-specific standards, architecture blueprints, formatter/linter configurations, and CI templates. | [Language standards](docs/standards.md), [universal rules](CODING.md) |
| Project setup | Apply standards and agent instructions to a repository, preview changes, preserve existing files, and optionally add starter code. | [`setup`](skills/setup/SKILL.md), `agentic init` |
| Requirements and domain design | Clarify decisions and acceptance criteria, establish domain vocabulary and ADRs, and design module boundaries and interfaces. | [`grilling`](skills/grilling/SKILL.md), [`domain-modeling`](skills/domain-modeling/SKILL.md), [`codebase-design`](skills/codebase-design/SKILL.md) |
| Architecture and design review | Explore alternatives, write specifications and implementation plans, run independent design critiques, and resolve findings through bounded review cycles. | `egm-brainstorm`, `egm-draft`, `egm-review`, `egm-review-loop`, `egm-resolve` — [EGM workflows](skills/README.md#requirements-and-egm-design-capabilities) |
| Codebase documentation | Create source-grounded architecture documentation and report divergence between the code and its documented design. | [`egm-bootstrap`](skills/egm-bootstrap/SKILL.md), [`egm-drift-report`](skills/egm-drift-report/SKILL.md) |
| Implementation and delivery | Coordinate scoped implementation, independent QA, automated tests, live product checks, production readiness, bounded fixes, and authorized release. | [`codinary`](skills/codinary/SKILL.md) |
| Testing, debugging, and source review | Develop behavior tests, reproduce and diagnose failures, and review changes against both coding standards and the requested behavior. | [`tdd`](skills/tdd/SKILL.md), [`diagnosing-bugs`](skills/diagnosing-bugs/SKILL.md), [`code-review`](skills/code-review/SKILL.md) |
| Security | Focused security guidance or an explicitly requested six-phase audit with coverage records, independent validation, and structured findings. | [`security-audit`](skills/security-audit/SKILL.md) |
| Conversational presentation | An optional terse voice that preserves technical facts, complete artifacts, and verification evidence. | [`caveman`](skills/caveman/SKILL.md) |
| Design handoffs and evidence | Validate approved-design artifacts, human signatures, source fingerprints, and review coverage before optional design-to-delivery intake. | [`agentic handoff`](docs/integration/handoff-contract.md), [security model](docs/integration/security-model.md) |

The [skill catalog](skills/README.md) explains individual commands. The [architecture guide](docs/integration/architecture.md) explains how their responsibilities connect.

## Install in your coding harness

Choose one installation method for each harness.

### Claude Code

Run inside Claude Code:

```text
/plugin marketplace add igmrrf/agentic
/plugin install agentic@agentic
```

Then run `/agentic:setup` in your project.

### Codex, OpenCode, and other harnesses

Run the matching command in your terminal. The installer needs Node.js 18+ and Bash (macOS, Linux, or Windows with WSL/Git Bash).

| Harness | Install for all your projects |
| --- | --- |
| **Codex** | `npx -y github:igmrrf/agentic skills --global --agent codex` |
| **OpenCode** | `npx -y github:igmrrf/agentic skills --global --agent opencode` |
| **Antigravity CLI (agy)** | `agy plugin install https://github.com/igmrrf/agentic` |
| **Antigravity App / IDE** | `npx -y github:igmrrf/agentic skills --global --agent antigravity` |
| **Gemini CLI** | `npx -y github:igmrrf/agentic skills --global --agent gemini` |
| **Cursor** | `npx -y github:igmrrf/agentic skills --global --agent cursor` |
| **GitHub Copilot** | `npx -y github:igmrrf/agentic skills --global --agent copilot` |
| **Cline** | `npx -y github:igmrrf/agentic skills --global --agent cline` |
| **Windsurf** | `npx -y github:igmrrf/agentic skills --global --agent windsurf` |
| **Amp** | `npx -y github:igmrrf/agentic skills --global --agent amp` |

### Pi

```bash
pi install git:github.com/igmrrf/agentic
```

Reload your harness or start a new session after installation. In Codex, select `$setup`; in Pi, run `/skill:setup`. In other harnesses, ask: **“Use the setup skill to apply Agentic standards to this project.”**

Prefer a project install, selected skills, a Codex plugin marketplace, or a clone? See the [installation guide](docs/installation.md), including updates, removal, and exact install locations.

## Use it

For a focused feature or bug, start with Codinary and a concrete result. For uncertain requirements, use Grilling first. For complex architectural work, use EGM to develop and review a design before handing implementation to Codinary. Design and review skills can also be used independently.

```text
Use codinary to add password reset. Tokens must expire after 30 minutes.
Use diagnosing-bugs to investigate this failing test.
Use code-review to review the changes since main.
```

Codinary owns implementation and delivery verification; EGM owns architecture and design documentation. A clean design review and human approval are separate. Small tasks can go directly to delivery, while approved-design intake uses the explicit handoff contract.

Claude plugin commands use `/agentic:codinary`. Codex skills use `$codinary`; Pi uses `/skill:codinary`. OpenCode loads skills through its skill tool when you name them in your request. The [usage guide](docs/usage.md) covers common workflows and harness differences.

## Apply standards without installing skills

Run this from your project:

```bash
npx -y github:igmrrf/agentic init --lang=typescript --agent codex
```

Replace `typescript` with `rust`, `go`, `python`, `lua`, `swift`, `kotlin`, or `all`. Omit `--agent` to generate rules for all supported agents, including `AGENTS.md`. Existing files are preserved; add `--dry-run` to preview changes.

The initializer writes coding instructions, formatter/linter configurations, and GitHub Actions workflows. Add `--no-ci` to skip workflows, or `--with-starter` when you want starter code. See [project setup](docs/usage.md#project-setup) for examples.

## How the codebase fits together

| Location | Responsibility |
| --- | --- |
| [`CODING.md`](CODING.md) and the seven language directories | Standards, architecture examples, language toolchains, and starter implementations. |
| [`templates/`](templates/) | Agent instruction templates and language-specific CI workflows. |
| [`bin/`](bin/) and [`scripts/`](scripts/) | Project initialization, harness installation, registry generation, handoff commands, and packaging validation. |
| [`skills/`](skills/) | The 17 installable workflows, their references, scripts, and standalone resource bundles. |
| [`framework/egm/`](framework/egm/) | Canonical design-review personas, rubrics, runtime adapters, and documentation templates. |
| [`registry/`](registry/) | Skill identities, dependencies, invocation policies, and metadata used to generate consistent installable packages. |
| [`lib/`](lib/) | Registry validation and the contracts and cryptographic checks behind approved-design handoffs. |
| [`tests/`](tests/) | Initializer characterization, installation lifecycle, packaging, integration, and handoff regression coverage. Additional validator and recovery tests live with their skills. |
| [`docs/`](docs/) and [`licenses/`](licenses/) | Usage and technical guides, compatibility evidence, security boundaries, upstream provenance, and retained licenses. |

Native plugins and packages expose the same canonical skills. Generated manifests, metadata, and self-contained bundles are checked for drift so selected-skill installs retain their required resources. See [development and verification](docs/development.md) for the checks and release process.

## Further reading

- [Installation](docs/installation.md): native plugins, project/global skills, updates, removal, and troubleshooting.
- [Usage](docs/usage.md): setup, delivery, debugging, and review examples.
- [Skill catalog](skills/README.md): individual workflows and their requirements.
- [Language standards](docs/standards.md): language guides, configuration files, and architecture patterns.
- [Development and verification](docs/development.md): packaging, validation, tests, and release checks.
- [Integration architecture](docs/integration/architecture.md): contracts, security boundaries, and compatibility evidence.

Installation makes the workflows discoverable. Independent reviews and live verification also need the corresponding tools and fresh subagents in your harness; unavailable checks are reported as blocked.

Agentic is MIT-licensed, with adapted materials retaining their upstream MIT and Apache-2.0 notices. See the [license and provenance details](skills/README.md#licenses-and-provenance). No upstream endorsement is implied.
