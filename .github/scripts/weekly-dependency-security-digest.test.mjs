import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildDependencySecurityReply,
  buildExternalContributorReply,
  buildVlnReviewReply,
  buildWeeklySecurityDigest,
  splitSlackSectionText,
  validatePublishStatus,
} from './weekly-dependency-security-digest.mjs';

const pullRequest = (number, title, overrides = {}) => ({
  number,
  url: `https://github.com/temporalio/ui/pull/${number}`,
  title,
  draft: false,
  review: { status: 'pending' },
  merge: 'mergeable',
  checks: { status: 'passing' },
  ...overrides,
});

const audit = {
  run: { url: 'https://github.com/temporalio/ui/actions/runs/99' },
  dependabot: { openAlertCount: 2 },
  remediation: pullRequest(10, 'Weekly dependency-security review'),
  vln: {
    pending: [
      pullRequest(11, 'VLN-1601: *unsafe*', { checks: { status: 'pending' } }),
      pullRequest(12, 'VLN-1602: dependency bump', { draft: true }),
    ],
    needsTriage: [pullRequest(13, 'Possible VLN-1603')],
  },
  externalContributors: {
    reviewReady: [pullRequest(14, 'Community fix')],
    triage: [
      pullRequest(15, 'Needs maintainer context', {
        checks: { status: 'pending' },
      }),
    ],
    authorFollowup: [
      pullRequest(16, 'Fix CI', { review: { status: 'changes_requested' } }),
    ],
    staleCount: 2,
  },
};

test('builds a dependency-security thread reply with escaped PR text and unresolved items', () => {
  const reply = buildDependencySecurityReply({
    audit,
    channel: 'C123',
    threadTs: '172345.000001',
    remediation: {
      pullRequest: audit.remediation,
      addressedAlertCount: 2,
      unresolved: [
        { number: 9, package: 'go/pkg', reason: 'manual remediation required' },
      ],
    },
  });

  assert.equal(reply.channel, 'C123');
  assert.equal(reply.thread_ts, '172345.000001');
  assert.match(reply.text, /2 alerts addressed/);
  assert.match(reply.text, /Needs human handling/);
  assert.match(reply.text, /view workflow run/);
  assert.equal(reply.blocks[0].type, 'section');
});

test('renders the remediation planner report without requiring a published PR', () => {
  const reply = buildDependencySecurityReply({
    audit: { ...audit, remediation: null },
    publishStatus: 'success',
    remediation: {
      summary: { actions: 2, manual: 1, unsupported: 1 },
      applied: true,
      pullRequestUrl: 'https://github.com/temporalio/ui/pull/20',
      classifications: [
        {
          status: 'manual',
          packageName: 'go/pkg',
          reason: 'requires a major upgrade',
        },
        {
          status: 'unsupported',
          packageName: 'ruby/pkg',
          reason: 'unsupported ecosystem',
        },
      ],
    },
  });
  assert.match(reply.text, /2 safe changes applied/);
  assert.match(reply.text, /view draft remediation PR/);
  assert.match(reply.text, /go\/pkg/);
  assert.match(reply.text, /unsupported ecosystem/);
});

test('never reports an applied remediation without successful publication and a PR URL', () => {
  const remediation = {
    summary: { actions: 2 },
    applied: true,
    classifications: [],
  };
  const failed = buildDependencySecurityReply({
    audit: { ...audit, remediation: null },
    remediation,
    publishStatus: 'failure',
  });
  assert.doesNotMatch(failed.text, /changes applied/);
  assert.match(failed.text, /publication failed/);
  assert.match(failed.text, /Manual review required/);

  const skipped = buildDependencySecurityReply({
    audit: { ...audit, remediation: null },
    remediation,
    publishStatus: 'skipped',
  });
  assert.doesNotMatch(skipped.text, /changes applied/);
  assert.match(skipped.text, /publication was skipped/);

  const missingLink = buildDependencySecurityReply({
    audit: { ...audit, remediation: null },
    remediation,
    publishStatus: 'success',
  });
  assert.doesNotMatch(missingLink.text, /changes applied/);
  assert.match(missingLink.text, /success without a PR link/);

  assert.throws(
    () => validatePublishStatus('unknown'),
    /Unsupported publish status/,
  );
});

