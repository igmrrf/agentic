# Canonical skill registry

`registry/skills.json` is the authoritative discovery/contract data. Its root is exactly `{schemaVersion:1,skills:[Skill...]}`. `lib/registry.mjs` provides strict `parseRegistry(registry)` and asynchronous `validateRegistry(root,registry)`; both return the registry on success and throw on failure. No execution engine is introduced. Related skills are descriptive references, not recursive invocation edges.

| Skill field | Exact type/constraint |
| --- | --- |
| id | Nonempty lowercase slug matching `[a-z][a-z0-9-]*` |
| description, responsibility, invocation | Nonempty bounded text; invocation describes user-facing names |
| modelInvoked | Boolean; false requires disable-model-invocation in SKILL.md |
| inputs, outputs, prerequisites | Arrays of bounded nonempty text |
| dependencies | Array of canonical skill IDs; installation prerequisites |
| sideEffects, runtimeCapabilities, permissions | Arrays of bounded nonempty text; permissions distinguish instruction from enforcement |
| failureSemantics | Array of bounded nonempty text describing blocked/failure behavior |
| environments | Array of bounded nonempty text with discovery/runtime evidence limits |
| relatedSkills | Array of canonical skill IDs; descriptive only |
| aliases | Array of unique lowercase slugs sharing namespace with canonical IDs |
| path | Exactly `skills/<id>`; existing root-confined realpath |
| bundle | Boolean; generate self-contained EGM resources and intake tooling when true |

Root/entry unexpected keys reject. Skills must be nonempty, arrays <=1000, strings <=16384. Each array has unique elements; IDs and aliases are unique across all entries. Dependencies/related IDs must exist and cannot refer to self. Dependency cycles and depth beyond the installer's 15-edge bound reject. All 15 directories must correspond exactly to the registry. Actual local Markdown links outside fenced examples must exist and remain within root. Runtime-only names in prose are not treated as filesystem links.

For example, `tdd` has modelInvoked=true, dependencies=["codebase-design"], bundle=false. `egm-review` has modelInvoked=false, dependencies=[], bundle=true: every runtime resource is physically included in that skill directory. Full representative entries are inspectable with `agentic registry list`; no second hand-maintained schema or public type copy competes with the executable parser.

## Commands and generated outputs

```text
node scripts/registry.mjs list
node scripts/registry.mjs generate
node scripts/registry.mjs check
agentic registry list
agentic registry check
```

No flags or extra arguments are accepted. `list` prints the strict registry JSON. `generate` creates deterministic metadata/bundles then validates them; `check` changes nothing and compares actual bytes, detects extra generated bundle files and validates references. Both print `Registry <command>: 15 canonical skills, generated metadata and bundles valid` on success. Failures print the cause on stderr and exit 1; success exits 0. Unknown commands, malformed registries, missing paths, ambiguous aliases, cycles, bad references and any generated drift fail. `npm pack` checks registry first through prepack.

| Canonical input | Generated output |
| --- | --- |
| registry entries | `.claude-plugin/marketplace.json` skills list and plugin description; one existing Agentic identity |
| id/responsibility/modelInvoked | `skills/<id>/agents/openai.yaml` |
| aliases | `skills/aliases.tsv`, installer resolves alias to canonical directory |
| dependencies | `skills/<id>/dependencies.txt`, installer includes dependency closure on install |
| framework/egm/** | `skills/<bundled-id>/bundle/**`, same relative layout, byte-for-byte |
| lib/handoff/** | `skills/<bundled-id>/bundle/lib/handoff/**` |
| bin/handoff.mjs | `skills/<bundled-id>/bundle/bin/handoff.mjs` |
| licenses/** | `skills/<bundled-id>/bundle/licenses/**` |
| docs/integration/{handoff-contract,security-model}.md | `skills/<bundled-id>/bundle/docs/{handoff-contract,security-model}.md` |

Bundled IDs are Codinary and all seven EGM commands. Source definitions stay canonical; generated copies are not editable definitions or duplicate commands. The one Agentic marketplace registers nine generated thin Claude persona wrappers exactly once. Canonical definitions stay framework/egm/agents; framework/egm/adapters/claude produces .claude-plugin/agents. Seven reviewers declare Read/Grep/Glob plus omitClaudeMd:true; coordinators have scoped documentation/delegation tools. Standalone copies use fresh general-purpose fallback. Static registration is not native runtime proof.

The installer resolves `grill-me` to `grilling`, preserving one interview engine. It installs dependencies before requested skills, deduplicates canonical IDs and enforces bounds. Uninstall removes only requested skills; it leaves installed dependencies to avoid deleting another consumer's resources. Configuration stays unchanged. A third-party directory-copy tool must install declared dependency skills separately when it does not process dependencies.txt; EGM and Codinary optional intake are self-contained and have no such sibling dependency.

## Extension procedure

Add a scoped canonical skill and all required resources, add its strict entry, resolve overlaps/ownership, then generate/check. Codinary needs no registry-specific rewrite. Add dependency edges only for actual mandatory invocation/installation requirements; use relatedSkills for optional guidance. Keep authority with Agentic standards, EGM design and Codinary delivery. Alias metadata never authorizes an operation.
