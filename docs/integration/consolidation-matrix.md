# Consolidation matrix

Selection record prepared from the [capability inventory](capability-inventory.md) and actual local/upstream comparisons before integration implementation. These are dispositions, not a claim that the selected changes are already delivered. Source anchors and exact file mappings are in [provenance](upstream-provenance.md).

KEEP preserves the local authority. ENHANCE changes selected guidance without replacing that authority. ADOPT adds a missing capability. COMPOSE reuses a technique inside its existing owner. REJECT excludes redundant/conflicting behavior. DEFER records useful work outside this integration.

## Agentic remains canonical

| Existing capability | Disposition | Evidence and concrete boundary |
| --- | --- | --- |
| Universal/language standards and generated configurations | KEEP | `CODING.md`, seven language directories and initializer golden scenarios; upstream preferences cannot replace them |
| `setup` and initialization CLI | KEEP | Existing dry-run/skip/force+backup and seven language contracts remain; only dependency-complete skill packaging may grow |
| `codinary` | ENHANCE | Preserve all [invariants](codinary-invariants.md); add optional approved-design intake/routing and planning reference; direct requests remain supported |
| `code-review` | ENHANCE | Remove uninstalled setup dependency; require tracker only for tracker fetch. Keep two axes and standalone report contract; never substitute it for Codinary runtime QA |
| `tdd` | ENHANCE | Retain red/green, public seams and all companion assets; selected catches/misses note is useful. Honor already authorized seams rather than repeated gates |
| `diagnosing-bugs` | ENHANCE | Retain loop-first six phases and HITL asset; upstream mutation proof improves red evidence without replacing local conventions |
| `codebase-design` | KEEP | Main skill identical upstream; retain local CONTEXT vocabulary and selective design-it-twice use |
| `domain-modeling` | KEEP | Retain CONTEXT/map/ADR contract; no forced rename to upstream GLOSSARY filenames |

## Matt: every skill disposition

Paths below are relative to `skills/` in the pinned Matt source. Behavioral inputs, outputs, side effects and prerequisites are itemized in the inventory.

| Source | Disposition | Canonical owner / rationale |
| --- | --- | --- |
| `engineering/ask-matt` | REJECT | Agentic registry/routing owns discovery; importing this router would expose missing and competing commands |
| `engineering/code-review` | ENHANCE | Existing `code-review`; selected standards discovery/parallel clarity only, no second copy |
| `engineering/codebase-design` | KEEP | Existing identical skill and local references remain |
| `engineering/diagnosing-bugs` | ENHANCE | Existing debugger; mutation verification wording only |
| `engineering/domain-modeling` | KEEP | Existing local CONTEXT convention and ADR assets |
| `engineering/grill-with-docs` | COMPOSE | `grilling` + canonical domain-modeling; document composition or metadata alias, no wrapper engine copy |
| `engineering/implement` | REJECT | Codinary already owns implementation, independent QA and release; upstream auto-commit conflicts |
| `engineering/implement-spec` | COMPOSE | Extract dependency frontier, ownership and self-contained slice handoffs into Codinary reference; reject autonomous merges/resets/PR closure and duplicate execution loop |
| `engineering/improve-codebase-architecture` | DEFER | Useful optional deepening survey; existing codebase-design plus EGM review already cover chosen design, no survey required for ordinary delivery |
| `engineering/pr` | DEFER | Helpful evidence-first presentation; Humanlayer/show-me secondary credits need their own license/provenance review; no PR workflow needed here |
| `engineering/prototype` | DEFER | Useful separate discovery artifact; relaxed tests, branch commits and production folding require an explicit prototype scope and Codinary boundary |
| `engineering/research` | COMPOSE | Primary-source findings and shared context pointers inside discovery; no new mandatory background-router command |
| `engineering/retro` | DEFER | Optional continuous improvement, not a mandatory delivery stage; keep outside current command growth |
| `engineering/setup-matt-pocock-skills` | REJECT | Agentic setup remains canonical; adopted grilling has no tracker/label setup dependency |
| `engineering/tdd` | ENHANCE | Existing `tdd`; one catches/misses clarification, no GLOSSARY migration |
| `engineering/to-spec` | COMPOSE | Capture requirements, scope and tests in existing brief/design artifacts; EGM owns complex specs; reject automatic issue publishing and parallel spec truth |
| `engineering/to-tickets` | COMPOSE | Codinary planning reference: complete demoable slices, real blocking edges and expansion/contraction when necessary; no tracker publishing subsystem |
| `engineering/triage` | DEFER | Issue/PR labels, comments and closure are valuable but externally mutating and require tracker configuration absent from current integration |
| `engineering/wayfinder` | COMPOSE | Distinguish decision dependencies from implementation slices in Codinary planning; reject map/issue/branch automation and alternative orchestrator |
| `engineering/wizard` | DEFER | Human-only operational setup useful later; bundled secret-handling shell library needs isolated review and explicit procedure scope |
| `productivity/grill-me` | COMPOSE | Optional alias to `grilling` in registry/docs only; one interview implementation |
| `productivity/grilling` | ADOPT | One standalone requirements specialist; inspect available facts, resolve decision frontier, honor scope/authorization and capture downstream criteria |
| `productivity/handoff` | REJECT | Codinary already has durable brief, append-only ledger and handoffs; no competing run-memory format |
| `productivity/teach` | DEFER | Educational mission/lesson system outside engineering framework |
| `productivity/to-questionnaire` | DEFER | Useful asynchronous stakeholder elicitation, unnecessary for this integration; no sending authorization implied |
| `productivity/wait-what` | REJECT | Plain-language clarification can be a communication preference; no canonical command needed |
| `productivity/writing-for-agents` | COMPOSE | Use progressive disclosure and explicit completion criteria when maintaining skills; no additional framework command needed |
| `misc/git-guardrails-claude-code` | DEFER | Frozen/harness-specific hook mutation; Agentic authorization rules already prohibit unauthorized destructive Git |
| `misc/migrate-to-shoehorn` | DEFER | Frozen TS-specific test dependency migration unrelated to integration |
| `misc/scaffold-exercises` | REJECT | Frozen course/vendor lint workflow plus unconditional commit, outside scope |
| `misc/setup-pre-commit` | DEFER | Frozen JS tooling defaults cannot replace seven-language existing policies |
| `in-progress/chief-of-staff` | REJECT | Alternative goal orchestration/schedules; competes with Codinary and runtime lifecycle |
| `in-progress/claude-handoff` | REJECT | Harness-specific background process and duplicate memory mechanism |
| `in-progress/loop-me` | DEFER | Personal recurring workflows outside engineering mandate |
| `in-progress/setup-ts-deep-modules` | DEFER | Useful optional dependency discipline but package reshaping/tool installation is a separate migration |
| `in-progress/writing-beats` | REJECT | Article composition does not fill an engineering capability gap |
| `in-progress/writing-fragments` | REJECT | Prose exploration does not fill an engineering capability gap |
| `in-progress/writing-shape` | REJECT | Article shaping does not fill an engineering capability gap |

