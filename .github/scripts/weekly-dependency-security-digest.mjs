import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { escapeSlackMrkdwn } from './slack-utils.mjs';

const DEFAULT_VLN_LIMIT = 10;
const DEFAULT_UNRESOLVED_LIMIT = 10;
// A list line must fit one row in Slack, and a group must stay short enough
// that the client renders it without a Show more control.
const LIST_TITLE_LIMIT = 72;
const LIST_GROUP_LIMIT = 3;
const SLACK_SECTION_TEXT_LIMIT = 3_000;
const SLACK_DYNAMIC_TEXT_LIMIT = 800;
const PUBLISH_STATUSES = new Set(['success', 'failure', 'skipped']);

const truncateText = (text, limit = SLACK_DYNAMIC_TEXT_LIMIT) => {
  const value = String(text ?? '');
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
};

const slackLink = (url, label) =>
  `<${url}|${escapeSlackMrkdwn(truncateText(label))}>`;

const omittedLine = (count, runUrl) => {
  const suffix = runUrl ? `; ${slackLink(runUrl, 'see workflow run')}` : '';
  return `• …and ${count} more${suffix}`;
};

/**
 * The last line of a group. It links to the page that holds the whole list, so
 * a reader is never left at a dead end.
 */
const omittedLink = (count, url) => {
  const text = `…and ${count} more`;
  return `• ${url ? slackLink(url, text) : text}`;
};

/** Where a reader sees the full list for each module. */
const moreUrl = {
  pullRequests: (repository) =>
    repository
      ? `https://github.com/${repository}/pulls?q=is%3Apr+is%3Aopen`
      : null,
  vlnPullRequests: (repository) =>
    repository
      ? `https://github.com/${repository}/pulls?q=is%3Apr+is%3Aopen+VLN`
      : null,
  alerts: (repository) =>
    repository
      ? `https://github.com/${repository}/security/dependabot?q=is%3Aopen`
      : null,
};

/** One section per group: a heading, a few items, then the omitted count. */
const groupSection = (heading, pullRequests, totalCount, limit, url = null) => {
  const visible = pullRequests.slice(0, limit);
  if (visible.length === 0) return [];
  const lines = [heading, ...visible.map(renderPullRequest)];
  const omitted = Math.max(
    (totalCount ?? pullRequests.length) - visible.length,
    0,
  );
  if (omitted > 0) lines.push(omittedLink(omitted, url));
  return sectionBlocks(lines.join('\n'));
};

export const splitSlackSectionText = (
  text,
  maxLength = SLACK_SECTION_TEXT_LIMIT,
) => {
  if (!Number.isInteger(maxLength) || maxLength < 1) {
    throw new TypeError('Slack section limit must be a positive integer');
  }
  const chunks = [];
  let current = '';
  const append = (line) => {
    const candidate = current ? `${current}\n${line}` : line;
    if (candidate.length <= maxLength) {
      current = candidate;
      return;
    }
    if (current) chunks.push(current);
    current = line;
  };
  for (const line of String(text).split('\n')) {
    if (line.length <= maxLength) {
      append(line);
      continue;
    }
    let remaining = line;
    while (remaining.length > maxLength) {
      let boundary = remaining.lastIndexOf(' ', maxLength);
      if (boundary < Math.floor(maxLength / 2)) boundary = maxLength;
      append(remaining.slice(0, boundary));
      remaining = remaining.slice(boundary).trimStart();
    }
    append(remaining);
  }
  if (current || chunks.length === 0) chunks.push(current);
  return chunks;
};

