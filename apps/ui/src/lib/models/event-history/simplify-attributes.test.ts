import { describe, expect, it } from 'vitest';

import type { EventAttributesWithType } from '$lib/types/events';

import {
  canBeSimplified,
  getValueForFirstKey,
  simplifyAttributes,
} from './simplify-attributes';

const attributes = {
  workflowType: {
    name: 'workflow.advanced-visibility',
  },
  parentWorkflowNamespace: 'canary',
  parentWorkflowExecution: {
    workflowId: 'temporal.fixture.running.workflow.id',
    runId: '8f00d989-6bc2-4826-b9f9-7c18ed90c9cc',
  },
  parentInitiatedEventId: '11',
  taskQueue: {
    name: 'canary-task-queue',
    kind: 'Normal',
  },
  input: {
    payloads: ['1656707029044596700', 'canary'],
  },
  workflowExecutionTimeout: '0s',
  workflowRunTimeout: '1200s',
  workflowTaskTimeout: '20s',
  continuedExecutionRunId: '',
  initiator: 'Unspecified',
  continuedFailure: null,
  lastCompletionResult: null,
  originalExecutionRunId: '2a7ba421-f74b-4b8b-b9d8-e6e30e4caac7',
  identity: '',
  firstExecutionRunId: '2a7ba421-f74b-4b8b-b9d8-e6e30e4caac7',
  retryPolicy: null,
  attempt: 1,
  workflowExecutionExpirationTime: null,
  cronSchedule: '',
  firstWorkflowTaskBackoff: '0s',
  memo: null,
  searchAttributes: {
    indexedFields: {
      CustomKeywordField: 'childWorkflowValue',
    },
  },
  prevAutoResetPoints: null,
  header: {
    fields: {},
  },
  parentInitiatedEventVersion: '0',
} as unknown as EventAttributesWithType<'workflowExecutionStartedEventAttributes'>;

describe('simplifyAttributes', () => {
  it('should take single key attributes and reduce them down to their values', () => {
    const { initiator } = simplifyAttributes(
      attributes,
    ) as EventAttributesWithType<'workflowExecutionStartedEventAttributes'>;

    expect(initiator).toBe('Unspecified');
  });

  it('should take single key attributes and reduce them down to their values', () => {
    const { parentWorkflowExecution } = simplifyAttributes(
      attributes,
    ) as EventAttributesWithType<'workflowExecutionStartedEventAttributes'>;

    expect(parentWorkflowExecution).toEqual({
      workflowId: 'temporal.fixture.running.workflow.id',
      runId: '8f00d989-6bc2-4826-b9f9-7c18ed90c9cc',
    });
  });

  it('should format a duration', () => {
    const { workflowRunTimeout } = simplifyAttributes(
      attributes,
    ) as EventAttributesWithType<'workflowExecutionStartedEventAttributes'>;

    expect(workflowRunTimeout).toBe('20 seconds');
  });

  it('should format a duration', () => {
    const { workflowType } = simplifyAttributes(
      attributes as unknown as EventAttributesWithType<'workflowExecutionStartedEventAttributes'>,
    ) as EventAttributesWithType<'workflowExecutionStartedEventAttributes'>;

    expect(workflowType).toBe('workflow.advanced-visibility');
  });
});

describe('getValueForFirstKey', () => {
  it('should return undefined if given an empty object', () => {
    expect(getValueForFirstKey({})).toBeUndefined();
  });
});

describe('canBeSimplified', () => {
  it('should return true if given an object with one key', () => {
    expect(canBeSimplified({ key: 'value' })).toBe(true);
  });

  it('should return false if given an object with more than key', () => {
    expect(canBeSimplified({ key: 'value', anotherKey: 'another value' })).toBe(
      false,
    );
  });

  it('should return false if given null', () => {
    expect(canBeSimplified(null)).toBe(false);
  });

  it('should return false if given undefined', () => {
    expect(canBeSimplified(undefined)).toBe(false);
  });

  it('should return false if given a number', () => {
    expect(canBeSimplified(13)).toBe(false);
  });

  it('should return false if given a string', () => {
    expect(canBeSimplified('hello')).toBe(false);
  });

  it('should return false if given a boolean', () => {
    expect(canBeSimplified(true)).toBe(false);
    expect(canBeSimplified(false)).toBe(false);
  });
});
