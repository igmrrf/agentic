# Caveman and Security Audit verification

The local implementation checkpoint and requested verification completed on 2026-10-29, before release authorization. Tests used Node.js `v26.10.0` and macOS Bash `3.2.57`; other Node/native-host versions were not exercised. No commit, push, publication, deployment, or merge had been performed at that checkpoint. Subsequent user authorization permits release; package and marketplace versions are prepared as 1.3.0 and the release candidate is checked again before publication.

## Automated results

| Check | Observed result |
| --- | --- |
| Pre-edit baseline | Clean worktree; registry 15; all 117 existing integration tests passed. |
| `npm run registry:check` | Passed: 17 canonical skills, generated metadata/bundles/marketplace and local references valid. |
| `node scripts/check-provenance.mjs` | Passed: 376 source/destination mappings, including 21 new source files and four notice mappings. |
| `npm run test:integration` | Passed: 127 tests, zero failures/skips; includes 10 new specialist tests and extended package/generation-drift checks. |
| `TEST_BASH=/bin/bash scripts/test-install-skills.sh` | Passed: all 23 installer/marketplace checks on Bash 3.2. |
| `npm run test:security-audit` / direct upstream test command | Both validator suites passed: 65 tests, zero failures/skips. |
| `node --test skills/codinary/evals/scripts/recovery.test.mjs` | Passed: 10 recovery/role-identity checks. |
| Actual `npm pack --json`, extraction, package CLI consumers | Package/prepack check and selected installed consumers passed; complete resources and notices retained. Final archive inventory is retained with the logs. |
| `claude plugin validate --strict .` | Native manifest validation passed. This is discovery validation, not native audit execution. |
| Syntax, YAML and whitespace checks | Changed JavaScript parsed; both skills' YAML metadata parsed and matched Agentic invocation policy; `git diff --check` passed. No root JavaScript formatter/linter is configured; language templates are not root tooling. |
| Protected sources | Codinary SKILL/roles/verification/platform reference/testing contract/invariants are digest-checked. All Codinary, handoff, EGM framework, initializer, installer, workspace discovery and standards sources remain unchanged. |

New regressions exercise each skill alone into both `.claude/skills` and `.agents/skills`, local links, repeat/update/uninstall with user configuration preserved, plain directory copies, local remote-archive simulation and npm-package CLI installs. They compare complete trees/bytes, resolve all local Markdown references within the selected directory, and execute both vendored validator suites from installed copies. The child test process explicitly drops inherited `NODE_TEST_CONTEXT` and requires a nonzero passing-test count; an early suppressed nested-run attempt was detected and corrected before the final run.

The installed findings validator accepts a synthetic exact sandbox blocker while rejecting unsupported severity, confirmation and empty blockers. Unchanged upstream tests exercise ledger identity/ownership/attempts, artifact paths, bounded input, schema branch semantics and hostile-input rejection. These are validator tests, not proof that reviewers ran or that source claims are true.

The generic Codex `quick_validate.py` accepts Security Audit. It rejects Caveman's `disable-model-invocation` field because that generic helper omits the existing Agentic/Claude explicit-invocation convention. The field is required by Agentic's registry and is retained; Agentic validation, YAML parsing and native marketplace validation pass. PyYAML 6.0.3 was installed only into the external temporary validation folder; no package/runtime dependency was added. This helper mismatch is not reported as a successful generic validation.

## Behavioral results

Independent evaluators started with `fork_turns: "none"` and received only the skill/resources, synthetic source/input and stated host capabilities. No expected answers were supplied. [Reproduction scenarios](../../tests/integration/specialist-behavior.md) retain the input sequence and acceptance conditions.

| Probe | Observed decision |
| --- | --- |
| Initial `/caveman status` | `off (not tracked by this host)`; loading did not activate. |
| Explicit activation and technical payload | The reply preserved `readReceipt`, the negation, `/var/tmp/receipt-17.json`, `node check.cjs --strict --limit=32`, and `ERR_SIGNATURE_INVALID: signature does not match` exactly. |
| Later status, approval artifact, JSON and host requirements | Mode remained caveman; approval question used a full sentence, JSON values were unchanged, and the reply committed to required tool updates and complete final verification output. |
| Excluded alias | `/caveman ultra` was reported unsupported, with mode unchanged; no alternate capability was invoked. |
| Disable and warning | `normal mode` restored off status; the warning explicitly required a verified backup before the exact migration command. |
| Lost earlier history, separate fresh probe | `unknown (not tracked by this host)` rather than invented activation/off state. |
| Focused security question | Source-only guidance identified the missing store/caller isolation facts, without confirmed severity, execution or automatic full-audit reports. |
| Explicit full audit with missing capabilities | Actual metadata/report recorded `incomplete`; findings were `[]`, with one unvalidated ledger candidate and one deferred coverage gap. Missing roles, OS network/memory/disk controls and descriptor-safe promotion were disclosed. No target execution or source change occurred. Both actual JSON validators passed without changing the incomplete status. |
| Material Phase 5 replacement and delivery boundary | The evaluator required a new independent verifier, kept the disputed claim outside final findings when unavailable, and rejected a delivery pass, review-only remediation and reset of an exhausted two-fix budget. |

The actual incomplete fixture and reports are retained at `/private/tmp/agentic-skills-verification/security-probe/run-1/`. Their source snapshot hash is `d422ecbb2833390b05e3eb78616bf0178b4ceadcf3d10a997c4c1050f53a4892`. Parent checks independently re-ran both validators and verified the fixture source hash. The primary logs, pinned checkout identities, input hashes, and observed-reply record are retained under `/private/tmp/agentic-skills-verification/`. These local evidence paths are not runtime dependencies of either skill.

## Remaining runtime boundaries

The behavioral probes establish decisions in controlled scenarios. They do not establish a completed six-phase audit, real hunter/critic/verifier orchestration, hostile-process isolation, sandbox resource enforcement, race-safe evidence promotion, hook tracking, or native behavior across hosts. Those capabilities remain unverified and must be tested on the actual audit host. Missing controls continue to block the affected operation.

The archive installer uses an actual local archive through the existing download/extract boundary; public-network publication and the actual third-party `npx skills` CLI were not exercised. Workspace and marketplace discovery are structurally verified. No visual surface changed, so browser/device checks are not applicable. Zero confirmed findings in the incomplete fixture is not a clean audit or delivery verdict.

All AC1–AC7 local implementation/distribution checks passed. AC8 is satisfied by the observed decision probes and explicit unverified-runtime labels. No unsupported runtime success or waiver is inferred.
