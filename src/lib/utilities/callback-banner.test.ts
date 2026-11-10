import { describe, expect, it } from 'vitest';

import type { Callback } from '$lib/types/nexus';

import {
  callbackBannerKind,
  callbackBannerTitle,
  callbackStateCounts,
} from './callback-banner';

const callback = (state: string) => ({ state }) as unknown as Callback;

describe('callbackBannerKind', () => {
  it('shows no banner when there are no callbacks', () => {
    expect(callbackBannerKind(0, 0)).toBe('none');
  });

  it('shows the single banner for one own callback', () => {
    expect(callbackBannerKind(1, 0)).toBe('single');
  });

  it('shows the single banner for one worker callback link', () => {
    expect(callbackBannerKind(0, 1)).toBe('single');
  });

  it('shows the summary when own callbacks and worker callback links add up to more than one', () => {
    expect(callbackBannerKind(1, 1)).toBe('summary');
    expect(callbackBannerKind(2, 0)).toBe('summary');
    expect(callbackBannerKind(0, 3)).toBe('summary');
  });
});

describe('callbackBannerTitle', () => {
  it.each([
    ['Standby', 'Callback is standing by, waiting to be triggered.'],
    [
      'Scheduled',
      'Callback is in the queue waiting to be executed or is currently executing.',
    ],
    [
      'BackingOff',
      'Callback has failed with a retryable error and is backing off before the next attempt.',
    ],
    ['Blocked', 'Callback is blocked.'],
    ['Failed', 'Callback has failed.'],
    ['Succeeded', 'Callback has succeeded.'],
  ])('titles a %s callback "%s"', (state, title) => {
    expect(callbackBannerTitle(state)).toBe(title);
  });

  it('falls back to a generic title for an unknown or missing state', () => {
    expect(callbackBannerTitle('Unspecified')).toBe('Callback');
    expect(callbackBannerTitle(undefined)).toBe('Callback');
  });
});

describe('callbackStateCounts', () => {
  it('lists every state in order, including states with no callbacks', () => {
    expect(callbackStateCounts([])).toEqual([
      { state: 'Standby', label: 'Standing by, awaiting trigger', count: 0 },
      { state: 'Scheduled', label: 'Scheduled', count: 0 },
      { state: 'BackingOff', label: 'Backing off', count: 0 },
      { state: 'Blocked', label: 'Blocked', count: 0 },
      { state: 'Succeeded', label: 'Completed successfully', count: 0 },
      { state: 'Failed', label: 'Failed', count: 0 },
    ]);
  });

  it('counts callbacks by state', () => {
    const counts = callbackStateCounts([
      callback('Succeeded'),
      callback('Succeeded'),
      callback('BackingOff'),
      callback('Failed'),
    ]);

    expect(Object.fromEntries(counts.map((c) => [c.state, c.count]))).toEqual({
      Standby: 0,
      Scheduled: 0,
      BackingOff: 1,
      Blocked: 0,
      Succeeded: 2,
      Failed: 1,
    });
  });

  it('leaves out callbacks with an unknown state', () => {
    const counts = callbackStateCounts([callback('Unspecified')]);

    expect(counts.every(({ count }) => count === 0)).toBe(true);
  });
});
