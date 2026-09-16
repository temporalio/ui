import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const DEFAULT_REMEDIATION_BRANCH = 'automation/weekly-dependency-security';
const EXTERNAL_CONTRIBUTOR_LIMIT = 5;
const STALE_EXTERNAL_PR_DAYS = 14;
const PR_ENRICHMENT_CONCURRENCY = 4;
const GITHUB_MAX_ATTEMPTS = 4;
const GITHUB_MAX_EXPONENTIAL_DELAY_MS = 5_000;
const AUDIT_SCOPES = new Set([
  'all',
  'dependency-security',
  'vln-review',
  'external-contributors',
]);
const VLN_TITLE = /^\s*(VLN-\d+)\b/i;
const VLN_JIRA_LINK = /https?:\/\/[^\s)]*\/browse\/(VLN-\d+)\b/gi;
const CAMPAIGN_MARKER = /\b(?:camper|automated(?:\s+security)?\s+campaign)\b/i;

const asArray = (value) => (Array.isArray(value) ? value : []);

const toIso = (value) => (value ? new Date(value).toISOString() : null);

const unique = (items) => [...new Set(items.filter(Boolean))];

export const mapWithConcurrency = async (items, limit, mapper) => {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new TypeError('Concurrency limit must be a positive integer');
  }
  const results = new Array(items.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
};

export const retryGithubRequest = async (
  operation,
  {
    maxAttempts = GITHUB_MAX_ATTEMPTS,
    baseDelayMs = 250,
    maxDelayMs = GITHUB_MAX_EXPONENTIAL_DELAY_MS,
    sleep = (delayMs) =>
      new Promise((resolveSleep) => setTimeout(resolveSleep, delayMs)),
  } = {},
) => {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new TypeError('maxAttempts must be a positive integer');
  }
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return await operation(attempt);
    } catch (error) {
      if (!error?.retryable || attempt >= maxAttempts) throw error;
      const exponentialDelay = baseDelayMs * 2 ** (attempt - 1);
      const delay = Number.isFinite(error.retryAfterMs)
        ? Math.max(
            error.retryAfterMs *
              (error.exponentialRetryAfter ? 2 ** (attempt - 1) : 1),
            0,
          )
        : Math.min(exponentialDelay, maxDelayMs);
      await sleep(delay);
    }
  }
  throw new Error('GitHub request retry loop exhausted unexpectedly');
};

export const githubRetryMetadata = ({
  status,
  responseBody = '',
  retryAfterHeader = null,
  rateLimitResetHeader = null,
  nowMs = Date.now(),
}) => {
  const retryAfterValue = retryAfterHeader?.trim() ?? '';
  const retryAfterSeconds = /^\d+(?:\.\d+)?$/.test(retryAfterValue)
    ? Number(retryAfterValue)
    : null;
  const retryAfterDateMs = retryAfterValue ? Date.parse(retryAfterValue) : NaN;
  const rateLimitResetSeconds =
    rateLimitResetHeader === null ? NaN : Number(rateLimitResetHeader);
  const isRateLimitResponse =
    status === 429 ||
    (status === 403 && /secondary rate limit|rate limit/i.test(responseBody));
  const isSecondaryRateLimit =
    status === 403 && /secondary rate limit/i.test(responseBody);
  const hasRetryAfter =
    Number.isFinite(retryAfterSeconds) || Number.isFinite(retryAfterDateMs);
  const hasRateLimitReset =
    isRateLimitResponse && Number.isFinite(rateLimitResetSeconds);
  const retryAfterMs = Number.isFinite(retryAfterSeconds)
    ? retryAfterSeconds * 1_000
    : Number.isFinite(retryAfterDateMs)
      ? Math.max(retryAfterDateMs - nowMs, 0)
      : hasRateLimitReset
        ? Math.max(rateLimitResetSeconds * 1_000 - nowMs, 0)
        : isSecondaryRateLimit
          ? 60_000
          : undefined;
  return {
    retryable: status === 429 || status >= 500 || isRateLimitResponse,
    retryAfterMs,
    ...(isSecondaryRateLimit && !hasRetryAfter && !hasRateLimitReset
      ? { exponentialRetryAfter: true }
      : {}),
  };
};

