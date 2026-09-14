import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyVln,
  collectWeeklySecurityAudit,
  githubRetryMetadata,
  isExternalContributorPullRequest,
  isRemediationPullRequest,
  mapWithConcurrency,
  normalizeDependabotAlert,
  normalizePullRequest,
  prioritizeExternalContributorPullRequest,
  retryGithubRequest,
  summarizeChecks,
  summarizeReviews,
} from './weekly-dependency-security-audit.mjs';

const pullRequest = (overrides = {}) => ({
  number: 42,
  html_url: 'https://github.com/temporalio/ui/pull/42',
  title: 'VLN-1585: update checkout',
  body: '',
  draft: false,
  user: { login: 'camper' },
  head: {
    ref: 'camper/vln-1585',
    sha: 'abc123',
    repo: { full_name: 'temporalio/ui' },
  },
  base: { repo: { full_name: 'temporalio/ui' } },
  author_association: 'MEMBER',
  requested_reviewers: [],
  mergeable: true,
  mergeable_state: 'clean',
  created_at: '2026-08-10T12:00:00Z',
  updated_at: '2026-08-12T12:00:00Z',
  ...overrides,
});

test('normalizes Dependabot alerts to the remediation-relevant fields', () => {
  assert.deepEqual(
    normalizeDependabotAlert({
      number: 5,
      html_url: 'https://github.com/temporalio/ui/security/dependabot/5',
      security_advisory: { severity: 'high', summary: 'bad package' },
      security_vulnerability: {
        package: { name: 'lodash', ecosystem: 'npm' },
        vulnerable_version_range: '< 4.17.22',
        first_patched_version: { identifier: '4.17.22' },
      },
      dependency: { manifest_path: '/package.json' },
      created_at: '2026-08-12T12:00:00Z',
    }),
    {
      number: 5,
      url: 'https://github.com/temporalio/ui/security/dependabot/5',
      severity: 'high',
      summary: 'bad package',
      package: 'lodash',
      ecosystem: 'npm',
      vulnerableRange: '< 4.17.22',
      firstPatchedVersion: '4.17.22',
      manifestPath: '/package.json',
      createdAt: '2026-08-12T12:00:00.000Z',
    },
  );
});

test('recognizes title VLNs and only recognizes body VLNs with both required signals', () => {
  assert.deepEqual(classifyVln(pullRequest()), {
    kind: 'vln',
    ticket: 'VLN-1585',
    reason: 'title',
  });
  assert.deepEqual(
    classifyVln(
      pullRequest({
        title: 'Update an action pin',
        body: 'Camper campaign: https://temporalio.atlassian.net/browse/VLN-1601',
      }),
    ),
    { kind: 'vln', ticket: 'VLN-1601', reason: 'campaign_body' },
  );
  assert.deepEqual(
    classifyVln(
      pullRequest({
        title: 'Update an action pin',
        body: 'https://temporalio.atlassian.net/browse/VLN-1601',
      }),
    ),
    {
      kind: 'needs_triage',
      ticket: 'VLN-1601',
      reason: 'jira_link_without_campaign_marker',
    },
  );
  assert.equal(
    classifyVln(pullRequest({ title: 'Fix VLN-1601 eventually' })).kind,
    'needs_triage',
  );
});

test('summarizes the latest reviewer decision and check status', () => {
  assert.deepEqual(
    summarizeReviews(
      [
        {
          user: { login: 'ross' },
          state: 'CHANGES_REQUESTED',
          submitted_at: '2026-08-10T00:00:00Z',
        },
        {
          user: { login: 'ross' },
          state: 'APPROVED',
          submitted_at: '2026-08-11T00:00:00Z',
        },
        {
          user: { login: 'tegan' },
          state: 'CHANGES_REQUESTED',
          submitted_at: '2026-08-11T00:00:00Z',
        },
      ],
      [{ login: 'bilal' }],
    ),
    {
      status: 'changes_requested',
      approvals: 1,
      changesRequested: 1,
      requested: ['bilal'],
    },
  );
  assert.deepEqual(
    summarizeChecks([
      { name: 'lint', status: 'completed', conclusion: 'success' },
      { name: 'test', status: 'in_progress', conclusion: null },
    ]),
    { status: 'pending', total: 2, failing: [], pending: ['test'] },
  );
});

