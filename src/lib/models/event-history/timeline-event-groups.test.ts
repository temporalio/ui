import { describe, expect, it } from 'vitest';

import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { WorkflowEvent } from '$lib/types/events';

import type { EventGroupLabel } from './event-group-markers';
import {
  createTimelineEventGroup,
  createTimelineEventGroupFilter,
  isTimelineEventGroup,
  summarizeLifecycleGroups,
  type TimelineEventGroupLifecycle,
} from './timeline-event-groups';

const label: EventGroupLabel = { key: 'label:a', kind: 'label', id: 'a' };

const event = (
  id: string,
  overrides: Partial<WorkflowEvent> = {},
): WorkflowEvent =>
  ({
    id,
    eventTime: `2026-01-01T00:00:0${id}Z`,
    timestamp: `2026-01-01T00:00:0${id}Z`,
    classification: 'Completed',
    category: 'activity',
    attributes: {},
    ...overrides,
  }) as unknown as WorkflowEvent;

const lifecycle = (
  initialId: string,
  lastId: string,
  overrides: Partial<TimelineEventGroupLifecycle> = {},
): TimelineEventGroupLifecycle => ({
  id: initialId,
  version: 1,
  eventCount: 2,
  initialEvent: event(initialId),
  lastEvent: event(lastId),
  category: 'activity',
  classification: 'Scheduled',
  isPending: false,
  ...overrides,
});

describe('createTimelineEventGroup', () => {
  it('returns undefined without lifecycle groups', () => {
    expect(
      createTimelineEventGroup({ label, lifecycleGroups: [] }),
    ).toBeUndefined();
  });

  it('spans from the earliest to the latest lifecycle event', () => {
    const group = createTimelineEventGroup({
      label,
      lifecycleGroups: [lifecycle('4', '6'), lifecycle('1', '3')],
    })!;

    expect(group.id).toBe('event-group:label:a');
    expect(group.displayName).toBe('a');
    expect(group.initialEvent.id).toBe('1');
    expect(group.lastEvent.id).toBe('6');
    expect(group.eventTime).toBe(group.lastEvent.eventTime);
    expect(group.eventCount).toBe(4);
    expect(group.isPending).toBe(false);
    expect(group.classification).toBe('Completed');
    expect(isTimelineEventGroup(group)).toBe(true);
  });

  it('is pending when any lifecycle group is pending', () => {
    const group = createTimelineEventGroup({
      label,
      lifecycleGroups: [
        lifecycle('1', '3'),
        lifecycle('4', '5', { isPending: true }),
      ],
    })!;

    expect(group.isPending).toBe(true);
    expect(group.classification).toBe('Running');
  });

  it('reuses the previous group when nothing changed', () => {
    const lifecycleGroups = [lifecycle('1', '3')];
    const previous = createTimelineEventGroup({
      label,
      lifecycleGroups,
    });

    expect(
      createTimelineEventGroup({
        label,
        lifecycleGroups,
        previous,
      }),
    ).toBe(previous);
    expect(
      createTimelineEventGroup({
        label,
        lifecycleGroups: [lifecycle('1', '3', { version: 2 })],
        previous,
      }),
    ).not.toBe(previous);
  });
});

describe('createTimelineEventGroupFilter', () => {
  const timer = lifecycle('1', '2', { category: 'timer' });
  const activity = lifecycle('3', '7');
  const group = createTimelineEventGroup({
    label,
    lifecycleGroups: [timer, activity],
  })!;
  const isTimer = (lifecycleGroup: TimelineEventGroupLifecycle) =>
    lifecycleGroup.category === 'timer';

  it('returns groups unchanged when every lifecycle group matches', () => {
    const filter = createTimelineEventGroupFilter();

    expect(filter([group], () => true)).toEqual([group]);
    expect(filter([group], () => true)[0]).toBe(group);
  });

  it('narrows span, count and members to the matching lifecycle groups', () => {
    const filter = createTimelineEventGroupFilter();
    const [filtered] = filter([group], isTimer);

    expect(filtered.id).toBe(group.id);
    expect(filtered.lifecycleGroups).toEqual([timer]);
    expect(filtered.lastEvent.id).toBe('2');
    expect(filtered.eventCount).toBe(2);
  });

  it('drops groups with no matching lifecycle groups', () => {
    const filter = createTimelineEventGroupFilter();

    expect(filter([group], () => false)).toEqual([]);
  });

  it('updates when the filter matches a different subset', () => {
    const filter = createTimelineEventGroupFilter();
    const isActivity = (lifecycleGroup: TimelineEventGroupLifecycle) =>
      lifecycleGroup.category === 'activity';

    const [timersOnly] = filter([group], isTimer);
    const [activitiesOnly] = filter([group], isActivity);

    expect(activitiesOnly).not.toBe(timersOnly);
    expect(activitiesOnly.lifecycleGroups).toEqual([activity]);
    expect(activitiesOnly.initialEvent.id).toBe('3');
    expect(activitiesOnly.lastEvent.id).toBe('7');
  });

  it('reuses the filtered group while nothing changes', () => {
    const filter = createTimelineEventGroupFilter();

    expect(filter([group], isTimer)[0]).toBe(filter([group], isTimer)[0]);
  });

  it('rebuilds the filtered group when its label gains a name', () => {
    const filter = createTimelineEventGroupFilter();
    const signalLabel: EventGroupLabel = {
      key: 'event:3',
      kind: 'event',
      id: '3',
    };
    const signalGroup = createTimelineEventGroup({
      label: signalLabel,
      lifecycleGroups: [timer, activity],
    })!;
    expect(filter([signalGroup], isTimer)[0].name).toBe('3');

    signalLabel.name = 'launchHold';
    expect(filter([signalGroup], isTimer)[0].name).toBe('launchHold (3)');
  });
});

describe('isTimelineEventGroup', () => {
  it('rejects ordinary groups', () => {
    expect(isTimelineEventGroup({ id: '1' })).toBe(false);
    expect(isTimelineEventGroup(undefined)).toBe(false);
  });
});

describe('summarizeLifecycleGroups', () => {
  it('counts failures (including failed local activities), timeouts, retries and terminal states per group', () => {
    const groups = [
      {
        eventList: [
          event('1'),
          event('2', {
            activityTaskStartedEventAttributes: { attempt: 3 },
            attributes: { attempt: 3 },
          } as Partial<WorkflowEvent>),
          event('3', { classification: 'Failed' }),
        ],
        isCanceled: false,
        isTerminated: false,
      },
      {
        eventList: [event('4', { classification: 'TimedOut' })],
        isCanceled: true,
        isTerminated: false,
      },
      {
        eventList: [event('5')],
        isCanceled: false,
        isTerminated: false,
        pendingActivity: { attempt: 2, paused: true },
      },
      {
        eventList: [
          event('6', {
            classification: 'Completed',
            markerRecordedEventAttributes: {
              markerName: 'LocalActivity',
              failure: { message: 'boom' },
            },
          } as Partial<WorkflowEvent>),
        ],
        isCanceled: false,
        isTerminated: false,
      },
    ] as unknown as EventGroup[];

    expect(summarizeLifecycleGroups(groups)).toEqual({
      failed: 2,
      timedOut: 1,
      retries: 3,
      canceled: 1,
      terminated: 0,
      paused: 1,
    });
  });
});
