import { describe, expect, it } from 'vitest';
import {
  getSingleAttributeForEvent,
  shouldDisplayAsExecutionLink,
  checkForChildWorkflowExecutionAndAddRunIdAttribute,
} from './get-single-attribute-for-event';

describe('getSingleAttributeForEvent', () => {
  const workflowEvent = {
    eventId: '1',
    eventTime: '2022-03-14T17:44:14.996241458Z',
    eventType: 'WorkflowExecutionStarted',
    version: '0',
    taskId: '2097152',
    workflowExecutionStartedEventAttributes: {
      workflowType: {
        name: 'RainbowStatusesWorkflow',
      },
      parentWorkflowNamespace: '',
      parentWorkflowExecution: null,
      parentInitiatedEventId: '0',
      taskQueue: {
        name: 'rainbow-statuses',
        kind: 'Normal',
      },
      input: {
        payloads: null,
      },
      workflowExecutionTimeout: '0s',
      workflowRunTimeout: '0s',
      workflowTaskTimeout: '10s',
      continuedExecutionRunId: '',
      initiator: 'Unspecified',
      continuedFailure: null,
      lastCompletionResult: null,
      originalExecutionRunId: 'b28e27e5-364f-4807-a8e2-b964f2c8aeb7',
      identity: '47339@MacBook-Pro@',
      firstExecutionRunId: 'b28e27e5-364f-4807-a8e2-b964f2c8aeb7',
      retryPolicy: null,
      attempt: 1,
      workflowExecutionExpirationTime: null,
      cronSchedule: '',
      firstWorkflowTaskBackoff: '0s',
      memo: null,
      searchAttributes: {
        indexedFields: {
          CustomBoolField: true,
          CustomDatetimeField: '2022-03-14T17:44:14.999501Z',
          CustomDoubleField: 0,
          CustomIntField: 0,
          CustomKeywordField: 'rainbow-statuses-61404c',
          CustomStringField: 'rainbow statuses 61404c Running',
        },
      },
      prevAutoResetPoints: null,
      header: {
        fields: {},
      },
    },
    id: '1',
    attributes: {
      type: 'workflowExecutionStartedEventAttributes',
      workflowType: {
        name: 'RainbowStatusesWorkflow',
      },
      parentWorkflowNamespace: '',
      parentWorkflowExecution: null,
      taskQueue: {
        name: 'rainbow-statuses',
        kind: 'Normal',
      },
      parentInitiatedEventId: '0',
      input: {
        payloads: [
          {
            Hey: 'from Mars',
            At: '2022-04-04T11:50:28.151785-05:00',
          },
        ],
      },
      workflowExecutionTimeout: '0s',
      workflowRunTimeout: '0s',
      workflowTaskTimeout: '10s',
      continuedExecutionRunId: '',
      initiator: 'Unspecified',
      continuedFailure: null,
      lastCompletionResult: null,
      originalExecutionRunId: 'b28e27e5-364f-4807-a8e2-b964f2c8aeb7',
      identity: '47339@MacBook-Pro@',
      firstExecutionRunId: 'b28e27e5-364f-4807-a8e2-b964f2c8aeb7',
      retryPolicy: null,
      attempt: 1,
      workflowExecutionExpirationTime: null,
      cronSchedule: '',
      firstWorkflowTaskBackoff: '0s',
      memo: null,
      searchAttributes: {
        indexedFields: {
          CustomBoolField: true,
          CustomDatetimeField: '2022-03-14T17:44:14.999501Z',
          CustomDoubleField: 0,
          CustomIntField: 0,
          CustomKeywordField: 'rainbow-statuses-61404c',
          CustomStringField: 'rainbow statuses 61404c Running',
        },
      },
      prevAutoResetPoints: null,
      header: {
        fields: {},
      },
    },
  };

  it('should return "workflowType.name" if the workflow type exists', () => {
    expect(getSingleAttributeForEvent(workflowEvent)).toStrictEqual({
      key: 'workflowTypeName',
      value: 'RainbowStatusesWorkflow',
    });
  });

  it('should return "taskqueue.name" if the workflow type does not exists', () => {
    const event = { ...workflowEvent };
    event.attributes.workflowType = null;
    expect(getSingleAttributeForEvent(event)).toStrictEqual({
      key: 'taskQueueName',
      value: 'rainbow-statuses',
    });
  });

  it('should return "parentInitiatedEventId" if the workflow type and task queue does not exist', () => {
    const event = { ...workflowEvent };
    event.attributes.workflowType = null;
    event.attributes.taskQueue = null;
    expect(getSingleAttributeForEvent(event)).toStrictEqual({
      key: 'parentInitiatedEventId',
      value: '0',
    });
  });

  it('should return empty key value object if none of the attributes display', () => {
    expect(getSingleAttributeForEvent(null)).toStrictEqual({
      key: '',
      value: '',
    });
  });
});

describe('shouldDisplayAsExecutionLink', () => {
  it('should return true for event keys that end with RunId', () => {
    expect(shouldDisplayAsExecutionLink('originalExecutionRunId')).toBe(true);
    expect(shouldDisplayAsExecutionLink('firstExecutionRunId')).toBe(true);
    expect(shouldDisplayAsExecutionLink('continuedExecutionRunId')).toBe(true);
  });

  it('should return false for event keys that do not end with RunId', () => {
    expect(shouldDisplayAsExecutionLink('')).toBe(false);
    expect(shouldDisplayAsExecutionLink('workflowType.name')).toBe(false);
    expect(shouldDisplayAsExecutionLink('parentInitiatedEventId')).toBe(false);
    expect(shouldDisplayAsExecutionLink('inlineRunIdSample')).toBe(false);
  });
});

