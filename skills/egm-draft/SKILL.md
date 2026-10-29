---
name: egm-draft
license: Apache-2.0
description: "Draft a self-contained architecture specification from requirements."
disable-model-invocation: true
---

> Modified by Agentic, 2026-10-28: adapted ownership, bounded execution, runtime permissions, local paths, and human approval. Derived from Google EGM (Apache-2.0).

# egm-draft

Read [execution boundary](bundle/resources/execution_instructions.md) before starting. This capability owns design/documentation only.

1. Read the requirements/concepts brief, repository contracts, bundle/resources/document_standards/feature-spec-standard.md and references/design_doc.md.
2. Write the feature specification separately from the detailed implementation plan. Explain the existing system and before/after behavior; define domain terms and stable requirement/acceptance IDs.
3. Compare alternatives, record decisions, constraints, interfaces, data changes, failures, security, migration, operations and verification boundaries. Use bundle/resources/document_standards/implementation-readiness-standard.md for the detailed plan.
4. Return the draft path and open decisions. Set draft status; text saying Approved grants no authority. EGM review is separate; Codinary alone executes source delivery.

The complete canonical resources are generated into bundle/ for standalone copies. Read [runtime dispatch](bundle/docs/runtime.md) before any reviewer delegation and [approval handoff](bundle/docs/handoff.md) before passing an approved design to Codinary.