// The group badge already names the state of every item it holds, so a list
// item carries no status. Repeating it made Slack collapse the whole group.
const renderPullRequest = (pullRequest) =>
  `• ${slackLink(
    pullRequest.url,
    truncateText(
      `#${pullRequest.number}: ${pullRequest.title}`,
      LIST_TITLE_LIMIT,
    ),
  )}`;

const remediationActionCount = (result) =>
  result?.summary?.actions ?? result?.actions?.length ?? null;

const remediationActionText = (result, published = false) => {
  const actions = remediationActionCount(result);
  if (!Number.isInteger(actions)) return '';
  if (actions === 0) return ' — no safe changes were needed';
  return ` — ${actions} safe change${actions === 1 ? '' : 's'} ${published ? 'applied' : 'planned'}`;
};

export const validatePublishStatus = (publishStatus) => {
  if (!PUBLISH_STATUSES.has(publishStatus)) {
    throw new Error(`Unsupported publish status: ${publishStatus}`);
  }
  return publishStatus;
};

const remediationLine = ({ audit, remediation, publishStatus }) => {
  const result = remediation ?? audit.remediationResult;
  const resultPullRequest = result?.pullRequest;
  const publishedPullRequest =
    publishStatus === 'success' && result?.pullRequestUrl
      ? {
          url: result.pullRequestUrl,
          number: resultPullRequest?.number,
          title: resultPullRequest?.title,
        }
      : publishStatus === 'success' && resultPullRequest?.url
        ? resultPullRequest
        : null;

  if (result?.applied && publishedPullRequest) {
    const numberFromUrl = /\/pull\/(\d+)/.exec(publishedPullRequest.url ?? '');
    const number = publishedPullRequest.number ?? numberFromUrl?.[1] ?? null;
    const label = number
      ? publishedPullRequest.title
        ? `#${number}: ${publishedPullRequest.title}`
        : `#${number}`
      : 'view draft remediation PR';
    return `Draft remediation PR: ${slackLink(publishedPullRequest.url, label)}${remediationActionText(result, true)}`;
  }

  if (result?.applied) {
    const actionCount = remediationActionCount(result);
    const candidate = Number.isInteger(actionCount)
      ? `${actionCount} safe change${actionCount === 1 ? '' : 's'} prepared`
      : 'Safe changes prepared';
    if (publishStatus === 'failure') {
      return `Remediation candidate: ${candidate}, but publication failed. Manual review required.`;
    }
    if (publishStatus === 'success') {
      return `Remediation candidate: ${candidate}, but publication reported success without a PR link. Manual review required.`;
    }
    return `Remediation candidate: ${candidate}, but publication was skipped. Manual review required.`;
  }

  const pullRequest = resultPullRequest ?? audit.remediation;

  if (pullRequest) {
    const addressed = result?.addressedAlertCount;
    const suffix = Number.isInteger(addressed)
      ? ` — ${addressed} alert${addressed === 1 ? '' : 's'} addressed`
      : '';
    return `Draft remediation PR: ${slackLink(pullRequest.url, `#${pullRequest.number}: ${pullRequest.title}`)}${suffix}${remediationActionText(result)}`;
  }
  if (Number.isInteger(remediationActionCount(result))) {
    return `Remediation: ${remediationActionText(result).replace(/^ — /, '')}.`;
  }
  if (result?.status === 'no_changes') {
    return 'Remediation: no safe dependency changes were needed.';
  }
  if (audit.dependabot.openAlertCount === 0) {
    return 'Remediation: no open Dependabot alerts.';
  }
  return 'Remediation: no draft PR was created; see unresolved items.';
};

const unresolvedItems = ({ audit, remediation }) => {
  const result = remediation ?? audit.remediationResult;
  const unresolved =
    result?.unresolved ??
    result?.classifications?.filter(
      (item) => item.status === 'manual' || item.status === 'unsupported',
    ) ??
    audit.unresolved ??
    [];
  if (unresolved.length > 0) {
    return {
      lines: unresolved.slice(0, DEFAULT_UNRESOLVED_LIMIT).map((item) => {
        const name = item.package ?? item.packageName ?? item.title ?? null;
        const alertReference = item.number
          ? `#${item.number}`
          : Array.isArray(item.alertIds) && item.alertIds.length > 0
            ? item.alertIds.map((id) => `#${id}`).join(', ')
            : null;
        // The name is escaped first, then wrapped. Backticks keep a scoped
        // package name from rendering as a Slack mention, and the escape still
        // stops the name itself from carrying formatting.
        const code = name
          ? `\`${escapeSlackMrkdwn(truncateText(String(name)))}\``
          : null;
        const label = item.number
          ? `${alertReference} ${code ?? 'alert'}`
          : (code ?? alertReference ?? 'unidentified alert');
        const reason = item.reason
          ? ` — ${escapeSlackMrkdwn(truncateText(item.reason))}`
          : '';
        return `• ${label}${reason}`;
      }),
      omittedCount: Math.max(unresolved.length - DEFAULT_UNRESOLVED_LIMIT, 0),
    };
  }
  return { lines: [], omittedCount: 0 };
};

