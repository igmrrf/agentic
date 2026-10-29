---
name: egm-review
license: Apache-2.0
description: "Review a design through five independent Goldfish stages."
disable-model-invocation: true
---

> Modified by Agentic, 2026-10-28: adapted ownership, bounded execution, runtime permissions, local paths, and human approval. Derived from Google EGM (Apache-2.0).

# egm-review

Read [execution boundary](bundle/resources/execution_instructions.md) before starting. This capability owns design/documentation only.

1. Require TargetFile. Accept GoldfishContext as an explicit reading allowlist and Step as interactive, uninterrupted, feature_spec, implementation, or 5/6/7/8/9. Default to interactive when no preset is supplied. Read bundle/docs/stages.md and bundle/docs/runtime.md.
2. Resolve feature and detailed sections semantically; calculate current line bounds before each stage. Record target hash. Dispatch the exact personas and rubrics from stages.md in fresh contexts. Preserve complete raw reports, reviewer statuses and comprehension paraphrases.
3. Interactive runs pause after each stage for proceed, authorized resolution, manual edits or halt. Uninterrupted runs all five without checkpoints and produces findings only; it never auto-edits or approves. feature_spec runs 5–8; implementation runs 9. Standalone stages remain available.
4. Allow one re-audit per stage after edits. At the cap retain unresolved findings and report awaiting human disposition; advancing does not imply accepted risk. Recalculate bounds/hash after edits; prior-stage reports become stale when their reviewed document changes.
5. Write per-stage reports and consolidated_review_report.md mapping every raw finding to consolidated IDs, severity and disposition. A failed reviewer is not_run; retry once then block that stage. Clean AI review means reviewed, never human approved. Use bundle/docs/handoff.md only when the user requests approved-design delivery.

The complete canonical resources are generated into bundle/ for standalone copies. Read [runtime dispatch](bundle/docs/runtime.md) before any reviewer delegation and [approval handoff](bundle/docs/handoff.md) before passing an approved design to Codinary.
