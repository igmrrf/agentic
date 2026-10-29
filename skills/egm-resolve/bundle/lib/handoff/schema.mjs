export class ContractError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function requireCondition(condition, code, message) {
  if (!condition) throw new ContractError(code, message);
}

export function object(value, keys, label) {
  requireCondition(value !== null && typeof value === 'object' && !Array.isArray(value), 'SCHEMA', `${label}: expected object`);
  requireCondition(Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key)), 'SCHEMA', `${label}: unexpected or missing fields`);
}

export function text(value, label) {
  requireCondition(typeof value === 'string' && value.trim().length > 0 && value.length <= 16384, 'SCHEMA', `${label}: expected bounded text`);
}

export function list(value, label) {
  requireCondition(Array.isArray(value) && value.length <= 1000, 'SCHEMA', `${label}: expected bounded array`);
}

export function unique(values, label) {
  requireCondition(new Set(values).size === values.length, 'SCHEMA', `${label}: duplicate identifiers`);
}

export function checksum(value) {
  requireCondition(typeof value === 'string' && /^[a-f0-9]{64}$/.test(value), 'SCHEMA', 'expected SHA-256');
}

export const PRESETS = Object.freeze({ interactive: ['5', '6', '7', '8', '9'], uninterrupted: ['5', '6', '7', '8', '9'], feature_spec: ['5', '6', '7', '8'], implementation: ['9'], '5': ['5'], '6': ['6'], '7': ['7'], '8': ['8'], '9': ['9'] });
export const STATES = ['draft', 'in_review', 'changes_requested', 'reviewed', 'approved', 'in_implementation', 'superseded'];
const TEXT_FIELDS = ['architecturalDecisions', 'technicalConstraints', 'interfaces', 'dataModelChanges', 'failureScenarios', 'securityRequirements', 'migrationConsiderations', 'operationalRequirements', 'unresolvedRisks'];

function parseCriteria(payload) {
  list(payload.requirements, 'requirements');
  list(payload.acceptanceCriteria, 'acceptanceCriteria');
  requireCondition(payload.requirements.length > 0 && payload.acceptanceCriteria.length > 0, 'SCHEMA', 'requirements and acceptance criteria required');
  for (const requirement of payload.requirements) {
    object(requirement, ['id', 'text'], 'requirement');
    text(requirement.id, 'requirement.id');
    text(requirement.text, 'requirement.text');
  }
  unique(payload.requirements.map(requirement => requirement.id), 'requirements');
  for (const criterion of payload.acceptanceCriteria) {
    object(criterion, ['id', 'requirementIds', 'text', 'verification'], 'criterion');
    text(criterion.id, 'criterion.id');
    text(criterion.text, 'criterion.text');
    text(criterion.verification, 'criterion.verification');
    list(criterion.requirementIds, 'requirementIds');
    unique(criterion.requirementIds, 'requirementIds');
    requireCondition(criterion.requirementIds.length > 0 && criterion.requirementIds.every(id => payload.requirements.some(requirement => requirement.id === id)), 'TRACEABILITY', 'criterion references unknown requirement');
  }
  unique(payload.acceptanceCriteria.map(criterion => criterion.id), 'acceptanceCriteria');
  requireCondition(payload.requirements.every(requirement => payload.acceptanceCriteria.some(criterion => criterion.requirementIds.includes(requirement.id))), 'TRACEABILITY', 'requirement has no acceptance criterion');
}

function parseReviews(review) {
  object(review, ['preset', 'stages'], 'review');
  requireCondition(typeof review.preset === 'string' && Object.hasOwn(PRESETS, review.preset), 'SCHEMA', 'expected known string review preset');
  list(review.stages, 'stages');
  for (const stage of review.stages) {
    object(stage, ['id', 'report', 'reviewedDesignSha256', 'findings'], 'stage');
    requireCondition(PRESETS[review.preset].includes(stage.id), 'SCHEMA', 'unexpected review stage');
    parseFile(stage.report);
    checksum(stage.reviewedDesignSha256);
    list(stage.findings, 'findings');
    for (const finding of stage.findings) {
      object(finding, ['id', 'severity', 'summary', 'disposition'], 'finding');
      text(finding.id, 'finding.id');
      text(finding.summary, 'finding.summary');
      requireCondition(['blocker', 'major', 'nit'].includes(finding.severity), 'SCHEMA', 'unknown finding severity');
      object(finding.disposition, ['status', 'reason', 'authority'], 'disposition');
      requireCondition(['open', 'fixed', 'contested', 'accepted_risk'].includes(finding.disposition.status), 'SCHEMA', 'unknown disposition');
      text(finding.disposition.reason, 'disposition.reason');
      text(finding.disposition.authority, 'disposition.authority');
    }
    unique(stage.findings.map(finding => finding.id), 'findings');
  }
  unique(review.stages.map(stage => stage.id), 'stages');
}

export function parseFile(value) {
  object(value, ['path', 'sha256'], 'file');
  text(value.path, 'file.path');
  checksum(value.sha256);
}

export function parseArtifact(artifact) {
  object(artifact, ['schemaVersion', 'payload', 'lifecycle'], 'artifact');
  requireCondition(artifact.schemaVersion === 1, 'SCHEMA_VERSION', 'unsupported artifact schema');
  object(artifact.lifecycle, ['state'], 'lifecycle');
  requireCondition(STATES.includes(artifact.lifecycle.state), 'SCHEMA', 'unknown lifecycle state');
  const payload = artifact.payload;
  object(payload, ['specId', 'specVersion', 'repository', 'design', 'requirements', 'acceptanceCriteria', ...TEXT_FIELDS, 'review'], 'payload');
  text(payload.specId, 'specId');
  requireCondition(Number.isSafeInteger(payload.specVersion) && payload.specVersion > 0, 'SCHEMA', 'specVersion must be positive integer');
  object(payload.repository, ['url', 'revision'], 'repository');
  text(payload.repository.url, 'repository.url');
  requireCondition(typeof payload.repository.revision === 'string' && /^[a-f0-9]{40,64}$/.test(payload.repository.revision), 'SCHEMA', 'invalid repository revision');
  parseFile(payload.design);
  parseCriteria(payload);
  for (const field of TEXT_FIELDS) {
    list(payload[field], field);
    payload[field].forEach(value => text(value, field));
  }
  parseReviews(payload.review);
  return artifact;
}