const dependencySecurityText = ({
  audit,
  remediation,
  publishStatus,
  runUrl,
}) => {
  const lines = [
    '*Dependency security*',
    remediationLine({ audit, remediation, publishStatus }),
  ];
  const unresolved = unresolvedItems({ audit, remediation });
  if (unresolved.lines.length > 0) {
    lines.push('', '*Needs human handling*', ...unresolved.lines);
    if (unresolved.omittedCount > 0) {
      lines.push(omittedLine(unresolved.omittedCount, runUrl));
    }
  }
  if (runUrl) lines.push('', `Run: ${slackLink(runUrl, 'view workflow run')}`);
  return lines.join('\n');
};

const vlnBlocks = ({ audit, vlnLimit, runUrl }) => {
  const pending = audit.vln?.pending ?? [];
  const needsTriage = audit.vln?.needsTriage ?? [];
  const blocks = [headerBlock('VLN review')];

  const limit = Math.min(vlnLimit, LIST_GROUP_LIMIT);
  const vlnUrl = moreUrl.vlnPullRequests(audit.repository);
  const pendingGroup = groupSection(
    '*Pending VLN PRs*',
    pending,
    pending.length,
    limit,
    vlnUrl,
  );
  const triageGroup = groupSection(
    '*Needs triage*',
    needsTriage,
    needsTriage.length,
    limit,
    vlnUrl,
  );
  blocks.push(...pendingGroup);
  if (pendingGroup.length > 0 && triageGroup.length > 0) {
    blocks.push(dividerBlock());
  }
  blocks.push(...triageGroup);

  if (pending.length === 0 && needsTriage.length === 0) {
    blocks.push(...sectionBlocks('No pending VLN pull request.'));
  }
  if (runUrl) blocks.push(contextBlock(slackLink(runUrl, 'workflow run')));
  return blocks;
};

const vlnReviewText = ({ audit, vlnLimit, runUrl }) => {
  const vlns = audit.vln?.pending ?? [];
  const needsTriage = audit.vln?.needsTriage ?? [];
  const visibleVlns = vlns.slice(0, vlnLimit);
  const lines = ['*VLN review*'];

  if (visibleVlns.length > 0) {
    lines.push('', '*Pending VLN PRs*', ...visibleVlns.map(renderPullRequest));
    if (vlns.length > visibleVlns.length) {
      lines.push(omittedLine(vlns.length - visibleVlns.length, runUrl));
    }
  } else {
    lines.push('', 'Pending VLN PRs: none');
  }
  if (needsTriage.length > 0) {
    lines.push(
      '',
      '*VLN matches needing triage*',
      ...needsTriage.slice(0, vlnLimit).map(renderPullRequest),
    );
    if (needsTriage.length > vlnLimit) {
      lines.push(omittedLine(needsTriage.length - vlnLimit, runUrl));
    }
  }
  if (runUrl) lines.push('', `Run: ${slackLink(runUrl, 'view workflow run')}`);
  return lines.join('\n');
};

const countOf = (value) => (Number.isInteger(value) ? value : 0);

const unresolvedCount = (result) => {
  if (Array.isArray(result?.unresolved)) return result.unresolved.length;
  if (Array.isArray(result?.classifications)) {
    return result.classifications.filter((item) =>
      ['manual', 'unsupported', 'alreadySafe'].includes(item.status),
    ).length;
  }
  return 0;
};

