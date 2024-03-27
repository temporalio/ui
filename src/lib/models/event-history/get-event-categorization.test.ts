import { describe, expect, it } from 'vitest';

import type {
  EventType,
  EventTypeCategory,
  WorkflowEvents,
} from '$lib/types/events';

import {
  allEventTypeOptions,
  compactEventTypeOptions,
  eventTypeCategorizations,
  getEventCategory,
  getEventsInCategory,
  isCategoryType,
} from './get-event-categorization';

import eventsCompleted from '$fixtures/events.completed.json';

describe('Event Category Data Structures', () => {
  it('should match the eventTypeCategorizations to the last snapshot', () => {
    expect(eventTypeCategorizations).toMatchInlineSnapshot(`
      {
        "ActivityTaskCancelRequested": "activity",
        "ActivityTaskCanceled": "activity",
        "ActivityTaskCompleted": "activity",
        "ActivityTaskFailed": "activity",
        "ActivityTaskScheduled": "activity",
        "ActivityTaskStarted": "activity",
        "ActivityTaskTimedOut": "activity",
        "ChildWorkflowExecutionCanceled": "child-workflow",
        "ChildWorkflowExecutionCompleted": "child-workflow",
        "ChildWorkflowExecutionFailed": "child-workflow",
        "ChildWorkflowExecutionStarted": "child-workflow",
        "ChildWorkflowExecutionTerminated": "child-workflow",
        "ChildWorkflowExecutionTimedOut": "child-workflow",
        "ExternalWorkflowExecutionCancelRequested": "workflow",
        "ExternalWorkflowExecutionSignaled": "workflow",
        "MarkerRecorded": "marker",
        "RequestCancelExternalWorkflowExecutionFailed": "workflow",
        "RequestCancelExternalWorkflowExecutionInitiated": "workflow",
        "SignalExternalWorkflowExecutionFailed": "signal",
        "SignalExternalWorkflowExecutionInitiated": "signal",
        "StartChildWorkflowExecutionFailed": "child-workflow",
        "StartChildWorkflowExecutionInitiated": "child-workflow",
        "TimerCanceled": "timer",
        "TimerFired": "timer",
        "TimerStarted": "timer",
        "UpsertWorkflowSearchAttributes": "command",
        "WorkflowExecutionCancelRequested": "workflow",
        "WorkflowExecutionCanceled": "workflow",
        "WorkflowExecutionCompleted": "workflow",
        "WorkflowExecutionContinuedAsNew": "workflow",
        "WorkflowExecutionFailed": "workflow",
        "WorkflowExecutionSignaled": "signal",
        "WorkflowExecutionStarted": "workflow",
        "WorkflowExecutionTerminated": "workflow",
        "WorkflowExecutionTimedOut": "workflow",
        "WorkflowExecutionUpdateAccepted": "update",
        "WorkflowExecutionUpdateCompleted": "update",
        "WorkflowExecutionUpdateRejected": "update",
        "WorkflowExecutionUpdateRequested": "update",
        "WorkflowTaskCompleted": "workflow",
        "WorkflowTaskFailed": "workflow",
        "WorkflowTaskScheduled": "workflow",
        "WorkflowTaskStarted": "workflow",
        "WorkflowTaskTimedOut": "workflow",
      }
    `);
  });

  it('should match the allEventTypeOptions to the last snapshot', () => {
    expect(allEventTypeOptions).toMatchInlineSnapshot(`
      [
        {
          "label": "events.category.activity",
          "value": "activity",
        },
        {
          "label": "events.category.child-workflow",
          "value": "child-workflow",
        },
        {
          "label": "events.category.command",
          "value": "command",
        },
        {
          "label": "events.category.local-activity",
          "value": "local-activity",
        },
        {
          "label": "events.category.marker",
          "value": "marker",
        },
        {
          "label": "events.category.signal",
          "value": "signal",
        },
        {
          "label": "events.category.timer",
          "value": "timer",
        },
        {
          "label": "events.category.update",
          "value": "update",
        },
        {
          "label": "events.category.workflow",
          "value": "workflow",
        },
      ]
    `);
  });

  it('should match the compactEventTypeOptions to the last snapshot', () => {
    expect(compactEventTypeOptions).toMatchInlineSnapshot(`
      [
        {
          "label": "events.category.activity",
          "value": "activity",
        },
        {
          "label": "events.category.child-workflow",
          "value": "child-workflow",
        },
        {
          "label": "events.category.local-activity",
          "value": "local-activity",
        },
        {
          "label": "events.category.marker",
          "value": "marker",
        },
        {
          "label": "events.category.signal",
          "value": "signal",
        },
        {
          "label": "events.category.timer",
          "value": "timer",
        },
        {
          "label": "events.category.update",
          "value": "update",
        },
      ]
    `);
  });
});

