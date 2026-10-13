import { describe, expect, it } from 'vitest';

import {
  relativeRunTime,
  sessionStatusPresentation,
} from './session-presentation';

describe('sessionStatusPresentation for closed runs', () => {
  it.each([
    ['completed', 'Completed'],
    ['canceled', 'Canceled'],
    ['continued-as-new', 'ContinuedAsNew'],
    ['failed', 'Failed'],
    ['terminated', 'Terminated'],
    ['timed-out', 'TimedOut'],
  ] as const)(
    'presents %s runs with the %s badge status',
    (terminalStatus, status) => {
      expect(
        sessionStatusPresentation({
          state: 'execution-terminal',
          terminalStatus,
        }),
      ).toEqual({ status });
    },
  );
});

describe('sessionStatusPresentation', () => {
  it('presents a finished run by its terminal status', () => {
    expect(
      sessionStatusPresentation({
        state: 'execution-terminal',
        terminalStatus: 'failed',
      }),
    ).toEqual({ status: 'Failed' });
  });

  it('presents other runs by their session state', () => {
    expect(sessionStatusPresentation({ state: 'launch-rejected' })).toEqual({
      label: 'Start failed',
    });
    expect(sessionStatusPresentation({ state: 'execution-terminal' })).toEqual({
      label: 'Closed',
    });
    expect(sessionStatusPresentation({ state: 'launch-uncertain' })).toEqual({
      label: 'Start not confirmed',
    });
    expect(sessionStatusPresentation({ state: 'observation-paused' })).toEqual({
      label: 'Status checks paused',
    });
    expect(sessionStatusPresentation({ state: 'stopped' })).toEqual({
      label: 'Status checks stopped',
    });
  });
});

describe('relativeRunTime', () => {
  it('describes how long ago a run started', () => {
    const start = Date.UTC(2026, 9, 12, 12);
    expect(relativeRunTime(start, start + 60_000)).toBe('1m ago');
    expect(relativeRunTime(start, start)).toBe('just now');
  });
});