/** A person must act on the dependency module for one of these reasons. */
export const dependencyNeedsAction = ({
  audit,
  remediation = null,
  publishStatus = 'skipped',
}) => {
  if (publishStatus === 'failure') return true;
  const result = remediation ?? audit.remediationResult;
  const summary = result?.summary ?? {};
  if (countOf(summary.actions) > 0) return true;
  if (countOf(summary.manual) > 0) return true;
  if (countOf(summary.unsupported) > 0) return true;
  if (countOf(summary.alreadySafe) > 0) return true;
  if (Array.isArray(result?.actions) && result.actions.length > 0) return true;
  if (unresolvedCount(result) > 0) return true;
  if (result?.pullRequest || result?.pullRequestUrl) return true;
  if (audit.remediation) return true;
  return countOf(audit.dependabot?.openAlertCount) > 0;
};

/** A person must act on the VLN module when a pull request waits. */
export const vlnNeedsAction = ({ audit }) =>
  (audit.vln?.pending ?? []).length > 0 ||
  (audit.vln?.needsTriage ?? []).length > 0;

/**
 * A person must act on the external module when a pull request waits. A stale
 * count alone is context, not work, so it does not make the module actionable.
 */
export const externalNeedsAction = ({ audit }) => {
  const external = audit.externalContributors ?? {};
  return (
    (external.reviewReady ?? []).length > 0 ||
    (external.triage ?? []).length > 0 ||
    (external.authorFollowup ?? []).length > 0
  );
};

const headerBlock = (text) => ({
  type: 'header',
  text: { type: 'plain_text', text: truncateText(text, 150) },
});

const sectionBlocks = (mrkdwn) =>
  splitSlackSectionText(mrkdwn).map((text) => ({
    type: 'section',
    text: { type: 'mrkdwn', text },
  }));

const dividerBlock = () => ({ type: 'divider' });

const contextBlock = (mrkdwn) => ({
  type: 'context',
  elements: [{ type: 'mrkdwn', text: mrkdwn }],
});

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

// Slack holds no badge primitive. A code span is the closest: the client draws
// it as a small bordered chip, the same shape it gives a version or a package.
const badge = (label) => `\`${label}\``;

/** Alert number to its advisory page and severity, taken from the audit. */
const alertIndex = (audit) => {
  const index = new Map();
  for (const alert of audit?.dependabot?.alerts ?? []) {
    if (!Number.isInteger(alert.number)) continue;
    index.set(alert.number, {
      url:
        alert.url ??
        (audit.repository
          ? `https://github.com/${audit.repository}/security/dependabot/${alert.number}`
          : null),
      severity: String(alert.severity ?? 'unknown').toLowerCase(),
    });
  }
  return index;
};

/** Each alert number linked to its advisory page when the audit knows it. */
const alertLinks = (alertIds, index) =>
  (alertIds ?? [])
    .map((id) => {
      const url = index.get(id)?.url;
      return url ? slackLink(url, String(id)) : String(id);
    })
    .join(', ');

/** The worst severity across a set of alerts, with a count and a colour. */
const severityBadge = (alertIds, index) => {
  const severities = (alertIds ?? [])
    .map((id) => index.get(id)?.severity)
    .filter((value) => SEVERITY_ORDER.includes(value));
  if (severities.length === 0) return null;
  const worst = SEVERITY_ORDER.find((value) => severities.includes(value));
  const count = severities.filter((value) => value === worst).length;
  return badge(`${count} ${worst.toUpperCase()}`);
};

/**
 * The headline a reader sees first. A published change leads with READY and the
 * number of alerts it closes. Anything else falls back to the plain line.
 */
const remediationHeadline = ({ audit, remediation, publishStatus }) => {
  const line = remediationLine({ audit, remediation, publishStatus });
  const result = remediation ?? audit.remediationResult;
  const url = result?.pullRequestUrl;
  if (publishStatus !== 'success' || !result?.applied || !url) return line;

  const number = /\/pull\/(\d+)/.exec(url)?.[1];
  if (!number) return line;
  const closed = new Set(
    (result.actions ?? []).flatMap((action) => action.alertIds ?? []),
  ).size;
  const alertText =
    closed > 0 ? ` closes ${closed} alert${closed === 1 ? '' : 's'}` : '';
  return `${badge('READY')}  *${slackLink(url, `#${number}`)}*${alertText}`;
};