export const normalizeDependabotAlert = (alert) => {
  const vulnerability = alert.security_vulnerability ?? {};
  const advisory = alert.security_advisory ?? {};

  return {
    number: alert.number,
    url: alert.html_url,
    severity: advisory.severity ?? 'unknown',
    summary: advisory.summary ?? 'No advisory summary',
    package: vulnerability.package?.name ?? 'unknown',
    ecosystem: vulnerability.package?.ecosystem ?? 'unknown',
    vulnerableRange: vulnerability.vulnerable_version_range ?? null,
    firstPatchedVersion:
      vulnerability.first_patched_version?.identifier ?? null,
    manifestPath: alert.dependency?.manifest_path ?? null,
    createdAt: toIso(alert.created_at),
  };
};

export const summarizeReviews = (reviews, requestedReviewers = []) => {
  const latestReviews = new Map();
  for (const review of asArray(reviews)) {
    const login = review.user?.login;
    if (!login || review.state === 'PENDING') continue;
    const previous = latestReviews.get(login);
    if (
      !previous ||
      new Date(review.submitted_at) >= new Date(previous.submitted_at)
    ) {
      latestReviews.set(login, review);
    }
  }

  const states = [...latestReviews.values()].map((review) => review.state);
  const approvals = states.filter((state) => state === 'APPROVED').length;
  const changesRequested = states.filter(
    (state) => state === 'CHANGES_REQUESTED',
  ).length;
  const requested = asArray(requestedReviewers)
    .map((reviewer) => reviewer.login)
    .filter(Boolean);

  return {
    status:
      changesRequested > 0
        ? 'changes_requested'
        : approvals > 0
          ? 'approved'
          : requested.length > 0
            ? 'review_requested'
            : 'pending',
    approvals,
    changesRequested,
    requested,
  };
};

export const summarizeChecks = (checkRuns) => {
  const checks = asArray(checkRuns);
  const pending = checks.filter((check) => check.status !== 'completed');
  const failed = checks.filter(
    (check) =>
      check.status === 'completed' &&
      [
        'action_required',
        'cancelled',
        'failure',
        'startup_failure',
        'timed_out',
      ].includes(check.conclusion),
  );

  return {
    status:
      failed.length > 0
        ? 'failing'
        : pending.length > 0
          ? 'pending'
          : checks.length > 0
            ? 'passing'
            : 'none',
    total: checks.length,
    failing: failed.map((check) => check.name),
    pending: pending.map((check) => check.name),
  };
};

export const summarizeMergeability = (pullRequest) => {
  const mergeableState = pullRequest.mergeable_state;
  if (pullRequest.mergeable === null || !mergeableState) return 'unknown';
  if (pullRequest.mergeable === false || mergeableState === 'dirty') {
    return 'conflicting';
  }
  if (['blocked', 'behind', 'unstable'].includes(mergeableState)) {
    return mergeableState;
  }
  return 'mergeable';
};

export const classifyVln = (pullRequest) => {
  const title = pullRequest.title ?? '';
  const body = pullRequest.body ?? '';
  const titleMatch = title.match(VLN_TITLE);
  const jiraTickets = unique(
    [...body.matchAll(VLN_JIRA_LINK)].map((match) => match[1].toUpperCase()),
  );
  const hasCampaignMarker = CAMPAIGN_MARKER.test(body);
  const inlineTicket = /\bVLN-\d+\b/i.test(body);
  const titleHasTicket = /\bVLN-\d+\b/i.test(title);

  if (titleMatch) {
    return {
      kind: 'vln',
      ticket: titleMatch[1].toUpperCase(),
      reason: 'title',
    };
  }

  if (jiraTickets.length > 0 && hasCampaignMarker) {
    return { kind: 'vln', ticket: jiraTickets[0], reason: 'campaign_body' };
  }

  if (
    jiraTickets.length > 0 ||
    hasCampaignMarker ||
    inlineTicket ||
    titleHasTicket
  ) {
    return {
      kind: 'needs_triage',
      ticket: jiraTickets[0] ?? null,
      reason:
        jiraTickets.length > 0
          ? 'jira_link_without_campaign_marker'
          : 'vln_like_metadata',
    };
  }

  return { kind: 'other', ticket: null, reason: null };
};

