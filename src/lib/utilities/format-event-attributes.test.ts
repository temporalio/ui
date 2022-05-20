import { formatAttributes, attributeGroups } from './format-event-attributes';

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
    taskQueue: {
      name: 'rainbow-statuses',
      kind: 'Normal',
    },
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

describe(formatAttributes, () => {
  it('should remove values thath should not display', () => {
    const formattedAttributes = formatAttributes(workflowEvent);
    expect(formattedAttributes.firstWorkflowTaskBackoff).toBe(undefined);
  });

  it('should remove values that are should be omitted', () => {
    const formattedAttributes = formatAttributes(workflowEvent);
    expect(formattedAttributes.header).toBe(undefined);
  });

  it('should format nested attributes', () => {
    const formattedAttributes = formatAttributes(workflowEvent);
    expect(formattedAttributes.taskQueueName).toBe('rainbow-statuses');
  });
});

describe(attributeGroups, () => {
  it('should group attributes', () => {
    const formattedAttributes = formatAttributes(workflowEvent);
    const groups = attributeGroups(workflowEvent, formattedAttributes);
    expect(groups.summary).toEqual([
      'input',
      'initiator',
      'originalExecutionRunId',
      'identity',
      'firstExecutionRunId',
      'attempt',
      'parentInitiatedEventId',
    ]);
    expect(groups.parent).toEqual([]);
    expect(groups.activity).toEqual([]);
    expect(groups.taskQueue).toEqual(['taskQueueKind', 'taskQueueName']);
    expect(groups.schedule).toEqual([]);
    expect(groups.retryPolicy).toEqual([]);
    expect(groups.workflow).toEqual(['workflowTaskTimeout', 'workflowType']);
    expect(groups.searchAttributes).toEqual(['searchAttributes']);
  });
});
