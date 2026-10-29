import { parseArtifact, PRESETS, requireCondition } from './schema.mjs';
import { readJson, repositoryIdentity, resolveArtifactPath, verifyFile } from './files.mjs';
import { payloadHash, verifyApproval } from './approval.mjs';
export { approvalMessage, payloadHash } from './approval.mjs';
export { canonical, sha256 } from './files.mjs';
export { ContractError, PRESETS } from './schema.mjs';

const TRANSITIONS = Object.freeze({ draft: ['in_review', 'superseded'], in_review: ['changes_requested', 'reviewed', 'superseded'], changes_requested: ['draft', 'in_review', 'superseded'], reviewed: ['approved', 'draft', 'superseded'], approved: ['in_implementation', 'superseded'], in_implementation: ['superseded'], superseded: [] });
const REVIEWED_STATES = ['reviewed', 'approved', 'in_implementation'];

function verifyReviewCompletion(artifact) {
  const { review, design } = artifact.payload;
  requireCondition(PRESETS[review.preset].every(id => review.stages.some(stage => stage.id === id)), 'REVIEW_INCOMPLETE', 'required review stages missing');
  for (const stage of review.stages) {
    requireCondition(stage.reviewedDesignSha256 === design.sha256, 'STALE_REVIEW', 'review targets an older design');
    requireCondition(stage.findings.every(finding => finding.severity === 'nit' || ['fixed', 'accepted_risk'].includes(finding.disposition.status)), 'OPEN_FINDINGS', 'blocker/major findings must be fixed or explicitly recorded as accepted risk; contested/open findings block readiness');
  }
}

export async function validateHandoff(options) {
  const { root, artifactPath } = options;
  requireCondition(root && artifactPath, 'INPUT', 'root and relative artifactPath required');
  const artifact = parseArtifact(await readJson(await resolveArtifactPath(root, artifactPath)));
  const actual = repositoryIdentity(root);
  requireCondition(actual.url === artifact.payload.repository.url && actual.revision === artifact.payload.repository.revision, 'REPOSITORY', 'source repository or revision differs from handoff');
  await verifyFile(root, artifact.payload.design);
  for (const stage of artifact.payload.review.stages) await verifyFile(root, stage.report);
  if (REVIEWED_STATES.includes(artifact.lifecycle.state)) verifyReviewCompletion(artifact);
  let approval = null;
  if (['approved', 'in_implementation'].includes(artifact.lifecycle.state)) approval = await verifyApproval({ ...options, payload: artifact.payload });
  return { artifact, payloadHash: payloadHash(artifact.payload), approval };
}

export async function transitionHandoff(options) {
  const result = await validateHandoff(options);
  const { artifact } = result;
  requireCondition(TRANSITIONS[artifact.lifecycle.state].includes(options.to), 'TRANSITION', 'invalid lifecycle transition');
  const next = { ...artifact, lifecycle: { state: options.to } };
  if (REVIEWED_STATES.includes(options.to)) verifyReviewCompletion(next);
  if (['approved', 'in_implementation'].includes(options.to)) await verifyApproval({ ...options, payload: artifact.payload });
  return next;
}

export async function codinaryIntake(options) {
  requireCondition(options.mode === 'handoff', 'MODE', 'approved-design intake requires explicit handoff mode');
  const result = await validateHandoff(options);
  requireCondition(['approved', 'in_implementation'].includes(result.artifact.lifecycle.state), 'NOT_APPROVED', 'handoff must have valid human approval');
  const payload = result.artifact.payload;
  return { mode: 'handoff', specId: payload.specId, specVersion: payload.specVersion, payloadHash: result.payloadHash, source: payload.repository, approval: result.approval, acceptanceCriteria: payload.acceptanceCriteria, requirements: payload.requirements, design: payload.design, review: payload.review };
}
