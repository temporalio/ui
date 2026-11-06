import { describe, expect, it } from 'vitest';

import { toTimelineEventRow } from './to-timeline-event-row';
import type { QualifiedHistoryEvent } from '../../../data/history-events/types';
import {
  getEventKey,
  getExecutionKey,
  getLifecycleKey,
} from '../../../data/identity-keys';
import type { LifecycleGroup } from '../../../data/lifecycle-groups/types';

const executionKey = getExecutionKey({
  namespace: 'default',
  workflowId: 'workflow',
  runId: 'run',
});

function historyEvent(
  eventId: string,
  eventTimeMs: number,
): QualifiedHistoryEvent {
  return {
    executionKey,
    eventKey: getEventKey(executionKey, eventId),
    eventId,
    eventType: 'WorkflowExecutionSignaled',
    eventTypeFormat: 'readable',
    eventTimeMs,
    workflowExecutionSignaledEventAttributes: {
      signalName: `signal-${eventId}`,
    },
  };
}

function lifecycleGroup(
  events: readonly QualifiedHistoryEvent[],
): LifecycleGroup {
  const headEventKey = getEventKey(executionKey, '1');
  return {
    lifecycleKey: getLifecycleKey(headEventKey),
    executionKey,
    headEventKey,
    kind: 'event',
    eventKeys: Object.freeze(events.map((event) => event.eventKey)),
  };
}

function projectRow(
  group: LifecycleGroup,
  events: readonly QualifiedHistoryEvent[],
) {
  const eventsByKey = new Map(events.map((event) => [event.eventKey, event]));
  return toTimelineEventRow(group, (key) => eventsByKey.get(key));
}

describe('toTimelineEventRow', () => {
  const earliest = historyEvent('20', 100);
  const middle = historyEvent('3', 200);
  const latest = historyEvent('1', 300);

  it.each([
    { arrival: 'descending', events: [latest, middle, earliest] },
    { arrival: 'interleaved', events: [middle, earliest, latest] },
  ])(
    'sorts $arrival arrivals chronologically before event IDs',
    ({ events }) => {
      const group = lifecycleGroup(events);

      expect(projectRow(group, events)).toEqual({
        rowKey: group.lifecycleKey,
        executionKey,
        kind: 'event',
        label: 'signal-20',
        eventKeys: [earliest.eventKey, middle.eventKey, latest.eventKey],
        startEventId: '20',
        endEventId: '1',
        startTimeMs: 100,
        endTimeMs: 300,
      });
    },
  );

  it('breaks equal timestamp ties by numeric event ID', () => {
    const events = [
      historyEvent('10', 100),
      historyEvent('9007199254740993', 100),
      historyEvent('2', 100),
      historyEvent('9007199254740992', 100),
    ];
    const group = lifecycleGroup(events);

    expect(projectRow(group, events)).toEqual({
      rowKey: group.lifecycleKey,
      executionKey,
      kind: 'event',
      label: 'signal-2',
      eventKeys: ['2', '10', '9007199254740992', '9007199254740993'].map((id) =>
        getEventKey(executionKey, id),
      ),
      startEventId: '2',
      endEventId: '9007199254740993',
      startTimeMs: 100,
      endTimeMs: 100,
    });
  });

  it('uses a single event for both row endpoints', () => {
    const event = historyEvent('7', 250);
    const events = [event];
    const group = lifecycleGroup(events);

    expect(projectRow(group, events)).toEqual({
      rowKey: group.lifecycleKey,
      executionKey,
      kind: 'event',
      label: 'signal-7',
      eventKeys: [event.eventKey],
      startEventId: '7',
      endEventId: '7',
      startTimeMs: 250,
      endTimeMs: 250,
    });
  });

  it('leaves canonical lifecycle keys and source events untouched', () => {
    const events = Object.freeze([latest, middle, earliest]);
    const group = Object.freeze(lifecycleGroup(events));
    const canonicalEventKeys = group.eventKeys;
    const row = projectRow(group, events);

    expect(row?.eventKeys).toEqual([
      earliest.eventKey,
      middle.eventKey,
      latest.eventKey,
    ]);
    expect(row?.eventKeys).not.toBe(canonicalEventKeys);
    expect(row?.rowKey).toBe(group.lifecycleKey);
    expect(row?.executionKey).toBe(group.executionKey);
    expect(group.headEventKey).toBe(latest.eventKey);
    expect(group.lifecycleKey).toBe(getLifecycleKey(latest.eventKey));
    expect(group.eventKeys).toBe(canonicalEventKeys);
    expect(group.eventKeys).toEqual([
      latest.eventKey,
      middle.eventKey,
      earliest.eventKey,
    ]);
    expect(events).toEqual([latest, middle, earliest]);
  });
});
