import { describe, expect, it } from 'vitest';
import { getWorkflowStartedCompletedAndTaskFailedEvents } from './get-started-completed-and-task-failed-events.';

import completedEventHistory from '$fixtures/events.completed.json';
import canceledEventHistory from '$fixtures/events.canceled.json';
import failedEventHistory from '$fixtures/events.failed.json';
import runningEventHistory from '$fixtures/events.running.json';
import terminatedEventHistory from '$fixtures/events.terminated.json';
import timedOutEventHistory from '$fixtures/events.timed-out.json';

describe('getWorkflowStartedCompletedAndTaskFailedEvents', () => {
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
      getWorkflowStartedCompletedAndTaskFailedEvents([workflowStartedEvent])
        .input,
    ).toBe('null');
  });

  it('should get the correct input for a completed event history', () => {
    const { input } = getWorkflowStartedCompletedAndTaskFailedEvents(
      completedEventHistory,
    );
    expect(input).toMatchInlineSnapshot(
      '"[\\"1656707328774263000\\",\\"canary\\"]"',
    );
  });

  it('should get the correct result for a completed event history', () => {
    const { results } = getWorkflowStartedCompletedAndTaskFailedEvents(
      completedEventHistory,
    );
    expect(results).toMatchInlineSnapshot('"null"');
  });

  it('should get the correct input for a cancelled event history', () => {
    const { input } =
      getWorkflowStartedCompletedAndTaskFailedEvents(canceledEventHistory);
    expect(input).toMatchInlineSnapshot('"[1656706850149404400,480000000000]"');
  });

  it('should get the correct result for a cancelled event history', () => {
    const { results } =
      getWorkflowStartedCompletedAndTaskFailedEvents(canceledEventHistory);
    expect(results).toMatchInlineSnapshot(
      '"{\\"type\\":\\"workflowExecutionCanceledEventAttributes\\",\\"workflowTaskCompletedEventId\\":\\"11\\",\\"details\\":null}"',
    );
  });

  it('should get the correct input for a failed event history', () => {
    const { input } =
      getWorkflowStartedCompletedAndTaskFailedEvents(failedEventHistory);
    expect(input).toMatchInlineSnapshot('"[1656706968987842000]"');
  });

  it('should get the correct result for a failed event history', () => {
    const { results } =
      getWorkflowStartedCompletedAndTaskFailedEvents(failedEventHistory);
    expect(results).toMatchInlineSnapshot(
      '"{\\"type\\":\\"workflowExecutionFailedEventAttributes\\",\\"failure\\":{\\"message\\":\\"failing on attempt 2\\",\\"source\\":\\"GoSDK\\",\\"stackTrace\\":\\"\\",\\"cause\\":null,\\"applicationFailureInfo\\":{\\"type\\":\\"\\",\\"nonRetryable\\":false,\\"details\\":null}},\\"retryState\\":\\"InProgress\\",\\"workflowTaskCompletedEventId\\":\\"4\\",\\"newExecutionRunId\\":\\"15e13ed4-880a-4557-96c6-0116e3d07b8d\\"}"',
    );
  });

  it('should get the correct input for a running event history', () => {
    const { input } =
      getWorkflowStartedCompletedAndTaskFailedEvents(runningEventHistory);
    expect(input).toMatchInlineSnapshot('"[1656707029044596700,\\"canary\\"]"');
  });

  it('should get the correct result for a running event history', () => {
    const { results } =
      getWorkflowStartedCompletedAndTaskFailedEvents(runningEventHistory);
    expect(results).toMatchInlineSnapshot('undefined');
  });

  it('should get the correct input for a terminated event history', () => {
    const { input } = getWorkflowStartedCompletedAndTaskFailedEvents(
      terminatedEventHistory,
    );
    expect(input).toMatchInlineSnapshot(
      '"[1656706488881881600,\\"temporal.fixture.terminated.workflow.id\\",\\"3cbbf515-36da-43b9-a1f3-18a7ec031ddd\\",\\"canary\\"]"',
    );
  });

  it('should get the correct result for a terminated event history', () => {
    const { results } = getWorkflowStartedCompletedAndTaskFailedEvents(
      terminatedEventHistory,
    );
    expect(results).toMatchInlineSnapshot(
      '"{\\"type\\":\\"workflowExecutionTerminatedEventAttributes\\",\\"reason\\":\\"reset canary\\",\\"details\\":null,\\"identity\\":\\"history-service\\"}"',
    );
  });

  it('should get the correct input for a timedOut event history', () => {
    const { input } =
      getWorkflowStartedCompletedAndTaskFailedEvents(timedOutEventHistory);
    expect(input).toMatchInlineSnapshot('"[1656683778738403300,\\"canary\\"]"');
  });

  it('should get the correct result for a timedOut event history', () => {
    const { results } =
      getWorkflowStartedCompletedAndTaskFailedEvents(timedOutEventHistory);
    expect(results).toMatchInlineSnapshot(
      '"{\\"type\\":\\"workflowExecutionTimedOutEventAttributes\\",\\"retryState\\":\\"RetryPolicyNotSet\\",\\"newExecutionRunId\\":\\"\\"}"',
    );
  });

  it('should work as expected with a WorkflowCompletedEvent with a null result', () => {
    const history = [
      {
        eventId: '11',
        eventTime: '2022-04-11T12:59:24.614591797Z',
        eventType: 'WorkflowExecutionCompleted',
        version: '0',
        taskId: '1048745',
        workflowExecutionCompletedEventAttributes: {
          result: null,
          workflowTaskCompletedEventId: '10',
          newExecutionRunId: '',
        },
        attributes: {
          result: null,
          workflowTaskCompletedEventId: '10',
          newExecutionRunId: '',
        },
      },
    ];

    const { results } = getWorkflowStartedCompletedAndTaskFailedEvents(history);
    expect(results).toBe('null');
  });

  it('should work as expected with a WorkflowCompletedEvent with a payloads', () => {
    const history = [
      {
        eventId: '11',
        eventTime: '2022-04-11T12:59:24.614591797Z',
        eventType: 'WorkflowExecutionCompleted',
        version: '0',
        taskId: '1048745',
        workflowExecutionCompletedEventAttributes: {
          result: { payloads: 'result' },
          workflowTaskCompletedEventId: '10',
          newExecutionRunId: '',
        },
        attributes: {
          result: { payloads: 'result' },
          workflowTaskCompletedEventId: '10',
          newExecutionRunId: '',
        },
      },
    ];

    const { results } = getWorkflowStartedCompletedAndTaskFailedEvents(history);
    expect(results).toBe('"result"');
  });

  it('should get the correct error for a completed event history without any failed tasks', () => {
    const { error } = getWorkflowStartedCompletedAndTaskFailedEvents(
      completedEventHistory,
    );
    expect(error).toMatchInlineSnapshot('undefined');
  });

  it('should get the correct error for a WorkflowTaskFailed event', () => {
    const cause = 'NonDeterministicError';
    const history = [
      {
        eventId: '11',
        eventTime: '2022-10-31T22:41:28.917920758Z',
        eventType: 'WorkflowTaskFailed',
        version: '0',
        taskId: '56713476',
        workflowTaskFailedEventAttributes: {
          cause,
          failure: {
            cause: null,
          },
        },
        attributes: {
          type: 'workflowTaskFailedEventAttributes',
          cause,
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
    ];

    const { error } = getWorkflowStartedCompletedAndTaskFailedEvents(history);
    expect(error).toBe(cause);
  });

  it('should get the correct error for a workflow that has a completed task after a failed task', () => {
    const history = [
      {
        eventId: '17',
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
        id: '17',
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
    ];

    const { error } = getWorkflowStartedCompletedAndTaskFailedEvents(history);
    expect(error).toMatchInlineSnapshot('undefined');
  });
});
