import { getSingleAttributeForEvent } from './get-single-attribute-for-event';

describe(getSingleAttributeForEvent, () => {
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

  const workflowEventGroup = {
    initialEvent: workflowEvent,
  };

  it('should return "workflowType.name" if the workflow type exists', () => {
    expect(
      getSingleAttributeForEvent({ event: workflowEvent, eventGroup: null }),
    ).toStrictEqual({
      key: 'workflowType.name',
      value: 'RainbowStatusesWorkflow',
    });
  });

  it('should return "taskqueue.name" if the workflow type does not exists', () => {
    const event = { ...workflowEvent };
    event.attributes.workflowType = null;
    expect(
      getSingleAttributeForEvent({ event, eventGroup: null }),
    ).toStrictEqual({ key: 'taskQueue.name', value: 'rainbow-statuses' });
  });

  it('should return "parentInitiatedEventId" if the workflow type and task queue does not exists', () => {
    const event = { ...workflowEvent };
    event.attributes.workflowType = null;
    event.attributes.taskQueue = null;
    expect(
      getSingleAttributeForEvent({ event, eventGroup: null }),
    ).toStrictEqual({ key: 'parentInitiatedEventId', value: '0' });
  });

  it('should return empty key value object if none of the attributes display', () => {
    expect(
      getSingleAttributeForEvent({ event: null, eventGroup: null }),
    ).toStrictEqual({ key: '', value: '' });
  });

  it('should return "input" if passed an event group', () => {
    const event = { ...workflowEvent };
    const value = {
      payloads: [
        {
          Hey: 'from Mars',
          At: '2022-04-04T11:50:28.151785-05:00',
        },
      ],
    };
    expect(
      getSingleAttributeForEvent({ event, eventGroup: workflowEventGroup }),
    ).toStrictEqual({ key: 'input', value });
  });
});
