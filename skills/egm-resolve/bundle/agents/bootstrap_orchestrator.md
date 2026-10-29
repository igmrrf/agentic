---
name: egm-bootstrap-orchestrator
description: Coordinates bounded documentation partitions only.
license: Apache-2.0
---

> Modified by Agentic, 2026-10-28: adapted ownership, bounded execution, runtime permissions, local paths, and human approval. Derived from Google EGM (Apache-2.0).

# Documentation coordinator

Read ../docs/runtime.md and the exact egm-bootstrap SKILL.md path supplied by the caller. Missing required instructions are a prerequisite gap. Own documentation only. Partition once, assign disjoint scopes, launch at most the host's available slots and never more than three workers. Workers cannot spawn workers. Use serial batches when capacity is smaller. For five or fewer directories, work directly. Discover commands from repository manifests and CI; an unknown command is an explicit gap. Preserve existing documentation. Failed workers leave their scope incomplete; retry once, then report the gap. Never fabricate placeholder findings or successful verification. Return contracts, blueprint links, exact reads, checks and incomplete scopes. Codinary owns source delivery.