export const isRemediationPullRequest = (
  pullRequest,
  remediationBranch = DEFAULT_REMEDIATION_BRANCH,
) => {
  const headRef = pullRequest.headRef ?? pullRequest.head?.ref ?? null;
  return (
    headRef === remediationBranch ||
    /weekly (?:dependabot|dependency)[- ]security/i.test(
      pullRequest.title ?? '',
    )
  );
};

export const isExternalContributorPullRequest = (pullRequest) => {
  const author = pullRequest.user ?? {};
  const login = author.login ?? '';
  const memberAssociation = ['MEMBER', 'COLLABORATOR', 'OWNER'];
  const headRepository = pullRequest.head?.repo?.full_name;
  const baseRepository = pullRequest.base?.repo?.full_name;
  const isCrossRepository = Boolean(
    headRepository && baseRepository && headRepository !== baseRepository,
  );
  const isBot = author.type === 'Bot' || /\[bot\]$/i.test(login);

  return (
    isCrossRepository &&
    !isBot &&
    !memberAssociation.includes(pullRequest.author_association)
  );
};

export const prioritizeExternalContributorPullRequest = (pullRequest) => {
  if (
    pullRequest.review.status === 'changes_requested' ||
    pullRequest.checks.status === 'failing' ||
    pullRequest.merge === 'conflicting'
  ) {
    return 'author_followup';
  }
  if (
    !pullRequest.draft &&
    ['passing', 'none'].includes(pullRequest.checks.status) &&
    pullRequest.merge === 'mergeable' &&
    pullRequest.review.status !== 'approved'
  ) {
    return 'review_ready';
  }
  return 'triage';
};

export const normalizePullRequest = (
  pullRequest,
  { reviews = [], checks = [] } = {},
) => {
  const classification = classifyVln(pullRequest);

  return {
    number: pullRequest.number,
    url: pullRequest.html_url,
    title: pullRequest.title ?? '',
    body: pullRequest.body ?? '',
    draft: Boolean(pullRequest.draft),
    author: pullRequest.user?.login ?? null,
    authorAssociation: pullRequest.author_association ?? 'UNKNOWN',
    headRef: pullRequest.head?.ref ?? null,
    isCrossRepository:
      Boolean(pullRequest.head?.repo?.full_name) &&
      pullRequest.head.repo.full_name !== pullRequest.base?.repo?.full_name,
    createdAt: toIso(pullRequest.created_at),
    updatedAt: toIso(pullRequest.updated_at),
    review: summarizeReviews(reviews, pullRequest.requested_reviewers),
    merge: summarizeMergeability(pullRequest),
    checks: summarizeChecks(checks),
    vln: classification,
  };
};

const isVlnCandidate = (pullRequest) =>
  classifyVln(pullRequest).kind !== 'other';

export const pullRequestMatchesAuditScope = (
  pullRequest,
  scope,
  remediationBranch = DEFAULT_REMEDIATION_BRANCH,
) => {
  if (scope === 'all') return true;
  if (scope === 'dependency-security') {
    return isRemediationPullRequest(pullRequest, remediationBranch);
  }
  if (scope === 'vln-review') return isVlnCandidate(pullRequest);
  if (scope === 'external-contributors') {
    return isExternalContributorPullRequest(pullRequest);
  }
  throw new Error(`Unsupported audit scope: ${scope}`);
};

/**
 * Produces a serializable read-only audit.  The client is deliberately small so
 * Actions and tests can supply the same data shape without GitHub SDK coupling.
 */
