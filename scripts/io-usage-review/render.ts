import { z } from 'zod';

import type { Review } from './review';
import { COMPONENTS } from './rules';

export const MARKER = '<!-- io-usage-review-bot -->';
const sha = z.string().regex(/^[a-f0-9]{40}$/);
export const MetaSchema = z
  .object({
    repo: z.enum(['temporalio/ui', 'temporalio/cloud-ui']),
    pr: z.number().int().positive(),
    prUrl: z.string(),
    headSha: sha,
    reviewStatus: z.enum(['complete', 'partial', 'unavailable', 'skipped']),
    skippedFiles: z.array(z.string()),
    missingRules: z.array(z.string()),
    reason: z.string().nullable(),
  })
  .strict()
  .refine(
    (meta) => meta.prUrl === `https://github.com/${meta.repo}/pull/${meta.pr}`,
    'PR identity mismatch',
  );
export type Meta = z.infer<typeof MetaSchema>;
export const FindingSchema = z
  .object({
    repo: z.enum(['temporalio/ui', 'temporalio/cloud-ui']),
    pr: z.number().int().positive(),
    prUrl: z.string(),
    component: z.string(),
    ruleId: z.string().nullable(),
    kind: z.enum(['violation', 'uncovered']),
    pattern: z.string().nullable(),
    file: z.string(),
    line: z.number().int().positive(),
    reason: z.string(),
  })
  .strict()
  .refine(
    (finding) =>
      finding.prUrl ===
        `https://github.com/${finding.repo}/pull/${finding.pr}` &&
      (finding.kind === 'violation'
        ? !!finding.ruleId && finding.pattern === null
        : finding.ruleId === null && !!finding.pattern),
  );
export type Finding = z.infer<typeof FindingSchema>;
const StateSchema = z
  .object({
    meta: MetaSchema,
    records: z.array(
      z.object({ headSha: sha, finding: FindingSchema }).strict(),
    ),
  })
  .strict()
  .refine((state) =>
    state.records.every(
      ({ finding }) =>
        finding.repo === state.meta.repo && finding.pr === state.meta.pr,
    ),
  );
export type CommentState = z.infer<typeof StateSchema>;