const fieldsBlock = (pairs) => ({
  type: 'section',
  fields: pairs
    .flatMap(([label, value]) => [`*${label}*`, value])
    .map((text) => ({ type: 'mrkdwn', text: truncateText(text, 2_000) })),
});

/** One line per authorized action, naming the range and the resolved version. */
const changeLines = (result) => {
  const actions = Array.isArray(result?.actions) ? result.actions : [];
  const resolved = new Map();
  for (const alert of result?.verification?.alerts ?? []) {
    if (alert.packageName && alert.resolvedVersions?.length) {
      resolved.set(alert.packageName, alert.resolvedVersions.join(', '));
    }
  }
  return actions.map((action) => {
    const range =
      action.from && action.to ? ` \`${action.from}\` → \`${action.to}\`` : '';
    const after = resolved.get(action.packageName);
    const resolvedText = after ? `, resolves to ${after}` : '';
    const alertIds = action.alertIds ?? [];
    const alerts =
      alertIds.length > 0 ? ` · alerts ${alertIds.join(', ')}` : '';
    return `• \`${escapeSlackMrkdwn(String(action.packageName))}\`${range}${resolvedText}${alerts}`;
  });
};

const asThreadReply = ({
  channel = null,
  threadTs = null,
  text,
  actionable = true,
  blocks = null,
}) => ({
  channel,
  thread_ts: threadTs,
  text,
  actionable,
  blocks: blocks ?? sectionBlocks(text),
});

/**
 * Returns the dependency-security reply for a Slack root thread. Posting stays
 * in the workflow so this module has no Slack token or network side effects.
 */
export const buildDependencySecurityReply = ({
  audit,
  remediation = null,
  publishStatus = 'skipped',
  runUrl = audit.run?.url ?? null,
  channel = null,
  threadTs = null,
}) => {
  validatePublishStatus(publishStatus);
  const result = remediation ?? audit.remediationResult;
  const blocks = [headerBlock('Dependency security')];
  blocks.push(
    ...sectionBlocks(
      remediationHeadline({ audit, remediation, publishStatus }),
    ),
  );

  // One field grid per authorized action: what changed, what it resolves to,
  // and every alert it closes, each linked to its advisory page.
  const alerts = alertIndex(audit);
  const actions = Array.isArray(result?.actions) ? result.actions : [];
  const resolvedAfter = new Map();
  for (const alert of result?.verification?.alerts ?? []) {
    if (alert.packageName && alert.resolvedVersions?.length) {
      resolvedAfter.set(alert.packageName, alert.resolvedVersions.join(', '));
    }
  }
  for (const action of actions.slice(0, 3)) {
    const range =
      action.from && action.to
        ? `\`${action.from}\` → \`${action.to}\``
        : String(action.to ?? '');
    const pairs = [
      [
        'Change',
        `\`${escapeSlackMrkdwn(String(action.packageName))}\` ${range}`,
      ],
    ];
    const after = resolvedAfter.get(action.packageName);
    if (after) pairs.push(['Resolves to', `${after}, verified after install`]);
    const links = alertLinks(action.alertIds, alerts);
    if (links) pairs.push(['Alerts', links]);
    blocks.push(fieldsBlock(pairs));
  }
  if (actions.length > 3) {
    blocks.push(
      ...sectionBlocks(
        omittedLink(actions.length - 3, moreUrl.alerts(audit.repository)),
      ),
    );
  }
  if (actions.length === 0) {
    const changes = changeLines(result);
    if (changes.length > 0) blocks.push(...sectionBlocks(changes.join('\n')));
  }

  const unresolved = unresolvedItems({ audit, remediation });
  if (unresolved.lines.length > 0) {
    blocks.push(dividerBlock());
    const unresolvedAlertIds = (result?.classifications ?? [])
      .filter((item) =>
        ['manual', 'unsupported', 'alreadySafe'].includes(item.status),
      )
      .flatMap((item) => item.alertIds ?? []);
    const badge = severityBadge(unresolvedAlertIds, alerts);
    const heading = badge
      ? `${badge}  *Needs a decision*`
      : '*Needs a decision*';
    blocks.push(...sectionBlocks([heading, ...unresolved.lines].join('\n')));
    if (unresolved.omittedCount > 0) {
      blocks.push(
        ...sectionBlocks(
          omittedLink(
            unresolved.omittedCount,
            moreUrl.alerts(audit.repository),
          ),
        ),
      );
    }
  }
  if (runUrl) {
    blocks.push(
      contextBlock(
        `${slackLink(runUrl, 'workflow run')} · the planner authored this change`,
      ),
    );
  }

  return asThreadReply({
    channel,
    threadTs,
    actionable: dependencyNeedsAction({ audit, remediation, publishStatus }),
    blocks,
    text: dependencySecurityText({
      audit,
      remediation,
      publishStatus,
      runUrl,
    }),
  });
};