const categories: Record<
  Exclude<EventTypeCategory, 'local-activity'>,
  EventType[]
> = {
  activity: [
    'ActivityTaskCanceled',
    'ActivityTaskCancelRequested',
    'ActivityTaskCompleted',
    'ActivityTaskFailed',
    'ActivityTaskScheduled',
    'ActivityTaskStarted',
    'ActivityTaskTimedOut',
  ],

  'child-workflow': [
    'ChildWorkflowExecutionCanceled',
    'ChildWorkflowExecutionCompleted',
    'ChildWorkflowExecutionFailed',
    'ChildWorkflowExecutionStarted',
    'ChildWorkflowExecutionTerminated',
    'ChildWorkflowExecutionTimedOut',
    'StartChildWorkflowExecutionFailed',
    'StartChildWorkflowExecutionInitiated',
  ],

  marker: ['MarkerRecorded'],

  signal: [
    'SignalExternalWorkflowExecutionFailed',
    'SignalExternalWorkflowExecutionInitiated',
    'WorkflowExecutionSignaled',
  ],

  timer: ['TimerCanceled', 'TimerFired', 'TimerStarted'],

  workflow: [
    'WorkflowExecutionCanceled',
    'WorkflowExecutionCancelRequested',
    'WorkflowExecutionCompleted',
    'WorkflowExecutionContinuedAsNew',
    'WorkflowExecutionFailed',
    'WorkflowExecutionStarted',
    'WorkflowExecutionTerminated',
    'WorkflowExecutionTimedOut',
    'WorkflowTaskCompleted',
    'WorkflowTaskFailed',
    'WorkflowTaskScheduled',
    'WorkflowTaskStarted',
    'WorkflowTaskTimedOut',
    'ExternalWorkflowExecutionCancelRequested',
    'ExternalWorkflowExecutionSignaled',
    'RequestCancelExternalWorkflowExecutionFailed',
    'RequestCancelExternalWorkflowExecutionInitiated',
  ],

  command: ['UpsertWorkflowSearchAttributes'],

  update: [
    'WorkflowExecutionUpdateAccepted',
    'WorkflowExecutionUpdateCompleted',
  ],
};

describe('getEventCategory', () => {
  for (const [category, eventTypes] of Object.entries(categories)) {
    for (const eventType of eventTypes) {
      it(`should return ${category} for ${eventType}`, () => {
        expect(getEventCategory(eventType)).toBe(category);
      });
    }
  }
});

describe('getEventsInCategory', () => {
  const events = eventsCompleted as unknown as WorkflowEvents;

  it('should return the correct events for the activity" category', () => {
    expect(getEventsInCategory(events, 'activity')).toMatchSnapshot();
  });

  it('should return the correct events for the child-workflow" category', () => {
    const events = eventsCompleted as unknown as WorkflowEvents;

    expect(getEventsInCategory(events, 'child-workflow')).toMatchSnapshot();
  });

  it('should return the correct events for the command" category', () => {
    expect(getEventsInCategory(events, 'command')).toMatchSnapshot();
  });

  it('should return the correct events for the marker" category', () => {
    expect(getEventsInCategory(events, 'marker')).toMatchSnapshot();
  });

  it('should return the correct events for the signal" category', () => {
    expect(getEventsInCategory(events, 'signal')).toMatchSnapshot();
  });

  it('should return the correct events for the timer" category', () => {
    expect(getEventsInCategory(events, 'timer')).toMatchSnapshot();
  });

  it('should return the correct events for the workflow" category', () => {
    expect(getEventsInCategory(events, 'workflow')).toMatchSnapshot();
  });

  it('should return the original set of events if given an invalid category', () => {
    expect(getEventsInCategory(events, 'bogus')).toEqual(events);
  });
});

describe('isCategoryType', () => {
  it('should return true for "activity"', () => {
    expect(isCategoryType('activity')).toBeTruthy();
  });

  it('should return true for "child-workflow"', () => {
    expect(isCategoryType('child-workflow')).toBeTruthy();
  });

  it('should return true for "signal"', () => {
    expect(isCategoryType('signal')).toBeTruthy();
  });

  it('should return true for "timer"', () => {
    expect(isCategoryType('timer')).toBeTruthy();
  });

  it('should return true for "workflow"', () => {
    expect(isCategoryType('workflow')).toBeTruthy();
  });

  it('should return true for "command"', () => {
    expect(isCategoryType('command')).toBeTruthy();
  });

  it('should return false for "bogus"', () => {
    expect(isCategoryType('bogus')).toBe(false);
  });
});
