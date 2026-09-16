import { describe, expect, it } from 'vitest';

import type { WorkflowExecution } from '$lib/types/workflows';

import {
  getWorkflowColumnAttribute,
  getWorkflowColumnValue,
  UNFILTERABLE_WORKFLOW_COLUMNS,
  WORKFLOW_COLUMN_ATTRIBUTE,
} from './column-search-attributes';

const workflow = {
  name: 'MyWorkflowType',
  id: 'my-workflow-id',
  runId: 'my-run-id',
  status: 'Completed',
  startTime: '2024-01-02T03:04:05Z',
  endTime: '2024-01-02T04:04:05Z',
  executionTime: '2024-01-02T03:04:05Z',
  taskQueue: 'my-task-queue',
  historySizeBytes: '2048',
  historyEvents: '17',
  stateTransitionCount: '0',
  parentNamespaceId: 'parent-namespace',
  searchAttributes: {
    indexedFields: {
      TemporalWorkerDeploymentVersion: 'my-deployment.abc123',
      TemporalChangeVersion: ['v1', 'v2'],
      CustomIntField: 42,
      CustomBoolField: true,
    },
  },
} as unknown as WorkflowExecution;

describe('getWorkflowColumnAttribute', () => {
  it('maps a column label to its search attribute', () => {
    expect(getWorkflowColumnAttribute('Status')).toBe('ExecutionStatus');
    expect(getWorkflowColumnAttribute('Task Queue')).toBe('TaskQueue');
  });

  it('treats an unmapped label as a custom search attribute name', () => {
    expect(getWorkflowColumnAttribute('CustomIntField')).toBe('CustomIntField');
  });
});

describe('getWorkflowColumnValue', () => {
  it('returns raw values rather than the formatted cell text', () => {
    expect(getWorkflowColumnValue('Start', workflow)).toBe(
      '2024-01-02T03:04:05Z',
    );
    expect(getWorkflowColumnValue('End', workflow)).toBe(
      '2024-01-02T04:04:05Z',
    );
    expect(getWorkflowColumnValue('History Size', workflow)).toBe('2048');
    expect(getWorkflowColumnValue('History Length', workflow)).toBe('17');
  });

  it('returns the readable status used by the status filter chip', () => {
    expect(getWorkflowColumnValue('Status', workflow)).toBe('Completed');
  });

  it('omits a count the cell renders as blank', () => {
    expect(
      getWorkflowColumnValue('State Transitions', workflow),
    ).toBeUndefined();
  });

  it('falls back to the deployment version for Build ID', () => {
    expect(getWorkflowColumnValue('Build ID', workflow)).toBe('abc123');
  });

  it('reads custom search attributes with their runtime types intact', () => {
    expect(getWorkflowColumnValue('CustomIntField', workflow)).toBe(42);
    expect(getWorkflowColumnValue('CustomBoolField', workflow)).toBe(true);
    expect(getWorkflowColumnValue('Change Version', workflow)).toEqual([
      'v1',
      'v2',
    ]);
  });

  it.each(UNFILTERABLE_WORKFLOW_COLUMNS)(
    'has no value to filter on for %s',
    (label) => {
      expect(getWorkflowColumnValue(label, workflow)).toBeUndefined();
      expect(WORKFLOW_COLUMN_ATTRIBUTE[label]).toBeUndefined();
    },
  );
});
