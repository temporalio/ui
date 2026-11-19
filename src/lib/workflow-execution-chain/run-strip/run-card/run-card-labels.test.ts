import { describe, expect, it } from 'vitest';

import type { RunCounts } from '$lib/models/event-history/run-counts';

import {
  partialSuffix,
  runCardDescription,
  runCardName,
} from './run-card-labels';

const counts = (overrides: Partial<RunCounts> = {}): RunCounts => ({
  activities: 0,
  childWorkflows: 0,
  timers: 0,
  signals: 0,
  nexusOperations: 0,
  updates: 0,
  succeeded: 0,
  failed: 0,
  retried: 0,
  ...overrides,
});

describe('runCardName', () => {
  it('names a Run by short ID, status and duration', () => {
    expect(
      runCardName({
        runId: 'run-0123456789',
        status: 'ContinuedAsNew',
        mode: null,
        duration: '1h',
      }),
    ).toBe('Run run-0123, Continued as New, 1h');
  });

  it('adds the mode for the Latest Run', () => {
    expect(
      runCardName({
        runId: 'run-03',
        status: 'Completed',
        mode: 'latest',
        duration: '1h',
      }),
    ).toBe('Run run-03, Completed, latest, 1h');
    expect(
      runCardName({
        runId: 'run-03',
        status: 'Running',
        mode: 'live',
        duration: '5m',
      }),
    ).toBe('Run run-03, Running, live, 5m');
  });
});

describe('runCardDescription', () => {
  it('lists the full ID, non-zero counts and the incoming transition', () => {
    expect(
      runCardDescription({
        runId: 'run-02',
        counts: counts({ activities: 1, timers: 2, failed: 1, retried: 3 }),
        loadState: 'complete',
        transition: 'retry',
      }),
    ).toBe(
      'run-02, 1 activity, 2 timers, 1 failed, 3 retried, Continued from previous run by retry',
    );
  });

  it('marks partial counts and says the Run is still loading', () => {
    expect(
      runCardDescription({
        runId: 'run-02',
        counts: counts({ activities: 2, failed: 1 }),
        loadState: 'partial',
        transition: null,
      }),
    ).toBe('run-02, 2+ activities, 1+ failed, still loading, Start of chain');
  });

  it('describes the loading and error states', () => {
    const describe = (loadState: 'loading' | 'error') =>
      runCardDescription({
        runId: 'run-01',
        counts: counts(),
        loadState,
        transition: null,
      });

    expect(describe('loading')).toBe('run-01, loading events, Start of chain');
    expect(describe('error')).toBe(
      "run-01, couldn't load events, Start of chain",
    );
  });
});

describe('partialSuffix', () => {
  it('is + only while partial', () => {
    expect(partialSuffix('partial')).toBe('+');
    expect(partialSuffix('complete')).toBe('');
  });
});
