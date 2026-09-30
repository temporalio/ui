import { describe, expect, it } from 'vitest';

import { flattenPlotScene } from './flatten-plot-scene';
import type { ExecutionRowEntry, ExecutionScene, WorkflowScene } from './types';
import {
  getEventKey,
  getExecutionKey,
  getLifecycleKey,
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
    const eventKey = getEventKey(parentFirst.execution.executionKey, '1');
    const workflow: ExecutionRowEntry = {
      kind: 'row',
      row: {
        rowKey: getLifecycleKey(
          getEventKey(parentFirst.execution.executionKey, '0'),
        ),
        executionKey: parentFirst.execution.executionKey,
        kind: 'workflow',
        label: 'Workflow Execution',
        eventKeys: [],
        startEventId: '0',
        endEventId: '0',
        startTimeMs: 0,
        endTimeMs: 0,
      },
    };
    const secondWorkflow: ExecutionRowEntry = {
      kind: 'row',
      row: {
        ...workflow.row,
        rowKey: getLifecycleKey(
          getEventKey(parentSecond.execution.executionKey, '0'),
        ),
        executionKey: parentSecond.execution.executionKey,
        label: 'Second Workflow Execution',
      },
    };
    const activity: ExecutionRowEntry = {
      kind: 'row',
      row: {
        rowKey: getLifecycleKey(eventKey),
        executionKey: parentFirst.execution.executionKey,
        kind: 'activity',
        label: 'Activity',
        eventKeys: [eventKey],
        startEventId: '1',
        endEventId: '1',
        startTimeMs: 0,
        endTimeMs: 0,
      },
    };
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
            workflow,
            activity,
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
        { ...parentSecond, entries: [secondWorkflow] },
      ],
    };

    const expanded = flattenPlotScene(
      scene,
      () => false,
      () => false,
    );
    expect(
      expanded.map((row) => [
        row.kind === 'execution'
          ? row.execution.execution.identity.runId
          : row.kind === 'child'
            ? 'child workflow'
            : row.row.label,
        row.depth,
        row.kind === 'execution' ? row.continuesAsNew : false,
      ]),
    ).toEqual([
      ['parent-run-1', 0, true],
      ['Workflow Execution', 1, false],
      ['Activity', 1, false],
      ['child workflow', 1, false],
      ['child-run-1', 2, true],
      ['child workflow', 3, false],
      ['grandchild-run', 4, false],
      ['child-run-2', 2, false],
      ['parent-run-2', 0, false],
      ['Second Workflow Execution', 1, false],
    ]);

    const childHeader = expanded.find((row) => row.kind === 'child');
    if (!childHeader) throw new Error('Expected child header');
    expect(
      flattenPlotScene(
        scene,
        (key) => key === childHeader.key,
        () => false,
      ).map((row) => row.kind),
    ).toEqual(['execution', 'event', 'event', 'child', 'execution', 'event']);
    expect(
      flattenPlotScene(
        scene,
        () => false,
        (key) => key === `execution:${parentFirst.execution.executionKey}`,
      ).map((row) => row.kind),
    ).toEqual(['execution', 'execution', 'event']);

    const expandedChildKeys = new Set<string>();
    const collapsedExecutionKeys = new Set<string>();
    const firstKey = `execution:${parentFirst.execution.executionKey}`;
    const secondKey = `execution:${parentSecond.execution.executionKey}`;
    const defaultRows = () =>
      flattenPlotScene(
        scene,
        (key) => !expandedChildKeys.has(key),
        (key) => collapsedExecutionKeys.has(key),
      );
    expect(defaultRows().map((row) => row.key)).toEqual([
      firstKey,
      `row:${workflow.row.rowKey}`,
      `row:${activity.row.rowKey}`,
      childHeader.key,
      secondKey,
      `row:${secondWorkflow.row.rowKey}`,
    ]);
    expandedChildKeys.add(childHeader.key);
    expect(defaultRows().map((row) => row.kind)).toEqual([
      'execution',
      'event',
      'event',
      'child',
      'execution',
      'child',
      'execution',
      'execution',
      'event',
    ]);
    collapsedExecutionKeys.add(
      `execution:${childFirst.execution.executionKey}`,
    );
    expect(defaultRows().some((row) => row.depth === 3)).toBe(false);
    collapsedExecutionKeys.add(secondKey);
    expect(defaultRows().at(-1)?.key).toBe(secondKey);
  });
});