describe('checkForChildWorkflowExecutionAndAddRunIdAttribute', () => {
  const previousEvent = {
    eventType: 'WorkflowTaskCompleted',
    name: 'WorkflowTaskCompleted',
    id: '2',
    category: 'workflow',
    attributes: {
      type: 'workflowTaskCompletedEventAttributes',
    },
  };
  const currentEvent = {
    eventType: 'StartChildWorkflowExecutionInitiated',
    name: 'StartChildWorkflowExecutionInitiated',
    id: '3',
    category: 'child-workflow',
    attributes: {
      type: 'startChildWorkflowExecutionInitiatedEventAttributes',
      workflowId:
        'temporal.canary.cron-workflow.sanity-2023-01-04T12:35:02-07:00/workflow.schedule',
    },
  };
  const nextEvent = {
    eventType: 'ChildWorkflowExecutionStarted',
    name: 'ChildWorkflowExecutionStarted',
    id: '4',
    category: 'child-workflow',
    attributes: {
      type: 'childWorkflowExecutionStartedEventAttributes',
      workflowExecution: {
        workflowId:
          'temporal.canary.cron-workflow.sanity-2023-01-04T12:35:02-07:00/workflow.schedule',
        runId: 'b10a03e8-ae07-4a86-88e6-21898c38d2bd',
      },
    },
  };

  it('should not add a childWorkflowExecutionRunId to the event if it is a StartChildWorkflowExecutionInitiated event and there is no following ChildWorkflowExecutionStarted event', () => {
    const event = JSON.parse(JSON.stringify(currentEvent));
    expect(event.attributes['childWorkflowExecutionRunId']).toEqual(undefined);

    checkForChildWorkflowExecutionAndAddRunIdAttribute({
      currentEvent: event,
      eventGroup: [],
      visibleItems: [previousEvent, event],
      compact: false,
      descending: false,
    });

    expect(event.attributes['childWorkflowExecutionRunId']).toEqual(undefined);
  });

  it('should add a childWorkflowExecutionRunId to the event if it is a StartChildWorkflowExecutionInitiated event and the next event is a ChildWorkflowExecutionStarted event when the events are in ascending order', () => {
    const event = JSON.parse(JSON.stringify(currentEvent));
    expect(event.attributes['childWorkflowExecutionRunId']).toEqual(undefined);

    checkForChildWorkflowExecutionAndAddRunIdAttribute({
      currentEvent: event,
      eventGroup: [],
      visibleItems: [previousEvent, event, nextEvent],
      compact: false,
      descending: false,
    });

    expect(event.attributes['childWorkflowExecutionRunId']).toEqual(
      nextEvent.attributes.workflowExecution.runId,
    );
  });

  it('should add a childWorkflowExecutionRunId to the event if it is a StartChildWorkflowExecutionInitiated event and the next event is a ChildWorkflowExecutionStarted event when the events are in descending order', () => {
    const event = JSON.parse(JSON.stringify(currentEvent));
    expect(event.attributes['childWorkflowExecutionRunId']).toEqual(undefined);

    checkForChildWorkflowExecutionAndAddRunIdAttribute({
      currentEvent: event,
      eventGroup: [],
      visibleItems: [nextEvent, event, previousEvent],
      compact: false,
      descending: true,
    });

    expect(event.attributes['childWorkflowExecutionRunId']).toEqual(
      nextEvent.attributes.workflowExecution.runId,
    );
  });

  it('should add a childWorkflowExecutionRunId to the event if it is a StartChildWorkflowExecutionInitiated event and the event group contains a ChildWorkflowExecutionStarted event when the events are in the compact view', () => {
    const event = JSON.parse(JSON.stringify(currentEvent));
    const events = new Map();
    events.set('4', nextEvent);
    expect(event.attributes['childWorkflowExecutionRunId']).toEqual(undefined);

    checkForChildWorkflowExecutionAndAddRunIdAttribute({
      currentEvent: event,
      eventGroup: {
        id: '2',
        name: 'Child Workflow: workflow.schedule',
        events,
      },
      visibleItems: [],
      compact: true,
      descending: false,
    });

    expect(event.attributes['childWorkflowExecutionRunId']).toEqual(
      nextEvent.attributes.workflowExecution.runId,
    );
  });

  it('should not add a childWorkflowExecutionRunId to the event if it is a StartChildWorkflowExecutionInitiated event and the event group does not contain a ChildWorkflowExecutionStarted event in the compact view', () => {
    const event = JSON.parse(JSON.stringify(currentEvent));
    const events = new Map();
    expect(event.attributes['childWorkflowExecutionRunId']).toEqual(undefined);

    checkForChildWorkflowExecutionAndAddRunIdAttribute({
      currentEvent: event,
      eventGroup: {
        id: '2',
        name: 'Child Workflow: workflow.schedule',
        events,
      },
      visibleItems: [],
      compact: true,
      descending: false,
    });

    expect(event.attributes['childWorkflowExecutionRunId']).toEqual(undefined);
  });
});
