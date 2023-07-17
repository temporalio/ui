import { describe, expect, it } from 'vitest';

import {
  getCodeBlockValue,
  getSingleAttributeForEvent,
  shouldDisplayAsExecutionLink,
  shouldDisplayAttribute,
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
    event.attributes.workflowType = null as unknown as {
      name: string;
    };

    event.attributes.taskQueue = null as unknown as {
      name: string;
      kind: string;
    };

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

describe('shouldDisplayAttribute', () => {
  it('should return false for certain attribute values', () => {
    expect(shouldDisplayAttribute('', null)).toBe(false);
    expect(shouldDisplayAttribute('', undefined)).toBe(false);
    expect(shouldDisplayAttribute('', '')).toBe(false);
    expect(shouldDisplayAttribute('', '0s')).toBe(false);
    expect(shouldDisplayAttribute('type', '')).toBe(false);
    expect(shouldDisplayAttribute('suggestContinueAsNew', false)).toBe(false);
    expect(shouldDisplayAttribute('historySizeBytes', '0')).toBe(false);
  });

  it('should return false for certain attributes', () => {
    expect(shouldDisplayAttribute('type', '')).toBe(false);
  });

  it('should return false for certain atrributes with unpopulated values', () => {
    expect(shouldDisplayAttribute('suggestContinueAsNew', true)).toBe(true);
    expect(shouldDisplayAttribute('suggestContinueAsNew', false)).toBe(false);
    expect(shouldDisplayAttribute('historySizeBytes', '256')).toBe(true);
    expect(shouldDisplayAttribute('historySizeBytes', '0')).toBe(false);
  });
});

describe('getCodeBlockValue', () => {
  it('should return value if value is a string', () => {
    expect(getCodeBlockValue('test')).toBe('test');
  });

  it('should return payloads if they exist', () => {
    expect(getCodeBlockValue({ payloads: [1, 2, 3] })).toEqual([1, 2, 3]);
    expect(getCodeBlockValue({ payloads: null })).toBe(null);
  });

  it('should return indexedFields if they exist', () => {
    expect(getCodeBlockValue({ indexedFields: [1, 2, 3] })).toEqual([1, 2, 3]);
    expect(getCodeBlockValue({ indexedFields: null })).toBe(null);
  });

  it('should return points if they exist', () => {
    expect(getCodeBlockValue({ points: [1, 2, 3] })).toEqual([1, 2, 3]);
    expect(getCodeBlockValue({ points: null })).toBe(null);
  });

  it("should return the value if it is not a string and payloads, indexedFields, or points don't exist", () => {
    expect(getCodeBlockValue({ test: [1, 2, 3] })).toEqual({ test: [1, 2, 3] });
    expect(getCodeBlockValue(0)).toBe(0);
    expect(getCodeBlockValue(1)).toBe(1);
    expect(getCodeBlockValue(null)).toBe(null);
    expect(getCodeBlockValue([1, 2, 3])).toEqual([1, 2, 3]);
  });
});
