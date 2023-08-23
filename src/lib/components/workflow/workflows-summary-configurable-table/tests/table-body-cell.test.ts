import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { WorkflowHeaderLabels } from '$lib/stores/workflow-table-columns';
import type { WorkflowExecution } from '$lib/types/workflows';

import TableBodyCell from '../table-body-cell.svelte';

const workflow: WorkflowExecution = {
  name: 'mock-workflow',
  id: 'abc-123',
  runId: 'def-456',
  startTime: '2023-04-27T00:00:00.000000000Z',
  endTime: '2023-04-28T00:00:00.000000000Z',
  executionTime: '2023-04-27T01:00:00.000000000Z',
  status: 'Running',
  taskQueue: 'task-queue',
  historyEvents: '42',
  historySizeBytes: '1024',
  parent: {
    workflowId: 'parent-workflow-id',
  },
  parentNamespaceId: 'parent-namespace-id',
  searchAttributes: {},
  pendingChildren: [],
  pendingActivities: [],
  stateTransitionCount: '12',
  url: 'the-url',
  isRunning: true,
  defaultWorkflowTaskTimeout: {},
  canBeTerminated: true,
};

let target: HTMLElement;

beforeEach(() => {
  target = document.createElement('div');
  target.setAttribute('id', 'target');
  document.body.appendChild(target);
});

afterEach(() => {
  target.remove();
});

describe(TableBodyCell.name, () => {
  test.each(WorkflowHeaderLabels)('%s renders', (label) => {
    const column = { label, pinned: false };
    const instance = new TableBodyCell({ target, props: { column, workflow } });
    expect(instance).toBeTruthy();
    expect(target.innerHTML).toMatchSnapshot();
  });
});
