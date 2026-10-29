# Existing system audit

Discovery snapshot: Agentic `d1c0d036302a939387dc04b90792b1d2cef48a59`, 2026-10-28. This records the pre-integration system and recommendations, not a claim that the integration already works. Pinned upstream paths are relative to the repositories listed in [provenance](upstream-provenance.md).

## Authority and baseline

`AGENTS.md` points to `CODING.md` and seven language guides. Agentic owns standards, setup and configuration. Codinary owns delivery. Universal rules include explicit errors, pure business logic, observable tests, characterization before refactoring, and 400/150/60 line defaults. Existing standards apply to changed code; migration must not force unrelated cleanup.

Two user edits already existed: cleanup lifecycle in `skills/codinary/SKILL.md` and temporary-resource recording in `skills/codinary/references/roles.md`. Their initial copies and staged/unstaged patch are retained in `/private/tmp/codinary/unified-agentic-20261028T220833Z/baseline/`. Preserve them verbatim through integration.

## Every existing specialist

| Canonical path | Observed behavior, inputs and outputs | Dependency/side effect | Decision |
| --- | --- | --- | --- |
| `skills/setup/SKILL.md` | Explicit invocation; chooses language/agent flags; dry-run then initializer | `scripts/init.sh`; optional downloaded fallback; preserves existing files unless authorized force+backup | KEEP initializer contract; extend packaging only |
| `skills/codinary/SKILL.md` | Brief to fresh implementer to independent QA to at most two fixes to authorized release | Full roles, verification/platform references; filesystem evidence and launch/teardown; source implementation delegated | KEEP as only delivery owner |
| `skills/code-review/SKILL.md` | Fixed point plus standards/spec; parallel independent reports kept separate | Git and optional tracker, two subagents; reports only | ENHANCE stale setup fallback and runtime honesty |
| `skills/tdd/SKILL.md` | Red/green at agreed public seams; behavioral tests, vertical slices | `tests.md`, `mocking.md`, codebase-design reference; writes tests/source only within authorized implementation role | KEEP with selected seam trade-off clarification |
| `skills/diagnosing-bugs/SKILL.md` | Red-capable feedback loop, minimization, ranked hypotheses, probes, regression and cleanup | `scripts/hitl-loop.template.sh`; synthetic/redacted evidence; temporary instrumentation | KEEP; incorporate pinned mutation-proof clarification if useful |
| `skills/codebase-design/SKILL.md` | Shared module/interface/seam/depth vocabulary, alternatives and dependency categories | `DEEPENING.md`, `DESIGN-IT-TWICE.md`; alternative designs can spawn agents only when requested | KEEP canonical vocabulary |
| `skills/domain-modeling/SKILL.md` | Canonical terms, examples, contradictions, selective ADRs | `CONTEXT-FORMAT.md`, `ADR-FORMAT.md`; lazy `CONTEXT.md`/map/ADR writes | KEEP existing filenames and conventions |

Every existing skill has `agents/openai.yaml`; setup and Codinary explicitly disable implicit invocation. Existing `skills/README.md` incorrectly calls TDD a red-green-refactor loop even though its skill assigns refactoring to review. Treat skill contract as authoritative and reconcile prose.

## Existing adaptations compared with pinned Matt source

Comparison used full skill bodies and companion assets, not names alone. These are substantial adaptations of Matt Pocock material; their original historical import revision is not recorded, so the pinned revision is a comparison anchor, not a fabricated import date.

| Agentic path | Pinned source | Evidence/difference |
| --- | --- | --- |
| `skills/code-review` | `skills/engineering/code-review` | Same dual-axis flow and smell baseline. Local tracker filepath differs; upstream now explicitly searches all standards and issues both calls together |
| `skills/tdd` | `skills/engineering/tdd` | Same loop; local `CONTEXT.md` vs upstream `GLOSSARY.md`; upstream adds seam catches/misses note. `tests.md`, `mocking.md`, metadata identical |
| `skills/diagnosing-bugs` | `skills/engineering/diagnosing-bugs` | Same six phases; local CONTEXT naming; upstream adds diff proof when forcing red. HITL script and metadata identical |
| `skills/codebase-design` | `skills/engineering/codebase-design` | Main skill and DEEPENING identical. DESIGN-IT-TWICE differs in context-file vocabulary. Metadata identical |
| `skills/domain-modeling` | `skills/engineering/domain-modeling` | CONTEXT/map/format renamed upstream to GLOSSARY equivalents; otherwise same lazy glossary/ADR behavior. ADR format and metadata identical |