test('collects normalized read-only alert, remediation, VLN and triage data', async () => {
  const audit = await collectWeeklySecurityAudit({
    repository: 'temporalio/ui',
    now: new Date('2026-08-12T12:00:00Z'),
    runUrl: 'https://github.com/temporalio/ui/actions/runs/1',
    listDependabotAlerts: async () => [
      {
        number: 7,
        security_advisory: { severity: 'critical', summary: 'alert' },
        security_vulnerability: { package: { name: 'foo', ecosystem: 'npm' } },
      },
    ],
    listPullRequests: async () => [
      pullRequest({ number: 1, title: 'VLN-1585: action pin' }),
      pullRequest({
        number: 2,
        title: 'Weekly dependency-security review',
        head: { ref: 'automation/weekly-dependency-security', sha: 'def456' },
      }),
      pullRequest({ number: 3, title: 'Maybe VLN-1999 someday' }),
    ],
    getPullRequest: async (number) =>
      ({
        1: pullRequest({ number: 1, title: 'VLN-1585: action pin' }),
        2: pullRequest({
          number: 2,
          title: 'Weekly dependency-security review',
          head: { ref: 'automation/weekly-dependency-security', sha: 'def456' },
        }),
        3: pullRequest({ number: 3, title: 'Maybe VLN-1999 someday' }),
      })[number],
    listReviews: async () => [],
    listCheckRuns: async () => [],
  });

  assert.equal(audit.dependabot.openAlertCount, 1);
  assert.equal(audit.remediation.number, 2);
  assert.deepEqual(
    audit.vln.pending.map((pr) => pr.number),
    [1],
  );
  assert.deepEqual(
    audit.vln.needsTriage.map((pr) => pr.number),
    [3],
  );
  assert.equal(normalizePullRequest(pullRequest()).merge, 'mergeable');
});

test('includes only eligible external contributors in review priority buckets', async () => {
  const externalReady = pullRequest({
    number: 20,
    title: 'Improve docs',
    user: { login: 'community-user', type: 'User' },
    author_association: 'CONTRIBUTOR',
    head: {
      ref: 'docs',
      sha: 'external1',
      repo: { full_name: 'community/ui' },
    },
    created_at: '2026-07-01T12:00:00Z',
    updated_at: '2026-07-01T12:00:00Z',
  });
  const internal = pullRequest({ number: 21 });
  const bot = pullRequest({
    number: 22,
    user: { login: 'dependabot[bot]', type: 'Bot' },
    author_association: 'CONTRIBUTOR',
    head: { ref: 'bot', sha: 'botsha', repo: { full_name: 'dependabot/ui' } },
  });
  assert.equal(isExternalContributorPullRequest(externalReady), true);
  assert.equal(isExternalContributorPullRequest(internal), false);
  assert.equal(isExternalContributorPullRequest(bot), false);
  assert.equal(
    prioritizeExternalContributorPullRequest(
      normalizePullRequest(externalReady, {
        checks: [{ name: 'test', status: 'completed', conclusion: 'success' }],
      }),
    ),
    'review_ready',
  );

  const audit = await collectWeeklySecurityAudit({
    repository: 'temporalio/ui',
    now: new Date('2026-08-12T12:00:00Z'),
    listDependabotAlerts: async () => [],
    listPullRequests: async () => [externalReady, internal, bot],
    getPullRequest: async (number) =>
      ({ 20: externalReady, 21: internal, 22: bot })[number],
    listReviews: async () => [],
    listCheckRuns: async () => [
      { name: 'test', status: 'completed', conclusion: 'success' },
    ],
  });
  assert.deepEqual(
    audit.externalContributors.reviewReady.map((pr) => pr.number),
    [20],
  );
  assert.equal(audit.externalContributors.staleCount, 1);
});

test('scopes API work to relevant module data and PR details', async () => {
  const listed = [
    pullRequest({ number: 1, title: 'Ordinary change' }),
    pullRequest({ number: 2, title: 'VLN-2001: action update' }),
    pullRequest({
      number: 3,
      title: 'Weekly dependency-security review',
      head: {
        ref: 'automation/weekly-dependency-security',
        sha: 'security',
        repo: { full_name: 'temporalio/ui' },
      },
    }),
  ];
  const detailsRequested = [];
  const reviewsRequested = [];
  const audit = await collectWeeklySecurityAudit({
    repository: 'temporalio/ui',
    scope: 'vln-review',
    now: new Date('2026-08-12T12:00:00Z'),
    listDependabotAlerts: async () => {
      throw new Error('VLN scope must not query Dependabot');
    },
    listPullRequests: async () => listed,
    getPullRequest: async (number) => {
      detailsRequested.push(number);
      return listed.find((item) => item.number === number);
    },
    listReviews: async (number) => {
      reviewsRequested.push(number);
      return [];
    },
    listCheckRuns: async () => [],
  });
  assert.deepEqual(detailsRequested, [2]);
  assert.deepEqual(reviewsRequested, [2]);
  assert.equal(audit.dependabot.openAlertCount, 0);
  assert.deepEqual(
    audit.vln.pending.map((item) => item.number),
    [2],
  );
});

