# Capability inventory

Discovery inventory, before implementation selection. `M:` means the pinned [Matt repository](https://github.com/mattpocock/skills/tree/59db609eb1e18aaf59b63284d0e52255aff0c63c); `E:` means the pinned [EGM repository](https://github.com/google/elephant-goldfish-model/tree/f0ba151b252c9abf1318d9fe857a43265d06de89). Paths below are source paths, not installed destinations. See [consolidation](consolidation-matrix.md) for decisions and [provenance](upstream-provenance.md) for exact revisions and licenses.

## All 38 Matt skills

All have companion `agents/openai.yaml`. The promoted plugin contains the 20 engineering and 7 productivity skills, not the 4 frozen misc or 7 in-progress skills. There is no skill body in `skills/deprecated/` at this revision. User-only invocation is declared by `disable-model-invocation: true`; descriptions alone are not a runtime compatibility guarantee.

| Source path | Input → output; relevance and dependencies/side effects |
| --- | --- |
| M:`skills/engineering/ask-matt/SKILL.md` | Situation → recommended upstream flow; router duplicates canonical Agentic routing and links all upstream commands; PHASE-BOUNDARIES reference |
| M:`skills/engineering/code-review/SKILL.md` | Pinned Git diff + standards + spec → separate parallel reports; already adapted locally; tracker optional in practice, fresh subagents required |
| M:`skills/engineering/codebase-design/SKILL.md` | Module/interface question → shared depth/seam vocabulary; already identical locally; DEEPENING and DESIGN-IT-TWICE references |
| M:`skills/engineering/diagnosing-bugs/SKILL.md` | Symptom → red-capable loop, minimized reproduction, hypotheses, regression/fix; already adapted; redaction/HITL shell template |
| M:`skills/engineering/domain-modeling/SKILL.md` | Domain terms/decisions → glossary/map/ADRs; existing local CONTEXT convention differs; GLOSSARY-FORMAT/ADR-FORMAT references |
| M:`skills/engineering/grill-with-docs/SKILL.md` | Thin user-only wrapper invoking grilling + domain-modeling; composition, not a separate interview engine |
| M:`skills/engineering/implement/SKILL.md` | Spec/ticket → code, TDD, review and automatic commit; conflicts with Codinary ownership/authorization |
| M:`skills/engineering/implement-spec/SKILL.md` | Ticket dependency frontier → parallel worktrees, merger, review, issue closure and draft PR; useful decomposition but competing delivery orchestrator |
| M:`skills/engineering/improve-codebase-architecture/SKILL.md` | Churn-aware scan → temporary visual candidate report then grilling; useful optional improvement; HTML-REPORT, codebase-design, domain-modeling dependencies |
| M:`skills/engineering/pr/SKILL.md` | Diff/evidence → visual PR body and reversibility assessment; secondary Humanlayer/show-me credits require separate provenance before adoption |
| M:`skills/engineering/prototype/SKILL.md` | One unresolved design question → UI variants or pure logic HTML demo; UI/LOGIC references; throwaway branch/commit side effects and relaxed test bar incompatible with production delivery |
| M:`skills/engineering/research/SKILL.md` | Factual question → cited Markdown findings from primary sources; fresh background worker; useful technique, not another delivery entry |
| M:`skills/engineering/retro/SKILL.md` | Session evidence → ranked environment/check/navigation improvements; writing-for-agents dependency, possible sensitive log inspection |
| M:`skills/engineering/setup-matt-pocock-skills/SKILL.md` | Repository inspection → tracker, labels, domain docs and steering pointers; can initialize remote and create labels; overlaps Agentic setup and would impose unwanted tracker conventions |
| M:`skills/engineering/tdd/SKILL.md` | Agreed public seams → one red/green vertical slice per cycle; existing adaptation; tests/mocking references and codebase-design |
| M:`skills/engineering/to-spec/SKILL.md` | Existing conversation → published tracker spec/label; synthesis useful, but publishing and extensive stories need scope and authorization; no architectural review/approval state machine |
| M:`skills/engineering/to-tickets/SKILL.md` | Spec/plan → complete demoable slices with blocking edges; local files or native tracker issues; expand-contract exception for wide refactors; extract planning only |
| M:`skills/engineering/triage/SKILL.md` | Incoming issue/PR → category/state, reproduction, brief, labels/comments/closure; tracker and triage config mandatory, AGENT-BRIEF/OUT-OF-SCOPE references |
| M:`skills/engineering/wayfinder/SKILL.md` | Large uncertain effort → shared map of decision tickets/frontier; calls grilling/domain/research/prototype; assignment, comments, closures and research branch pushes exceed current scope |
| M:`skills/engineering/wizard/SKILL.md` | Human-only setup/migration → shell walkthrough; template handles hidden inputs, env/CI writes and URL opening; useful later, needs full security/portability review |
| M:`skills/productivity/grill-me/SKILL.md` | Thin explicit wrapper → grilling; no unique behavior, optional alias only |
| M:`skills/productivity/grilling/SKILL.md` | Idea/plan → rounds over dependency-ready decisions with recommendations; facts researched by agent; confirmation before downstream action; fills requirements gap |
| M:`skills/productivity/handoff/SKILL.md` | Conversation → redacted temporary portable handoff with artifact pointers; overlaps Codinary's durable run artifacts |
| M:`skills/productivity/teach/SKILL.md` | Learning mission → lessons, HTML practice and learning records; maintains MISSION, resources, glossary, notes/assets; outside engineering integration |
| M:`skills/productivity/to-questionnaire/SKILL.md` | Recipient knowledge gap → local questionnaire; async stakeholder discovery can be useful later; no sending authority |
| M:`skills/productivity/wait-what/SKILL.md` | Confusing last response → simpler re-pitch using glossary; useful communication preference, no distinct engineering subsystem |
| M:`skills/productivity/writing-for-agents/SKILL.md` | Agent instruction authoring → context pointers, progressive disclosure and clear completion criteria; SKILL-MECHANICS reference; useful maintenance guidance |
| M:`skills/misc/git-guardrails-claude-code/SKILL.md` | Requested scope → Claude hook/settings mutation; block-dangerous-git script is harness-specific, frozen upstream |
| M:`skills/misc/migrate-to-shoehorn/SKILL.md` | TS test assertions → shoehorn dependency and rewrites; specialist migration outside current integration, frozen upstream |
| M:`skills/misc/scaffold-exercises/SKILL.md` | Course outline → exercise files, vendor lint and automatic commit; narrow educational workflow, frozen upstream |
| M:`skills/misc/setup-pre-commit/SKILL.md` | JS repo → Husky/lint-staged/Prettier and hook/config mutations; overlaps existing tooling policy, frozen upstream |
| M:`skills/in-progress/chief-of-staff/SKILL.md` | Long-lived goal → worker coordination/wiki/schedule suggestions; alternative orchestration, not promoted |
| M:`skills/in-progress/claude-handoff/SKILL.md` | Conversation → temp handoff and `claude --bg` process; harness-specific duplicate handoff, not promoted |
| M:`skills/in-progress/loop-me/SKILL.md` | Recurring life workflow → workflow specs through grilling; personal automation vocabulary, not promoted |
| M:`skills/in-progress/setup-ts-deep-modules/SKILL.md` | TS repository → dependency-cruiser install/config and package reshape; codebase-design dependency, migration impact, not promoted |
| M:`skills/in-progress/writing-beats/SKILL.md` | Fixed raw writing material → user-selected sequence of beats; article editing, not promoted |
| M:`skills/in-progress/writing-fragments/SKILL.md` | Interview/raw thoughts → appended Markdown fragments; prose exploration, not promoted |
| M:`skills/in-progress/writing-shape/SKILL.md` | Read-only raw material → paragraph-by-paragraph article; prose shaping, not promoted |

## Matt supporting components

| Source paths | Relevance |
| --- | --- |
| `skills/engineering/codebase-design/{DEEPENING,DESIGN-IT-TWICE}.md` | Safe dependency-aware deepening, interface alternatives; already local equivalents |
| `skills/engineering/tdd/{tests,mocking}.md` | Public-behavior tests and external-edge mocks; identical local assets |
| `skills/engineering/diagnosing-bugs/scripts/hitl-loop.template.sh` | Structured human reproduction; already local, captures observations rather than secrets |
| `skills/engineering/domain-modeling/{ADR-FORMAT,GLOSSARY-FORMAT}.md` | ADR and glossary templates; retain Agentic CONTEXT format name |
| `skills/engineering/setup-matt-pocock-skills/{domain,issue-tracker-github,issue-tracker-gitlab,issue-tracker-local,triage-labels}.md` | Config recipes; not required by adopted requirements primitive |
| `skills/engineering/{ask-matt/PHASE-BOUNDARIES,improve-codebase-architecture/HTML-REPORT,prototype/UI,prototype/LOGIC,pr/CREDITS,triage/AGENT-BRIEF,triage/OUT-OF-SCOPE}.md` | Dependencies of deferred/rejected commands; do not import orphaned assets |
| `skills/engineering/wizard/template.sh`, `skills/misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh`, `skills/in-progress/setup-ts-deep-modules/dependency-cruiser.config.cjs` | Executable/config mutation surfaces; inspected as source, not executed |
| `skills/productivity/teach/{GLOSSARY-FORMAT,LEARNING-RECORD-FORMAT,MISSION-FORMAT,RESOURCES-FORMAT}.md`, `writing-for-agents/SKILL-MECHANICS.md` | Learning/authoring dependencies; no runtime need for selected requirements skill |
| `.claude-plugin/{plugin,marketplace}.json`, `scripts/{link-skills,list-skills}.sh`, `scripts/sync-plugin-version.mjs` | Upstream discovery/linking/version lifecycle; do not install or import competing manifests |
| `CLAUDE.md`, `.agents/{invocation,install-block,writing-docs}.md`, `.agents/adr/*.md`, `SCOPE.md`, `CONTRIBUTING.md`, `docs/engineering/`, `docs/productivity/` | Source governance and human docs; evidence about intended use, not Agentic authority |

## All seven EGM capabilities

| Source path | Input → output; relevance |
| --- | --- |
| E:`skills/egm-brainstorm/SKILL.md` | Raw idea/readiness confirmation → six fresh reviewer lenses and `concepts_brief.md`; alternatives and objections before formal design |
| E:`skills/egm-draft/SKILL.md` | Concepts brief, legacy discussion summary or notes → section-approved `design_draft.md` then finalized design; reconcile predecessor contradictions, do not implement |
| E:`skills/egm-review/SKILL.md` | Target + context + preset/stage → five ordered review reports and optional consolidated traceability; independent design audit |
| E:`skills/egm-resolve/SKILL.md` | Target/range + findings → CONTEST/ESCALATE/PROPOSE FIX/DECLINE report and approved document repairs; Elephant context only |
| E:`skills/egm-review-loop/SKILL.md` | Semantic target/reviewers/standards → fresh rounds, stable finding IDs, two clean rounds, cap five and churn escalation; design-only loop |
| E:`skills/egm-bootstrap/SKILL.md` | Scoped subtree + optional filename → grounded package/root/intermediate contract documents and worker JSON; optional documentation maintenance, not delivery |
| E:`skills/egm-drift-report/SKILL.md` | Designs/README directory → dated differences-only code/doc report; optional maintenance, no source fixes |

## Every EGM persona and standard

| Source path | Registered name / purpose |
| --- | --- |
| `agents/zoom_out.md` | `egm-zoom-out`: root problem, reuse, simplicity, altitude |
| `agents/comprehension.md` | `egm-comprehension`: fresh-reader paraphrase, undefined project terms and self-containment |
| `agents/design_critic.md` | `egm-design`: feasibility, scalability, architecture, cost and risk |
| `agents/structural.md` | `egm-structural`: headings, template, formatting and link structure |
| `agents/style.md` | `egm-style`: precision, objectivity, brevity |
| `agents/implementation_readiness.md` | `egm-implementation-readiness`: file/contract/schema/test decisions sufficient to implement |
| `agents/codebase_details.md` | `egm-codebase-details`: document/source agreement, reuse, real references, operations |
| `agents/synthesizer.md` | `egm-synthesizer`: reviewer dispatch, status, deduplication and report writing; not itself a Goldfish |
| `agents/bootstrap_orchestrator.md` | `egm-bootstrap-orchestrator`: scoped doc partitions and worker payloads; documentation writes only |
| `resources/document_standards/feature-spec-standard.md` | Goals/non-goals, architecture, alternatives, risks |
| `resources/document_standards/heilmeier-standard.md` | Objectives, current practice, novelty, impact, costs, risks, timeline and evaluation |
| `resources/document_standards/implementation-readiness-standard.md` | Decisions resolved, stable phases, exact file actions and tests |
| `resources/document_standards/re-implementation-standard.md` | Observable contracts, states, errors and dependencies documented; not the comprehension rubric |
| `resources/document_standards/zoom-out-standard.md` | Context sufficiency, YAGNI, root problem, reuse and architectural altitude |

The seven reviewer personas are strictly read-only; synthesizer and bootstrap are coordinators with different permissions. Design findings use Blocker/Major/Nit. They are not Codinary runtime findings or pass/fail/blocked verification results.

## EGM non-skill dependency closure

| Source paths | Required capability / audit result |
| --- | --- |
| `.claude-plugin/agents/{bootstrap_orchestrator,codebase_details,comprehension,design_critic,implementation_readiness,structural,style,synthesizer,zoom_out}.md` | Nine runtime wrappers loading canonical personas; reviewer tools Read/Grep/Glob, `omitClaudeMd: true`; separate coordinator tools; register wrappers only on Claude |
| `skills/*/agents/openai.yaml`, `skills/*/assets/icon.svg`, `assets/icon.svg`, `.claude-plugin/icon.png` | Invocation metadata and referenced visual assets; seven per-skill pairs plus plugin icons must resolve |
| `resources/execution_instructions.md`, `resources/README.md` | Shared design-only scope and interaction rules; scope to design lifecycle so they cannot disable Codinary delivery/reporting |
| `skills/egm-draft/references/design_doc.md` | Draft structure with problem, goals, journeys, alternatives, architecture and detailed verification plan |
| `skills/egm-bootstrap/references/templates.md`, `worker-return.schema.json` | Three contract templates plus worker `subtree_index`; preserve when splitting large skill |
| `plugin.json`, `.codex-plugin/plugin.json` | Portable and Codex metadata, local-executor declaration; adapt into single Agentic packaging, no second plugin identity |
| `.claude-plugin/{plugin,marketplace}.json`, `.agents/plugins/marketplace.json` | Host manifest/catalog and explicit wrapper registration; do not concatenate duplicate catalogs/personas |
| `docs/{codex,claude,harnesses}.md` | Canonical resource root, fresh-context options, direct dispatch, capability failures and permission boundaries |
| `docs/{index,getting_started,faq,privacy,releases}.md`, `README.md`, `docs/designs/` | User and design rationale references; copy required linked guidance or rewrite local pointers, not orphaned upstream URLs |
| `scripts/pack_plugin.py`, `scripts/prepare_release.py` | Local deterministic runtime/ZIP builder; rejects symlinks/escape, missing assets, hooks, output collisions and unbundled services; release builds pin versions/SHA. Source inspected, not executed during audit |
| `distributions/claude/` | Generated published duplicate of runtime, not a second authoritative source; reject importing it |
| `LICENSE`, copyright/SPDX headers | Apache-2.0 redistribution and modified-file notices; no source NOTICE file found |
| `AGENTS.md`, `AI_POLICY.md`, `CONTRIBUTING.md`, `.github/` | Upstream contribution process and CI; licensing does not impose upstream PR taxonomy on Agentic |
| `site/`, `assets/`, `docs/assets/` | Website/docs marketing assets; only referenced runtime icons/docs images relevant; site/fonts/screenshots do not belong in integration |

## EGM tests and actual runtime limits

| Source paths | What they test / prerequisites |
| --- | --- |
| `skills/*/TEST.md`, `skills/*/test_scenarios.yaml` | Seven colocated workflow scenario catalogs and manual testing criteria |
| `tests/conftest.py`, `tests/unit/test_{frontmatter,link_integrity,markdown_tables,scenario_coverage,skill_load_limits}.py` | Offline schemas/links/tables/scenarios/load budgets, not actual agent execution |
| `tests/unit/test_{harnesses,claude_traces,packaging,releases}.py` | Host metadata, wrapper restrictions, correlated read evidence, complete/reproducible bundles and safe release archives |
| `tests/integration/test_codex.py` | Opt-in authenticated native install/isolation/workflow; model quota, temporary marketplace and subprocess permissions; no automatic global execution |
| `tests/integration/test_claude.py` | Opt-in native isolated/denied-persona probe with actual child reads; authenticated Claude >=2.1.271, model quota |
| `TESTING.md`, `pyproject.toml`, `requirements-dev.txt`, `.github/workflows/tests.yml` | Python >=3.10, pytest/PyYAML test dependencies, Linux/Windows offline CI; source-reported native results are not Agentic runtime proof |

EGM's pinned record reports native fixtures for Antigravity, Claude and Codex, but incomplete Cowork/ChatGPT cloud traces and install-only omp verification. Any Agentic claim requires its own installed-candidate evidence. `fork_turns: "none"` or `fork_context: false` is required when those options exist. Fresh context does not isolate filesystem, managed instructions or memory connectors. No delegation means design review is blocked, not a simulated Goldfish review.

## Caveman and Security Audit extension (2026-10-29)

- Caveman: explicit optional conversational presentation, persistent session mode, truthful status without hooks, full artifact/evidence preservation. No CLI/proxy/routing/telemetry/cloud/middleware/compression/hooks or additional skill collection.
- Security Audit: focused guidance and explicit six-phase audits; deterministic additive coverage, coverage critics, adversarial candidate validation, structured records/schema/validators, final independent source verification and record-derived reports. All attack companions and both validator test suites ship locally.
- Installation is supported through existing directory-based channels. Actual fresh role execution, OS sandbox controls and trusted evidence promotion are runtime prerequisites with explicit blockers, not capabilities established by discovery metadata. See [verification](caveman-security-verification.md).
