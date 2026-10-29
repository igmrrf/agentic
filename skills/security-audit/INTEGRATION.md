# Agentic integration boundary

Agentic owns engineering standards and initialization. Codinary is the sole engineering delivery orchestrator. EGM owns architectural design and independent design review. This skill supplies security guidance and its specialized audit workflow. Caveman controls optional conversational presentation only.

## Choose the requested scope

Guidance mode supports security questions and focused reviews within an existing task. Loading the skill does not authorize a full audit, audit artifacts, remediation, or release. Ordinary engineering work does not require an audit. Full audits require the explicit triggers in `SKILL.md`; ambiguous scope is clarified before creating audit files or launching the complete workflow.

## Keep audit and delivery evidence separate

Use the upstream external `security-audit-skill/<repo>/run-<N>` namespace with a new unused run number, complete records, and additive prior-run checks. Preserve the upstream exception for an explicitly selected, fully ignored in-target output directory. Resolve permission constraints with an authorized external path; never silently fall back to a delivery run directory or another agent's scratch area.

When an audit contributes to Codinary, link its absolute run path, exact source state, profile, scope, coverage gaps, and verified records from the delivery brief/ledger. Never overwrite Codinary's `brief.md`, `ledger.md`, `review-<n>.*`, `response-<n>.json`, `handoff-fix-<n>.md`, `release-review-<attempt>.*`, or `summary.md`. Keep audit source-freshness checks after changes, including dirty worktree content, separate from delivery evidence.

Codinary retains delivery scope, source-change ownership, acceptance criteria, review-only behavior, fresh independent read-only QA, source-state evidence, at most two fix cycles over the whole delivery run, and action-specific release authorization. Audit findings recommend fixes; they do not authorize remediation. The audit does not edit target source. Separately authorized remediation goes through Codinary; audit iterations never reset its fix budget. EGM design review, audit validation, and delivery QA have distinct contracts. An audit verifier does not automatically satisfy independent delivery QA.

Audit `confirmed`, `needs_validation`, and `rejected` records retain their upstream meanings. They do not replace Codinary verdicts. Zero confirmed findings proves neither exhaustive coverage nor a delivery pass. If an audit is required by acceptance criteria, missing required audit evidence remains visible in the delivery matrix and blocks completion under Codinary's existing rules. Preserve independently verified records and unresolved ledger candidates without inventing a severity or confirmation.

## Require real capabilities

Map upstream research/general roles to actual fresh-context delegation. Use a host's no-history option explicitly (for example `fork_turns: "none"`), with the bounded reading/prompt inputs specified by the phase. Queue or batch independent roles within the host's capacity; never reuse a hunter as its independent reviewer. A host's discovery metadata, installed directory, named persona, or schema check is not evidence of role execution.

If fresh delegation is missing, disclose the exact role and capability gap. Do not simulate independent reviewers in the parent context. In full audit mode, record `run_status: "incomplete"` with the exact reason in `run-metadata.json` and disclose it in `REPORT.md`; preserve completed work and unvalidated ledger candidates, and never manufacture findings or a complete run. If the output path itself is unavailable, report that blocker before any audit work.

Target-controlled builds, tests, fixtures, browsers, emulators, and processes require every OS-enforced control in `SKILL.md`. Prompts and generic workspace restrictions are not enforcement. No external network, empty allowlisted environment, read-only target/toolchain, scratch-only writes, and explicit CPU, memory, process, file-size, disk, and wall-clock limits are mandatory. If any control is missing, do not execute target code. Preserve the source-grounded lead with its exact blocker and safe validation plan; independent record validation still applies before `findings.json` inclusion. Missing delegation leaves an unvalidated ledger candidate, not a fabricated `needs_validation` finding.

Retained execution evidence also requires the upstream trusted parent-only, descriptor-based promotion procedure. Missing promotion controls block use of scratch output as evidence. Run both shipped validators when required; validator success establishes structural consistency only. Material record changes require the upstream fresh re-verification, even if a schema check passes.

Caveman may shorten surrounding conversational updates. Keep full audit prompts, warnings, authorization questions, source traces, JSON, coverage, reports, approval material, and required verification output. Host-required communication takes precedence. No automatic fixes, delivery passes, or release authorization follow from this skill.

## Distribution

This standalone directory includes every upstream phase, attack-class companion, schema, validator, and validator test at `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`, plus the Cloudflare MIT notice and generated Agentic metadata/license. It requires Node.js >=18 to run validators and no upstream checkout or additional npm dependency. Installation/discovery is supported by Agentic's existing channels; native audit orchestration and sandbox enforcement must be verified on the actual host.
