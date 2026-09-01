import { describe, expect, it } from 'vitest';

import type {
  EventGroup,
  EventGroups,
} from '$lib/models/event-groups/event-groups';
import type { EventGroupMarker, WorkflowEvent } from '$lib/types/events';

import {
  createTimelineEventMarkerGroups,
  type EventMarkerAttribution,
  eventMatchesEventGroupFilter,
  getEventGroupMarkerKey,
  getEventGroupMarkerPresentation,
  lifecycleGroupMatchesEventGroupFilter,
} from './event-marker-groups';

const createEvent = (
  id: string,
  eventGroupMarkers: EventGroupMarker[] = [],
): WorkflowEvent =>
  ({
    id,
    eventId: id,
    eventType: 'ActivityTaskScheduled',
    name: 'ActivityTaskScheduled',
    eventTime: `2026-08-10T10:41:0${id}.000Z`,
    timestamp: `2026-08-10T10:41:0${id}.000Z`,
    classification: 'Scheduled',
    category: 'activity',
    attributes: {},
    eventGroupMarkers,
  }) as WorkflowEvent;

const createLifecycleGroup = (
  id: string,
  eventList: WorkflowEvent[],
): EventGroup =>
  ({
    id,
    name: `Activity ${id}`,
    label: `Activity ${id}`,
    displayName: `Activity ${id}`,
    eventList,
    initialEvent: eventList[0],
    lastEvent: eventList[eventList.length - 1],
    timestamp: eventList[0].timestamp,
    classification: 'Scheduled',
    finalClassification: 'Completed',
    category: 'activity',
    eventTime: eventList[eventList.length - 1].eventTime,
    attributes: {},
    isPending: false,
    isFailureOrTimedOut: false,
    isCanceled: false,
    isTerminated: false,
    level: undefined,
    pendingActivity: undefined,
    pendingNexusOperation: undefined,
    links: [],
    billableActions: 0,
    eventCount: eventList.length,
  }) as EventGroup;

const createAttribution = (
  marker: EventGroupMarker,
  events: WorkflowEvent[],
  lifecycleGroupIds: string[],
): EventMarkerAttribution => ({
  key: getEventGroupMarkerKey(marker)!,
  eventGroupMarker: marker,
  eventsById: new Map(
    events.map((event, index) => [
      event.id,
      {
        event,
        lifecycleGroupId:
          lifecycleGroupIds.length === 1
            ? lifecycleGroupIds[0]
            : lifecycleGroupIds[index],
      },
    ]),
  ),
});

const presentationLabelsByMarkerKey = new Map([
  ['event:1', 'WorkflowExecutionStarted (1)'],
  ['update:update-1', 'Start the update (update-1)'],
]);

const presentationsByMarkerKey = new Map(
  [
    getEventGroupMarkerPresentation(
      { inboundEvent: { inboundEventId: '1' } },
      presentationLabelsByMarkerKey,
    ),
    getEventGroupMarkerPresentation(
      { inboundUpdate: { inboundUpdateId: 'update-1' } },
      presentationLabelsByMarkerKey,
    ),
  ]
    .filter((presentation) => presentation !== undefined)
    .map((presentation) => [presentation.key, presentation]),
);