export function escapeText(value: string): string {
  return value.replace(
    /[&<>`*_[\]\\|!@\r\n]/g,
    (char) => `&#${char.charCodeAt(0)};`,
  );
}

export function displayName(component: string): string {
  return (
    component
      .split('/')
      .at(-1)
      ?.split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') ?? component
  );
}

export function toFindings(review: Review, meta: Meta): Finding[] {
  return review.usages
    .filter((usage) => usage.verdict !== 'aligned')
    .map((usage) =>
      FindingSchema.parse({
        repo: meta.repo,
        pr: meta.pr,
        prUrl: meta.prUrl,
        component: displayName(usage.component),
        ruleId: usage.verdict === 'uncovered' ? null : usage.ruleId,
        kind: usage.verdict,
        pattern: usage.verdict === 'uncovered' ? usage.pattern : null,
        file: usage.file,
        line: usage.line,
        reason: usage.reason,
      }),
    );
}

export function parseState(body: string): CommentState | null {
  try {
    if (!body.startsWith(MARKER) || body.length > 65_000) return null;
    const encoded = /\n<!-- io-usage-state:([A-Za-z0-9+/=]+) -->$/.exec(
      body,
    )?.[1];
    if (!encoded) return null;
    return StateSchema.parse(
      JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')),
    );
  } catch {
    return null;
  }
}

export function renderComment(
  review: Review | null,
  meta: Meta,
  previous: CommentState | null = null,
  docsSha = meta.headSha,
): string {
  MetaSchema.parse(meta);
  const current = review ? toFindings(review, meta) : [];
  const findingKey = (finding: Finding): string =>
    JSON.stringify([
      finding.repo,
      finding.pr,
      finding.component,
      finding.file,
      finding.line,
      finding.kind,
      finding.ruleId,
      finding.pattern,
    ]);
  const currentRecords = current.map((finding) => ({
    headSha: meta.headSha,
    finding,
  }));
  const currentKeys = new Set(current.map(findingKey));
  const priorRecords =
    meta.reviewStatus === 'complete' && review !== null && current.length === 0
      ? []
      : (previous?.records ?? []);
  const merged = new Map<string, CommentState['records'][number]>();
  for (const record of [...priorRecords, ...currentRecords]) {
    const key = findingKey(record.finding);
    merged.set(key, {
      headSha: merged.get(key)?.headSha ?? record.headSha,
      finding: record.finding,
    });
  }
  const records = [...merged.values()];
  const retained = records.filter(
    (record) => !currentKeys.has(findingKey(record.finding)),
  );
  const lines = [
    MARKER,
    '## IO usage review',
    '',
    `Reviewed head: ${meta.headSha}`,
    `Coverage: ${meta.reviewStatus}`,
    '',
  ];
  if (meta.reviewStatus === 'unavailable')
    lines.push(
      `IO usage review unavailable: ${escapeText(meta.reason ?? 'Unknown failure')}`,
    );
  else if (meta.reviewStatus === 'partial')
    lines.push(
      `Review has incomplete coverage: ${escapeText(meta.reason ?? 'Some usages could not be reviewed')}`,
    );
  else if (!review?.usages.length)
    lines.push('No IO component usage changed in this PR.');
  for (const file of [
    ...new Set(review?.usages.map((usage) => usage.file) ?? []),
  ]) {
    lines.push('', `**${escapeText(file)}**`);
    for (const usage of review?.usages.filter((item) => item.file === file) ??
      []) {
      const verdict =
        usage.verdict === 'aligned'
          ? `follows ${usage.ruleId}`
          : usage.verdict === 'violation'
            ? `breaks ${usage.ruleId}`
            : 'no documented rule covers this';
      const finding = toFindings({ usages: [usage] }, meta)[0];
      const origin = finding
        ? merged.get(findingKey(finding))?.headSha
        : undefined;
      lines.push(
        `- ${usage.verdict === 'aligned' ? '✅' : '⚠️'} ${escapeText(displayName(usage.component))} — ${escapeText(verdict)}: ${escapeText(usage.reason)} (line ${usage.line}${origin && origin !== meta.headSha ? `; originating head ${origin}` : ''})`,
      );
    }
  }
  if (retained.length) {
    lines.push('', 'Previous warnings (retained; resolution is unconfirmed):');
    for (const record of retained)
      lines.push(
        `- ⚠️ ${escapeText(record.finding.component)} ${escapeText(record.finding.ruleId ?? record.finding.pattern ?? '')} — ${escapeText(record.finding.file)}:${record.finding.line}: ${escapeText(record.finding.reason)} (originating head ${record.headSha})`,
      );
  }
  if (meta.skippedFiles.length)
    lines.push(
      '',
      `Skipped files: ${meta.skippedFiles.map(escapeText).join(', ')}`,
    );
  if (meta.missingRules.length)
    lines.push(
      '',
      `No rules at pinned ui version / unusable context: ${meta.missingRules.map(escapeText).join(', ')}`,
    );
  lines.push(
    '',
    'This review is advisory and never blocks a PR. ⚠️ findings are available for design/frontend review through the findings artifact; digest logging is pending FE-1629.',
  );
  const components = new Set(
    review?.usages.map((usage) => usage.component) ?? [],
  );
  if (!sha.safeParse(docsSha).success) throw new Error('Invalid docs source');
  for (const component of components)
    if (COMPONENTS.includes(component))
      lines.push(
        `[${displayName(component)} docs](https://github.com/temporalio/ui/blob/${docsSha}/src/lib/io/${component}/${component.split('/').at(-1)}.md)`,
      );
  const state = StateSchema.parse({ meta, records });
  lines.push(
    `\n<!-- io-usage-state:${Buffer.from(JSON.stringify(state)).toString('base64')} -->`,
  );
  return lines.join('\n');
}
