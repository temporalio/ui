import { describe, expect, it } from 'vitest';

import {
  getCodeBlockValue,
  getPrimaryAttributeForEvent,
  getSummaryAttribute,
  shouldDisplayAsExecutionLink,
  shouldDisplayAsTime,
  shouldDisplayAttribute,
} from './get-single-attribute-for-event';
import { toEvent } from '../models/event-history';

import dotnetLocalActivity from '$fixtures/local-activities/dotnet_local_activity.json';
import goLocalActivity from '$fixtures/local-activities/go_local_activity.json';
import javaLocalActivity from '$fixtures/local-activities/java_local_activity.json';
import pythonLocalActivity from '$fixtures/local-activities/python_local_activity.json';
import tsLocalActivity from '$fixtures/local-activities/ts_local_activity.json';

describe('getPrimaryAttributeForEvent', () => {
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

  it('should return "workflowType.name" if the workflow type exists', async () => {
    expect(await getPrimaryAttributeForEvent(workflowEvent)).toStrictEqual({
      key: 'workflowTypeName',
      value: 'RainbowStatusesWorkflow',
    });
  });

  it('should return "input" if the workflow type does not exists', async () => {
    const event = { ...workflowEvent };
    event.attributes.workflowType = null;
    expect(await getPrimaryAttributeForEvent(event)).toStrictEqual({
      key: 'input',
      value: {
        payloads: [
          {
            At: '2022-04-04T11:50:28.151785-05:00',
            Hey: 'from Mars',
          },
        ],
      },
    });
  });

  it('should return "taskQueue" if the workflow type and input does not exist', async () => {
    const event = { ...workflowEvent };
    event.attributes.workflowType = null as unknown as {
      name: string;
    };
    event.attributes.input = null;

    expect(await getPrimaryAttributeForEvent(event)).toStrictEqual({
      key: 'taskQueueName',
      value: 'rainbow-statuses',
    });
  });

  it('should return empty key value object if none of the attributes display', async () => {
    expect(await getPrimaryAttributeForEvent(null)).toStrictEqual({
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

describe('shouldDisplayAsTime', () => {
  it('should return non-time values as is', () => {
    expect(shouldDisplayAsTime('originalExecutionRunId')).toBe(false);
    expect(shouldDisplayAsTime('lastScheduledTimeout')).toBe(false);
    expect(shouldDisplayAsTime('timeToFire')).toBe(false);
  });
  it('should return time values as formatted time', () => {
    expect(shouldDisplayAsTime('lastScheduledTime')).toBe(true);
    expect(shouldDisplayAsTime('expirationTime')).toBe(true);
    expect(shouldDisplayAsTime('lastHeartbeatTime')).toBe(true);
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
    expect(
      shouldDisplayAttribute('targetWorkerDeploymentVersionChanged', false),
    ).toBe(false);
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

describe('getSummaryEvent', () => {
  it('should return expected payload for Go', async () => {
    const localActivity = await toEvent(goLocalActivity);
    expect(getSummaryAttribute(localActivity)).toStrictEqual({
      key: 'ActivityType',
      value: 'Activity',
    });
  });
  it('should return expected payload for TS', async () => {
    const localActivity = await toEvent(tsLocalActivity);
    expect(getSummaryAttribute(localActivity)).toStrictEqual({
      key: 'ActivityType',
      value: 'greet',
    });
  });
  it('should return expected payload for Java', async () => {
    const localActivity = await toEvent(javaLocalActivity);
    expect(getSummaryAttribute(localActivity)).toStrictEqual({
      key: 'ActivityType',
      value: 'greet',
    });
  });
  it('should return expected payload for Python', async () => {
    const localActivity = await toEvent(pythonLocalActivity);
    expect(getSummaryAttribute(localActivity)).toStrictEqual({
      key: 'ActivityType',
      value: 'compose_greeting',
    });
  });
  it('should return expected payload for .Net', async () => {
    const localActivity = await toEvent(dotnetLocalActivity);
    expect(getSummaryAttribute(localActivity)).toStrictEqual({
      key: 'ActivityType',
      value: 'DoStaticThing',
    });
  });

  it('should return expected payload for a Nexus single payload', async () => {
    const nexusEvent = {
      eventId: '5',
      eventTime: '2024-07-11T17:42:53.326959Z',
      eventType: 'EVENT_TYPE_NEXUS_OPERATION_SCHEDULED',
      taskId: '1098294',
      nexusOperationScheduledEventAttributes: {
        endpoint: 'sdk_go_nexus_test_ep_c5559a73_33a7_436e_bfa0_f794d2f26795',
        service: 'test',
        operation: 'custom-op',
        input: {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
          },
          data: 'InN0YXJ0LWFzeW5jIg==',
        },
        scheduleToCloseTimeout: '0s',
        workflowTaskCompletedEventId: '4',
        requestId: '4e393ac4-564f-4856-9ddc-fbe1fdc0a7f7',
        endpointId: 'f0a6cc80-cb36-4e3c-92a6-92681687b0ee',
      },
    };
    const event = await toEvent(nexusEvent);
    expect(getSummaryAttribute(event)).toStrictEqual({
      key: 'input',
      value: {
        metadata: {
          encoding: 'anNvbi9wbGFpbg==',
        },
        data: 'InN0YXJ0LWFzeW5jIg==',
      },
    });
  });
});
