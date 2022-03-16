import { getWorkflowStartedAndCompletedEvents } from './get-started-and-completed-events';

describe(getWorkflowStartedAndCompletedEvents, () => {
  it('should return null if the input is null', () => {
    const workflowStartedEvent = {
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
        parentInitiatedEventId: '0',
        taskQueue: {
          name: 'rainbow-statuses',
          kind: 'Normal',
        },
        input: {
          payloads: [1],
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

    expect(
      getWorkflowStartedAndCompletedEvents([workflowStartedEvent]).input,
    ).toBe('null');
  });
});
