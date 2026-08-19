import { describe, expect, it } from 'vitest';

import type {
  ActivityTaskCompletedEvent,
  ActivityTaskScheduledEvent,
  WorkflowEvent,
} from '$lib/types/events';

import {
  createEventGroup,
  groupCategory,
  groupIsPending,
} from './create-event-group';

const scheduledEvent = {
  id: '5',
  eventId: '5',
  eventTime: '2021-12-27T15:23:21.806965200Z',
  eventType: 'ActivityTaskScheduled',
  version: '0',
  taskId: '1049493',
  activityTaskScheduledEventAttributes: {
    activityId: '5',
    activityType: {
      name: 'CompletedActivity',
    },
    namespace: '',
    taskQueue: {
      name: 'rainbow-statuses',
      kind: 'Normal',
    },
    input: null,
  },
} as unknown as ActivityTaskScheduledEvent;

const completedEvent = {
  id: '7',
  eventId: '7',
  eventTime: '2021-12-27T15:23:21.841178500Z',
  eventType: 'ActivityTaskCompleted',
  version: '0',
  taskId: '1049498',
  activityTaskCompletedEventAttributes: {
    result: null,
    scheduledEventId: '5',
    startedEventId: '6',
    identity: '21665@temporal@',
  },
  attributes: {
    result: null,
    scheduledEventId: '5',
    startedEventId: '6',
    identity: '21665@temporal@',
  },
} as unknown as ActivityTaskCompletedEvent;

describe('createEventGroup', () => {
  it('should grab the name of the groupTaskScheduledEvent', () => {
    const group = createEventGroup(scheduledEvent)!;

    expect(group.name).toBe('CompletedActivity');
  });

  it('should grab the id of the groupTaskScheduledEvent', () => {
    const group = createEventGroup(scheduledEvent)!;

    expect(group.id).toBe('5');
  });

  it('should store the groupTaskScheduled', () => {
    const group = createEventGroup(scheduledEvent)!;

    expect(group.eventList[0]).toBe(scheduledEvent);
  });

  it('should be able to add a started event', () => {
    const group = createEventGroup(scheduledEvent)!;
    group.eventList.push(completedEvent);

    expect(group.eventList.length).toBe(2);
    expect(group.eventList[1]).toBe(completedEvent);
  });

  it('should have the event time of the last event', () => {
    const group = createEventGroup(scheduledEvent)!;
    group.eventList.push(completedEvent);

    expect(group.eventTime).toBe(completedEvent.eventTime);
  });

  it('should have the attributes of the last event', () => {
    const group = createEventGroup(scheduledEvent)!;
    group.eventList.push(completedEvent);

    expect(group.attributes).toBe(completedEvent.attributes);
  });

  it('should create a group from a startChildWorkflowExecutionInitiatedEvent', () => {
    const event = {
      id: '123',
      eventId: '123',
      startChildWorkflowExecutionInitiatedEventAttributes: {},
    } as unknown as WorkflowEvent;

    expect(createEventGroup(event)!.id).toBe(event.id);
  });

  it('should create a group from a timerStartedEvent', () => {
    const event = {
      id: '123',
      eventId: '123',
      timerStartedEventAttributes: {},
    } as unknown as WorkflowEvent;

    expect(createEventGroup(event)!.id).toBe(event.id);
  });

  it('should create a group from a signalExternalWorkflowExecutionInitiatedEvent', () => {
    const event = {
      id: '123',
      eventId: '123',
      signalExternalWorkflowExecutionInitiatedEventAttributes: {},
    } as unknown as WorkflowEvent;

    expect(createEventGroup(event)!.id).toBe(event.id);
  });

  it('should create a group from a workflowExecutionSignaledEvent', () => {
    const event = {
      id: '123',
      eventId: '123',
      workflowExecutionSignaledEventAttributes: {},
    } as unknown as WorkflowEvent;

    expect(createEventGroup(event)!.id).toBe(event.id);
  });

  it('should create a group from a markerRecordedEvent', () => {
    const event = {
      id: '123',
      eventId: '123',
      markerRecordedEventAttributes: {},
    } as unknown as WorkflowEvent;

    expect(createEventGroup(event)!.id).toBe(event.id);
  });

  it('should ignore an event that should not create an event group', () => {
    expect(createEventGroup(completedEvent)).toBeUndefined();
  });
});

// The buffer's LazyGroup and the materialized EventGroup both derive isPending
// from this, so the agreement tests can no longer catch a wrong rule here —
// they would move together. These assert the rule itself.
describe('groupIsPending', () => {
  const head = (event: Partial<WorkflowEvent>) => event as WorkflowEvent;

  it('is true while a timer has only its started event', () => {
    const timer = head({
      eventType: 'TimerStarted',
      timerStartedEventAttributes: {},
    });
    expect(groupIsPending(timer, 1, undefined, undefined)).toBe(true);
    expect(groupIsPending(timer, 2, undefined, undefined)).toBe(false);
  });

  it('is true while a child workflow has only initiated and started', () => {
    const child = head({
      eventType: 'StartChildWorkflowExecutionInitiated',
      startChildWorkflowExecutionInitiatedEventAttributes: {},
    });
    expect(groupIsPending(child, 1, undefined, undefined)).toBe(false);
    expect(groupIsPending(child, 2, undefined, undefined)).toBe(true);
    expect(groupIsPending(child, 3, undefined, undefined)).toBe(false);
  });

  it('is true whenever pending metadata is attached, whatever the count', () => {
    const activity = head({
      eventType: 'ActivityTaskScheduled',
      activityTaskScheduledEventAttributes: {},
    });
    expect(groupIsPending(activity, 3, undefined, undefined)).toBe(false);
    expect(
      groupIsPending(activity, 3, { activityId: '1' } as never, undefined),
    ).toBe(true);
    expect(
      groupIsPending(activity, 3, undefined, {
        scheduledEventId: '1',
      } as never),
    ).toBe(true);
  });
});

describe('groupCategory', () => {
  it('reports local-activity for a local-activity marker', () => {
    const marker = {
      eventType: 'MarkerRecorded',
      category: 'marker',
      markerRecordedEventAttributes: { markerName: 'LocalActivity' },
    } as unknown as WorkflowEvent;
    expect(groupCategory(marker)).toBe('local-activity');
  });

  it('reports the head event category otherwise', () => {
    const marker = {
      eventType: 'MarkerRecorded',
      category: 'marker',
      markerRecordedEventAttributes: { markerName: 'Version' },
    } as unknown as WorkflowEvent;
    expect(groupCategory(marker)).toBe('marker');
  });
});
