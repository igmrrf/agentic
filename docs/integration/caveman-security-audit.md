# Caveman and Security Audit integration

## Plan and acceptance criteria

Inspect pinned source snapshots, retain the selected capabilities and licenses, adapt only their Agentic boundary, register the two standalone directories, regenerate existing discovery metadata, and verify installed and packaged consumers. Preserve existing delivery sources and user changes. No upstream installer runs. The initial implementation scope excluded commit, push, publication, deployment, and merge; later release authorization is recorded in the verification checkpoint.

| Criterion | Required evidence |
| --- | --- |
| AC1 | Caveman ships only its core conversational skill, activates explicitly, persists until disabled, and reports status without activating. |
| AC2 | Technical payload, negation, security warnings, authorization, ordered instructions, persisted artifacts, audit evidence, and required host output retain full meaning and required detail. |
| AC3 | Security Audit retains guidance and full-audit routing, all six phases, attack references, schema, validators, prior-run freshness, and independent verification. |
| AC4 | Missing sandbox controls or fresh delegation remain explicit blockers; neither self-review nor successful schema validation establishes independent execution. |
| AC5 | Agentic, Codinary, EGM, Caveman, and Security Audit retain distinct ownership; audit records cannot authorize source fixes or replace delivery verdicts. |
| AC6 | Each skill installs alone through local copy/link, remote-archive simulation, npm-package CLI, and plain directory copy with all resources and notices. |
| AC7 | Registry generation, existing integration/installer checks, upstream validator tests, provenance digests, package contents, and protected Codinary sources pass checks. |
| AC8 | Behavioral probes distinguish observed decisions from unverified native orchestration, sandbox enforcement, and third-party installation. |

## Source selection

| Source | Pinned revision | Selection |
| --- | --- | --- |
| [Caveman](https://github.com/juliusbrussee/caveman/tree/9b68f7ed12b05e7efaff18e65c5a3fc2849fd0a4) | `9b68f7ed12b05e7efaff18e65c5a3fc2849fd0a4` | Adapt only `skills/caveman/SKILL.md`; preserve Apache-2.0, historical MIT notice, and applicable NOTICE text. |
| [Security Audit](https://github.com/cloudflare/security-audit-skill/tree/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8) | `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` | All 20 files under `skills/security-audit/`, including both validator test suites; Cloudflare MIT notice. |

Exact source/destination paths, SHA-256 digests, and adaptations extend [upstream-provenance.json](upstream-provenance.json). Existing provenance anchors retain their historical meaning. New licenses stay inside the respective standalone skill; this avoids adding unrelated notices to every generated EGM bundle.

Caveman infrastructure is excluded: proxy, CLI, routing, telemetry, cloud services, SDKs, middleware, compression tools, hooks, additional skills, browser/runtime, fonts, and binaries. Upstream `/caveman ultra` and `/caveman wenyan` route to excluded `ultracave` and `megacave`; neither alias ships. The persisted-artifact exception for `/caveman-compress` is removed because that capability is excluded. Core activation, status, and disable commands remain in the one skill. No token-savings measurement is claimed.

## Ownership and evidence boundary

Agentic owns engineering standards and initialization. Codinary remains the sole engineering delivery orchestrator. EGM owns architectural design and independent design review. Caveman controls optional conversational presentation. Security Audit owns security guidance and its specialized audit procedure.

Focused guidance can inform already scoped implementation and review. Full audits use an external `security-audit-skill/<repo>/run-<N>` namespace and preserve upstream filenames and additive prior runs. When linked from Codinary, the delivery brief/ledger references that absolute audit directory and source state; audit files never occupy Codinary's brief, ledger, review, response, release-review, or summary paths.

Codinary retains source changes, delivery acceptance criteria, the run-wide two-fix limit, fresh independent read-only QA, source-state evidence, review-only scope, and action-specific release authorization. Security findings recommend remediation; they do not authorize it. The audit never changes target source. Any separately authorized fix returns to Codinary and requires refreshed delivery evidence and audit source claims as applicable. Audit iterations cannot reset the delivery fix budget.

Audit `confirmed`, `needs_validation`, and `rejected` states remain distinct from Codinary's `pass`, `fail`, and `blocked` verdicts. A completed audit with zero confirmed findings establishes neither exhaustive coverage nor a delivery pass. Required missing audit evidence stays visible in the delivery verification matrix and blocks completion under existing verdict rules. Independent hunters/verifiers do not automatically satisfy delivery QA; that role must independently meet the full Codinary contract.

Caveman can shorten surrounding conversation only. Audit prompts, JSON, source traces, findings, coverage, reports, approval material, and required verification output retain full language and evidence. Host-required communication and confirmations take precedence.

## Runtime and size policy

Full audits require actual fresh contexts for independent roles. On a host without genuine delegation, report the missing role/capability and an incomplete audit; never simulate reviewers in the parent context. Host install/discovery support establishes no runtime guarantee.

Target-controlled execution requires every upstream OS sandbox control: no external network, an empty allowlisted environment, scratch-only writes, read-only target/toolchain, and CPU, memory, process, file-size, disk, and wall-clock limits. Parent-only evidence promotion also requires the upstream descriptor-based controls. Missing enforcement blocks execution or promotion and preserves the exact unresolved fact. No new sandbox implementation or unrelated runtime dependency is added by this integration.

`CODING.md` §5 exempts vendored code and static data. Security Audit's unchanged validators (872/773 lines), upstream tests (740/652 lines), and schema (461 lines) retain that exemption, including cohesive functions and upstream comments. They are vendored, digest-bound resources, not rewritten application code. Phase instructions are retained without truncation; the adapted entrypoint stays below 400 lines. Agentic-owned additions follow normal caps.

## Verification record

Baseline: clean worktree, registry check passed with 15 skills, and all 117 existing integration tests passed before implementation. Final checks and behavioral evidence are recorded in [caveman-security-verification.md](caveman-security-verification.md).
