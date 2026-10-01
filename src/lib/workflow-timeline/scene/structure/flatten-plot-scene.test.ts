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
  it('keeps only the root header when the root workflow is collapsed', () => {
    const rootExecution = execution('parent', 'parent-run');
    const scene: WorkflowScene = {
      workflowKey: rootExecution.execution.workflowKey,
      executions: [rootExecution],
    };
    const collapseKeys: string[] = [];
    const executionCollapseKeys: string[] = [];

    expect(
      flattenPlotScene(
        scene,
        (key) => {
          collapseKeys.push(key);
          return key === `workflow:${scene.workflowKey}`;
        },
        (key) => {
          executionCollapseKeys.push(key);
          return false;
        },
      ),
    ).toEqual([
      {
        kind: 'workflow',
        key: `workflow:${scene.workflowKey}`,
        depth: 0,
        workflow: scene,
      },
    ]);
    expect(collapseKeys).toEqual([`workflow:${scene.workflowKey}`]);
    expect(executionCollapseKeys).toEqual([]);
  });

  it('shows the root header even when there are no runs', () => {
    const scene: WorkflowScene = {
      workflowKey: getWorkflowKey({
        namespace: 'default',
        workflowId: 'parent',
      }),
      executions: [],
    };

    expect(
      flattenPlotScene(
        scene,
        () => false,
        () => false,
      ),
    ).toEqual([
      {
        kind: 'workflow',
        key: `workflow:${scene.workflowKey}`,
        depth: 0,
        workflow: scene,
      },
    ]);
  });

  it('omits child workflow lifecycle rows while keeping other child events', () => {
    const parent = execution('parent', 'parent-run');
    const child = execution('child', 'child-run');
    const eventKey = getEventKey(child.execution.executionKey, '1');
    const lifecycle: ExecutionRowEntry = {
      kind: 'row',
      row: {
        rowKey: getLifecycleKey(eventKey),
        executionKey: child.execution.executionKey,
        kind: 'workflow',
        label: 'Workflow Execution',
        eventKeys: [eventKey],
        startEventId: '1',
        endEventId: '1',
        startTimeMs: 0,
        endTimeMs: 0,
      },
    };
    const activityKey = getEventKey(child.execution.executionKey, '2');
    const activity: ExecutionRowEntry = {
      kind: 'row',
      row: {
        ...lifecycle.row,
        rowKey: getLifecycleKey(activityKey),
        kind: 'activity',
        label: 'Activity',
        eventKeys: [activityKey],
        startEventId: '2',
        endEventId: '2',
      },
    };
    const scene: WorkflowScene = {
      workflowKey: parent.execution.workflowKey,
      executions: [
        {
          ...parent,
          childCount: 1,
          entries: [
            {
              kind: 'child-workflow',
              initiatedEventId: '1',
              initiatedEventKey: getEventKey(
                parent.execution.executionKey,
                '1',
              ),
              workflow: {
                workflowKey: child.execution.workflowKey,
                executions: [{ ...child, entries: [lifecycle, activity] }],
              },
            },
          ],
        },
      ],
    };

    const rows = flattenPlotScene(
      scene,
      () => false,
      () => false,
    );
    expect(rows.map((row) => [row.kind, row.depth])).toEqual([
      ['workflow', 0],
      ['execution', 1],
      ['child', 2],
      ['execution', 3],
      ['event', 4],
    ]);
    expect(rows.filter((row) => row.kind === 'event')).toEqual([
      {
        kind: 'event',
        key: `row:${activity.row.rowKey}`,
        depth: 4,
        executionKey: child.execution.executionKey,
        row: activity.row,
      },
    ]);
  });

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
            : row.kind === 'workflow'
              ? 'root workflow'
              : row.row.label,
        row.depth,
        row.kind === 'execution' ? row.continuesAsNew : false,
      ]),
    ).toEqual([
      ['root workflow', 0, false],
      ['parent-run-1', 1, true],
      ['Activity', 2, false],
      ['child workflow', 2, false],
      ['child-run-1', 3, true],
      ['child workflow', 4, false],
      ['grandchild-run', 5, false],
      ['child-run-2', 3, false],
      ['parent-run-2', 1, false],
    ]);

    expect(expanded[0]).toEqual({
      kind: 'workflow',
      key: `workflow:${scene.workflowKey}`,
      depth: 0,
      workflow: scene,
    });
    expect(
      expanded
        .filter((row) => row.kind === 'execution')
        .map((row) => [
          row.execution.execution.identity.runId,
          row.runNumber,
          row.runCount,
        ]),
    ).toEqual([
      ['parent-run-1', 1, 2],
      ['child-run-1', 1, 2],
      ['grandchild-run', 1, 1],
      ['child-run-2', 2, 2],
      ['parent-run-2', 2, 2],
    ]);
    expect(expanded.filter((row) => row.kind === 'event')).toEqual([
      {
        kind: 'event',
        key: `row:${activity.row.rowKey}`,
        depth: 2,
        executionKey: parentFirst.execution.executionKey,
        row: activity.row,
      },
    ]);

    const childHeader = expanded.find((row) => row.kind === 'child');
    if (!childHeader) throw new Error('Expected child header');
    expect(
      flattenPlotScene(
        scene,
        (key) => key === childHeader.key,
        () => false,
      ).map((row) => row.kind),
    ).toEqual(['workflow', 'execution', 'event', 'child', 'execution']);
    expect(
      flattenPlotScene(
        scene,
        () => false,
        (key) => key === `execution:${parentFirst.execution.executionKey}`,
      ).map((row) => row.kind),
    ).toEqual(['workflow', 'execution', 'execution']);

    const expandedChildKeys = new Set<string>([
      `workflow:${scene.workflowKey}`,
    ]);
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
      `workflow:${scene.workflowKey}`,
      firstKey,
      `row:${activity.row.rowKey}`,
      childHeader.key,
      secondKey,
    ]);
    expandedChildKeys.add(childHeader.key);
    expect(defaultRows().map((row) => row.kind)).toEqual([
      'workflow',
      'execution',
      'event',
      'child',
      'execution',
      'child',
      'execution',
      'execution',
    ]);
    collapsedExecutionKeys.add(
      `execution:${childFirst.execution.executionKey}`,
    );
    expect(defaultRows().some((row) => row.depth === 4)).toBe(false);
    collapsedExecutionKeys.add(secondKey);
    expect(defaultRows().at(-1)?.key).toBe(secondKey);
  });
});
