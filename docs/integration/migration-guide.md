# Migration and local usage

Existing Agentic users keep their standards, configs and seven canonical skills. Existing Codinary requests continue directly. Refresh skills through the same chosen install channel; avoid installing both marketplace and copied duplicates in one host. Agentic remains the only plugin identity.

```text
node bin/agentic.js registry check
bash scripts/install-skills.sh --target /path/to/project --skill egm-review --agent agents
bash scripts/install-skills.sh --target /path/to/project --skill grilling,codinary --agent agents
```

The installer copies complete generated bundles for EGM/Codinary. It accepts grill-me as an alias for grilling without creating another command directory. Dependencies are installed first; uninstall removes selected skills and retains dependencies. Repeat install preserves existing skill content unless --force/--update is explicit. Existing workspace config stays unchanged. Update replaces selected skill directories; preserve intentional local changes before authorizing it. Uninstall preserves workspace config and unrelated skills. Local --link uses canonical generated content in the clone; regenerate after changing canonical resources. Remote tar and npm channels include the same files/notices.

`npx skills` remains an optional third-party directory installer. EGM selected-directory copies are self-contained. If selecting TDD through a copier that ignores dependencies.txt, also select codebase-design. This integration does not install or execute a third-party CLI automatically.

For requirements, invoke grilling and return its stable IDs/business rules/criteria to Codinary. Existing domain-modeling keeps CONTEXT.md and ADR conventions. Code-review accepts a local spec independently of an issue tracker; a missing tracker config no longer demands an upstream setup command.

For complex design use egm-brainstorm/egm-draft, select egm-review's preset or individual stage, and retain raw reports/findings/dispositions. Actual fresh dispatch is required for Goldfish; unsupported hosts stop the review. An AI clean report does not approve a design. Review-only requests produce findings without auto-fixes.

To deliver an approved design, read handoff-contract.md and security-model.md. Prepare a version-1 payload and exact design/report hashes, run validate while reviewed, and ask the human owner to inspect it. The human controls signing and separately pins the Ed25519 public key, current specification/version/hash and expected repository outside the reviewed root. The package has no signing command. Never put private keys in project/run artifacts or ask an agent to establish real human trust. Synthetic test receipts are never human authorization.

Use explicit intake with --mode handoff and receipt/trust paths. Supply trust as an explicitly chosen canonical absolute external path without traversal, repeated separators or symlink aliases; macOS `/tmp` and `/var` aliases require the canonical `/private/...` location. Public Node imports use `@igmrrf/agentic/lib/handoff/index.mjs` and `@igmrrf/agentic/lib/registry.mjs`; existing package subpaths retain Node's extensionless resolution. A valid projection preserves signed criterion IDs in Codinary's brief/checks/ledger; failed intake stops dependent delivery. Save transition output to a new file, revalidate and preserve stable snapshots. If design/criteria/report bytes change, increment version, renew affected review and human approval, and update external expected-current authority. Superseding a local label alone is not revocation against a malicious artifact writer.

Roll back this additive integration by restoring prior skill installation from the user's retained backup/version and removing only explicitly selected new skill directories. No language standards/init migration, repository data rewrite, background service, catalog or automatic upstream tracking is introduced. Keep existing user work and evidence. Release/commit/push remain separate authorized actions.