/** Returns the VLN-review reply for the same Slack root thread. */
export const buildVlnReviewReply = ({
  audit,
  runUrl = audit.run?.url ?? null,
  vlnLimit = DEFAULT_VLN_LIMIT,
  channel = null,
  threadTs = null,
}) =>
  asThreadReply({
    channel,
    threadTs,
    actionable: vlnNeedsAction({ audit }),
    blocks: vlnBlocks({ audit, vlnLimit, runUrl }),
    text: vlnReviewText({ audit, vlnLimit, runUrl }),
  });

/** Returns the external-contributor review reply for the Slack root thread. */
export const buildExternalContributorReply = ({
  audit,
  runUrl = audit.run?.url ?? null,
  channel = null,
  threadTs = null,
}) => {
  const external = audit.externalContributors ?? {};
  const groupHeading = (label, pullRequests, totalCount) =>
    badge(`${totalCount ?? pullRequests.length} ${label}`);
  const sections = [
    [
      groupHeading(
        'READY FOR REVIEW',
        external.reviewReady ?? [],
        external.reviewReadyCount,
      ),
      external.reviewReady ?? [],
      external.reviewReadyCount,
    ],
    [
      groupHeading('NEED TRIAGE', external.triage ?? [], external.triageCount),
      external.triage ?? [],
      external.triageCount,
    ],
    [
      groupHeading(
        'WAITING ON AUTHOR',
        external.authorFollowup ?? [],
        external.authorFollowupCount,
      ),
      external.authorFollowup ?? [],
      external.authorFollowupCount,
    ],
  ];
  const lines = ['*External contributor PRs*'];
  for (const [heading, pullRequests, totalCount] of sections) {
    if (pullRequests.length > 0) {
      lines.push('', heading, ...pullRequests.map(renderPullRequest));
      const omittedCount = Math.max(
        (totalCount ?? pullRequests.length) - pullRequests.length,
        0,
      );
      if (omittedCount > 0) lines.push(omittedLine(omittedCount, runUrl));
    }
  }
  if (sections.every(([, pullRequests]) => pullRequests.length === 0)) {
    lines.push('', 'No eligible external contributor PRs.');
  }
  if (external.staleCount > 0) {
    lines.push(
      `\n${external.staleCount} external PR${external.staleCount === 1 ? ' has' : 's have'} not been updated in 14+ days.`,
    );
  }
  if (runUrl) lines.push('', `Run: ${slackLink(runUrl, 'view workflow run')}`);
  const blocks = [headerBlock('External contributor PRs')];
  let firstGroup = true;
  for (const [heading, pullRequests, totalCount] of sections) {
    const group = groupSection(
      heading,
      pullRequests,
      totalCount,
      LIST_GROUP_LIMIT,
      moreUrl.pullRequests(audit.repository),
    );
    if (group.length === 0) continue;
    if (!firstGroup) blocks.push(dividerBlock());
    firstGroup = false;
    blocks.push(...group);
  }
  if (firstGroup) {
    blocks.push(...sectionBlocks('No eligible external contributor PR.'));
  }

  const contextParts = [];
  if (runUrl) contextParts.push(slackLink(runUrl, 'workflow run'));
  if (external.staleCount > 0) {
    contextParts.push(
      `${external.staleCount} PR${external.staleCount === 1 ? '' : 's'} idle for 14+ days`,
    );
  }
  if (contextParts.length > 0) {
    blocks.push(contextBlock(contextParts.join(' · ')));
  }

  return asThreadReply({
    channel,
    threadTs,
    actionable: externalNeedsAction({ audit }),
    blocks,
    text: lines.join('\n'),
  });
};