export const collectWeeklySecurityAudit = async ({
  repository,
  scope = 'all',
  runUrl = null,
  now = new Date(),
  remediationBranch = DEFAULT_REMEDIATION_BRANCH,
  listDependabotAlerts,
  listPullRequests,
  getPullRequest,
  listReviews,
  listCheckRuns,
}) => {
  if (!AUDIT_SCOPES.has(scope)) {
    throw new Error(`Unsupported audit scope: ${scope}`);
  }
  const [rawAlerts, listedPullRequests] = await Promise.all([
    scope === 'all' || scope === 'dependency-security'
      ? listDependabotAlerts()
      : [],
    listPullRequests(),
  ]);
  const relevantPullRequests = asArray(listedPullRequests).filter(
    (pullRequest) =>
      pullRequestMatchesAuditScope(pullRequest, scope, remediationBranch),
  );
  const enrichReviewState = scope !== 'dependency-security';
  const enrichedPullRequests = await mapWithConcurrency(
    relevantPullRequests,
    PR_ENRICHMENT_CONCURRENCY,
    async (listedPullRequest) => {
      const pullRequest = getPullRequest
        ? await getPullRequest(listedPullRequest.number)
        : listedPullRequest;
      const [reviews, checks] = await Promise.all([
        enrichReviewState && listReviews ? listReviews(pullRequest.number) : [],
        enrichReviewState && listCheckRuns && pullRequest.head?.sha
          ? listCheckRuns(pullRequest.head.sha)
          : [],
      ]);
      return {
        raw: pullRequest,
        normalized: normalizePullRequest(pullRequest, { reviews, checks }),
      };
    },
  );
  const decoratedPullRequests = enrichedPullRequests.map(
    ({ normalized }) => normalized,
  );

  const vlnPullRequests = decoratedPullRequests.filter(
    (pullRequest) => pullRequest.vln.kind === 'vln',
  );
  const needsTriage = decoratedPullRequests.filter(
    (pullRequest) => pullRequest.vln.kind === 'needs_triage',
  );
  const remediation = decoratedPullRequests.find((pullRequest) =>
    isRemediationPullRequest(pullRequest, remediationBranch),
  );
  const externalContributorPullRequests = enrichedPullRequests
    .filter(({ raw }) => isExternalContributorPullRequest(raw))
    .map(({ normalized }) => ({
      ...normalized,
      externalPriority: prioritizeExternalContributorPullRequest(normalized),
    }));
  const staleExternalPullRequestCount = externalContributorPullRequests.filter(
    (pullRequest) =>
      pullRequest.updatedAt &&
      now.getTime() - new Date(pullRequest.updatedAt).getTime() >=
        STALE_EXTERNAL_PR_DAYS * 24 * 60 * 60 * 1000,
  ).length;
  const externalByPriority = (priority) =>
    externalContributorPullRequests
      .filter((pullRequest) => pullRequest.externalPriority === priority)
      .sort(
        (left, right) => new Date(left.createdAt) - new Date(right.createdAt),
      );
  const reviewReady = externalByPriority('review_ready');
  const triage = externalByPriority('triage');
  const authorFollowup = externalByPriority('author_followup');

  return {
    schemaVersion: 1,
    scope,
    generatedAt: now.toISOString(),
    repository,
    run: { url: runUrl },
    dependabot: {
      openAlertCount: asArray(rawAlerts).length,
      alerts: asArray(rawAlerts).map(normalizeDependabotAlert),
    },
    remediation: remediation ?? null,
    vln: {
      pending: vlnPullRequests,
      needsTriage,
    },
    externalContributors: {
      totalCount: externalContributorPullRequests.length,
      reviewReadyCount: reviewReady.length,
      triageCount: triage.length,
      authorFollowupCount: authorFollowup.length,
      reviewReady: reviewReady.slice(0, EXTERNAL_CONTRIBUTOR_LIMIT),
      triage: triage.slice(0, EXTERNAL_CONTRIBUTOR_LIMIT),
      authorFollowup: authorFollowup.slice(0, EXTERNAL_CONTRIBUTOR_LIMIT),
      staleCount: staleExternalPullRequestCount,
    },
  };
};

const parseLinkHeader = (header) => {
  if (!header) return null;
  const next = header
    .split(',')
    .map((part) => part.trim())
    .find((part) => /rel="next"/.test(part));
  return next?.match(/<([^>]+)>/)?.[1] ?? null;
};

const githubClient = ({ token, apiUrl, fetchImplementation = fetch }) => {
  const request = (pathOrUrl) =>
    retryGithubRequest(async () => {
      const url = pathOrUrl.startsWith('http')
        ? pathOrUrl
        : new URL(pathOrUrl, apiUrl).toString();
      let response;
      try {
        response = await fetchImplementation(url, {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });
      } catch (error) {
        throw Object.assign(error, { retryable: true });
      }
      if (!response.ok) {
        const responseBody = await response.text();
        const retry = githubRetryMetadata({
          status: response.status,
          responseBody,
          retryAfterHeader: response.headers.get('retry-after'),
          rateLimitResetHeader: response.headers.get('x-ratelimit-reset'),
        });
        throw Object.assign(
          new Error(
            `GitHub API ${response.status} for ${url}: ${responseBody.slice(0, 300)}`,
          ),
          retry,
        );
      }
      return {
        data: await response.json(),
        next: parseLinkHeader(response.headers.get('link')),
      };
    });

  const listAll = async (path) => {
    const results = [];
    let next = path;
    while (next) {
      const page = await request(next);
      results.push(...asArray(page.data));
      next = page.next;
    }
    return results;
  };

  return { request, listAll };
};

