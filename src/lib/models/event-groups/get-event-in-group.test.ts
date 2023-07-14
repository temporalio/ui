import { describe, expect, it } from 'vitest';

import type {
  ActivityTaskScheduledEvent,
  StartChildWorkflowExecutionInitiatedEvent,
  WorkflowEvent,
} from '$lib/types/events';

import { groupEvents } from '.';
import {
  eventIsCanceled,
  eventIsFailureOrTimedOut,
  eventIsTerminated,
  eventOrGroupIsCanceled,
  eventOrGroupIsFailureOrTimedOut,
  eventOrGroupIsTerminated,
} from './get-event-in-group';

const startChildWorkflow = {
  id: '42',
  eventId: '42',
  startChildWorkflowExecutionInitiatedEventAttributes: {},
} as unknown as StartChildWorkflowExecutionInitiatedEvent;

const activityTaskScheduled = {
  id: '13',
  eventId: '13',
  eventType: 'ActivityTaskScheduled',
  activityTaskScheduledEventAttributes: {
    activityId: '13',
    activityType: { name: 'activity.advanced-visibility' },
    taskQueue: { name: 'canary-task-queue', kind: 'Normal' },
  },
} as unknown as ActivityTaskScheduledEvent;

describe('eventIsFailureOrTimedOut', () => {
  it('should return true if provided an event with activityTaskTimedOutEventAttributes', () => {
    const event = {
      activityTaskTimedOutEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsFailureOrTimedOut(event)).toBe(true);
  });

  it('should return true if provided an event with activityTaskFailedEventAttributes', () => {
    const event = {
      activityTaskFailedEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsFailureOrTimedOut(event)).toBe(true);
  });

  it('should return true if provided an event with workflowExecutionFailedEventAttributes', () => {
    const event = {
      workflowExecutionFailedEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsFailureOrTimedOut(event)).toBe(true);
  });

  it('should return true if provided an event with workflowExecutionTimedOutEventAttributes', () => {
    const event = {
      workflowExecutionTimedOutEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsFailureOrTimedOut(event)).toBe(true);
  });

  it('should return true if provided an event with workflowTaskTimedOutEventAttributes', () => {
    const event = {
      workflowTaskTimedOutEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsFailureOrTimedOut(event)).toBe(true);
  });

  it('should return true if provided an event with workflowTaskFailedEventAttributes', () => {
    const event = {
      workflowTaskFailedEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsFailureOrTimedOut(event)).toBe(true);
  });

  it('should return false if provided an event with workflowTaskFailedEventAttributes and has UnhandledCommand message', () => {
    const event = {
      workflowTaskFailedEventAttributes: {
        failure: { message: 'UnhandledCommand' },
      },
    } as unknown as WorkflowEvent;
    expect(eventIsFailureOrTimedOut(event)).toBe(false);
  });

  it('should return true if provided an event with childWorkflowExecutionFailedEventAttributes', () => {
    const event = {
      childWorkflowExecutionFailedEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsFailureOrTimedOut(event)).toBe(true);
  });

  it('should return true if provided an event with childWorkflowExecutionTimedOutEventAttributes', () => {
    const event = {
      childWorkflowExecutionTimedOutEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsFailureOrTimedOut(event)).toBe(true);
  });

  it('should return true if provided an event with signalExternalWorkflowExecutionFailedEventAttributes', () => {
    const event = {
      signalExternalWorkflowExecutionFailedEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsFailureOrTimedOut(event)).toBe(true);
  });
});

describe('eventIsCanceled', () => {
  it('should return true if provided an event with activityTaskCanceledEventAttributes', () => {
    const event = {
      activityTaskCanceledEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsCanceled(event)).toBe(true);
  });

  it('should return true if provided an event with timerCanceledEventAttributes', () => {
    const event = {
      timerCanceledEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsCanceled(event)).toBe(true);
  });

  it('should return true if provided an event with workflowExecutionCanceledEventAttributes', () => {
    const event = {
      workflowExecutionCanceledEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsCanceled(event)).toBe(true);
  });

  it('should return true if provided an event with childWorkflowExecutionCanceledEventAttributes', () => {
    const event = {
      childWorkflowExecutionCanceledEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsCanceled(event)).toBe(true);
  });
});

describe('eventIsTerminated', () => {
  it('should return true if provided an event with workflowExecutionTerminatedEventAttributes', () => {
    const event = {
      workflowExecutionTerminatedEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsTerminated(event)).toBe(true);
  });

  it('should return true if provided an event with childWorkflowExecutionTerminatedEventAttributes', () => {
    const event = {
      childWorkflowExecutionTerminatedEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventIsTerminated(event)).toBe(true);
  });
});

describe('eventOrGroupIsFailureOrTimedOut', () => {
  it('should return true with an event that is a failure', () => {
    const event = {
      activityTaskTimedOutEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventOrGroupIsFailureOrTimedOut(event)).toBe(true);
  });

  it('should return true with an eligible event group', () => {
    const event = {
      id: '14',
      activityTaskTimedOutEventAttributes: {
        scheduledEventId: '13',
      },
    } as unknown as WorkflowEvent;

    const [group] = groupEvents([activityTaskScheduled, event]);

    expect(eventOrGroupIsFailureOrTimedOut(group)).toBe(true);
  });
});

describe('eventOrGroupIsCanceled', () => {
  it('should return true with an event that is canceled', () => {
    const event = {
      activityTaskCanceledEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventOrGroupIsCanceled(event)).toBe(true);
  });

  it('should return true with an eligible event group', () => {
    const event = {
      id: '43',
      activityTaskCanceledEventAttributes: {
        scheduledEventId: '13',
      },
    } as unknown as WorkflowEvent;

    const [group] = groupEvents([activityTaskScheduled, event]);

    expect(eventOrGroupIsCanceled(group)).toBe(true);
  });
});

describe('eventOrGroupIsTerminated', () => {
  it('should return true with an event that is terminated', () => {
    const event = {
      childWorkflowExecutionTerminatedEventAttributes: {},
    } as unknown as WorkflowEvent;
    expect(eventOrGroupIsTerminated(event)).toBe(true);
  });

  it('should return true with an eligible event group', () => {
    const event = {
      id: '43',
      childWorkflowExecutionTerminatedEventAttributes: {
        initiatedEventId: '42',
      },
    } as unknown as WorkflowEvent;

    const [group] = groupEvents([startChildWorkflow, event]);

    expect(eventOrGroupIsTerminated(group)).toBe(true);
  });
});