describe('createTimelineEventMarkerGroups', () => {
  it('matches events and lifecycle groups against any selected marker', () => {
    const checkout = createEvent('1', [{ label: { id: 'checkout' } }]);
    const payment = createEvent('2', [{ label: { id: 'payment' } }]);
    const lifecycleGroup = createLifecycleGroup('1', [checkout, payment]);

    expect(
      eventMatchesEventGroupFilter(
        checkout,
        new Set(['label:checkout', 'label:other']),
      ),
    ).toBe(true);
    expect(
      eventMatchesEventGroupFilter(checkout, new Set(['label:other'])),
    ).toBe(false);
    expect(
      lifecycleGroupMatchesEventGroupFilter(
        lifecycleGroup,
        new Set(['label:payment']),
      ),
    ).toBe(true);
    expect(
      lifecycleGroupMatchesEventGroupFilter(lifecycleGroup, new Set()),
    ).toBe(true);
  });

  it('uses consistent fallback labels for marker kinds', () => {
    expect(
      getEventGroupMarkerKey({ inboundEvent: { inboundEventId: null } }),
    ).toBeUndefined();
    expect(
      getEventGroupMarkerPresentation({ label: { id: 'checkout' } }),
    ).toMatchObject({
      key: 'label:checkout',
      displayName: 'checkout',
    });
    expect(
      getEventGroupMarkerPresentation(
        { inboundEvent: { inboundEventId: '1' } },
        presentationLabelsByMarkerKey,
      ),
    ).toMatchObject({
      key: 'event:1',
      displayName: 'WorkflowExecutionStarted (1)',
    });
    expect(
      getEventGroupMarkerPresentation(
        { inboundUpdate: { inboundUpdateId: 'update-1' } },
        presentationLabelsByMarkerKey,
      ),
    ).toMatchObject({
      key: 'update:update-1',
      displayName: 'Start the update (update-1)',
    });
    expect(
      getEventGroupMarkerPresentation({
        inboundUpdate: { inboundUpdateId: 'demo-update-row-2' },
      }),
    ).toMatchObject({
      displayName: 'demo-update-row-2',
    });
  });

  it('creates one timeline row for each marker', () => {
    const first = createEvent('1', [
      { label: { id: 'checkout' } },
      { label: { id: 'row-17' } },
    ]);
    const second = createEvent('2', [{ label: { id: 'checkout' } }]);
    const lifecycleGroups: EventGroups = [
      createLifecycleGroup('1', [first]),
      createLifecycleGroup('2', [second]),
    ];

    const groups = createTimelineEventMarkerGroups(
      [
        createAttribution(
          { label: { id: 'checkout' } },
          [first, second],
          ['1', '2'],
        ),
        createAttribution({ label: { id: 'row-17' } }, [first], ['1']),
      ],
      lifecycleGroups,
      presentationsByMarkerKey,
    );

    expect(groups.map((group) => group.markerKey)).toEqual([
      'label:checkout',
      'label:row-17',
    ]);
    expect(groups[0].eventList.map((event) => event.id)).toEqual(['1', '2']);
    expect(groups[0].lifecycleGroups).toHaveLength(2);
    expect(groups[1].lifecycleGroups).toHaveLength(1);
  });

  it('uses a label payload found on any occurrence of a marker', () => {
    const first = createEvent('1', [{ label: { id: 'checkout' } }]);
    const label = {
      metadata: { encoding: 'anNvbi9wbGFpbg==' },
      data: 'IkNoZWNrb3V0Ig==',
    };
    const second = createEvent('2', [
      { label: { id: 'checkout', label: label as never } },
    ]);
    const lifecycleGroups: EventGroups = [
      createLifecycleGroup('1', [first, second]),
    ];

    const [group] = createTimelineEventMarkerGroups(
      [
        createAttribution(
          { label: { id: 'checkout', label: label as never } },
          [first, second],
          ['1'],
        ),
      ],
      lifecycleGroups,
      presentationsByMarkerKey,
    );

    expect(group.userMetadata?.summary).toEqual(label);
  });

  it('reuses a lifecycle group across marker groups', () => {
    const event = createEvent('1', [
      { label: { id: 'checkout' } },
      { inboundEvent: { inboundEventId: '1' } },
      { inboundUpdate: { inboundUpdateId: 'update-1' } },
    ]);
    const lifecycleGroup = createLifecycleGroup('1', [event]);

    const groups = createTimelineEventMarkerGroups(
      [
        createAttribution({ label: { id: 'checkout' } }, [event], ['1']),
        createAttribution(
          { inboundEvent: { inboundEventId: '1' } },
          [event],
          ['1'],
        ),
        createAttribution(
          { inboundUpdate: { inboundUpdateId: 'update-1' } },
          [event],
          ['1'],
        ),
      ],
      [lifecycleGroup],
      presentationsByMarkerKey,
    );

    expect(groups).toHaveLength(3);
    expect(groups[0].lifecycleGroups[0]).toBe(lifecycleGroup);
    expect(groups[1].lifecycleGroups[0]).toBe(lifecycleGroup);
    expect(groups[2].lifecycleGroups[0]).toBe(lifecycleGroup);
    expect(
      groups.find((group) => group.markerKey === 'event:1')?.eventGroupMarker
        .inboundEvent?.inboundEventId,
    ).toBe('1');
    expect(
      groups.find((group) => group.markerKey === 'update:update-1')
        ?.eventGroupMarker.inboundUpdate?.inboundUpdateId,
    ).toBe('update-1');
  });

  it('creates a standalone row for marked events without a lifecycle group', () => {
    const event = createEvent('1', [{ label: { id: 'checkout' } }]);

    const [group] = createTimelineEventMarkerGroups(
      [createAttribution({ label: { id: 'checkout' } }, [event], ['1'])],
      [],
      presentationsByMarkerKey,
    );

    expect(group.eventList).toEqual([event]);
    expect(group.eventList[0]).toBe(event);
    expect(group.lifecycleGroups).toHaveLength(1);
    expect(group.lifecycleGroups[0].initialEvent).toBe(event);
  });
});