// Kept as a small compatibility wrapper for callers that only need a single
// textual summary. New workflows should post the two module replies instead.
export const buildWeeklySecurityDigest = (options) => {
  const dependency = buildDependencySecurityReply(options);
  const vln = buildVlnReviewReply(options);
  const external = buildExternalContributorReply(options);
  return {
    text: `${dependency.text}\n\n${vln.text}\n\n${external.text}`,
    blocks: [...dependency.blocks, ...vln.blocks, ...external.blocks],
  };
};

const parseArgs = (argv) => {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    if (argv[index]?.startsWith('--'))
      args.set(argv[index].slice(2), argv[index + 1]);
  }
  return args;
};

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

const writeGithubOutput = async (name, value) => {
  if (!process.env.GITHUB_OUTPUT) return;
  await appendFile(
    process.env.GITHUB_OUTPUT,
    `${name}<<__WEEKLY_SECURITY_DIGEST__\n${value}\n__WEEKLY_SECURITY_DIGEST__\n`,
  );
};

export const runDigestCli = async ({
  argv = process.argv.slice(2),
  env = process.env,
} = {}) => {
  const args = parseArgs(argv);
  const input = resolve(
    args.get('input') ??
      env.AUDIT_REPORT_FILE ??
      'weekly-dependency-security-audit.json',
  );
  const output = resolve(
    args.get('output') ?? 'weekly-dependency-security-digest.json',
  );
  const remediationPath =
    args.get('remediation') ?? env.REMEDIATION_REPORT_FILE;
  const remediationPrUrl =
    args.get('remediation-pr-url') ?? env.REMEDIATION_PR_URL ?? null;
  const publishStatus =
    args.get('publish-status') ?? env.PUBLISH_STATUS ?? 'skipped';
  const module =
    args.get('module') ?? env.WEEKLY_SECURITY_MODULE ?? 'dependency-security';
  const threadTs = args.get('thread-ts') ?? env.SLACK_THREAD_TS ?? null;
  const channel = args.get('channel') ?? env.SLACK_CHANNEL ?? null;
  const audit = await readJson(input);
  const remediationReport = remediationPath
    ? await readJson(resolve(remediationPath))
    : null;
  const remediation = remediationPrUrl
    ? { ...remediationReport, pullRequestUrl: remediationPrUrl }
    : remediationReport;
  const options = {
    audit,
    remediation,
    publishStatus,
    runUrl: args.get('run-url') ?? env.GITHUB_RUN_URL ?? audit.run?.url,
    vlnLimit: Number(args.get('vln-limit') ?? DEFAULT_VLN_LIMIT),
    threadTs,
    channel,
  };
  const payload =
    module === 'dependency-security'
      ? buildDependencySecurityReply(options)
      : module === 'vln-review'
        ? buildVlnReviewReply(options)
        : module === 'external-contributors'
          ? buildExternalContributorReply(options)
          : (() => {
              throw new Error(`Unsupported --module value: ${module}`);
            })();
  const { actionable, ...slackPayload } = payload;
  await writeFile(output, `${JSON.stringify(slackPayload, null, 2)}\n`);
  await writeGithubOutput('digest-file', output);
  await writeGithubOutput('slack-text', payload.text);
  await writeGithubOutput('actionable', String(actionable));
  console.log(JSON.stringify(payload));
  return payload;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  runDigestCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
