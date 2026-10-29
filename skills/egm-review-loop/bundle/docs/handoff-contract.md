# EGM to Codinary contract, version 1

The dependency-free Node 18+ API is imported from `@igmrrf/agentic/lib/handoff/index.mjs`; registry consumers use `@igmrrf/agentic/lib/registry.mjs`. The package retains unrestricted Node subpath resolution, including existing extensionless CommonJS paths such as `@igmrrf/agentic/package` and `@igmrrf/agentic/bin/agentic`. The CLI is `agentic handoff`. An installed standalone skill includes the same API under `bundle/lib/handoff/index.mjs` and CLI under `bundle/bin/handoff.mjs`. These tools validate artifacts and emit JSON; they do not execute agents or write lifecycle state.

## Choose the input mode

Direct requests go to Codinary with its existing brief, criteria and verification process. They need no EGM artifact. Approved-design requests explicitly select `intake --mode handoff`. Missing or invalid design intake blocks that request. A caller must never silently retry it as a direct task.

```text
agentic handoff validate --root <git-repository> --artifact <relative-handoff.json>
agentic handoff transition --root <git-repository> --artifact <relative-handoff.json> --to in_review
agentic handoff intake --mode handoff --root <git-repository> --artifact <relative-handoff.json> --receipt <human-receipt.json> --trust <external-trust.json>
```

Approved and in_implementation artifacts require receipt and trust even for validation. Transitions to these states also verify approval. Success is JSON on stdout with exit 0; errors are `{error,message}` on stderr with exit 1. Unknown, duplicate, missing or command-inapplicable flags reject. Transition prints a new artifact; save to a new file and revalidate. Redirecting stdout over the input file would truncate it before validation. Caller persistence must use its own atomic replacement/concurrency discipline. This is not a mutable catalog, database or transaction service.

## Exact artifact shape

All keys shown are mandatory; unexpected keys reject. Text arrays can be empty where the concern does not apply; record a reason when omission would leave a design question unresolved. Use positive integer versions and stable requirement/criterion/finding IDs. Files are bounded to 2 MiB, strings to 16384 characters, arrays to 1000 items. The executable schema is `lib/handoff/schema.mjs`.

```json
{
  "schemaVersion": 1,
  "payload": {
    "specId": "billing-recovery",
    "specVersion": 1,
    "repository": {"url": "https://example.invalid/team/project.git", "revision": "0000000000000000000000000000000000000000"},
    "design": {"path": "design/spec.md", "sha256": "<64 lowercase hex digits>"},
    "requirements": [{"id": "R1", "text": "Recover eligible payments exactly once"}],
    "acceptanceCriteria": [{"id": "AC1", "requirementIds": ["R1"], "text": "A repeated callback does not duplicate recovery", "verification": "Send callback twice through the service interface"}],
    "architecturalDecisions": [],
    "technicalConstraints": [],
    "interfaces": [],
    "dataModelChanges": [],
    "failureScenarios": [],
    "securityRequirements": [],
    "migrationConsiderations": [],
    "operationalRequirements": [],
    "unresolvedRisks": [],
    "review": {
      "preset": "implementation",
      "stages": [{
        "id": "9",
        "report": {"path": "design/reviews/readiness.md", "sha256": "<64 lowercase hex digits>"},
        "reviewedDesignSha256": "<same current design checksum>",
        "findings": [{"id": "IR-1", "severity": "major", "summary": "Retry policy unspecified", "disposition": {"status": "fixed", "reason": "Policy and negative tests added before this review", "authority": "design author"}}]
      }]
    }
  },
  "lifecycle": {"state": "reviewed"}
}
```

The illustrative placeholders must be replaced with actual hashes/revision; this example is not a valid approval fixture. Requirements and criteria must be nonempty and unique. Every criterion references existing requirements and every requirement has at least one criterion. Criterion IDs/text remain canonical when projected into Codinary's brief; execution check IDs link back to these IDs. Do not maintain a second editable criterion list. Additional discovered criteria require a renewed design version when they change approved scope.

