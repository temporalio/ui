import { describe, expect, it } from 'vitest';

import { getWorkflowTaskFailedEvent } from './get-workflow-task-failed-event';

import runningEventHistory from '$fixtures/events.running.json';

describe('getWorkflowTaskFailedEvent', () => {
  const failedEvent = {
    eventId: '15',
    eventTime: '2022-10-31T22:41:28.917920758Z',
    eventType: 'WorkflowTaskFailed',
    version: '0',
    taskId: '56713476',
    workflowTaskFailedEventAttributes: {
      cause: 'NonDeterministicError',
      failure: {
        cause: null,
      },
    },
    attributes: {
      type: 'workflowTaskFailedEventAttributes',
      cause: 'NonDeterministicError',
      failure: {
        cause: null,
      },
    },
    classification: 'Failed',
    category: 'workflow',
    id: '11',
    name: 'WorkflowTaskFailed',
    timestamp: '2022-10-31 UTC 22:41:28.91',
  };

  it('should get the correct error for a WorkflowTaskFailed event when events are in descending order', () => {
    const history = [failedEvent, ...runningEventHistory];
    const error = getWorkflowTaskFailedEvent(history, 'descending');
    expect(error).toBe(failedEvent);
  });

  it('should get the correct error for a WorkflowTaskFailed event when events are in ascending order', () => {
    const history = [failedEvent, ...runningEventHistory].reverse();
    const error = getWorkflowTaskFailedEvent(history, 'ascending');
    expect(error).toBe(failedEvent);
  });

  it('should get the last error for a workflow that has multiple WorkflowTaskFailed events', () => {
    const history = [
      {
        eventId: '12',
        eventTime: '2022-07-01T20:28:52.916365546Z',
        eventType: 'WorkflowTaskCompleted',
        version: '0',
        taskId: '29887669',
        workflowTaskCompletedEventAttributes: {
          scheduledEventId: '15',
          startedEventId: '16',
          identity: '83579@MacBook-Pro-2.local@',
          binaryChecksum: 'e56c0141e58df0bd405138565d0526f9',
        },
        attributes: {
          type: 'workflowTaskCompletedEventAttributes',
          scheduledEventId: '15',
          startedEventId: '16',
          identity: '83579@MacBook-Pro-2.local@',
          binaryChecksum: 'e56c0141e58df0bd405138565d0526f9',
        },
        classification: 'Completed',
        category: 'workflow',
        id: '12',
        name: 'WorkflowTaskCompleted',
        timestamp: '2022-07-01 UTC 20:28:52.91',
      },
      {
        eventId: '11',
        eventTime: '2022-10-31T22:41:28.917920758Z',
        eventType: 'WorkflowTaskFailed',
        version: '0',
        taskId: '56713476',
        workflowTaskFailedEventAttributes: {
          cause: 'NonDeterministicError',
          failure: {
            cause: null,
          },
        },
        attributes: {
          type: 'workflowTaskFailedEventAttributes',
          cause: 'NonDeterministicError',
          failure: {
            cause: null,
          },
        },
        classification: 'Failed',
        category: 'workflow',
        id: '11',
        name: 'WorkflowTaskFailed',
        timestamp: '2022-10-31 UTC 22:41:28.91',
      },
      {
        eventId: '10',
        eventTime: '2022-10-31T22:41:28.917920758Z',
        eventType: 'WorkflowTaskFailed',
        version: '0',
        taskId: '56713476',
        workflowTaskFailedEventAttributes: {
          cause: 'NonDeterministicError',
          failure: {
            cause: null,
          },
        },
        attributes: {
          type: 'workflowTaskFailedEventAttributes',
          cause: 'NonDeterministicError',
          failure: {
            cause: null,
          },
        },
        classification: 'Failed',
        category: 'workflow',
        id: '10',
        name: 'WorkflowTaskFailed',
        timestamp: '2022-10-31 UTC 22:41:28.91',
      },
    ];

    let error = getWorkflowTaskFailedEvent(history, 'descending');
    const expectedError = `
      {
        "attributes": {
          "cause": "NonDeterministicError",
          "failure": {
            "cause": null,
          },
          "type": "workflowTaskFailedEventAttributes",
        },
        "category": "workflow",
        "classification": "Failed",
        "eventId": "11",
        "eventTime": "2022-10-31T22:41:28.917920758Z",
        "eventType": "WorkflowTaskFailed",
        "id": "11",
        "name": "WorkflowTaskFailed",
        "taskId": "56713476",
        "timestamp": "2022-10-31 UTC 22:41:28.91",
        "version": "0",
        "workflowTaskFailedEventAttributes": {
          "cause": "NonDeterministicError",
          "failure": {
            "cause": null,
          },
        },
      }
    `;
    expect(error).toMatchInlineSnapshot(expectedError);

    error = getWorkflowTaskFailedEvent([...history].reverse(), 'ascending');
    expect(error).toMatchInlineSnapshot(expectedError);
  });
});
