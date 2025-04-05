import { describe, expect, it } from 'vitest';

import type {
  ActivityTaskCompletedEvent,
  ActivityTaskScheduledEvent,
  WorkflowEvent,
} from '$lib/types/events';

import { createEventGroup } from './create-event-group';

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
    const group = createEventGroup(scheduledEvent);

    expect(group.name).toBe('CompletedActivity');
  });

  it('should grab the id of the groupTaskScheduledEvent', () => {
    const group = createEventGroup(scheduledEvent);

    expect(group.id).toBe('5');
  });

  it('should store the groupTaskScheduled', () => {
    const group = createEventGroup(scheduledEvent);

    expect(group.events.get(scheduledEvent.id)).toBe(scheduledEvent);
  });

  it('should be able to add a started event', () => {
    const group = createEventGroup(scheduledEvent);
    group.events.set(completedEvent.eventType, completedEvent);

    expect(group.events.size).toBe(2);
    expect(group.events.get('ActivityTaskCompleted')).toBe(completedEvent);
  });

  it('should have the event time of the last event', () => {
    const group = createEventGroup(scheduledEvent);
    group.events.set(completedEvent.eventType, completedEvent);

    expect(group.eventTime).toBe(completedEvent.eventTime);
  });

  it('should have the attributes of the last event', () => {
    const group = createEventGroup(scheduledEvent);
    group.events.set(completedEvent.eventType, completedEvent);

    expect(group.attributes).toBe(completedEvent.attributes);
  });

  it('should create a group from a startChildWorkflowExecutionInitiatedEvent', () => {
    const event = {
      id: '123',
      eventId: '123',
      startChildWorkflowExecutionInitiatedEventAttributes: {},
    } as unknown as WorkflowEvent;

    expect(createEventGroup(event).id).toBe(event.id);
  });

  it('should create a group from a timerStartedEvent', () => {
    const event = {
      id: '123',
      eventId: '123',
      timerStartedEventAttributes: {},
    } as unknown as WorkflowEvent;

    expect(createEventGroup(event).id).toBe(event.id);
  });

  it('should create a group from a signalExternalWorkflowExecutionInitiatedEvent', () => {
    const event = {
      id: '123',
      eventId: '123',
      signalExternalWorkflowExecutionInitiatedEventAttributes: {},
    } as unknown as WorkflowEvent;

    expect(createEventGroup(event).id).toBe(event.id);
  });

  it('should create a group from a workflowExecutionSignaledEvent', () => {
    const event = {
      id: '123',
      eventId: '123',
      workflowExecutionSignaledEventAttributes: {},
    } as unknown as WorkflowEvent;

    expect(createEventGroup(event).id).toBe(event.id);
  });

  it('should create a group from a markerRecordedEvent', () => {
    const event = {
      id: '123',
      eventId: '123',
      markerRecordedEventAttributes: {},
    } as unknown as WorkflowEvent;

    expect(createEventGroup(event).id).toBe(event.id);
  });

  it('should ignore an event that should not create an event group', () => {
    expect(createEventGroup(completedEvent)).toBeUndefined();
  });
});
