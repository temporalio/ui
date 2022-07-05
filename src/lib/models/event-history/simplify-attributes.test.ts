import { describe, expect, it } from 'vitest';
import { simplifyAttributes } from './simplify-attributes';

const attributes = {
  type: 'workflowExecutionStartedEventAttributes',
  workflowType: 'workflow.advanced-visibility',
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
  workflowExecutionTimeout: '',
  workflowRunTimeout: '20 minutes',
  workflowTaskTimeout: '20 seconds',
  continuedExecutionRunId: '',
  initiator: 'Unspecified',
  continuedFailure: null,
  lastCompletionResult: null,
  originalExecutionRunId: '2a7ba421-f74b-4b8b-b9d8-e6e30e4caac7',
  identity: '',
  firstExecutionRunId: '2a7ba421-f74b-4b8b-b9d8-e6e30e4caac7',
  retryPolicy: null,
  attempt: 1,
  workflowExecutionExpirationTime: '',
  cronSchedule: '',
  firstWorkflowTaskBackoff: '',
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
    const { workflowType } = simplifyAttributes(
      attributes,
    ) as EventAttributesWithType<'workflowExecutionStartedEventAttributes'>;

    expect(workflowType).toBe('workflow.advanced-visibility');
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
});