Findings use blocker/major/nit, with disposition open/fixed/contested/accepted_risk plus reason and authority. Reviewed states require disposition of every open blocker/major. The validator checks structure and hashes, not whether an asserted finding resolution is true or its named person actually consented. Human approval binds those assertions; native review traces and independent QA remain separate evidence.

## Review coverage and state transitions

| Preset | Required stage IDs |
| --- | --- |
| interactive, uninterrupted | 5,6,7,8,9 |
| feature_spec | 5,6,7,8 |
| implementation | 9 |
| 5,6,7,8,9 | The selected stage only |

Stage IDs and finding IDs must be unique. Each report is hashed and names the current design checksum. Unknown or out-of-preset stages reject. Stage coverage is derived from the selected preset; a standalone-stage artifact never claims all five stages ran. Review completion proves neither fresh reviewer execution nor human approval; retain runtime reports and their traces.

| From | Allowed next states |
| --- | --- |
| draft | in_review, superseded |
| in_review | changes_requested, reviewed, superseded |
| changes_requested | draft, in_review, superseded |
| reviewed | approved, draft, superseded |
| approved | in_implementation, superseded |
| in_implementation | superseded |
| superseded | none |

`reviewed`, `approved`, and `in_implementation` require complete selected review coverage, current hashes and dispositions. `approved` and `in_implementation` require the detached human signature and caller-pinned expected-current binding described below. `superseded` cannot enter Codinary. Local lifecycle labels are untrusted artifact metadata. Revoking/superseding approval against artifact tampering requires changing the external trusted current assertion as well.

## Detached approval and exact signing bytes

`payload` is immutable signed content. Lifecycle and detached receipt are excluded to avoid circular signatures and permit the approved -> in_implementation transition. Any design/report byte change, even spelling/whitespace, changes its hash and invalidates approval. Any payload value change also invalidates approval. The signed bytes are canonical payload bytes; insignificant JSON encoding whitespace and object-key order outside strings are not signed content. Editorial changes within strings do change signed bytes. Create a new version, renew affected review and obtain human approval. Editorial changes outside signed content retain approval. There is no semantic equivalence detector.

Canonical serialization sorts object keys using JavaScript string sort, preserves array order, serializes primitives with JSON.stringify, emits no whitespace/newline and applies no Unicode normalization. Hash the UTF-8 canonical payload with SHA-256 into lowercase hex. Unsupported/nonfinite values reject. The public `canonical` and `payloadHash` exports implement this representation.

A receipt contains exactly `{schemaVersion:1,payloadHash,authority,approvedAt,signature}`. `approvedAt` is a UTC ISO timestamp with milliseconds. `signature` is canonical base64 for the 64-byte Ed25519 signature. Sign the UTF-8 canonical object `{domain:"agentic.egm.human-approval.v1",schemaVersion:1,payloadHash,authority,approvedAt}`. Public `approvalMessage(receipt)` returns these bytes. An independent human-controlled signer must use those exact bytes. This package deliberately has no signing command and never establishes real human key trust.

The caller separately supplies a trusted file outside the reviewed artifact root. `trustPath` / `--trust` must be an explicitly canonical absolute filesystem path: no `.`/`..` segments, repeated separators, or symlink aliases in the file or any ancestor. The final real path and every ancestor must remain outside the reviewed root. Relative paths and aliases such as macOS `/tmp` or `/var` reject with `UNTRUSTED_KEY`; callers must deliberately select and supply the independently trusted canonical location (such as `/private/tmp/...`), rather than have the validator redirect their path. This strict contract applies only to external trust, not artifact-root or receipt paths.

```json
{
  "schemaVersion": 1,
  "authority": "human-owner",
  "publicKeyPem": "<human-pinned Ed25519 public key PEM>",
  "current": {"specId": "billing-recovery", "specVersion": 1, "payloadHash": "<expected current canonical payload SHA-256>"},
  "repository": {"url": "https://example.invalid/team/project.git", "revision": "<expected Git HEAD>"}
}
```

The human verifies complete design, report findings/dispositions, criteria, repository and expected version/hash before signing. They deliver the receipt separately and pin the public key/current assertion through their trusted process. An agent may prepare unsigned bytes, show hashes and validate a receipt; it must never sign or establish trust on behalf of a human. Tests use synthetic keys only. Real approval has not been exercised by integration fixtures.

