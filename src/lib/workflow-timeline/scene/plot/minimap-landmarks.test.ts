import { describe, expect, it } from 'vitest';

import { getMinimapLandmarks } from './minimap-landmarks';
import type { QualifiedHistoryEvent } from '../../data/history-events/types';
import {
  getEventKey,
  getExecutionKey,
  getLifecycleKey,
  getWorkflowKey,
} from '../../data/identity-keys';
import type { ExecutionScene, WorkflowScene } from '../structure/types';

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

function withWorkflowRow(
  executionScene: ExecutionScene,
  startTimeMs: number,
  endTimeMs: number,
): ExecutionScene {
  const executionKey = executionScene.execution.executionKey;
  const eventKey = getEventKey(executionKey, '1');
  return {
    ...executionScene,
    entries: [
      {
        kind: 'row',
        row: {
          rowKey: getLifecycleKey(eventKey),
          executionKey,
          kind: 'workflow',
          label: 'Workflow Execution',
          eventKeys: [eventKey],
          startEventId: '1',
          endEventId: '1',
          startTimeMs,
          endTimeMs,
        },
      },
      ...executionScene.entries,
    ],
  };
}

function historyEvent(
  executionScene: ExecutionScene,
  eventId: string,
  eventType: QualifiedHistoryEvent['eventType'],
  eventTimeMs: number,
): QualifiedHistoryEvent {
  const executionKey = executionScene.execution.executionKey;
  return {
    executionKey,
    eventKey: getEventKey(executionKey, eventId),
    eventId,
    eventType,
    eventTypeFormat: 'readable',
    eventTimeMs,
  };
}

describe('getMinimapLandmarks', () => {
  it('collects all runs and nested children, including those not expanded in the plot', () => {
    const rootFirst = withWorkflowRow(execution('root', 'one'), 10, 100);
    const rootSecond = withWorkflowRow(execution('root', 'two'), 101, 200);
    const childFirst = withWorkflowRow(execution('child', 'one'), 30, 70);
    const childSecond = withWorkflowRow(execution('child', 'two'), 71, 90);
    const grandchild = withWorkflowRow(execution('grandchild', 'one'), 45, 55);
    const grandchildStart = historyEvent(
      childFirst,
      '4',
      'StartChildWorkflowExecutionInitiated',
      40,
    );
    const childStart = historyEvent(
      rootFirst,
      '3',
      'StartChildWorkflowExecutionInitiated',
      25,
    );
    const childWorkflow: WorkflowScene = {
      workflowKey: childFirst.execution.workflowKey,
      executions: [
        {
          ...childFirst,
          entries: [
            ...childFirst.entries,
            {
              kind: 'child-workflow',
              initiatedEventId: '4',
              initiatedEventKey: grandchildStart.eventKey,
              workflow: {
                workflowKey: grandchild.execution.workflowKey,
                executions: [grandchild],
              },
            },
          ],
        },
        childSecond,
      ],
    };
    const scene: WorkflowScene = {
      workflowKey: rootFirst.execution.workflowKey,
      executions: [
        {
          ...rootFirst,
          entries: [
            ...rootFirst.entries,
            {
              kind: 'child-workflow',
              initiatedEventId: '3',
              initiatedEventKey: childStart.eventKey,
              workflow: childWorkflow,
            },
          ],
        },
        rootSecond,
      ],
    };

    expect(
      getMinimapLandmarks(scene, [
        childStart,
        childStart,
        grandchildStart,
        historyEvent(childFirst, '8', 'WorkflowExecutionFailed', 70),
        historyEvent(rootSecond, '9', 'WorkflowExecutionCompleted', 200),
        historyEvent(childSecond, '7', 'WorkflowExecutionCompleted', 90),
        historyEvent(rootFirst, '10', 'WorkflowExecutionContinuedAsNew', 100),
        historyEvent(
          rootFirst,
          '11',
          'StartChildWorkflowExecutionInitiated',
          28,
        ),
      ]),
    ).toEqual({
      spans: [
        { kind: 'root', startMs: 10, endMs: 100 },
        { kind: 'child', startMs: 30, endMs: 70 },
        { kind: 'child', startMs: 45, endMs: 55 },
        { kind: 'child', startMs: 71, endMs: 90 },
        { kind: 'root', startMs: 101, endMs: 200 },
      ],
      markers: [
        { kind: 'child', timeMs: 25 },
        { kind: 'child', timeMs: 40 },
        { kind: 'failure', timeMs: 70 },
        { kind: 'completion', timeMs: 200 },
        { kind: 'completion', timeMs: 90 },
      ],
    });
  });

  it('skips missing lifecycle rows and invalid times without losing valid descendants or markers', () => {
    const root = execution('root', 'one');
    const child = execution('child', 'one');
    const validChild = withWorkflowRow(child, 20, 40);
    const invalidRoot = withWorkflowRow(root, Number.NaN, 50);
    const childStart = historyEvent(
      root,
      '3',
      'StartChildWorkflowExecutionInitiated',
      15,
    );
    const scene: WorkflowScene = {
      workflowKey: root.execution.workflowKey,
      executions: [
        {
          ...invalidRoot,
          entries: [
            ...invalidRoot.entries,
            {
              kind: 'child-workflow',
              initiatedEventId: '3',
              initiatedEventKey: childStart.eventKey,
              workflow: {
                workflowKey: child.execution.workflowKey,
                executions: [
                  validChild,
                  withWorkflowRow(execution('child', 'two'), 60, 30),
                  execution('child', 'three'),
                ],
              },
            },
          ],
        },
        execution('root', 'two'),
      ],
    };

    expect(
      getMinimapLandmarks(scene, [
        childStart,
        historyEvent(child, '4', 'WorkflowExecutionTimedOut', 40),
        historyEvent(root, '5', 'WorkflowExecutionCompleted', Infinity),
        historyEvent(
          execution('other', 'one'),
          '6',
          'WorkflowExecutionFailed',
          25,
        ),
      ]),
    ).toEqual({
      spans: [{ kind: 'child', startMs: 20, endMs: 40 }],
      markers: [
        { kind: 'child', timeMs: 15 },
        { kind: 'failure', timeMs: 40 },
      ],
    });
    expect(getMinimapLandmarks(null, [childStart])).toEqual({
      spans: [],
      markers: [],
    });
  });
});
