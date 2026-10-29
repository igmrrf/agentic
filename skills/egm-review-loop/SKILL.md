---
name: egm-review-loop
license: Apache-2.0
description: "Run a bounded antagonistic document review and resolution loop."
disable-model-invocation: true
---

> Modified by Agentic, 2026-10-28: adapted ownership, bounded execution, runtime permissions, local paths, and human approval. Derived from Google EGM (Apache-2.0).

# egm-review-loop

Read [execution boundary](bundle/resources/execution_instructions.md) before starting. This capability owns design/documentation only.

1. Require TargetFile, SemanticTarget, Reviewers, Standards and an explicit GoldfishContext allowlist. Resolve persona shortnames under bundle/agents and standards under bundle/resources/document_standards. Custom paths require explicit authorization.
2. Re-read semantic scope each round. Dispatch fresh reviewers through bundle/docs/runtime.md; the parent uses direct dispatch if nesting is unavailable. Persist raw reports/status and stable reviewer-round-finding IDs.
3. Aggregate findings without losing raw identities. Use the [canonical resolution protocol](bundle/docs/resolution.md) in the Elephant context; the standalone egm-resolve command exposes the same protocol. Apply only authorized document edits; review-only scope remains read-only.
4. A clean round has every reviewer complete and no unsettled Blocker/Major. Fixed findings can reopen if reproduced. Contested or accepted risks retain human authority and evidence. Require two consecutive clean rounds; cap at five rounds. At cap/churn/halt retain open findings and stop for human decision. Never fabricate acceptance from a bound.
5. Return reports to the invoking design stage. This design budget does not reset or replace Codinary's two delivery fix cycles.

The complete canonical resources are generated into bundle/ for standalone copies. Read [runtime dispatch](bundle/docs/runtime.md) before any reviewer delegation and [approval handoff](bundle/docs/handoff.md) before passing an approved design to Codinary.
