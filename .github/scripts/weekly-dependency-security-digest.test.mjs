import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildDependencySecurityReply,
  buildExternalContributorReply,
  buildVlnReviewReply,
  buildWeeklySecurityDigest,
  runDigestCli,
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

/** Slack limits: a header holds 150 characters, other text holds 3000. */
const withinSlackLimits = (reply) =>
  reply.blocks.every((block) => {
    if (block.type === 'divider') return true;
    if (block.type === 'header') return block.text.text.length <= 150;
    if (block.type === 'context') {
      return block.elements.every((element) => element.text.length <= 3_000);
    }
    return block.text.type === 'mrkdwn' && block.text.text.length <= 3_000;
  });

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
  assert.equal(reply.blocks[0].type, 'header');
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
  assert.match(reply.text, /#20/);
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
  assert.ok(digest.blocks.length >= 3);
  assert.equal(
    digest.blocks.filter((block) => block.type === 'header').length,
    3,
  );
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
  assert.ok(withinSlackLimits(reply));
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
    assert.ok(withinSlackLimits(reply));
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

const quietAudit = {
  run: { url: 'https://github.com/temporalio/ui/actions/runs/99' },
  dependabot: { openAlertCount: 0 },
  remediation: null,
  vln: { pending: [], needsTriage: [] },
  externalContributors: {
    reviewReady: [],
    triage: [],
    authorFollowup: [],
    staleCount: 15,
  },
};

test('reports no action needed when no module found anything', () => {
  assert.equal(
    buildDependencySecurityReply({ audit: quietAudit }).actionable,
    false,
  );
  assert.equal(buildVlnReviewReply({ audit: quietAudit }).actionable, false);
  assert.equal(
    buildExternalContributorReply({ audit: quietAudit }).actionable,
    false,
  );
});

test('reports action needed for an authorized dependency change', () => {
  const reply = buildDependencySecurityReply({
    audit: { ...quietAudit, dependabot: { openAlertCount: 3 } },
    publishStatus: 'success',
    remediation: {
      summary: { actions: 1, manual: 0, unsupported: 0, alreadySafe: 0 },
      applied: true,
      resolver: 'deterministic-planner',
      pullRequestUrl: 'https://github.com/temporalio/ui/pull/3846',
      actions: [
        {
          packageName: 'protobufjs',
          alertIds: [338, 300, 299],
          type: 'pnpm-override',
          from: '^7.5.5',
          to: '^7.6.5',
        },
      ],
      classifications: [],
      verification: {
        verified: true,
        alerts: [
          {
            alertId: 338,
            packageName: 'protobufjs',
            resolvedVersions: ['7.6.5'],
          },
        ],
      },
    },
  });
  assert.equal(reply.actionable, true);
});

test('reports action needed when a classification waits on a person', () => {
  const reply = buildDependencySecurityReply({
    audit: quietAudit,
    remediation: {
      summary: { actions: 0, manual: 1, unsupported: 0, alreadySafe: 0 },
      applied: false,
      actions: [],
      classifications: [
        {
          packageName: '@grpc/grpc-js',
          alertIds: [295, 294],
          status: 'manual',
          reason: 'no override exists',
        },
      ],
    },
  });
  assert.equal(reply.actionable, true);
});

test('reports action needed when an alert covers an already patched tree', () => {
  const reply = buildDependencySecurityReply({
    audit: quietAudit,
    remediation: {
      summary: { actions: 0, manual: 0, unsupported: 0, alreadySafe: 2 },
      applied: false,
      actions: [],
      classifications: [
        {
          packageName: 'left-pad',
          alertIds: [7],
          status: 'alreadySafe',
          reason: 'the lockfile resolves 2.0.0',
        },
      ],
    },
  });
  assert.equal(reply.actionable, true);
});

test('reports action needed when publication failed', () => {
  const reply = buildDependencySecurityReply({
    audit: quietAudit,
    publishStatus: 'failure',
    remediation: {
      summary: { actions: 1, manual: 0, unsupported: 0, alreadySafe: 0 },
      applied: true,
      actions: [{ packageName: 'x', alertIds: [1], type: 'pnpm-override' }],
      classifications: [],
    },
  });
  assert.equal(reply.actionable, true);
});

test('reports action needed for a pending VLN pull request', () => {
  assert.equal(buildVlnReviewReply({ audit }).actionable, true);
});

test('treats a stale count alone as no action needed', () => {
  const reply = buildExternalContributorReply({ audit: quietAudit });
  assert.equal(reply.actionable, false);
});

test('reports action needed when an external pull request waits on triage', () => {
  assert.equal(buildExternalContributorReply({ audit }).actionable, true);
});

const RUN = 'https://github.com/temporalio/ui/actions/runs/99';

const appliedRemediation = {
  summary: { actions: 1, manual: 1, unsupported: 0, alreadySafe: 0 },
  applied: true,
  resolver: 'deterministic-planner',
  pullRequestUrl: 'https://github.com/temporalio/ui/pull/3846',
  actions: [
    {
      packageName: 'protobufjs',
      alertIds: [338, 300, 299],
      type: 'pnpm-override',
      from: '^7.5.5',
      to: '^7.6.5',
    },
  ],
  classifications: [
    {
      packageName: '@grpc/grpc-js',
      alertIds: [295, 294],
      status: 'manual',
      reason: 'no existing pnpm override',
    },
  ],
  verification: {
    verified: true,
    alerts: [
      { alertId: 338, packageName: 'protobufjs', resolvedVersions: ['7.6.5'] },
    ],
  },
};

const blockTypes = (reply) => reply.blocks.map((block) => block.type);
const blockText = (reply) => JSON.stringify(reply.blocks);
const countRunLinks = (reply) => blockText(reply).split(RUN).length - 1;

test('leads every reply with a header block', () => {
  for (const reply of [
    buildDependencySecurityReply({
      audit,
      remediation: appliedRemediation,
      publishStatus: 'success',
      runUrl: RUN,
    }),
    buildVlnReviewReply({ audit, runUrl: RUN }),
    buildExternalContributorReply({ audit, runUrl: RUN }),
  ]) {
    assert.equal(blockTypes(reply)[0], 'header');
    assert.equal(reply.blocks[0].text.type, 'plain_text');
    assert.ok(reply.blocks[0].text.text.length <= 150);
  }
});

test('links the workflow run once, from a context block', () => {
  for (const reply of [
    buildDependencySecurityReply({
      audit,
      remediation: appliedRemediation,
      publishStatus: 'success',
      runUrl: RUN,
    }),
    buildVlnReviewReply({ audit, runUrl: RUN }),
    buildExternalContributorReply({ audit, runUrl: RUN }),
  ]) {
    assert.equal(countRunLinks(reply), 1);
    const contexts = reply.blocks.filter((b) => b.type === 'context');
    assert.equal(contexts.length, 1);
    assert.equal(blockTypes(reply).at(-1), 'context');
    assert.match(JSON.stringify(contexts[0]), /runs\/99/);
  }
});

test('names the package, the range, and the resolved version', () => {
  const reply = buildDependencySecurityReply({
    audit,
    remediation: appliedRemediation,
    publishStatus: 'success',
    runUrl: RUN,
  });
  const rendered = blockText(reply);
  assert.match(rendered, /protobufjs/);
  assert.match(rendered, /\^7\.5\.5/);
  assert.match(rendered, /\^7\.6\.5/);
  assert.match(rendered, /7\.6\.5/);
  assert.match(rendered, /3846/);
});

test('separates the decision list from the applied change', () => {
  const reply = buildDependencySecurityReply({
    audit,
    remediation: appliedRemediation,
    publishStatus: 'success',
    runUrl: RUN,
  });
  assert.ok(blockTypes(reply).includes('divider'));
});

test('keeps the actionable flag out of the Slack payload it writes', async () => {
  const { mkdtemp, readFile, writeFile } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const nodePath = await import('node:path');

  const directory = await mkdtemp(nodePath.join(tmpdir(), 'weekly-digest-'));
  const inputPath = nodePath.join(directory, 'audit.json');
  const outputPath = nodePath.join(directory, 'digest.json');
  await writeFile(inputPath, JSON.stringify(quietAudit));

  const payload = await runDigestCli({
    argv: [
      '--module',
      'vln-review',
      '--input',
      inputPath,
      '--output',
      outputPath,
    ],
    env: {},
  });

  assert.equal(payload.actionable, false);
  const written = JSON.parse(await readFile(outputPath, 'utf8'));
  assert.equal(written.actionable, undefined);
  assert.ok(Array.isArray(written.blocks));
  assert.equal(typeof written.text, 'string');
});

test('names the published pull request by number when only its URL is known', () => {
  const reply = buildDependencySecurityReply({
    audit: { ...quietAudit, dependabot: { openAlertCount: 3 } },
    publishStatus: 'success',
    runUrl: RUN,
    remediation: {
      summary: { actions: 1, manual: 0, unsupported: 0, alreadySafe: 0 },
      applied: true,
      pullRequestUrl: 'https://github.com/temporalio/ui/pull/3846',
      actions: [
        {
          packageName: 'protobufjs',
          alertIds: [338],
          type: 'pnpm-override',
          from: '^7.5.5',
          to: '^7.6.5',
        },
      ],
      classifications: [],
    },
  });
  assert.match(JSON.stringify(reply.blocks), /#3846/);
  assert.doesNotMatch(
    JSON.stringify(reply.blocks),
    /view draft remediation PR/,
  );
});

const longTitlePullRequests = Array.from({ length: 9 }, (_, index) =>
  pullRequest(
    4000 + index,
    `feat: Add "Contains" filter option to workflow search UI for substring matching in WorkflowId and WorkflowType fields ${index}`,
  ),
);

test('keeps every list section short enough for Slack to render inline', () => {
  const reply = buildExternalContributorReply({
    audit: {
      ...audit,
      externalContributors: {
        reviewReady: [],
        triage: longTitlePullRequests,
        triageCount: 20,
        authorFollowup: longTitlePullRequests,
        authorFollowupCount: 20,
        staleCount: 3,
      },
    },
    runUrl: RUN,
  });

  // Slack hides the URL of a link, so measure what a reader sees.
  const visible = (text) => text.replaceAll(/<[^|>]+\|([^>]*)>/g, '$1');

  for (const block of reply.blocks) {
    if (block.type !== 'section') continue;
    const shown = visible(block.text.text);
    assert.ok(shown.length <= 600, `section shows ${shown.length} characters`);
    for (const line of shown.split('\n')) {
      assert.ok(line.length <= 120, `line shows ${line.length} characters`);
    }
  }
});

test('folds the omitted count into the group it belongs to', () => {
  const reply = buildExternalContributorReply({
    audit: {
      ...audit,
      externalContributors: {
        reviewReady: [],
        triage: longTitlePullRequests,
        triageCount: 20,
        authorFollowup: [],
        staleCount: 0,
      },
    },
    runUrl: RUN,
  });

  const withCount = reply.blocks.filter(
    (block) => block.type === 'section' && /more/.test(block.text.text),
  );
  assert.equal(withCount.length, 1);
  assert.match(withCount[0].text.text, /Needs triage/);
});
