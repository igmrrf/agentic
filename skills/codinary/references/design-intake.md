# Route requirements and optional approved designs

| Request | Route | Completion boundary |
| --- | --- | --- |
| Small, localized, understood and reversible | Direct Codinary discovery and proportional verification | Existing delivery contract |
| A few boundaries with unclear requirements but understood architecture | Targeted grilling, then Codinary with settled criteria | Requirements brief, then delivery |
| Uncertain architecture, authorization/privacy, data integrity, major API/migration, distributed or operational risk | EGM brainstorm/draft and independent review; explicit human approval; Codinary intake | Valid approved design, then independent delivery QA |
| Design-only | EGM requested stages only | Design artifacts and open decisions |
| Review-only | Requested design/source review only | Report; findings do not authorize fixes |
| Implementation-only | Direct scope, or explicitly supplied approved-design mode | Honor scope and all existing QA obligations |

Judge uncertainty, boundary type/count, security/privacy, data integrity, reversibility and operations, not line count. Do not turn small work into full design ceremony. Specialists return scoped results to the caller and never recursively invoke delivery.

The caller explicitly selects direct or handoff mode. Direct requests retain the existing Codinary workflow without an EGM prerequisite. In handoff mode, read bundle/docs/handoff-contract.md and bundle/docs/security-model.md, then run the bundled validator using the caller-supplied external trust/current assertion and detached human receipt:

```text
node bundle/bin/handoff.mjs intake --mode handoff --root <repo> --artifact <relative-handoff.json> --receipt <receipt.json> --trust <external-trust.json>
```

Block invalid, stale, superseded, unsigned, wrongly bound or untrusted inputs. Preserve the requested mode; an invalid approved-design request cannot silently become direct delivery. Never sign or establish real human trust autonomously. This approval covers design only, not source correctness, release, commits or production actions.

Copy the validator's canonical criterion IDs/text into brief.md by reference/projection, then map verification check IDs to them. Record spec ID/version, payload/design/report hashes, repository revision and validated approval authority/time in the brief and append-only ledger. Retain original design/review artifacts. Avoid a second editable acceptance-criteria source.

Set in_implementation only by a validated transition; transition output is a new JSON artifact, not an automatic write. Preserve stable snapshots and revalidate before delegation. If implementation discovers changed requirements, constraints or architecture, stop affected dependent work, return the divergence to design, supersede old version, renew affected review and human approval/current assertion. Replan affected checks without lowering criteria. Any signed-content byte change, including editorial text, invalidates approval; changes outside signed content do not. Expected-current replay prevention depends on the external caller assertion and is not a global latest-version service.

All Codinary roles, reviewer JSON, statuses, two-fix limit, narrow resource waivers, review-only rules, cleanup and release semantics remain authoritative. Design reviews are not implementation QA. Read planning.md when composing a medium/large delivery plan.

## Successful and rejected intake records

After successful validation, the brief records `input_mode: handoff`, `spec_id`, `spec_version`, `payload_hash`, repository URL/revision, design path/hash, review preset/report paths/hashes and verified approval authority/time. Under Acceptance Criteria retain the signed ID (for example `AC-PAY-1`) and its exact text, requirement IDs and verification instruction. Existing direct-task AC1... generation applies only to direct tasks; do not renumber imported IDs. Verification rows use execution check IDs such as V1 and criteria=["AC-PAY-1"]. Reviewer JSON criteria uses id="AC-PAY-1" and checks=["V1"]. Ledger entry records timestamp, `handoff_validated`, same spec/version/hash/approval and brief/matrix paths; later role handoffs retain that identity.

If intake fails, append a rejection entry with input mode, artifact path, failure code and prerequisite/correction, preserving the rejected evidence. Do not create an implementation brief with invented criteria, dispatch an implementer/fixer, mark in_implementation or downgrade modes. A rejection can have a diagnostic record in an already-created run directory; it grants no source authority. Continue independent tasks only when separately authorized. This is caller behavior, not automatic filesystem mutation by the validator.
