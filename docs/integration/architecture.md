# Unified Agentic architecture

Agentic previously offered standards/setup and seven specialists, while Matt's collection and EGM exposed overlapping workflows, separate plugin identities and resource paths. The local code-review also required a missing upstream setup command. Users could install only an EGM skill and omit its external personas/rubrics, or confuse an AI review with permission to implement. This integration gives each responsibility one owner while keeping standalone entrypoints.

Agentic defines engineering standards and seven-language initialization. Requirements specialists clarify intent and domain terms. EGM develops and independently reviews architecture. Codinary alone delegates implementation, independent QA, bounded fixes, verification and authorized release. Continuous improvement remains optional. Existing [Codinary invariants](codinary-invariants.md) and [audit](existing-system-audit.md) define protected behavior; imported guidance cannot override them.

## Before and after

A small bug request still goes directly to Codinary: establish a reproducer, write criteria/checks, delegate source work, independently review, and use the existing fix budget. EGM adds no mandatory artifact to that path.

A complex migration can now move through grilling requirements, EGM brainstorm/draft, fresh five-stage design review, explicit human approval and validated Codinary intake. Signed criteria retain their IDs in the brief, verification matrix and ledger. Source QA and release authorization remain separate from architectural approval.

| Responsibility | Canonical implementation |
| --- | --- |
| Standards, configs, setup | CODING.md, seven language directories, scripts/init.sh and scripts/lib/init |
| Requirements | skills/grilling, alias grill-me; domain-modeling CONTEXT/ADR conventions |
| Architecture and design review | Seven skills/egm-* entrypoints, framework/egm resources |
| Delivery, implementation delegation, independent QA/release | skills/codinary and existing roles/verification references |
| Behavioral verification specialists | Existing tdd, diagnosing-bugs, code-review |
| New metadata gap | registry/skills.json, lib/registry.mjs, scripts/registry.mjs |
| New approved-design gap | lib/handoff, bin/handoff.mjs; optional Codinary intake reference |

## Alternatives and selected composition

| Alternative | Decision and trade-off |
| --- | --- |
| Wholesale repository merge | Rejected: duplicate delivery owners, plugin identities and conflicting conventions |
| Copy EGM skills only | Rejected: drops personas, standards, templates and adapters |
| Duplicate upstream/local specialists | Rejected: divergent behavior and ambiguous discovery |
| Shared installed sibling resources only | Rejected for EGM: third-party selected-skill copies omit dependency paths |
| Canonical resources plus generated self-contained bundles | Chosen: all existing install channels retain resources; generated duplication costs space and is byte-checked |
| Unsigned approved metadata/trusted-host assertion | Insufficient for project-artifact attacker; appropriate only if every artifact writer is trusted to assert human consent |
| Detached signature, caller-pinned key/current assertion | Chosen: small built-in crypto verifier, no automatic signer or mutable catalog; requires human trust management and stable snapshots |

## Concrete resource layout

Pinned EGM `agents/*.md` maps to `framework/egm/agents/*.md`. All nine personas remain: zoom_out, comprehension, design_critic, structural, style, implementation_readiness, codebase_details, synthesizer and bootstrap_orchestrator. Canonical reviewers request read-only access; synthesizer is a bounded design coordinator, bootstrap coordinator is documentation-only. Enforcement still requires the actual host. The single Agentic plugin registers nine thin generated Claude wrappers exactly once. Native wrappers declare scoped tools and omitClaudeMd:true; standalone copies use fresh general-agent fallback. No EGM plugin identity is imported.

Pinned `resources/document_standards/*` and resources README/execution guidance map to `framework/egm/resources/`; the five complete rubrics remain. Adapted runtime guides are framework/egm/docs/{runtime,codex,claude,harnesses}.md. Stage/preset routing lives in docs/stages.md. The upstream icon is framework/egm/icon.svg. Each command retains its own assets/icon.svg; draft design_doc.md and bootstrap templates/schema stay under their skill's references/. Exact imported source/destination digests and modifications are in upstream-provenance.json.

For each bundled skill, framework/egm maps directly to `skills/<id>/bundle` (never bundle/framework/egm). Bundle agents, resources and docs are siblings, so all relative paths keep their canonical layout. Tooling maps to bundle/lib/handoff and bundle/bin/handoff.mjs; complete third-party notices map to bundle/licenses. The [registry contract](skill-registry.md) specifies every generated output and its drift check. Canonical definitions are edited once and generated; no resource-only phantom skill appears in discovery.

## Design command and stage routing

| Command | Boundary |
| --- | --- |
| egm-brainstorm | Problem framing, alternatives, concepts brief |
| egm-draft | Self-contained feature specification and detailed plan |
| egm-review | Five-stage review or selected preset/stage |
| egm-review-loop | Bounded fresh-review/resolution iterations |
| egm-resolve | Traceable finding dispositions and authorized design repairs |
| egm-bootstrap | Bounded source-grounded documentation contracts/blueprints |
| egm-drift-report | Report architecture/documentation divergence |

Stages 5–9 preserve Initial Zoom Out, Comprehension, Design Critique, Intermediate Zoom Out and Implementation Readiness. interactive/uninterrupted select all five; feature_spec selects 5–8; implementation selects 9; individual numeric string presets select one stage. Comprehension retains full paraphrases. Independent contexts, reports, allowlists and actual completion are mandatory; no fresh dispatch means not_run/blocked. Read-only policies are advisory when host cannot enforce tools. The cap leaves unresolved findings unresolved; it never fabricates human acceptance.

## Routing and change control

Route by uncertainty, boundary type/count, security/privacy, data integrity, reversibility, operational risk and user intent. Localized understood work goes direct; medium ambiguity uses targeted requirements discovery; high-risk architectural work uses EGM then human approval. Design-only/review-only requests stop at their artifacts. Implementation-only scope remains explicit. Specialists return to their caller without recursively launching delivery.

The handoff uses an immutable versioned payload, detached human receipt and caller-selected external key/current assertion. State transitions return JSON instead of storing a mutable catalog. Approved intake validates actual repository identity, all referenced hashes, selected review coverage and signature/current binding. Any signed-content byte change invalidates approval. [handoff-contract.md](handoff-contract.md) and [security-model.md](security-model.md) define exact types, guards, signing representation and limitations.

## Stable implementation checkpoints and evidence

1. Capture baseline and protected Codinary edits; run existing installer/init/70 characterization/recovery gates. Audit/inventory/select before imports. Gate: preserved baseline and recorded dispositions.
2. Add strict handoff/registry pure contracts and tests without exposing new discovery. Add canonical EGM resources/notices. Gate: API/CLI security and registry parser tests.
3. Complete entrypoints/templates, generate self-contained bundles/metadata/marketplace atomically as one reviewable workspace change. Gate: registry check and selected installed-copy consumer. No incomplete resource-only command is a checkpoint.
4. Add optional Codinary routing/intake and documentation/CI. Gate: package consumer, existing regressions, representative isolated projects and protected-content checks.
5. Fresh runtime probe against final installed assets and independent source QA. Gate: observable native traces/results, with unsupported hosts explicitly blocked/unverified. Neither initial proposal review nor a schema pass constitutes this final gate.

This order describes the chosen testable dependency boundaries, not a claim that each intermediate file write was released. No commit, publishing, deployment or global installation is part of this integration. Final results and remaining checks belong in integration-report.md.
