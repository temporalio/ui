import { temporal } from '@temporalio/proto';
import { describe, expect, it } from 'vitest';

import {
  getPlotRowLayout,
  getVisiblePlotRowRange,
  getWorkflowName,
  getWorkflowTimeRange,
} from './header-presentation';
import type { QualifiedHistoryEvent } from '../../data/history-events/types';
import {
  type ExecutionKey,
  getEventKey,
  getExecutionKey,
  getLifecycleKey,
  getWorkflowKey,
} from '../../data/identity-keys';
import type { FlattenedPlotSceneRow } from '../structure/flatten-plot-scene';
import type {
  ExecutionRowEntry,
  ExecutionScene,
  WorkflowScene,
} from '../structure/types';

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

function lifecycle(
  executionScene: ExecutionScene,
  startTimeMs: number,
  endTimeMs: number,
  kind: ExecutionRowEntry['row']['kind'] = 'workflow',
): ExecutionRowEntry {
  const executionKey = executionScene.execution.executionKey;
  const eventKey = getEventKey(executionKey, '1');
  return {
    kind: 'row',
    row: {
      rowKey: getLifecycleKey(eventKey),
      executionKey,
      kind,
      label: 'Workflow Execution',
      eventKeys: [eventKey],
      startEventId: '1',
      endEventId: '2',
      startTimeMs,
      endTimeMs,
    },
  };
}

function started(
  executionScene: ExecutionScene,
  name?: string,
): QualifiedHistoryEvent {
  const executionKey = executionScene.execution.executionKey;
  return {
    executionKey,
    eventKey: getEventKey(executionKey, '1'),
    eventId: '1',
    eventType: 'WorkflowExecutionStarted',
    eventTypeFormat: 'readable',
    eventTimeMs: 0,
    workflowExecutionStartedEventAttributes:
      temporal.api.history.v1.WorkflowExecutionStartedEventAttributes.fromObject(
        {
          workflowType: { name },
        },
      ),
  };
}

function initiated(workflowId?: string, name?: string): QualifiedHistoryEvent {
  const executionKey = getExecutionKey({
    namespace: 'default',
    workflowId: 'initiating-parent',
    runId: 'parent-run',
  });
  return {
    executionKey,
    eventKey: getEventKey(executionKey, '3'),
    eventId: '3',
    eventType: 'StartChildWorkflowExecutionInitiated',
    eventTypeFormat: 'readable',
    eventTimeMs: 0,
    startChildWorkflowExecutionInitiatedEventAttributes:
      temporal.api.history.v1.StartChildWorkflowExecutionInitiatedEventAttributes.fromObject(
        {
          workflowId,
          workflowType: { name },
        },
      ),
  };
}

const firstRun = execution('parent', 'one');
const nextRun = execution('parent', 'two');
const childRun = execution('child', 'one');
const child: WorkflowScene = {
  workflowKey: childRun.execution.workflowKey,
  executions: [{ ...childRun, entries: [lifecycle(childRun, -1000, 1000)] }],
};
const workflow: WorkflowScene = {
  workflowKey: firstRun.execution.workflowKey,
  executions: [
    {
      ...firstRun,
      entries: [
        lifecycle(firstRun, 10, 40),
        lifecycle(firstRun, -2000, 2000, 'activity'),
        {
          kind: 'child-workflow',
          initiatedEventId: '3',
          initiatedEventKey: getEventKey(firstRun.execution.executionKey, '3'),
          workflow: child,
        },
      ],
    },
    { ...nextRun, entries: [lifecycle(nextRun, 50, 70)] },
  ],
};
const noActiveKeys: ReadonlySet<ExecutionKey> = new Set();

function workflowWithRange(start: number, end: number): WorkflowScene {
  return {
    workflowKey: firstRun.execution.workflowKey,
    executions: [{ ...firstRun, entries: [lifecycle(firstRun, start, end)] }],
  };
}

