import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import type { CommentState, Meta } from './render';
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

  it('retains original provenance across heads and updates reasons without duplicate history', () => {
    const first = parseState(renderComment(review, meta));
    const nextMeta = { ...meta, headSha: 'b'.repeat(40) };
    const updated: Review = {
      usages: [{ ...review.usages[0], reason: 'Current warning' }],
    };
    const body = renderComment(updated, nextMeta, first);
    const next = parseState(body);
    expect(next?.records.map((record) => record.headSha)).toEqual([
      meta.headSha,
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
    expect(latest?.records).toHaveLength(1);
    expect(latest?.records[0].headSha).toBe(meta.headSha);
    expect(latest?.records[0].finding.reason).toBe('Reworded current warning');
    const currentLine = body
      .split('\n')
      .find((line) => line.includes('Badge — breaks IN-2'));
    expect(currentLine).toContain(`originating head ${meta.headSha}`);
    expect(body).not.toContain('Previous warnings');
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

  it('collapses stored duplicate heads in observed order, retaining origin and latest reason', () => {
    const finding = toFindings(review, meta)[0];
    const origin = 'f'.repeat(40);
    const previous: CommentState = {
      meta,
      records: [
        {
          headSha: origin,
          finding: { ...finding, reason: 'First observation' },
        },
        {
          headSha: '1'.repeat(40),
          finding: { ...finding, reason: 'Second observation' },
        },
      ],
    };
    const unavailable = parseState(
      renderComment(
        null,
        { ...meta, reviewStatus: 'unavailable', reason: 'Refused' },
        previous,
      ),
    );
    expect(unavailable?.records).toEqual([
      {
        headSha: origin,
        finding: { ...finding, reason: 'Second observation' },
      },
    ]);
    const body = renderComment(review, meta, previous);
    expect(parseState(body)?.records).toEqual([{ headSha: origin, finding }]);
    expect(body).toContain(`originating head ${origin}`);
    expect(body).not.toContain('Previous warnings');
  });

  it('bounds five persistent findings over 250 heads while keeping original provenance', async () => {
    const longReason =
      'Empty badge text provides no visible label and loses essential context for assistive technology users. '
        .repeat(12)
        .trim();
    expect(longReason).toHaveLength(1235);
    const initial: Review = {
      usages: Array.from({ length: 5 }, (_, index) => ({
        ...review.usages[0],
        line: index + 1,
        reason: longReason,
      })),
    };
    const origin = 'f'.repeat(40);
    let state = parseState(
      renderComment(initial, { ...meta, headSha: origin }),
    );
    const observations: { push: number; chars: number; records: number }[] = [];
    let body = '';
    for (let push = 1; push <= 250; push++) {
      const nextMeta: Meta = {
        ...meta,
        headSha: push.toString(16).padStart(40, '0'),
        reviewStatus: push % 2 ? 'complete' : 'partial',
        reason: push % 2 ? null : 'Coverage limited',
      };
      const current: Review = {
        usages: initial.usages.map((usage) => ({
          ...usage,
          reason: `${longReason} ${push}`,
        })),
      };
      body = renderComment(current, nextMeta, state);
      expect(body.length).toBeLessThan(65_000);
      state = parseState(body);
      expect(state?.records).toHaveLength(5);
      expect(state?.records.every((record) => record.headSha === origin)).toBe(
        true,
      );
      expect(
        state?.records.every((record) =>
          record.finding.reason.endsWith(` ${push}`),
        ),
      ).toBe(true);
      expect(body).not.toContain('Previous warnings');
      expect(body.split(`originating head ${origin}`)).toHaveLength(6);
      observations.push({
        push,
        chars: body.length,
        records: state?.records.length ?? -1,
      });
    }
    const directory = process.env.IO_REVIEW_EVIDENCE_DIR;
    if (directory) {
      await mkdir(directory, { recursive: true });
      await writeFile(
        path.join(directory, 'renderer-stress.json'),
        JSON.stringify(
          {
            pushes: 250,
            findings: 5,
            reasonChars: longReason.length,
            origin,
            minChars: Math.min(...observations.map((item) => item.chars)),
            maxChars: Math.max(...observations.map((item) => item.chars)),
            observations,
            finalState: state,
          },
          null,
          2,
        ),
      );
      await writeFile(
        path.join(directory, 'renderer-stress-comment.txt'),
        body,
      );
    }
    expect(
      parseState(renderComment({ usages: [] }, meta, state))?.records,
    ).toEqual([]);
  });
});
