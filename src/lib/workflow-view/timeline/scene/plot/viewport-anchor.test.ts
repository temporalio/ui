import { describe, expect, it } from 'vitest';

import type { TimeRange } from './time-viewport';
import {
  getInitialViewport,
  getInitialViewportDuration,
  getViewportScrollLeft,
  getViewportStartMs,
} from './viewport-anchor';
import type { ExecutionHistoryState } from '../../../data/execution-history/types';
import type { QualifiedHistoryEvent } from '../../../data/history-events/types';
import { getEventKey, getExecutionKey } from '../../../data/identity-keys';

function executionHistory(
  workflowId: string,
  runId: string,
  load: Partial<ExecutionHistoryState['load']> = {},
): ExecutionHistoryState {
  const identity = { namespace: 'default', workflowId, runId };
  return {
    executionKey: getExecutionKey(identity),
    identity,
    load: { status: 'loading', progress: null, stats: null, ...load },
    stream: { status: 'idle', cursor: '' },
  };
}

function historyEvent(
  history: ExecutionHistoryState,
  eventId: string,
  eventTimeMs: number,
  eventType: QualifiedHistoryEvent['eventType'] = 'WorkflowExecutionStarted',
): QualifiedHistoryEvent {
  return {
    executionKey: history.executionKey,
    eventKey: getEventKey(history.executionKey, eventId),
    eventId,
    eventType,
    eventTypeFormat: 'readable',
    eventTimeMs,
  };
}

function progress(ascPages: number, descPages: number) {
  return { ascPages, descPages, eventsAdded: 2, elapsedMs: 10 };
}

const root = executionHistory('root', 'one');
const nextRun = executionHistory('root', 'two', { status: 'loaded' });
const child = executionHistory('child', 'one', { status: 'loaded' });
const rootEvents = [
  historyEvent(root, '1', 100),
  historyEvent(root, '2', 2100),
];
const rootRange = { startMs: 100, endMs: 2100 };
const completedStatuses: ExecutionHistoryState['load']['status'][] = [
  'loaded',
  'failed',
];

describe('getInitialViewport', () => {
  it('returns null without an execution history', () => {
    expect(getInitialViewport(rootEvents, [])).toBeNull();
  });

  it.each([null, progress(0, 0), progress(1, 0), progress(0, 1)])(
    'waits for both page directions while loading: %j',
    (loadProgress) => {
      const history = {
        ...root,
        load: { ...root.load, progress: loadProgress },
      };
      expect(getInitialViewport(rootEvents, [history])).toBeNull();
    },
  );

  it('waits while pending with no progress', () => {
    const history = executionHistory('root', 'one', { status: 'pending' });
    expect(getInitialViewport(rootEvents, [history])).toBeNull();
  });

  it('uses the exact finite min/max once both directions have pages', () => {
    const history = executionHistory('root', 'one', {
      progress: progress(1, 1),
    });
    const events = [
      rootEvents[1],
      historyEvent(root, '3', 1000),
      rootEvents[0],
    ];
    expect(getInitialViewport(events, [history])).toEqual(rootRange);
    expect(events.map((event) => event.eventTimeMs)).toEqual([2100, 1000, 100]);
  });

  describe.each(completedStatuses)('%s history', (status) => {
    it.each([null, progress(1, 0), progress(0, 1)])(
      'allows completion without both page directions: %j',
      (loadProgress) => {
        const history = executionHistory('root', 'one', {
          status,
          progress: loadProgress,
        });
        expect(getInitialViewport(rootEvents, [history])).toEqual(rootRange);
      },
    );

    it('returns null when no events arrived', () => {
      const history = executionHistory('root', 'one', { status });
      expect(getInitialViewport([], [history])).toBeNull();
    });
  });

  it('excludes next-run and child events from the root range', () => {
    const history = executionHistory('root', 'one', { status: 'loaded' });
    expect(
      getInitialViewport(
        [
          historyEvent(nextRun, '1', -1000),
          historyEvent(child, '1', 9000),
          ...rootEvents,
        ],
        [history, nextRun, child],
      ),
    ).toEqual(rootRange);
  });

  it('chooses the requested first history independently of event arrival order', () => {
    const events = [
      ...rootEvents,
      historyEvent(nextRun, '1', 3000),
      historyEvent(nextRun, '2', 7000),
    ];
    expect(getInitialViewport(events, [nextRun, root])).toEqual({
      startMs: 3000,
      endMs: 7000,
    });
  });

  it('does not fall back to another ready history while the first is loading', () => {
    expect(
      getInitialViewport(
        [historyEvent(nextRun, '1', 3000), historyEvent(nextRun, '2', 7000)],
        [root, nextRun],
      ),
    ).toBeNull();
  });

  it('does not fall back when the completed first history has no matching events', () => {
    const history = executionHistory('root', 'one', { status: 'loaded' });
    expect(
      getInitialViewport(
        [historyEvent(nextRun, '1', 3000), historyEvent(nextRun, '2', 7000)],
        [history, nextRun],
      ),
    ).toBeNull();
  });

  it('ignores nonfinite timestamps when computing the range', () => {
    const history = executionHistory('root', 'one', { status: 'loaded' });
    expect(
      getInitialViewport(
        [
          historyEvent(root, '3', NaN),
          historyEvent(root, '4', Infinity),
          historyEvent(root, '5', -Infinity),
          ...rootEvents,
        ],
        [history],
      ),
    ).toEqual(rootRange);
  });

  it.each([[], [NaN, Infinity, -Infinity]])(
    'returns null without finite timestamps: %j',
    (...timestamps) => {
      const history = executionHistory('root', 'one', { status: 'loaded' });
      const events = timestamps.map((timestamp, index) =>
        historyEvent(root, String(index + 1), timestamp),
      );
      expect(getInitialViewport(events, [history])).toBeNull();
    },
  );
});