const writeGithubOutput = async (name, value) => {
  if (!process.env.GITHUB_OUTPUT) return;
  await appendFile(process.env.GITHUB_OUTPUT, `${name}=${String(value)}\n`);
};

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

const parseArgs = (argv) => {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    if (argv[index]?.startsWith('--'))
      args.set(argv[index].slice(2), argv[index + 1]);
  }
  return args;
};

export const runAuditCli = async ({
  argv = process.argv.slice(2),
  env = process.env,
} = {}) => {
  const args = parseArgs(argv);
  const scope = args.get('scope') ?? env.AUDIT_SCOPE ?? 'all';
  const outputPath = resolve(
    args.get('output') ?? 'weekly-dependency-security-audit.json',
  );
  const [owner, repo] = (env.GITHUB_REPOSITORY ?? '').split('/');
  const fixturePath = args.get('fixture') ?? env.AUDIT_FIXTURE_JSON;
  let audit;

  if (fixturePath) {
    const fixture = await readJson(resolve(fixturePath));
    audit = await collectWeeklySecurityAudit({
      repository: fixture.repository ?? env.GITHUB_REPOSITORY ?? 'owner/repo',
      scope,
      runUrl: fixture.runUrl ?? null,
      listDependabotAlerts: async () => fixture.alerts ?? [],
      listPullRequests: async () => fixture.pullRequests ?? [],
      getPullRequest: async (number) =>
        fixture.pullRequestDetails?.[number] ??
        fixture.pullRequests?.find(
          (pullRequest) => pullRequest.number === number,
        ),
      listReviews: async (number) => fixture.reviews?.[number] ?? [],
      listCheckRuns: async (sha) => fixture.checkRuns?.[sha] ?? [],
    });
  } else {
    if (!owner || !repo || !env.GITHUB_TOKEN) {
      throw new Error(
        'GITHUB_REPOSITORY and GITHUB_TOKEN are required without --fixture',
      );
    }
    const apiUrl = env.GITHUB_API_URL ?? 'https://api.github.com';
    const client = githubClient({ token: env.GITHUB_TOKEN, apiUrl });
    const basePath = `/repos/${owner}/${repo}`;
    const runUrl =
      env.GITHUB_RUN_ID && env.GITHUB_SERVER_URL
        ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
        : null;
    audit = await collectWeeklySecurityAudit({
      repository: env.GITHUB_REPOSITORY,
      scope,
      runUrl,
      listDependabotAlerts: () =>
        client.listAll(`${basePath}/dependabot/alerts?state=open&per_page=100`),
      listPullRequests: () =>
        client.listAll(`${basePath}/pulls?state=open&per_page=100`),
      getPullRequest: async (number) =>
        (await client.request(`${basePath}/pulls/${number}`)).data,
      listReviews: async (number) =>
        client.listAll(`${basePath}/pulls/${number}/reviews?per_page=100`),
      listCheckRuns: async (sha) => {
        const checks = [];
        let next = `${basePath}/commits/${sha}/check-runs?per_page=100`;
        while (next) {
          const page = await client.request(next);
          checks.push(...asArray(page.data.check_runs));
          next = page.next;
        }
        return checks;
      },
    });
  }

  await writeFile(outputPath, `${JSON.stringify(audit, null, 2)}\n`);
  await writeGithubOutput('audit-file', outputPath);
  await writeGithubOutput('open-alert-count', audit.dependabot.openAlertCount);
  await writeGithubOutput('vln-count', audit.vln.pending.length);
  await writeGithubOutput('needs-triage-count', audit.vln.needsTriage.length);
  await writeGithubOutput(
    'external-contributor-pr-count',
    audit.externalContributors.totalCount,
  );
  await writeGithubOutput('remediation-pr-url', audit.remediation?.url ?? '');
  console.log(JSON.stringify(audit));
  return audit;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  runAuditCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
