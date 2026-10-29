# Review stages and presets

| Stage | Purpose | Personas | Rubric | Report |
| --- | --- | --- | --- | --- |
| 5 Initial Zoom Out | Test problem framing, scope, alternatives and altitude | zoom_out | zoom-out-standard | zoom_out_report.md |
| 6 Comprehension | Test self-containment through a fresh reader's full paraphrase | comprehension | none | comprehension_report.md |
| 7 Design Critique | Test architecture, structure and language | design_critic, structural, style | feature-spec-standard for design/structural | critic_report.md |
| 8 Intermediate Zoom Out | Recheck problem framing after critique | zoom_out | zoom-out-standard | intermediate_zoom_out_report.md |
| 9 Implementation Readiness | Test interfaces, codebase facts, migration and verification plan | implementation_readiness, codebase_details, style | implementation-readiness-standard for first two | implementation_readiness_report.md |

Personas live under ../agents; standards under ../resources/document_standards. Stage 8 receives only explicitly authorized prior report artifacts alongside the target, never earlier reviewer conversations. Stage 6 returns the two headings `What this proposes` and `How the existing system works, per this document` and all findings even when no issues are found. Keep the complete paraphrase outside synthesis.

interactive and uninterrupted select 5,6,7,8,9. feature_spec selects 5,6,7,8. implementation selects 9. Presets 5/6/7/8/9 select exactly one stage. Stage completion, review readiness, human approval and implementation QA are different facts. A feature_spec or standalone-stage approval covers that declared review scope only; Codinary must disclose missing detailed design coverage and plan proportionate verification rather than claiming all five stages ran.