test('dependency scope fetches only the remediation PR without review enrichment', async () => {
  const listed = [
    pullRequest({ number: 1, title: 'Ordinary change' }),
    pullRequest({
      number: 2,
      title: 'Weekly dependency-security review',
      head: {
        ref: 'automation/weekly-dependency-security',
        sha: 'security',
        repo: { full_name: 'temporalio/ui' },
      },
    }),
  ];
  const detailsRequested = [];
  const audit = await collectWeeklySecurityAudit({
    repository: 'temporalio/ui',
    scope: 'dependency-security',
    listDependabotAlerts: async () => [],
    listPullRequests: async () => listed,
    getPullRequest: async (number) => {
      detailsRequested.push(number);
      return listed.find((item) => item.number === number);
    },
    listReviews: async () => {
      throw new Error('Dependency scope must not fetch reviews');
    },
    listCheckRuns: async () => {
      throw new Error('Dependency scope must not fetch checks');
    },
  });
  assert.deepEqual(detailsRequested, [2]);
  assert.equal(audit.remediation.number, 2);
});

test('external scope enriches only eligible non-bot fork PRs', async () => {
  const external = pullRequest({
    number: 3,
    title: 'Community fix',
    user: { login: 'community-user', type: 'User' },
    author_association: 'CONTRIBUTOR',
    head: {
      ref: 'community-fix',
      sha: 'community-sha',
      repo: { full_name: 'community/ui' },
    },
  });
  const listed = [pullRequest({ number: 1 }), external];
  const detailsRequested = [];
  const audit = await collectWeeklySecurityAudit({
    repository: 'temporalio/ui',
    scope: 'external-contributors',
    listDependabotAlerts: async () => {
      throw new Error('External scope must not query Dependabot');
    },
    listPullRequests: async () => listed,
    getPullRequest: async (number) => {
      detailsRequested.push(number);
      return listed.find((item) => item.number === number);
    },
    listReviews: async () => [],
    listCheckRuns: async () => [],
  });
  assert.deepEqual(detailsRequested, [3]);
  assert.equal(audit.externalContributors.totalCount, 1);
});

test('bounds enrichment concurrency while preserving result order', async () => {
  let active = 0;
  let maximumActive = 0;
  const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (item) => {
    active += 1;
    maximumActive = Math.max(maximumActive, active);
    await new Promise((resolveTask) => setImmediate(resolveTask));
    active -= 1;
    return item * 2;
  });
  assert.deepEqual(results, [2, 4, 6, 8, 10]);
  assert.equal(maximumActive, 2);
});

