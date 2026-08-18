import assert from 'node:assert/strict';
import test from 'node:test';

import { validateClaudeRemediation } from './validate-claude-dependency-remediation.mjs';

const base = {
  name: 'fixture',
  scripts: { test: 'vitest' },
  dependencies: { lodash: '^4.17.20', zod: '^3.23.0' },
};
const text = (value) => `${JSON.stringify(value, null, 2)}\n`;
const action = {
  packageName: 'lodash',
  alertIds: [1],
  type: 'direct-dependency',
  section: 'dependencies',
  from: '^4.17.20',
  to: '^4.17.21',
};
const report = (actions = [action]) => ({
  schemaVersion: 1,
  actions,
  applied: false,
});

test('accepts the exact authorized dependency bump', () => {
  const candidate = structuredClone(base);
  candidate.dependencies.lodash = '^4.17.21';
  const result = validateClaudeRemediation({
    baseText: text(base),
    candidateText: text(candidate),
    report: report(),
  });
  assert.equal(result.changed, true);
  assert.equal(result.report.applied, true);
  assert.equal(result.report.resolver, 'claude-code');
});

test('rejects a script or unrelated field modification', () => {
  const candidate = structuredClone(base);
  candidate.dependencies.lodash = '^4.17.21';
  candidate.scripts.test = 'echo compromised';
  assert.throws(
    () =>
      validateClaudeRemediation({
        baseText: text(base),
        candidateText: text(candidate),
        report: report(),
      }),
    /does not exactly match/,
  );
});

test('rejects a wrong or downgraded dependency version', () => {
  const candidate = structuredClone(base);
  candidate.dependencies.lodash = '^4.17.19';
  assert.throws(
    () =>
      validateClaudeRemediation({
        baseText: text(base),
        candidateText: text(candidate),
        report: report(),
      }),
    /does not exactly match/,
  );
});

test('rejects a whitespace-only candidate diff', () => {
  assert.throws(
    () =>
      validateClaudeRemediation({
        baseText: text(base),
        candidateText: JSON.stringify(base),
        report: report([]),
      }),
    /does not exactly match/,
  );
});

test('accepts no action with an unchanged candidate', () => {
  const result = validateClaudeRemediation({
    baseText: text(base),
    candidateText: text(base),
    report: report([]),
  });
  assert.equal(result.changed, false);
  assert.equal(result.report.applied, false);
  assert.equal('resolver' in result.report, false);
});

test('rejects a candidate change when no action is authorized', () => {
  const candidate = structuredClone(base);
  candidate.dependencies.zod = '^3.24.0';
  assert.throws(
    () =>
      validateClaudeRemediation({
        baseText: text(base),
        candidateText: text(candidate),
        report: report([]),
      }),
    /does not exactly match/,
  );
});
