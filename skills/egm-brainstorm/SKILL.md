---
name: egm-brainstorm
license: Apache-2.0
description: "Explore architectural alternatives and record a concepts brief."
disable-model-invocation: true
---

> Modified by Agentic, 2026-10-28: adapted ownership, bounded execution, runtime permissions, local paths, and human approval. Derived from Google EGM (Apache-2.0).

# egm-brainstorm

Read [execution boundary](bundle/resources/execution_instructions.md) before starting. This capability owns design/documentation only.

1. Read the concept and relevant repository context; record the problem, users, success measures and constraints.
2. Ask only unresolved consequential questions. Reuse already settled requirements; targeted grilling can supply them.
3. Compare at least two feasible approaches including the existing system. Evaluate cost, quota, security, reversibility, operations and user effort with the six lenses in bundle/agents/{design_critic,codebase_details,zoom_out,comprehension,implementation_readiness,structural}.md. For independent lens reviews use the runtime adapter.
4. Write concepts_brief.md with requirements, assumptions, alternatives, trade-offs, risks and decisions requiring a human. Return the artifact path. Drafting is a separate step; no source delivery begins.

The complete canonical resources are generated into bundle/ for standalone copies. Read [runtime dispatch](bundle/docs/runtime.md) before any reviewer delegation and [approval handoff](bundle/docs/handoff.md) before passing an approved design to Codinary.