test('retries a bounded number of times while honoring server-directed delays', async () => {
  const delays = [];
  let attempts = 0;
  const result = await retryGithubRequest(
    async () => {
      attempts += 1;
      if (attempts === 1) {
        throw Object.assign(new Error('secondary limit'), {
          retryable: true,
          retryAfterMs: 60_000,
        });
      }
      if (attempts === 2) {
        throw Object.assign(new Error('server error'), { retryable: true });
      }
      return 'ok';
    },
    {
      baseDelayMs: 10,
      maxDelayMs: 5_000,
      sleep: async (delayMs) => delays.push(delayMs),
    },
  );
  assert.equal(result, 'ok');
  assert.equal(attempts, 3);
  assert.deepEqual(delays, [60_000, 20]);
  const nowMs = Date.parse('2026-08-12T12:00:00Z');
  assert.deepEqual(
    githubRetryMetadata({
      status: 403,
      responseBody: 'You have exceeded a secondary rate limit.',
      retryAfterHeader: '2',
      rateLimitResetHeader: String((nowMs + 60_000) / 1_000),
      nowMs,
    }),
    { retryable: true, retryAfterMs: 2_000 },
  );
  assert.deepEqual(
    githubRetryMetadata({
      status: 429,
      retryAfterHeader: 'Wed, 12 Aug 2026 12:00:05 GMT',
      rateLimitResetHeader: String((nowMs + 60_000) / 1_000),
      nowMs,
    }),
    { retryable: true, retryAfterMs: 5_000 },
  );
  assert.deepEqual(
    githubRetryMetadata({
      status: 403,
      responseBody: 'API rate limit exceeded',
      retryAfterHeader: 'not-a-date',
      rateLimitResetHeader: String((nowMs + 7_000) / 1_000),
      nowMs,
    }),
    { retryable: true, retryAfterMs: 7_000 },
  );
  const ordinaryServerError = githubRetryMetadata({
    status: 500,
    responseBody: 'internal server error',
    rateLimitResetHeader: String((nowMs + 60_000) / 1_000),
    nowMs,
  });
  assert.deepEqual(ordinaryServerError, {
    retryable: true,
    retryAfterMs: undefined,
  });
  const serverErrorDelays = [];
  let serverErrorAttempts = 0;
  await retryGithubRequest(
    async () => {
      serverErrorAttempts += 1;
      if (serverErrorAttempts === 1) {
        throw Object.assign(new Error('server error'), ordinaryServerError);
      }
      return 'recovered';
    },
    {
      baseDelayMs: 25,
      sleep: async (delayMs) => serverErrorDelays.push(delayMs),
    },
  );
  assert.deepEqual(serverErrorDelays, [25]);

  const headerlessSecondary = githubRetryMetadata({
    status: 403,
    responseBody: 'You have exceeded a secondary rate limit.',
    nowMs,
  });
  assert.deepEqual(headerlessSecondary, {
    retryable: true,
    retryAfterMs: 60_000,
    exponentialRetryAfter: true,
  });
  const secondaryDelays = [];
  let secondaryAttempts = 0;
  await assert.rejects(
    retryGithubRequest(
      async () => {
        secondaryAttempts += 1;
        throw Object.assign(new Error('secondary limit'), headerlessSecondary);
      },
      {
        maxAttempts: 4,
        baseDelayMs: 10,
        sleep: async (delayMs) => secondaryDelays.push(delayMs),
      },
    ),
    /secondary limit/,
  );
  assert.equal(secondaryAttempts, 4);
  assert.deepEqual(secondaryDelays, [60_000, 120_000, 240_000]);

  const tooManyRequests = githubRetryMetadata({
    status: 429,
    responseBody: 'too many requests',
    rateLimitResetHeader: String((nowMs + 11_000) / 1_000),
    nowMs,
  });
  assert.deepEqual(tooManyRequests, {
    retryable: true,
    retryAfterMs: 11_000,
  });
  assert.equal(
    githubRetryMetadata({ status: 404, responseBody: 'not found' }).retryable,
    false,
  );

  let boundedAttempts = 0;
  const boundedDelays = [];
  await assert.rejects(
    retryGithubRequest(
      async () => {
        boundedAttempts += 1;
        throw Object.assign(new Error('still limited'), {
          retryable: true,
          retryAfterMs: 9_000,
        });
      },
      {
        maxAttempts: 2,
        sleep: async (delayMs) => boundedDelays.push(delayMs),
      },
    ),
    /still limited/,
  );
  assert.equal(boundedAttempts, 2);
  assert.deepEqual(boundedDelays, [9_000]);
});

test('recognizes the remediation pull request from a normalized object', () => {
  const raw = pullRequest({
    title: 'fix: weekly Dependabot security remediation',
    head: {
      ref: 'automation/weekly-dependency-security',
      sha: 'abc',
      repo: { full_name: 'temporalio/ui' },
    },
  });

  assert.equal(isRemediationPullRequest(raw), true);
  assert.equal(isRemediationPullRequest(normalizePullRequest(raw)), true);
});

test('reports the remediation pull request in a dependency-scope audit', async () => {
  const raw = pullRequest({
    number: 3815,
    title: 'fix: weekly Dependabot security remediation',
    draft: true,
    head: {
      ref: 'automation/weekly-dependency-security',
      sha: 'abc',
      repo: { full_name: 'temporalio/ui' },
    },
    base: { repo: { full_name: 'temporalio/ui' } },
  });

  const audit = await collectWeeklySecurityAudit({
    repository: 'temporalio/ui',
    scope: 'dependency-security',
    listDependabotAlerts: async () => [],
    listPullRequests: async () => [raw],
    getPullRequest: async () => raw,
    listReviews: async () => [],
    listCheckRuns: async () => [],
  });

  assert.equal(audit.remediation?.number, 3815);
});