describe('single-timestamp initial history', () => {
  it('uses a nonzero range when history has finished loading', () => {
    const history = executionHistory('root', 'one', { status: 'loaded' });
    expect(
      getInitialViewport([historyEvent(root, '1', 100)], [history]),
    ).toEqual({ startMs: 100, endMs: 101 });
  });

  it('waits for a useful span while history is still loading', () => {
    const history = executionHistory('root', 'one', {
      progress: progress(1, 1),
    });
    expect(
      getInitialViewport([historyEvent(root, '1', 100)], [history]),
    ).toBeNull();
  });
});

describe('getInitialViewportDuration', () => {
  it.each([1, 7000, 15_000, 60_000, 90_000])(
    'gives a running execution a minimum 15 seconds for a %i ms span before polling starts',
    (duration) => {
      const history = executionHistory('root', 'one', { status: 'loaded' });
      const events = [historyEvent(history, '1', 100)];
      expect(
        getInitialViewportDuration(
          { startMs: 100, endMs: 100 + duration },
          events,
          [history],
        ),
      ).toBe(Math.max(15_000, duration));
    },
  );

  const terminalEventTypes: QualifiedHistoryEvent['eventType'][] = [
    'WorkflowExecutionCompleted',
    'WorkflowExecutionFailed',
    'WorkflowExecutionCanceled',
    'WorkflowExecutionTerminated',
    'WorkflowExecutionTimedOut',
    'WorkflowExecutionContinuedAsNew',
  ];

  it.each(terminalEventTypes)(
    'fits a closed seven-second execution: %s',
    (eventType) => {
      expect(
        getInitialViewportDuration(
          { startMs: 100, endMs: 7100 },
          [historyEvent(root, '2', 7100, eventType)],
          [root],
        ),
      ).toBe(7000);
    },
  );

  it('keeps the requested continuation span despite the new running history', () => {
    expect(
      getInitialViewportDuration(
        rootRange,
        [
          historyEvent(nextRun, '1', 2100),
          historyEvent(root, '2', 2100, 'WorkflowExecutionContinuedAsNew'),
        ],
        [root, nextRun],
      ),
    ).toBe(2000);
  });

  it.each([nextRun, child])(
    'ignores a close event from $executionKey',
    (unrelatedHistory) => {
      expect(
        getInitialViewportDuration(
          rootRange,
          [
            historyEvent(
              unrelatedHistory,
              '2',
              2100,
              'WorkflowExecutionCompleted',
            ),
            ...rootEvents,
          ],
          [root, unrelatedHistory],
        ),
      ).toBe(15_000);
    },
  );

  it('uses the first history rather than the first close event', () => {
    expect(
      getInitialViewportDuration(
        rootRange,
        [historyEvent(root, '2', 2100, 'WorkflowExecutionCompleted')],
        [nextRun, root],
      ),
    ).toBe(15_000);
  });

  it.each<QualifiedHistoryEvent['eventType']>([
    'WorkflowTaskCompleted',
    'WorkflowExecutionCancelRequested',
    'ChildWorkflowExecutionCompleted',
  ])('does not treat %s as an execution close event', (eventType) => {
    expect(
      getInitialViewportDuration(
        rootRange,
        [historyEvent(root, '2', 2100, eventType)],
        [root],
      ),
    ).toBe(15_000);
  });

  it.each([0, 1])(
    'keeps a finished single-timestamp span of %i ms at one millisecond',
    (duration) => {
      expect(
        getInitialViewportDuration(
          { startMs: 100, endMs: 100 + duration },
          [historyEvent(root, '1', 100, 'WorkflowExecutionCompleted')],
          [root],
        ),
      ).toBe(1);
    },
  );

  it('defaults to 15 seconds without a requested execution', () => {
    expect(
      getInitialViewportDuration(
        rootRange,
        [historyEvent(root, '2', 2100, 'WorkflowExecutionCompleted')],
        [],
      ),
    ).toBe(15_000);
  });
});