Validation resolves artifact paths within root including symlinks, matches actual Git origin and HEAD, checks current design/report bytes and selected stage coverage, then matches receipt, authority, key type, expected current identity/version/hash and repository before verifying Ed25519. No project key or `Status: Approved` text is trusted. See security-model.md for the precise threat boundary and limitations.

## Public API and error behavior

- `validateHandoff({root,artifactPath,receiptPath?,trustPath?})` resolves and strictly validates the current artifact, returning `{artifact,payloadHash,approval}`.
- `transitionHandoff({...options,to})` validates source/target prerequisites and returns new lifecycle state without writing or mutating input.
- `codinaryIntake({...options,mode:'handoff'})` requires approved/in_implementation, returning canonical criteria/requirements, design/review, repository, approval authority/time and payload identity.
- `canonical`, `sha256`, `payloadHash`, `approvalMessage`, `ContractError` and `PRESETS` support independent consumers; they do not confer authorization.

Machine categories include SCHEMA, SCHEMA_VERSION, TRACEABILITY, PATH_ESCAPE, FILE_SIZE, STALE_CONTENT, REPOSITORY, REVIEW_INCOMPLETE, STALE_REVIEW, OPEN_FINDINGS, APPROVAL_REQUIRED, UNTRUSTED_KEY, STALE_APPROVAL, AUTHORITY, KEY_TYPE, SIGNATURE, TRANSITION, MODE, NOT_APPROVED and INPUT. JSON/filesystem/crypto failures also stop the operation. Validation never executes document text. Git calls use argument arrays without a shell.

## State guards and exact return objects

Validation of a supplied state and transition to that state apply the same guards:

| State | Guards beyond strict schema, repository and every referenced file hash |
| --- | --- |
| draft, in_review, changes_requested, superseded | No readiness or approval claim; superseded still denies intake |
| reviewed | All selected stages present/current; every blocker/major is fixed or accepted_risk |
| approved, in_implementation | Same readiness guard plus valid detached human receipt and external expected-current assertion |

Open and contested blocker/major findings block reviewed/approved/in_implementation. Contesting a severe finding does not settle it: obtain a fresh review resolving it or record an explicit accepted_risk with reason/authority. Every disposition, including nits, requires nonempty reason/authority. Textual authority in a reviewed artifact is an assertion, not authenticated consent; approval requires the human signature over the complete disposition payload. A valid receipt binds accepted risks to its human authority. The validator verifies that signature, not the truth of claimed fixes or who authored unsigned reports.

`validateHandoff` returns exactly `{artifact:<parsed complete artifact>,payloadHash:<canonical payload hex>,approval:null}` in unapproved states; approved/in_implementation return approval `{authority:<receipt string>,approvedAt:<receipt UTC time>,payloadHash:<same hex>}`. `transitionHandoff` returns exactly the complete artifact with lifecycle.state replaced. It does not wrap the result or change payload.

`codinaryIntake` returns exactly `{mode:"handoff",specId,specVersion,payloadHash,source:<payload.repository>,approval:<verified object>,acceptanceCriteria:<payload array>,requirements:<payload array>,design:<payload.design>,review:<payload.review>}`. Criterion/requirement structures are unchanged, including string verification instructions and canonical IDs. Stage IDs and standalone presets are strings `"5"` through `"9"`; specVersion is a positive safe integer. IDs are nonempty bounded strings, unique within their respective requirement/criterion/stage collections; finding IDs are unique within a stage, and report trace IDs should include stage/reviewer/round to remain distinct across stages. Requirements and criteria each have minimum one; stages may be empty before reviewed, but readiness derives exact required IDs from preset.

The CLI success JSON is the corresponding public function return shape. These are executable in schema.mjs/index.mjs and exercised through independent synthetic signing and actual CLI/API boundaries in tests/integration. No API writes a Codinary brief or dispatches an agent; the caller follows references/design-intake.md to compose those artifacts after successful validation.
