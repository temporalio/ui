import { temporal } from '@temporalio/proto';
import { describe, expect, it } from 'vitest';

import { getMinimapLandmarks } from './minimap-landmarks';
import type { QualifiedHistoryEvent } from '../../data/history-events/types';
import {
  getEventKey,
  getExecutionKey,
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

const root = execution('root', 'one');
const child = execution('child', 'one');
const nextRun = execution('root', 'two');
const scene: WorkflowScene = {
  workflowKey: root.execution.workflowKey,
  executions: [
    {
      ...root,
      entries: [
        {
          kind: 'child-workflow',
          initiatedEventId: '3',
          initiatedEventKey: getEventKey(root.execution.executionKey, '3'),
          workflow: {
            workflowKey: child.execution.workflowKey,
            executions: [child],
          },
        },
      ],
    },
    nextRun,
  ],
};

const childStarted: QualifiedHistoryEvent = {
  ...historyEvent(root, '4', 'ChildWorkflowExecutionStarted', 30),
  childWorkflowExecutionStartedEventAttributes:
    temporal.api.history.v1.ChildWorkflowExecutionStartedEventAttributes.fromObject(
      {
        initiatedEventId: '3',
      },
    ),
};

describe('getMinimapLandmarks', () => {
  it('marks starts, continuations, failures and completions without duration lanes', () => {
    expect(
      getMinimapLandmarks(scene, [
        historyEvent(root, '1', 'WorkflowExecutionStarted', 0),
        childStarted,
        historyEvent(child, '1', 'WorkflowExecutionStarted', 30),
        historyEvent(child, '8', 'WorkflowExecutionFailed', 70),
        historyEvent(root, '10', 'WorkflowExecutionContinuedAsNew', 100),
        historyEvent(nextRun, '1', 'WorkflowExecutionStarted', 101),
        historyEvent(nextRun, '9', 'WorkflowExecutionCompleted', 200),
      ]).markers,
    ).toEqual([
      { kind: 'execution', timeMs: 0, label: 'Execution started' },
      { kind: 'execution', timeMs: 30, label: 'Execution started' },
      { kind: 'failure', timeMs: 70, label: 'WorkflowExecutionFailed' },
      { kind: 'continuation', timeMs: 100, label: 'Continued as new' },
      { kind: 'execution', timeMs: 101, label: 'Execution started' },
      { kind: 'completion', timeMs: 200, label: 'Workflow completed' },
    ]);
  });

  it('keeps child starts visible before child history loads', () => {
    expect(getMinimapLandmarks(scene, [childStarted]).markers).toEqual([
      { kind: 'execution', timeMs: 30, label: 'Child execution started' },
    ]);
  });

  it('marks explicit retries without treating every failure as a retry', () => {
    const events: QualifiedHistoryEvent[] = [
      {
        ...historyEvent(root, '2', 'ActivityTaskStarted', 20),
        activityTaskStartedEventAttributes: { attempt: 1 },
      },
      {
        ...historyEvent(root, '3', 'ActivityTaskStarted', 40),
        activityTaskStartedEventAttributes: { attempt: 3 },
      },
      {
        ...historyEvent(nextRun, '1', 'WorkflowExecutionStarted', 80),
        workflowExecutionStartedEventAttributes: { attempt: 2 },
      },
      historyEvent(root, '5', 'ActivityTaskFailed', 50),
      historyEvent(root, '6', 'WorkflowTaskTimedOut', 60),
      historyEvent(root, '7', 'NexusOperationFailed', 70),
    ];
    expect(
      getMinimapLandmarks(scene, events).markers.map((marker) => marker.kind),
    ).toEqual(['retry', 'retry', 'failure', 'failure', 'failure']);
    expect(getMinimapLandmarks(scene, events).markers[0]?.label).toBe(
      'Activity retry · attempt 3',
    );
  });

  it('ignores duplicates, invalid times, unrelated executions and routine events', () => {
    const failure = historyEvent(root, '5', 'ActivityTaskFailed', 50);
    expect(
      getMinimapLandmarks(scene, [
        failure,
        failure,
        historyEvent(root, '6', 'WorkflowExecutionCompleted', Infinity),
        historyEvent(
          execution('other', 'one'),
          '1',
          'WorkflowExecutionStarted',
          20,
        ),
        historyEvent(root, '7', 'WorkflowTaskCompleted', 70),
        historyEvent(root, '8', 'TimerFired', 80),
      ]).markers,
    ).toEqual([{ kind: 'failure', timeMs: 50, label: 'ActivityTaskFailed' }]);
    expect(getMinimapLandmarks(null, [failure])).toEqual({ markers: [] });
  });
});
