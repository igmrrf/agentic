> Modified by Agentic, 2026-10-28 from Google EGM egm-resolve: scoped authorization, raw finding traceability and conservative approval invalidation. Apache-2.0.

# Canonical finding-resolution protocol

The Elephant evaluates findings in its context; Goldfish reviewers remain fresh/read-only. This shared protocol also backs the standalone egm-resolve command. A copied review-loop skill can execute this protocol without installing a sibling command.

1. Read the current design, raw findings and explicitly authorized source context. Preserve every finding ID, original rationale and Blocker/Major/Nit severity.
2. Classify each finding as PROPOSE FIX or CONTEST with evidence. Record open/fixed/contested/accepted_risk disposition, reason and authority. Open or contested blocker/major findings continue blocking readiness. Accepted risk requires an explicit human decision; confidence, a clean AI review, cap or elapsed time does not imply consent.
3. Present proposed document changes and consequential trade-offs for human decision where not already authorized. Honor existing authorization for reversible drafting. Apply only authorized documentation edits; a review-only request remains report-only. Re-read the document, recalculate semantic line bounds/hash and invalidate stale review/approval bindings. A claimed fix needs fresh review evidence.
4. Write goldfish_review_report.md with raw-to-disposition mapping, proposed/applied changes, authority and unresolved questions. Preserve per-round artifacts. Resume review only within caller authorization and budget. At cap/churn retain residual findings and stop for human action. Return to the calling design workflow. Source implementation and release belong to Codinary.
