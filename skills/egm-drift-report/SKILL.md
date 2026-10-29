---
name: egm-drift-report
license: Apache-2.0
description: "Compare architectural documentation with implementation without modifying source."
disable-model-invocation: true
---

> Modified by Agentic, 2026-10-28: adapted ownership, bounded execution, runtime permissions, local paths, and human approval. Derived from Google EGM (Apache-2.0).

# egm-drift-report

Read [execution boundary](bundle/resources/execution_instructions.md) before starting. This capability owns design/documentation only.

1. Require documentation root and source scope. Read component contracts and blueprint links, then inspect actual interfaces, invariants and side effects through repository discovery tools.
2. Compare documented behavior with code and real verification commands. Separate stale documentation, implementation divergence and uncertain claims; missing reads/tests remain gaps.
3. Write drift_report.md with stable IDs, severity, exact file/symbol evidence, affected requirement/decision, suggested owner and next step. Keep design drift distinct from independent implementation QA.
4. Return report only. Human decides architectural changes; Codinary owns authorized source corrections. Documentation corrections may use an explicitly authorized egm-resolve step.

The complete canonical resources are generated into bundle/ for standalone copies. Read [runtime dispatch](bundle/docs/runtime.md) before any reviewer delegation and [approval handoff](bundle/docs/handoff.md) before passing an approved design to Codinary.
