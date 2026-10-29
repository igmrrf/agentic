# Upstream provenance and redistribution

The [JSON manifest](upstream-provenance.json) records exact pinned source paths/SHA-256 digests, actual canonical/generated destinations and their current digests, modifications and distributed notices. `node scripts/check-provenance.mjs` verifies every shipped mapping. Original import revisions for pre-existing adaptations remain unknown; pinned sources are comparison anchors.

## Repositories and immutable source identities

| Repository | Revision | Inspected license / notices |
| --- | --- | --- |
| [Agentic](https://github.com/igmrrf/agentic) | `d1c0d036302a939387dc04b90792b1d2cef48a59` | MIT; `Copyright (c) 2026 The Lazy` in `LICENSE` |
| [Matt Pocock skills](https://github.com/mattpocock/skills) | `59db609eb1e18aaf59b63284d0e52255aff0c63c` | MIT; `Copyright (c) 2026 Matt Pocock` in `LICENSE` |
| [Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model) | `f0ba151b252c9abf1318d9fe857a43265d06de89` | Apache-2.0; Google LLC file-level notices/SPDX; no source `NOTICE` file found |

Source checkout origins and full SHAs were verified locally. Read-only source snapshots remain under `/private/tmp/codinary/unified-agentic-20261028T220833Z/sources/`. No source installer, global link script, upstream release script or plugin installation was executed by the audit. Source licenses and file-level notices were read, rather than inferred from repository branding.

## Existing Matt adaptations

The exact original import revision is unknown. The pinned source revision is an audited comparison anchor. Do not present it as historical proof of when Agentic imported the files.

| Original source under `skills/engineering/` | Existing Agentic destination | Modifications/evidence |
| --- | --- | --- |
| `code-review/SKILL.md`, `code-review/agents/openai.yaml` | `skills/code-review/` | Main flow substantially identical; local explicit tracker filepath; metadata identical |
| `tdd/SKILL.md`, `tdd/{tests,mocking}.md`, `tdd/agents/openai.yaml` | `skills/tdd/` | CONTEXT naming; upstream adds catches/misses seam note; companion assets identical |
| `diagnosing-bugs/SKILL.md`, `diagnosing-bugs/scripts/hitl-loop.template.sh`, metadata | `skills/diagnosing-bugs/` | CONTEXT naming; upstream adds forced-red mutation proof; template/metadata identical |
| `codebase-design/SKILL.md`, `DEEPENING.md`, `DESIGN-IT-TWICE.md`, metadata | `skills/codebase-design/` | Main/DEEPENING/metadata identical; design-it-twice retains local CONTEXT vocabulary |
| `domain-modeling/SKILL.md`, `GLOSSARY-FORMAT.md`, `ADR-FORMAT.md`, metadata | `skills/domain-modeling/`; format named `CONTEXT-FORMAT.md` | Local CONTEXT/map/format convention; ADR/metadata identical |

Baseline attribution gap: no Matt notice was found in Agentic's root LICENSE, README, skill bodies or existing skill documentation. The MIT permission requires the copyright and permission notice in copies or substantial portions. Preserve Agentic's MIT license and distribute Matt's full MIT notice alongside the existing adaptations and new derived material. A repository-only notice is insufficient if a selected skill is redistributed without it; installer/package dependency closure must retain notices too.

## Selected source-derived additions

| Source paths | Actual destination / treatment | Required modification record |
| --- | --- | --- |
| M:`skills/productivity/grilling/{SKILL.md,agents/openai.yaml}` | `skills/grilling/` | Adapt authorization and output contracts; one requirements engine; MIT notice |
| M:`skills/engineering/{to-tickets,implement-spec,wayfinder,research,to-spec}/SKILL.md` | skills/codinary/references/planning.md | Extract slice/dependency/research techniques, reject competing orchestration and automatic external mutations; MIT notice |
| E:`skills/egm-*/SKILL.md`, metadata, icons and references | Seven canonical EGM skills | Adapt local bundle resolution, instruction precedence and bounded work; preserve full capabilities |
| E:`agents/*.md`, `.claude-plugin/agents/*.md` | framework/egm/agents and framework/egm/adapters/claude; generated .claude-plugin/agents | Canonical content shared; register only the applicable runtime wrapper/persona once |
| E:`resources/*.md`, `resources/document_standards/*.md` | framework/egm/resources; generated skills/<id>/bundle/resources | Scope design-only rules; retain all five standards; never leak design rules into delivery authority |
| E:`docs/{codex,claude,harnesses}.md` and referenced runtime icons | framework/egm/docs and icon.svg; generated bundle equivalents | Adapt Agentic identity, host schema and truthful support boundaries; preserve required dependencies |
| Upstream `LICENSE` files | licenses/ plus standalone adaptation and bundle copies | Exact source text and required file notices retained |

`M:` and `E:` refer to the repositories in the first table. The JSON manifest expands these groups to exact source files and digests. Generated `distributions/claude/`, marketing site assets/fonts and upstream plugin identities are excluded. No rejected/deferred skill is implicitly imported by being listed in the inventory.

## Apache-2.0 obligations observed in the source

Section 4 requires a copy of Apache-2.0 for recipients, prominent notices on modified files, retention of applicable copyright/patent/trademark/attribution notices, and preservation of relevant NOTICE text when the upstream distribution includes one. This pinned source has no NOTICE text file. Keep existing Google copyright/SPDX headers where present and add a prominent local modification notice to changed source-derived files. Track adaptations in this manifest; a central manifest alone does not replace the modified-file notice requirement.

Apache-2.0 grants patent rights under its stated conditions and includes trademark limits and warranty disclaimers. Preserve that text. Agentic's own work can retain MIT; bundled Apache-derived material remains identified as Apache-2.0. Package metadata and user docs must disclose the mixed bundle rather than imply sole MIT coverage of every imported file. Describe EGM origin factually and retain the statement that it is not an officially supported Google product; do not imply Google endorsement of Agentic.

Upstream `AGENTS.md`, contribution thresholds, design-ready/pr-ready labels and PR policies govern contributions to that source project. They are not redistribution license conditions and do not automatically become Agentic governance.

## Deferred provenance

Matt's `skills/engineering/pr/SKILL.md` includes credits to Dex Horthy/Humanlayer's show-me skill, with `CREDITS.md`. It is deferred. Audit that secondary source and its applicable terms before copying it. The current selection does not import it.

## Update and audit procedure

1. Fetch a new source into a separate pinned checkout; record URL, SHA, license text and relevant file notices.
2. Compare only selected source components and their complete dependency closure against this manifest and locally modified files. Never overwrite Agentic adaptations wholesale.
3. Revisit the disposition/conflict record for behavioral changes. Preserve Codinary contracts and existing local conventions.
4. Update actual source/destination path pairs, both digests, modifications and notices only after local changes are reviewable.
5. Validate that every selected installation/package contains required licenses/assets and that no duplicate role/skill registration appears. Run focused checks and required baseline gates.
6. Record upstream behavioral evidence separately from native Agentic runtime proof. No automatic source tracking, global installs or release publication is authorized by this procedure.

The single Agentic marketplace registers nine thin Claude wrappers exactly once. No upstream EGM plugin identity/icon is imported. Own Agentic code retains root MIT and standalone LICENSE-Agentic.txt; Matt MIT accompanies all existing adaptations/new requirements/planning material; EGM Apache license and modification notices accompany every self-contained bundle. Actual native execution remains separate from source provenance.

## Caveman and Security Audit extension (2026-10-29)

| Source | Revision | Licensing treatment |
| --- | --- | --- |
| [Caveman core](https://github.com/juliusbrussee/caveman/tree/9b68f7ed12b05e7efaff18e65c5a3fc2849fd0a4/skills/caveman) | `9b68f7ed12b05e7efaff18e65c5a3fc2849fd0a4` | Current Apache-2.0 plus retained historical MIT contributions. Both full texts and applicable NOTICE accompany the standalone skill; adapted SKILL.md carries a prominent modification notice. |
| [Cloudflare Security Audit](https://github.com/cloudflare/security-audit-skill/tree/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit) | `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` | MIT, Copyright (c) 2025-2026 Cloudflare, Inc.; full notice in standalone directory; no upstream NOTICE file found. |

Source Git origins/HEAD and licenses were inspected in separate read-only checkouts under `/private/tmp/agentic-{caveman,security}-upstream`. No upstream installer was executed. The earlier audit date and source anchors above remain historical; these new source records carry their own date. Exact mappings extend the existing JSON manifest with 21 source files and four notice mappings.

Caveman imports only core `skills/caveman/SKILL.md`. Local changes restrict activation, remove excluded aliases/compression exceptions, preserve truthful status, host precedence, full artifacts and audit evidence, and reject unsupported measured savings. `NOTICE.txt` retains the applicable upstream copyright/historical-MIT paragraph with local license pointers and an explicit modification/scope statement; only attributions for excluded runtime/CLI/browser/fonts are omitted. `LICENSE`, `LICENSE-MIT`, `NOTICE`, and `LICENSING.md` source paths/digests are recorded. No external Caveman runtime is installed or required.

Security Audit retains all 20 files under its upstream skill directory. Only `SKILL.md` adds a prominent local integration notice and required `INTEGRATION.md` pointer. All phase/attack instructions, schema, validators and tests remain byte-identical. Agentic owns the new boundary document and generated metadata/dependency/Agentic-license files; no upstream origin is fabricated for those additions. New upstream notices live inside their respective skills so existing EGM bundles do not acquire unrelated third-party content.

The existing vendored/static-data size exemption applies to unchanged upstream validators, tests, schema and cohesive functions/comments. No instruction, check, or evidence requirement is truncated to meet a local line cap. [Integration decisions](caveman-security-audit.md) record exclusions, boundaries and acceptance criteria; [verification](caveman-security-verification.md) distinguishes runtime evidence from static/package checks.