Baseline contains no Matt copyright/permission notice: root LICENSE names only The Lazy. Preserve Agentic MIT license and add the upstream MIT notice to distributed adaptations, including single-skill installations. No additional copy of those five skills is warranted.

## Actual execution and installation surfaces

| Surface | Evidence path | Audit conclusion |
| --- | --- | --- |
| CLI | `bin/agentic.js`, `package.json` | Node >=18 launcher, init/skills subcommands; no application dependency suite |
| Initialization | `scripts/init.sh`, `scripts/lib/init/{cli,files,language,rules,run,toolchains}.sh` | Seven languages; existing configs skipped; dry-run, force and backup covered by tests |
| Installation | `scripts/install-skills.sh` | List/select, local/download source, copy/link, force/update/uninstall, Claude/agents destinations; selected EGM copies need their complete shared bundle |
| Claude packaging | `.claude-plugin/marketplace.json` | Seven explicit skill paths in a single Agentic plugin, MIT metadata; no baseline `.claude-plugin/plugin.json` |
| Other discovery | `.agents/skills.json`, `skills/*/agents/openai.yaml` | One `skills` directory. Discovery is distinct from invocation, subagent isolation and runtime support |
| Language standards | `rust/`, `go/`, `typescript/`, `python/`, `lua/`, `swift/`, `kotlin/` | Preserve guides, tooling templates and CI generation; no reason to replace them with upstream preferences |
| CI | `.github/workflows/setup.yml` | Linux/macOS shellcheck, installer/init/characterization/recovery checks and strict marketplace validation |

## Tests and limits of the baseline evidence

| Evidence | What it establishes | What it cannot establish |
| --- | --- | --- |
| `scripts/test-install-skills.sh` baseline log | Installer regression coverage | Native runtime isolation or agent behavior |
| `tests/init/test_characterization.py` baseline log | 70/70 initializer scenarios match | Every native language toolchain succeeds |
| `scripts/test-init.sh` baseline log | Initializer/launcher tests pass with task-local npm cache; original default-cache permission failure retained | Treating an npm cache permission issue as a product failure |
| `skills/codinary/evals/evals.json` and `evals/TESTING.md` | 20 prompts, 60 observable assertions; executable and controlled cases explicitly separated | All 20 were executed in this integration |
| `evals/scripts/recovery.mjs`, `recovery.test.mjs` | Real copied seed, immutable inputs, role identity events, controlled injected regressions, stale-build detection and run-wide fix limits | A unit pass cannot simulate independent agent dispatch |
| `evals/fixtures/*` | Deliberately incomplete Node/Python applications and CLI/API/UI boundaries | Their expected starting failures must not be repaired in shipped fixtures |

Baseline evidence lives outside the source tree under `/private/tmp/codinary/unified-agentic-20261028T220833Z/evidence/`. The main integration report must state final actual results and limitations; this audit does not substitute for rerunning changed checks.

## Material gaps

1. Code-review asks users to run uninstalled `/setup-matt-pocock-skills` whenever `docs/agents/issue-tracker.md` is absent, even when a local specification suffices. Resolve tracker only when actually needed; accept a supplied spec or explicit no-spec result.
2. No canonical registry covers contracts, aliases, runtime prerequisites and failure behavior. Existing marketplace and docs require parallel edits.
3. No EGM personas, standards, design lifecycle, runtime adapter or approved-design handoff exists at baseline.
4. No explicit design identity/version/approval trust boundary exists; an upstream Markdown `Status: Approved` alone must never authorize delivery.
5. Baseline portability claims concern skill installation. EGM upstream support records cannot establish support for Agentic's adapted packaging.
6. Existing skills retain local source-contract differences that wholesale upstream overwrites would erase.

## Recommended shape

Keep seven canonical skills. Add one requirements specialist (`grilling`) and seven distinct EGM capabilities. Compose bounded vertical-slice planning inside Codinary. Keep the design bundle complete and runtime-aware, with a single registry and explicit approved-design handoff; preserve direct standalone Codinary work. See the [inventory](capability-inventory.md), [dispositions](consolidation-matrix.md), and [conflict resolutions](instruction-conflict-register.md).
