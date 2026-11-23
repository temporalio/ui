import { describe, expect, it } from 'vitest';

import type { Meta } from './render';
import {
  FindingSchema,
  MetaSchema,
  parseState,
  renderComment,
  toFindings,
} from './render';
import type { Review } from './review';

export const meta: Meta = {
  repo: 'temporalio/ui',
  pr: 42,
  prUrl: 'https://github.com/temporalio/ui/pull/42',
  headSha: 'a'.repeat(40),
  reviewStatus: 'complete',
  skippedFiles: [],
  missingRules: [],
  reason: null,
};
const review: Review = {
  usages: [
    {
      file: 'src/x.svelte',
      line: 2,
      component: 'badge',
      verdict: 'violation',
      ruleId: 'IN-2',
      pattern: null,
      reason: '<script>` @someone **injection**',
    },
  ],
};

describe('comments and artifacts', () => {
  it('keeps the marker, qualified rules, docs links, escaped text and exact finding shape', () => {
    const body = renderComment(review, meta);
    expect(body.startsWith('<!-- io-usage-review-bot -->')).toBe(true);
    expect(body).toContain('Badge — breaks IN-2');
    expect(body).toContain('advisory');
    expect(body).not.toContain('<script>');
    expect(body).not.toContain('@someone');
    expect(body).not.toContain('` @');
    expect(body).toContain(`/blob/${meta.headSha}/`);
    expect(toFindings(review, meta)).toEqual([
      {
        repo: meta.repo,
        pr: 42,
        prUrl: meta.prUrl,
        component: 'Badge',
        ruleId: 'IN-2',
        kind: 'violation',
        pattern: null,
        file: 'src/x.svelte',
        line: 2,
        reason: review.usages[0].reason,
      },
    ]);
  });

  it('preserves warning provenance across partial/unavailable, and only complete clean clears', () => {
    const old = parseState(renderComment(review, meta));
    expect(old?.records).toHaveLength(1);
    for (const reviewStatus of ['partial', 'unavailable'] as const) {
      const next = {
        ...meta,
        headSha: 'b'.repeat(40),
        reviewStatus,
        missingRules: ['badge'],
        skippedFiles: ['x'],
        reason: 'limited',
      };
      const body = renderComment({ usages: [] }, next, old);
      expect(body).toContain(meta.headSha);
      expect(body).toContain('Previous warnings');
      expect(body).not.toContain('No IO component usage changed');
      expect(parseState(body)?.records).toHaveLength(1);
    }
    expect(
      parseState(renderComment({ usages: [] }, meta, old))?.records,
    ).toEqual([]);
  });

  it('rejects missing, malformed, forged or mismatched handoff/state', () => {
    expect(
      MetaSchema.safeParse({ ...meta, reviewStatus: undefined }).success,
    ).toBe(false);
    expect(
      MetaSchema.safeParse({ ...meta, prUrl: 'https://evil.test' }).success,
    ).toBe(false);
    expect(FindingSchema.safeParse({}).success).toBe(false);
    expect(parseState('no state')).toBeNull();
    expect(parseState('<!-- io-usage-state:evil -->')).toBeNull();
  });

  it('renders complete empty and unavailable distinctly', () => {
    expect(renderComment({ usages: [] }, meta)).toContain(
      'No IO component usage changed',
    );
    expect(
      renderComment(null, {
        ...meta,
        reviewStatus: 'unavailable',
        reason: 'Model failed',
      }),
    ).toContain('IO usage review unavailable');
  });
});
