import { describe, expect, it } from 'vitest';

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
    it(`should match the snapshot for ${workflow.workflowExecutionInfo?.status} workflows`, () => {
      expect(toWorkflowExecution(workflow)).toMatchSnapshot();
    });
  }

  const withInfo = (workflowExecutionInfo: object) =>
    ({ workflowExecutionInfo }) as unknown as WorkflowExecutionAPIResponse;

  it('should include firstRunId when present', () => {
    const workflow = toWorkflowExecution(withInfo({ firstRunId: 'first-run' }));
    expect(workflow.firstRunId).toBe('first-run');
  });

  it('should leave firstRunId undefined when empty', () => {
    const workflow = toWorkflowExecution(withInfo({ firstRunId: '' }));
    expect(workflow.firstRunId).toBeUndefined();
  });

  it('should leave firstRunId undefined when missing', () => {
    const workflow = toWorkflowExecution(withInfo({}));
    expect(workflow.firstRunId).toBeUndefined();
  });
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