const plotRows: readonly FlattenedPlotSceneRow[] = [
  { kind: 'workflow', key: 'workflow', depth: 0, workflow },
  {
    kind: 'execution',
    key: 'execution',
    depth: 1,
    continuesAsNew: true,
    runNumber: 1,
    runCount: 2,
    hasDetails: false,
    execution: firstRun,
  },
  {
    kind: 'event',
    key: 'event',
    depth: 2,
    executionKey: firstRun.execution.executionKey,
    row: lifecycle(firstRun, 10, 20, 'activity').row,
  },
  { kind: 'child', key: 'child', depth: 2, workflow: child },
  {
    kind: 'event',
    key: 'child-event',
    depth: 3,
    executionKey: childRun.execution.executionKey,
    row: lifecycle(childRun, 20, 30, 'activity').row,
  },
];

const layoutRows = getPlotRowLayout(plotRows).rows;

describe('getWorkflowName', () => {
  it('uses the workflow type, not the workflow ID or a child name', () => {
    expect(
      getWorkflowName(workflow, [
        started(childRun, 'ChildWorkflow'),
        started(firstRun, 'ProcessOrder'),
      ]),
    ).toBe('ProcessOrder');
  });

  it('finds a name in a later run when the initial history is unavailable', () => {
    expect(
      getWorkflowName(workflow, [
        started(firstRun),
        started(nextRun, 'ContinueOrder'),
      ]),
    ).toBe('ContinueOrder');
  });

  it('requires a started event belonging to an own execution', () => {
    expect(
      getWorkflowName(workflow, [
        started(childRun, 'ChildWorkflow'),
        {
          ...started(firstRun, 'NotAStart'),
          eventType: 'WorkflowExecutionCompleted',
        },
      ]),
    ).toBe('Workflow');
  });

  it('uses the matching initiation type while child history is pending', () => {
    expect(
      getWorkflowName({ ...child, executions: [childRun] }, [
        initiated('other-child', 'WrongType'),
        initiated('child', 'PendingChildWorkflow'),
      ]),
    ).toBe('PendingChildWorkflow');
  });

  it('prefers an own started type over an earlier matching initiation', () => {
    expect(
      getWorkflowName(workflow, [
        initiated('parent', 'InitiatedType'),
        started(firstRun),
        started(nextRun, 'StartedType'),
      ]),
    ).toBe('StartedType');
  });

  it('uses initiation when own started attributes or names are absent', () => {
    expect(
      getWorkflowName(workflow, [
        {
          ...started(firstRun),
          workflowExecutionStartedEventAttributes: undefined,
        },
        started(nextRun, ''),
        initiated('parent', 'InitiatedType'),
      ]),
    ).toBe('InitiatedType');
  });

  it('requires an initiation event with the exact workflow ID', () => {
    expect(
      getWorkflowName(child, [
        initiated('child-other', 'WrongId'),
        {
          ...initiated('child', 'WrongEvent'),
          eventType: 'ChildWorkflowExecutionStarted',
        },
      ]),
    ).toBe('Workflow');
  });

  it('skips missing initiation attributes, IDs, types, and empty names', () => {
    const missingType: QualifiedHistoryEvent = {
      ...initiated('child'),
      startChildWorkflowExecutionInitiatedEventAttributes:
        temporal.api.history.v1.StartChildWorkflowExecutionInitiatedEventAttributes.fromObject(
          { workflowId: 'child' },
        ),
    };
    const events: readonly QualifiedHistoryEvent[] = [
      {
        ...initiated('child'),
        startChildWorkflowExecutionInitiatedEventAttributes: undefined,
      },
      initiated(undefined, 'MissingId'),
      missingType,
      initiated('child', ''),
    ];
    expect(getWorkflowName(child, events)).toBe('Workflow');
    expect(
      getWorkflowName(child, [...events, initiated('child', 'ValidType')]),
    ).toBe('ValidType');
  });

  it('does not match initiation events when there is no first execution', () => {
    expect(
      getWorkflowName({ ...child, executions: [] }, [
        initiated('child', 'ChildType'),
        initiated(undefined, 'MissingId'),
      ]),
    ).toBe('Workflow');
  });

  it('falls back for missing attributes, empty names, and no runs or events', () => {
    expect(getWorkflowName(workflow, [])).toBe('Workflow');
    expect(getWorkflowName(workflow, [started(firstRun, '')])).toBe('Workflow');
    expect(
      getWorkflowName(workflow, [
        {
          ...started(firstRun),
          workflowExecutionStartedEventAttributes: undefined,
        },
      ]),
    ).toBe('Workflow');
    expect(
      getWorkflowName({ ...workflow, executions: [] }, [
        started(firstRun, 'Order'),
      ]),
    ).toBe('Workflow');
  });
});

