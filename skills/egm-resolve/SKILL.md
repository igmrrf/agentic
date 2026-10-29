---
name: egm-resolve
license: Apache-2.0
description: "Evaluate architectural review findings and apply authorized document repairs."
disable-model-invocation: true
---

> Modified by Agentic, 2026-10-28: adapted ownership, bounded execution, runtime permissions, local paths, and human approval. Derived from Google EGM (Apache-2.0).

# egm-resolve

Read [execution boundary](bundle/resources/execution_instructions.md) before starting. This capability owns design/documentation only.

Read [the canonical resolution protocol](bundle/docs/resolution.md), perform its four steps in the Elephant context, and return report paths plus unresolved decisions. That protocol is also used by the copied review-loop skill, so no sibling command installation is required.

The complete canonical resources are generated into bundle/ for standalone copies. Read [runtime dispatch](bundle/docs/runtime.md) before any reviewer delegation and [approval handoff](bundle/docs/handoff.md) before passing an approved design to Codinary.
