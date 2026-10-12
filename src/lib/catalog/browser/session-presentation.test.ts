import { describe, expect, it } from 'vitest';

import {
  relativeRunTime,
  sessionStatusPresentation,
  terminalStatusPresentation,
} from './session-presentation';

describe('terminalStatusPresentation', () => {
  it.each([
    ['completed', { label: 'Completed', status: 'Completed' }],
    ['canceled', { label: 'Canceled', status: 'Canceled' }],
    [
      'continued-as-new',
      { label: 'Continued as new', status: 'ContinuedAsNew' },
    ],
    ['failed', { label: 'Failed', status: 'Failed' }],
    ['terminated', { label: 'Terminated', status: 'Terminated' }],
    ['timed-out', { label: 'Timed out', status: 'TimedOut' }],
  ] as const)('presents %s sessions', (status, presentation) => {
    expect(terminalStatusPresentation(status)).toEqual(presentation);
  });
});

describe('sessionStatusPresentation', () => {
  it('presents a finished run by its terminal status', () => {
    expect(
      sessionStatusPresentation({
        state: 'execution-terminal',
        terminalStatus: 'failed',
      }),
    ).toEqual({ label: 'Failed', status: 'Failed' });
  });

  it('presents other runs by their session state', () => {
    expect(sessionStatusPresentation({ state: 'launch-rejected' })).toEqual({
      label: 'Start failed',
    });
    expect(sessionStatusPresentation({ state: 'execution-terminal' })).toEqual({
      label: 'Finished',
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