describe('getWorkflowTimeRange', () => {
  it('aggregates own runs without child or activity ranges', () => {
    expect(getWorkflowTimeRange(workflow, noActiveKeys, 500)).toEqual({
      startMs: 10,
      endMs: 70,
    });
    expect(getWorkflowTimeRange(child, noActiveKeys, 500)).toEqual({
      startMs: -1000,
      endMs: 1000,
    });
  });

  it('extends only the runs whose execution keys are active', () => {
    expect(
      getWorkflowTimeRange(
        workflow,
        new Set([nextRun.execution.executionKey]),
        100,
      ),
    ).toEqual({ startMs: 10, endMs: 100 });
    expect(
      getWorkflowTimeRange(
        workflow,
        new Set([firstRun.execution.executionKey]),
        120,
      ),
    ).toEqual({ startMs: 10, endMs: 120 });
    expect(
      getWorkflowTimeRange(
        workflow,
        new Set([childRun.execution.executionKey]),
        500,
      ),
    ).toEqual({ startMs: 10, endMs: 70 });
  });

  it('does not truncate recorded timestamps when now is earlier', () => {
    expect(
      getWorkflowTimeRange(
        workflow,
        new Set([nextRun.execution.executionKey]),
        60,
      ),
    ).toEqual({ startMs: 10, endMs: 70 });
  });

  it('returns null for absent lifecycle rows or runs', () => {
    expect(
      getWorkflowTimeRange({ ...workflow, executions: [] }, noActiveKeys, 100),
    ).toBeNull();
    expect(
      getWorkflowTimeRange(
        { ...workflow, executions: [firstRun] },
        new Set([firstRun.execution.executionKey]),
        100,
      ),
    ).toBeNull();
    expect(
      getWorkflowTimeRange(
        {
          ...workflow,
          executions: [
            { ...firstRun, entries: [lifecycle(firstRun, 0, 100, 'activity')] },
          ],
        },
        noActiveKeys,
        100,
      ),
    ).toBeNull();
  });

  it('rejects a workflow row owned by another execution', () => {
    expect(
      getWorkflowTimeRange(
        {
          ...workflow,
          executions: [
            { ...firstRun, entries: [lifecycle(childRun, 0, 1000)] },
          ],
        },
        noActiveKeys,
        100,
      ),
    ).toBeNull();
  });

  it.each([
    [NaN, 100],
    [10, NaN],
    [-Infinity, 100],
    [10, Infinity],
    [100, 10],
  ])(
    'ignores an invalid range [%s, %s], even for an active run',
    (start, end) => {
      const invalid = workflowWithRange(start, end);
      expect(getWorkflowTimeRange(invalid, noActiveKeys, 200)).toBeNull();
      expect(
        getWorkflowTimeRange(
          invalid,
          new Set([firstRun.execution.executionKey]),
          200,
        ),
      ).toBeNull();
      expect(
        getWorkflowTimeRange(
          {
            ...workflow,
            executions: [...invalid.executions, workflow.executions[1]],
          },
          noActiveKeys,
          200,
        ),
      ).toEqual({ startMs: 50, endMs: 70 });
    },
  );

  it('accepts zero-duration ranges and ignores a non-finite active end', () => {
    expect(
      getWorkflowTimeRange(workflowWithRange(0, 0), noActiveKeys, 100),
    ).toEqual({ startMs: 0, endMs: 0 });
    expect(
      getWorkflowTimeRange(
        workflow,
        new Set([nextRun.execution.executionKey]),
        NaN,
      ),
    ).toEqual({ startMs: 10, endMs: 40 });
  });
});

