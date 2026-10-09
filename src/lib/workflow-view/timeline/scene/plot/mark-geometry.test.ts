import { describe, expect, it } from 'vitest';

import { getMarkGeometry } from './mark-geometry';
import type { QualifiedHistoryEvent } from '../../../data/history-events/types';

type MarkEvent = { x: number; eventType: QualifiedHistoryEvent['eventType'] };

function event(
  x: number,
  eventType: MarkEvent['eventType'] = 'WorkflowExecutionStarted',
): MarkEvent {
  return { x, eventType };
}

describe('mark geometry', () => {
  it('collapses a compact lifecycle into one outcome dot without stretching time', () => {
    const geometry = getMarkGeometry(
      100,
      108,
      [
        event(100, 'ActivityTaskScheduled'),
        event(101, 'ActivityTaskStarted'),
        event(108, 'ActivityTaskCompleted'),
      ],
      { clusterDistance: 8, radius: 5 },
    );
    expect(geometry).toEqual({
      bounds: { left: 100, right: 113 },
      ticks: [
        {
          x: 108,
          eventType: 'ActivityTaskCompleted',
          count: 3,
          isOutcome: true,
        },
      ],
    });
  });

  it('separates dots when zoom provides room while keeping their exact coordinates', () => {
    const geometry = getMarkGeometry(
      100,
      180,
      [
        event(100, 'ActivityTaskScheduled'),
        event(110, 'ActivityTaskStarted'),
        event(180, 'ActivityTaskCompleted'),
      ],
      { clusterDistance: 8, radius: 5 },
    );
    expect(geometry.ticks.map((tick) => tick.x)).toEqual([100, 110, 180]);
    expect(geometry.bounds).toEqual({ left: 95, right: 185 });
  });
  it('does not expand a tiny span based on event count', () => {
    const events = Array.from({ length: 1000 }, (_, index) =>
      event(100 + index / 1000),
    );

    expect(getMarkGeometry(100, 101, events)).toEqual({
      bounds: { left: 99.999, right: 101.999 },
      ticks: [
        {
          x: 100.999,
          eventType: 'WorkflowExecutionStarted',
          count: 1000,
          isOutcome: false,
        },
      ],
    });
  });

  it.each<MarkEvent['eventType']>([
    'WorkflowExecutionFailed',
    'WorkflowExecutionTerminated',
    'WorkflowExecutionTimedOut',
  ])('does not hide %s behind lower-priority events', (eventType) => {
    expect(
      getMarkGeometry(100, 102, [
        event(100, 'WorkflowExecutionCompleted'),
        event(100.5, eventType),
        event(101, 'WorkflowExecutionCanceled'),
        event(101.5, 'WorkflowExecutionCompleted'),
        event(102),
      ]),
    ).toEqual({
      bounds: { left: 99.5, right: 102 },
      ticks: [{ x: 100.5, eventType, count: 5, isOutcome: true }],
    });
  });

  it('prioritizes cancellation over completion and started events', () => {
    expect(
      getMarkGeometry(0, 2, [
        event(0, 'WorkflowExecutionCompleted'),
        event(0.5, 'WorkflowExecutionCanceled'),
        event(1, 'WorkflowExecutionContinuedAsNew'),
        event(2),
      ]).ticks,
    ).toEqual([
      {
        x: 0.5,
        eventType: 'WorkflowExecutionCanceled',
        count: 4,
        isOutcome: true,
      },
    ]);
  });

  it('preserves cluster order and uses actual coordinates of the last highest-priority events', () => {
    const events = [
      event(10, 'WorkflowExecutionFailed'),
      event(10.5, 'WorkflowExecutionTimedOut'),
      event(12),
      event(20, 'WorkflowExecutionCompleted'),
      event(21, 'TimerFired'),
      event(22),
      event(30),
      event(31, 'ActivityTaskStarted'),
    ];
    const original = events.map((event) => ({ ...event }));

    expect(getMarkGeometry(0, 40, events)).toEqual({
      bounds: { left: 0, right: 40 },
      ticks: [
        {
          x: 10.5,
          eventType: 'WorkflowExecutionTimedOut',
          count: 3,
          isOutcome: true,
        },
        { x: 21, eventType: 'TimerFired', count: 3, isOutcome: true },
        {
          x: 31,
          eventType: 'ActivityTaskStarted',
          count: 2,
          isOutcome: false,
        },
      ],
    });
    expect(events).toEqual(original);
  });

  it('clusters equal times and chooses the last event on a priority tie', () => {
    expect(
      getMarkGeometry(100, 100, [
        event(100, 'WorkflowExecutionFailed'),
        event(100, 'WorkflowExecutionTerminated'),
        event(100, 'WorkflowExecutionCompleted'),
        event(100),
      ]),
    ).toEqual({
      bounds: { left: 99, right: 101 },
      ticks: [
        {
          x: 100,
          eventType: 'WorkflowExecutionTerminated',
          count: 4,
          isOutcome: true,
        },
      ],
    });
  });

  it('separates events as zoom increases their pixel distances', () => {
    const events = [
      event(100),
      event(100.5, 'ActivityTaskStarted'),
      event(101, 'ActivityTaskCompleted'),
    ];
    expect(getMarkGeometry(100, 101, events).ticks).toHaveLength(1);

    const zoomedEvents = events.map((event) => ({
      ...event,
      x: 100 + (event.x - 100) * 10,
    }));
    expect(getMarkGeometry(100, 110, zoomedEvents)).toEqual({
      bounds: { left: 99, right: 111 },
      ticks: zoomedEvents.map((event) => ({
        ...event,
        count: 1,
        isOutcome: event.eventType === 'ActivityTaskCompleted',
      })),
    });
  });

  it('includes the 2px boundary without chaining neighboring events', () => {
    expect(
      getMarkGeometry(0, 6, [event(0), event(2), event(4), event(6)]),
    ).toEqual({
      bounds: { left: 0, right: 7 },
      ticks: [
        {
          x: 2,
          eventType: 'WorkflowExecutionStarted',
          count: 2,
          isOutcome: false,
        },
        {
          x: 6,
          eventType: 'WorkflowExecutionStarted',
          count: 2,
          isOutcome: false,
        },
      ],
    });
  });

  it.each<{ eventType: MarkEvent['eventType']; isOutcome: boolean }>([
    { eventType: 'WorkflowExecutionFailed', isOutcome: true },
    { eventType: 'WorkflowExecutionTerminated', isOutcome: true },
    { eventType: 'WorkflowExecutionTimedOut', isOutcome: true },
    { eventType: 'WorkflowExecutionCanceled', isOutcome: true },
    { eventType: 'ActivityTaskCompleted', isOutcome: true },
    { eventType: 'TimerFired', isOutcome: true },
    { eventType: 'WorkflowExecutionContinuedAsNew', isOutcome: true },
    { eventType: 'WorkflowExecutionStarted', isOutcome: false },
    { eventType: 'ActivityTaskStarted', isOutcome: false },
    { eventType: 'ActivityTaskScheduled', isOutcome: false },
    { eventType: 'WorkflowExecutionCancelRequested', isOutcome: false },
  ])('classifies $eventType outcomes', ({ eventType, isOutcome }) => {
    expect(getMarkGeometry(100, 100, [event(100, eventType)])).toEqual({
      bounds: { left: 99, right: 101 },
      ticks: [{ x: 100, eventType, count: 1, isOutcome }],
    });
  });

  it('does not shift a single tick at the edge of the plot', () => {
    expect(getMarkGeometry(0, 0, [event(0)])).toEqual({
      bounds: { left: -1, right: 1 },
      ticks: [
        {
          x: 0,
          eventType: 'WorkflowExecutionStarted',
          count: 1,
          isOutcome: false,
        },
      ],
    });
  });

  it('preserves bounds for an empty event list', () => {
    expect(getMarkGeometry(100, 200, [])).toEqual({
      bounds: { left: 100, right: 200 },
      ticks: [],
    });
  });
});
