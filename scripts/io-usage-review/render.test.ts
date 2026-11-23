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

  it('retains old origins on complete nonzero, dedupes same-head observations and updates reasons', () => {
    const first = parseState(renderComment(review, meta));
    const nextMeta = { ...meta, headSha: 'b'.repeat(40) };
    const updated: Review = {
      usages: [{ ...review.usages[0], reason: 'Current warning' }],
    };
    const body = renderComment(updated, nextMeta, first);
    const next = parseState(body);
    expect(next?.records.map((record) => record.headSha)).toEqual([
      meta.headSha,
      nextMeta.headSha,
    ]);
    expect(body).toContain(`originating head ${meta.headSha}`);
    const repeated = renderComment(updated, nextMeta, next);
    expect(parseState(repeated)?.records).toEqual(next?.records);
    expect(repeated).not.toContain(`originating head ${nextMeta.headSha}`);
    const latest = parseState(
      renderComment(
        {
          usages: [
            { ...updated.usages[0], reason: 'Reworded current warning' },
          ],
        },
        nextMeta,
        next,
      ),
    );
    expect(latest?.records).toHaveLength(2);
    expect(latest?.records[0]).toEqual(first?.records[0]);
    expect(latest?.records[1].finding.reason).toBe('Reworded current warning');
  });

  it('preserves distinct absent prior warnings until complete zero findings', () => {
    const historical: Review = {
      usages: [
        review.usages[0],
        { ...review.usages[0], file: 'src/old.svelte', ruleId: 'A11Y-1' },
      ],
    };
    const previous = parseState(renderComment(historical, meta));
    const nextMeta = { ...meta, headSha: 'b'.repeat(40) };
    const current: Review = {
      usages: [{ ...review.usages[0], file: 'src/new.svelte' }],
    };
    const state = parseState(renderComment(current, nextMeta, previous));
    expect(state?.records).toHaveLength(3);
    expect(state?.records.slice(0, 2)).toEqual(previous?.records);
    expect(toFindings(current, nextMeta)).toHaveLength(1);
    expect(
      parseState(
        renderComment(
          { usages: [{ ...current.usages[0], verdict: 'aligned' }] },
          nextMeta,
          state,
        ),
      )?.records,
    ).toEqual([]);
  });
});