describe('getPlotRowLayout', () => {
  it('uses 44px for all header kinds and 32px for events with cumulative offsets', () => {
    expect(getPlotRowLayout(plotRows)).toEqual({
      rows: [
        { top: 0, height: 44 },
        { top: 44, height: 44 },
        { top: 88, height: 32 },
        { top: 120, height: 44 },
        { top: 164, height: 32 },
      ],
      height: 196,
    });
    expect(plotRows.map((row) => row.kind)).toEqual([
      'workflow',
      'execution',
      'event',
      'child',
      'event',
    ]);
  });

  it('returns zero height and no rows for an empty plot', () => {
    expect(getPlotRowLayout([])).toEqual({ rows: [], height: 0 });
  });
});

describe('getVisiblePlotRowRange', () => {
  it.each([
    [0, 44, 0, 1],
    [44, 88, 1, 2],
    [88, 120, 2, 3],
    [120, 164, 3, 4],
    [164, 196, 4, 5],
    [43, 89, 0, 3],
    [119, 165, 2, 5],
    [-10, 1, 0, 1],
    [195, 250, 4, 5],
    [-50, 0, 0, 0],
    [196, 250, 5, 5],
    [-50, 250, 0, 5],
  ])(
    'slices viewport [%s, %s) at actual row boundaries',
    (start, end, firstIndex, lastIndex) => {
      expect(getVisiblePlotRowRange(layoutRows, start, end, 0)).toEqual({
        firstIndex,
        lastIndex,
      });
      expect(plotRows.slice(firstIndex, lastIndex)).toHaveLength(
        lastIndex - firstIndex,
      );
    },
  );

  it('adds row-count overscan and clamps to the plot edges', () => {
    expect(getVisiblePlotRowRange(layoutRows, 88, 120, 1)).toEqual({
      firstIndex: 1,
      lastIndex: 4,
    });
    expect(getVisiblePlotRowRange(layoutRows, 88, 120, 100)).toEqual({
      firstIndex: 0,
      lastIndex: 5,
    });
    expect(getVisiblePlotRowRange(layoutRows, -50, 0, 1)).toEqual({
      firstIndex: 0,
      lastIndex: 1,
    });
    expect(getVisiblePlotRowRange(layoutRows, 196, 250, 1)).toEqual({
      firstIndex: 4,
      lastIndex: 5,
    });
  });

  it.each([-1, NaN, Infinity])(
    'treats invalid overscan %s as zero',
    (overscan) => {
      expect(getVisiblePlotRowRange(layoutRows, 88, 120, overscan)).toEqual({
        firstIndex: 2,
        lastIndex: 3,
      });
    },
  );

  it('rounds fractional overscan down to whole rows', () => {
    expect(getVisiblePlotRowRange(layoutRows, 88, 120, 1.9)).toEqual({
      firstIndex: 1,
      lastIndex: 4,
    });
  });

  it.each([
    [44, 44],
    [88, 44],
    [NaN, 100],
    [0, Infinity],
  ])('returns an empty slice for invalid viewport [%s, %s)', (start, end) => {
    expect(getVisiblePlotRowRange(layoutRows, start, end, 2)).toEqual({
      firstIndex: 0,
      lastIndex: 0,
    });
  });

  it('handles an empty layout', () => {
    expect(getVisiblePlotRowRange([], 0, 100, 10)).toEqual({
      firstIndex: 0,
      lastIndex: 0,
    });
  });

  it('locates a narrow viewport near the end of a large layout', () => {
    const largeLayout = Array.from({ length: 10000 }, (_, index) => ({
      top: Math.floor(index / 2) * 76 + (index % 2) * 44,
      height: index % 2 === 0 ? 44 : 32,
    }));
    expect(getVisiblePlotRowRange(largeLayout, 379968, 380000, 2)).toEqual({
      firstIndex: 9997,
      lastIndex: 10000,
    });
  });
});
