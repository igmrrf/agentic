---
name: egm-bootstrap
license: Apache-2.0
description: "Ground repository documentation in real code with bounded workers."
disable-model-invocation: true
---

> Modified by Agentic, 2026-10-28: adapted ownership, bounded execution, runtime permissions, local paths, and human approval. Derived from Google EGM (Apache-2.0).

# egm-bootstrap

Read [execution boundary](bundle/resources/execution_instructions.md) before starting. This capability owns design/documentation only.

1. Require target root and documentation scope. Read references/templates.md and references/worker-return.schema.json. Inventory source/package boundaries and existing contracts using repository discovery tools. Exclude generated/vendor/cache directories and secrets.
2. For five or fewer directories work directly. Otherwise partition once into disjoint scopes and launch at most three workers, further limited by available host slots; use serial batches. Workers cannot delegate recursively. Use bundle/agents/bootstrap_orchestrator.md as the documentation coordinator contract.
3. Workers read code and actual manifests/CI. Generate component contracts (interfaces, invariants, side effects, evidence-backed verification) and bottom-up blueprint links only. Discover test commands from actual project tooling; unknown commands stay explicitly unknown, never guessed.
4. Preserve existing user documentation and authorized ownership. Retry a failed worker once; retain incomplete status/scope after failure. No placeholder text can stand in for successful grounding. Validate relative links and claims against source. Do not modify functional code or globally install tools.
5. Write documentation plus an evidence manifest: files read, commands actually run and outcomes, incomplete scopes and unresolved assumptions. Return paths and gaps. Source implementation returns to Codinary.

The complete canonical resources are generated into bundle/ for standalone copies. Read [runtime dispatch](bundle/docs/runtime.md) before any reviewer delegation and [approval handoff](bundle/docs/handoff.md) before passing an approved design to Codinary.
