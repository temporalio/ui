import { describe, expect, it, vi } from 'vitest';

import type {
  ListWorkflowExecutionsResponse,
  WorkflowExecutionAPIResponse,
} from '$lib/types/workflows';

import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from './workflow-execution';

import listWorkflowsResponse from '$fixtures/list-workflows.json';
import canceledWorkflow from '$fixtures/workflow.canceled.json';
import completedWorkflow from '$fixtures/workflow.completed.json';
import failedWorkflow from '$fixtures/workflow.failed.json';
import runningWorkflow from '$fixtures/workflow.running.json';
import terminatedWorkflow from '$fixtures/workflow.terminated.json';
import timedOutWorkflow from '$fixtures/workflow.timed-out.json';

vi.mock('$lib/utilities/write-actions-are-allowed', () => {
  return {
    writeActionsAreAllowed: () => false,
  };
});

const workflows = [
  canceledWorkflow,
  completedWorkflow,
  failedWorkflow,
  runningWorkflow,
  terminatedWorkflow,
  timedOutWorkflow,
] as unknown as WorkflowExecutionAPIResponse[];

describe('toWorkflowExecution', () => {
  for (const workflow of workflows) {
    it(`should match the snapshot for ${workflow.workflowExecutionInfo.status} workflows`, () => {
      expect(toWorkflowExecution(workflow)).toMatchSnapshot();
    });
  }
});

describe('toWorkflowExecutions', () => {
  it('should match the snapshot', () => {
    const response =
      listWorkflowsResponse as unknown as ListWorkflowExecutionsResponse;
    expect(toWorkflowExecutions(response)).toMatchSnapshot();
  });

  it('should gracefully fall back to an empty away if the executions property is not defined', () => {
    const response = {} as unknown as ListWorkflowExecutionsResponse;
    expect(toWorkflowExecutions(response)).toEqual([]);
  });
});
