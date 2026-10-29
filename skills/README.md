# Agentic Skills Library

Modular, production-grade agent skills designed for autonomous pair programming, multi-agent orchestration, test-driven development, independent QA review, and software architecture.

---

## Included Skills

Skill | Focus | Description
:--- | :--- | :---
[`setup`](./setup/SKILL.md) | Project Setup | Applies the Agentic standards to the current project: previews with a dry run, picks the language and agent rules, then writes `CLAUDE.md`, linter configs, and CI. Invoke explicitly with `/agentic:setup` (plugin) or `/setup`.
[`codinary`](./codinary/SKILL.md) | End-to-End SDE Delivery | One entry point for scoped implementation, behavior tests, live web/mobile/desktop verification, production readiness, and independent QA, with at most two fix cycles and explicit verification blockers.
[`code-review`](./code-review/SKILL.md) | Independent QA Review | Dual-axis review comparing changes against documented repo standards and issue specs in parallel subagents.
[`tdd`](./tdd/SKILL.md) | Test-Driven Development | Red &rarr; green discipline; refactoring belongs to review, seam discovery, interface-driven verification, and mock containment.
[`diagnosing-bugs`](./diagnosing-bugs/SKILL.md) | Systematic Debugging | Scientific root-cause isolation, feedback loop construction, and bisection for hard bugs and performance regressions.
[`codebase-design`](./codebase-design/SKILL.md) | Deep Module Architecture | Shared vocabulary for designing deep interfaces, identifying seam locations, and applying "design-it-twice".
[`domain-modeling`](./domain-modeling/SKILL.md) | Domain Models & ADRs | Domain-driven vocabulary generation, Architecture Decision Records (ADRs), and context boundary mapping.
[`caveman`](./caveman/SKILL.md) | Optional Presentation | Explicit conversational mode, session persistence and truthful status; technical payload and full artifacts preserved.
[`security-audit`](./security-audit/SKILL.md) | Security Guidance & Audits | Focused guidance or an explicitly requested six-phase independent audit with coverage, validators and verified records.

---

## Installing the Skills

Start with the [installation guide](../docs/installation.md) for native Claude/Codex/Antigravity plugins, Pi packages, and named targets for twelve coding harnesses. It covers project and global scope, updates, removal, local links, and troubleshooting.

```bash
npx -y github:igmrrf/agentic skills --global --agent codex
npx -y github:igmrrf/agentic skills --agent opencode --skill codinary,tdd
```

The [usage guide](../docs/usage.md) explains invocation and project setup. Installation establishes discoverability; host tools and independent-worker capabilities determine runtime coverage. See the [compatibility matrix](../docs/integration/compatibility-matrix.md).

## Maintaining the Skills

Add skills to [registry/skills.json](../registry/skills.json), then generate and check metadata. Versions come from `package.json`; plugin manifests and catalogs are generated. Follow the [development and verification guide](../docs/development.md) before release.

## Requirements and EGM design capabilities

| Command | Purpose |
| --- | --- |
| grilling (legacy installer alias grill-me) | One requirements interview with traceable criteria |
| egm-brainstorm | Problem framing and architectural alternatives |
| egm-draft | Feature specification and detailed implementation plan |
| egm-review | Five-stage fresh review or selected preset/stage |
| egm-review-loop | Bounded antagonistic design review |
| egm-resolve | Traceable dispositions and authorized document repairs |
| egm-bootstrap | Bounded source-grounded contracts/blueprints |
| egm-drift-report | Architecture/documentation drift findings |

Codinary owns implementation and independent source/runtime QA. EGM owns design/documentation only. A clean design review is not human approval. Small direct work remains unchanged; complex approved-design intake is optional and fails closed when invalid. See the [architecture/routing table](../docs/integration/architecture.md), [handoff contract](../docs/integration/handoff-contract.md) and [compatibility evidence](../docs/integration/compatibility-matrix.md).

All seven EGM skill directories and Codinary's optional intake contain generated self-contained bundles. Install one EGM skill through any directory-copy channel and its complete personas/rubrics/adapters/notices remain available. Third-party selected TDD installation must also include codebase-design if the tool ignores dependencies.txt. The native installer resolves dependency closure; uninstall keeps dependencies and existing workspace configuration.

Use `node bin/agentic.js registry list` for exact contracts, permissions, failure behavior and aliases. EGM presets interactive/uninterrupted run 5–9; feature_spec runs 5–8; implementation runs 9; individual string stages 5–9 remain callable. Claude plugin users have nine thin personas registered once; standalone copies use a fresh general agent loading the canonical persona. No duplicate plugin identity is registered. Read-only restrictions are advisory unless enforced by the host.

The pinned-source inventory, conflicts and [provenance](../docs/integration/upstream-provenance.md) explain selective integration. Agentic/Matt MIT and EGM Apache-2.0 notices ship with copies; EGM is not an officially supported Google product.

## Caveman and Security Audit

Both install independently with no sibling skill dependency. Select `--skill caveman` or `--skill security-audit` through the existing installer or npm launcher; local links, archive installs, directory copies and marketplace discovery retain their local resources and notices. Native packages discover the canonical `skills` directory. Third-party `npx skills` selection and native host invocation require their own runtime verification.

Invoke `/caveman` or `/agentic:caveman` explicitly; `/caveman status` reads existing mode without enabling it. `stop caveman` or `normal mode` disables it. Only the core voice ships: no alternate voice aliases, proxy, hooks, telemetry, CLI or compression infrastructure. Host communication, exact technical facts, full persisted artifacts, audit evidence and authorization take precedence; no measured token-savings claim is made.

Security Audit remains guidance by default. Explicit codebase audits, comprehensive reviews, pen tests or requested report artifacts use all six phases. Its standalone directory includes every phase, attack-class companion, schema, validator, upstream test and Cloudflare MIT notice. Validators require Node.js >=18 with no additional npm dependency. Run `npm run test:security-audit` to exercise the vendored suites.

Full audits retain independent validation, additive coverage and source freshness. Missing fresh delegation or any required OS sandbox/promotion control remains an explicit blocker. Installed metadata does not establish runtime support. Findings never authorize automatic remediation or replace Codinary's source QA, two-fix limit, verdicts or release authorization. See the [standalone boundary](./security-audit/INTEGRATION.md), [integration decisions](../docs/integration/caveman-security-audit.md), and [observed checks](../docs/integration/caveman-security-verification.md).

## Licenses and provenance

Agentic's own work is MIT. Matt Pocock adaptations retain their [MIT notice](../licenses/Matt-Pocock-MIT.txt). Google EGM-derived material retains [Apache-2.0](../licenses/Google-EGM-Apache-2.0.txt) and modification notices; EGM is not an officially supported Google product.

Caveman retains its current [Apache-2.0](caveman/LICENSE-Upstream-Apache-2.0.txt), historical [MIT](caveman/LICENSE-Upstream-MIT.txt), and applicable [NOTICE](caveman/NOTICE.txt). Security Audit retains [Cloudflare MIT](security-audit/LICENSE-Upstream-MIT.txt). Complete notices accompany standalone installs. Exact sources and digests are in [provenance](../docs/integration/upstream-provenance.md). No upstream endorsement is implied.