## EGM: adopt the distinct design lifecycle

| Capability / source | Disposition | Contract and integration condition |
| --- | --- | --- |
| `skills/egm-brainstorm` | ADOPT | Idea → readiness-confirmed multi-lens concepts brief; no production implementation |
| `skills/egm-draft` | ADOPT | Brief/notes → section-reviewed design, alternatives, constraints and implementation plan; human authority preserved |
| `skills/egm-review` | ADOPT | Five distinct sequential stages and standalone presets; fresh reviewers and traceable reports, no automatic design approval |
| `skills/egm-resolve` | ADOPT | Persistent Elephant resolves fresh findings and applies authorized document edits; no source writes or self-approval |
| `skills/egm-review-loop` | ADOPT | Re-resolve semantic scope each round; stable findings, at most five rounds unless user extends; no interaction-gate bypass |
| `skills/egm-bootstrap` | ADOPT | Optional bounded documentation maintenance; preserve existing notes/alternate filename; failed scouts remain incomplete |
| `skills/egm-drift-report` | ADOPT | Optional current source/document comparison; discrepancies produce report only |
| `agents/*.md`, standards, templates, schemas, icons/metadata, required runtime docs | ADOPT | Complete dependency bundle, single authoritative source; per-skill install dependency closure required |
| `.claude-plugin/agents/*.md` | ADOPT | Runtime wrappers only; one registered wrapper/persona per name, canonical personas remain shared |
| Upstream host/plugin identities and marketplace catalogs | REJECT | Single Agentic plugin/registry owns packaging; translate relevant capabilities instead of installing a second plugin |
| `distributions/claude/` runtime duplicate | REJECT | Generated copies are not canonical and would drift |
| Upstream website, fonts, marketing and contribution automation | REJECT | Not runtime dependencies; retain only referenced runtime visual assets/notices |
| Upstream packager and native test programs | COMPOSE | Reuse reviewed safety/test techniques in local tooling where justified; no blind execution, global installs or auto-updates |

## Selected architecture and stop condition

The intended public set is 15 canonical skills: seven existing, `grilling`, and seven EGM capabilities. Optional aliases route to the same implementation and must not create duplicate registrations. Design artifacts feed an explicit identity/version/revision/checksum-bound handoff; only authorized human approval unlocks approved-design delivery. Codinary remains available without that handoff.

EGM design review is separate from source review, runtime QA and post-release verification. No subsystem can reset Codinary's two-fix count or infer release authorization. Routing depends on uncertainty, affected interfaces, security/data risk and reversibility, not line count. Small work bypasses full design review; optional bootstrap/drift/improvement work is never mandatory for every task.

Implementation begins only after this inventory/selection record and the architecture proposal have been reviewed. Preserve public contracts, validate selected-install dependency closure and single registration, run baseline plus focused regression checks, and report native runtime evidence separately from static validation. Deferred capabilities do not block this integration; missing mandatory runtime evidence remains a disclosed limitation or blocker.