test('builds capped VLN replies and separately surfaces odd matches', () => {
  const reply = buildVlnReviewReply({
    audit,
    vlnLimit: 1,
    channel: 'C123',
    threadTs: '172345.000001',
  });

  assert.match(reply.text, /VLN review/);
  assert.ok(reply.text.includes('#11: VLN-1601: \u200B*unsafe\u200B*'));
  assert.match(reply.text, /…and 1 more/);
  assert.match(reply.text, /VLN matches needing triage/);
  assert.match(reply.text, /#13: Possible VLN-1603/);
  assert.doesNotMatch(reply.text, /#12:/);
});

test('compatibility summary combines the two independent replies', () => {
  const digest = buildWeeklySecurityDigest({ audit });
  assert.match(digest.text, /Dependency security/);
  assert.match(digest.text, /VLN review/);
  assert.match(digest.text, /External contributor PRs/);
  assert.equal(digest.blocks.length, 3);
});

test('builds external contributor replies by action bucket with stale count', () => {
  const reply = buildExternalContributorReply({
    audit,
    channel: 'C123',
    threadTs: '172345.000001',
  });
  assert.equal(reply.channel, 'C123');
  assert.match(reply.text, /Ready for review/);
  assert.match(reply.text, /#14: Community fix/);
  assert.match(reply.text, /Waiting on author/);
  assert.match(reply.text, /2 external PRs have not been updated in 14\+ days/);
});

test('splits Slack sections at the 3000-character boundary', () => {
  assert.deepEqual(splitSlackSectionText('x'.repeat(3_000)), [
    'x'.repeat(3_000),
  ]);
  const chunks = splitSlackSectionText('x'.repeat(3_001));
  assert.equal(chunks.length, 2);
  assert.ok(chunks.every((chunk) => chunk.length <= 3_000));
  assert.equal(chunks.join(''), 'x'.repeat(3_001));
});

test('caps long dependency findings with an omitted count and workflow link', () => {
  const classifications = Array.from({ length: 13 }, (_, index) => ({
    status: 'manual',
    packageName: `package-${index}`,
    reason: `manual ${'detail '.repeat(200)}`,
  }));
  const reply = buildDependencySecurityReply({
    audit: { ...audit, remediation: null },
    remediation: {
      summary: { actions: 0 },
      applied: false,
      classifications,
    },
  });
  assert.match(reply.text, /…and 3 more/);
  assert.match(reply.text, /see workflow run/);
  assert.ok(
    reply.blocks.every(
      (block) =>
        block.text.type === 'mrkdwn' && block.text.text.length <= 3_000,
    ),
  );
  assert.ok(reply.blocks.length > 1);
});

test('bounds every VLN and external Slack section and reports omitted PRs', () => {
  const manyPullRequests = Array.from({ length: 12 }, (_, index) =>
    pullRequest(
      100 + index,
      `VLN-${2000 + index}: ${'long title '.repeat(200)}`,
    ),
  );
  const largeAudit = {
    ...audit,
    vln: { pending: manyPullRequests, needsTriage: manyPullRequests },
    externalContributors: {
      reviewReady: manyPullRequests.slice(0, 5),
      reviewReadyCount: 12,
      triage: manyPullRequests.slice(0, 5),
      triageCount: 12,
      authorFollowup: manyPullRequests.slice(0, 5),
      authorFollowupCount: 12,
      staleCount: 0,
    },
  };
  for (const reply of [
    buildVlnReviewReply({ audit: largeAudit }),
    buildExternalContributorReply({ audit: largeAudit }),
  ]) {
    assert.match(reply.text, /…and [27] more/);
    assert.match(reply.text, /see workflow run/);
    assert.ok(reply.blocks.every((block) => block.text.text.length <= 3_000));
  }
});

test('labels an unresolved classification that names no package', () => {
  const reply = buildDependencySecurityReply({
    audit: { ...audit, remediation: null },
    remediation: {
      summary: { actions: 0, manual: 1, unsupported: 0 },
      applied: false,
      classifications: [
        {
          status: 'manual',
          packageName: null,
          alertIds: [77],
          reason: 'Alert did not identify an npm package.',
        },
      ],
    },
  });

  assert.doesNotMatch(reply.text, /\[object Object\]/);
  assert.match(reply.text, /#77/);
});
