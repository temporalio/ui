import { describe, expect, it } from 'vitest';

import { flattenPlotScene } from './flatten-plot-scene';
import type { ExecutionScene, WorkflowScene } from './types';
import {
  getEventKey,
  getExecutionKey,
  getWorkflowKey,
} from '../../data/identity-keys';

function execution(workflowId: string, runId: string): ExecutionScene {
  const identity = { namespace: 'default', workflowId, runId };
  return {
    execution: {
      identity,
      executionKey: getExecutionKey(identity),
      workflowKey: getWorkflowKey(identity),
    },
    rowCount: 0,
    childCount: 0,
    entries: [],
  };
}

describe('flattenPlotScene', () => {
  it('shows every child workflow and execution in scene order', () => {
    const grandchild = execution('grandchild', 'grandchild-run');
    const childFirst = execution('child', 'child-run-1');
    const childSecond = execution('child', 'child-run-2');
    const parentFirst = execution('parent', 'parent-run-1');
    const parentSecond = execution('parent', 'parent-run-2');
    const childWorkflow: WorkflowScene = {
      workflowKey: getWorkflowKey(childFirst.execution.identity),
      executions: [
        {
          ...childFirst,
          childCount: 1,
          entries: [
            {
              kind: 'child-workflow',
              initiatedEventId: '2',
              initiatedEventKey: getEventKey(
                childFirst.execution.executionKey,
                '2',
              ),
              workflow: {
                workflowKey: getWorkflowKey(grandchild.execution.identity),
                executions: [grandchild],
              },
            },
          ],
        },
        childSecond,
      ],
    };
    const scene: WorkflowScene = {
      workflowKey: getWorkflowKey(parentFirst.execution.identity),
      executions: [
        {
          ...parentFirst,
          childCount: 1,
          entries: [
            {
              kind: 'child-workflow',
              initiatedEventId: '3',
              initiatedEventKey: getEventKey(
                parentFirst.execution.executionKey,
                '3',
              ),
              workflow: childWorkflow,
            },
          ],
        },
        parentSecond,
      ],
    };

    expect(
      flattenPlotScene(scene)
        .filter((row) => row.kind === 'execution')
        .map((row) => [row.execution.execution.identity.runId, row.depth]),
    ).toEqual([
      ['parent-run-1', 0],
      ['child-run-1', 1],
      ['grandchild-run', 2],
      ['child-run-2', 1],
      ['parent-run-2', 0],
    ]);
  });
});