describe('viewport scroll projection', () => {
  it('projects timestamps and clamps only the negative scroll edge', () => {
    expect(getViewportScrollLeft(1100, rootRange, 1000)).toBe(500);
    expect(getViewportScrollLeft(0, rootRange, 1000)).toBe(0);
    expect(getViewportScrollLeft(3100, rootRange, 1000)).toBe(1500);
  });

  it('inverts scroll projection including both domain edges', () => {
    for (const startMs of [100, 600, 1100, 2100]) {
      const scrollLeft = getViewportScrollLeft(startMs, rootRange, 1000);
      expect(getViewportStartMs(scrollLeft, rootRange, 1000)).toBe(startMs);
    }
  });

  it('preserves the same time window when the domain grows later', () => {
    const grownDomain: TimeRange = { startMs: 100, endMs: 7100 };
    const scrollLeft = getViewportScrollLeft(1100, rootRange, 1000);
    const startMs = getViewportStartMs(scrollLeft, rootRange, 1000);
    const grownScrollLeft = getViewportScrollLeft(startMs, grownDomain, 3500);

    expect(grownScrollLeft).toBe(scrollLeft);
    expect(getViewportStartMs(grownScrollLeft, grownDomain, 3500)).toBe(1100);
    expect(getViewportStartMs(grownScrollLeft + 250, grownDomain, 3500)).toBe(
      getViewportStartMs(scrollLeft + 250, rootRange, 1000),
    );
    expect(getViewportScrollLeft(startMs, grownDomain, 1000)).toBeCloseTo(
      1000 / 7,
    );
  });

  it('moves pixel scroll while preserving the time window when the domain grows earlier', () => {
    const grownDomain: TimeRange = { startMs: -1900, endMs: 2100 };
    const scrollLeft = getViewportScrollLeft(1100, rootRange, 1000);
    const startMs = getViewportStartMs(scrollLeft, rootRange, 1000);
    const grownScrollLeft = getViewportScrollLeft(startMs, grownDomain, 2000);

    expect(scrollLeft).toBe(500);
    expect(grownScrollLeft).toBe(1500);
    expect(getViewportStartMs(grownScrollLeft, grownDomain, 2000)).toBe(1100);
    expect(getViewportStartMs(grownScrollLeft + 250, grownDomain, 2000)).toBe(
      getViewportStartMs(scrollLeft + 250, rootRange, 1000),
    );
  });
});
