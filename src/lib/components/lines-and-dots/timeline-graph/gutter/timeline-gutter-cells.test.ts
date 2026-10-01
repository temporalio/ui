import { describe, expect, it } from 'vitest';

import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { TimelineRun } from '$lib/services/chain-workflow-session';
import type { WorkflowExecution } from '$lib/types/workflows';

import type {
  TimelineChildEdge,
  TimelineWorkflowNode,
} from '../recursive-timeline-model';
import type { TimelineLayoutRow } from '../timeline-containment-layout';
import type { TimelineGroupEntry } from '../timeline-run-entries';
import {
  gutterAncestorRunLevels,
  gutterRunOrdinals,
  gutterSubtreeRange,
  gutterTreeLines,
  gutterWorkflowSummaries,
  type GutterWorkflowSummary,
  toGutterCell,
} from './timeline-gutter-cells';

const summary = (
  overrides: Partial<GutterWorkflowSummary> = {},
): Map<string, GutterWorkflowSummary> =>
  new Map([
    [
      'wf',
      {
        namespace: 'default',
        workflowId: 'order-123',
        workflowType: 'OrderWorkflow',
        status: 'Completed' as const,
        runCount: 1,
        expanded: true,
        ...overrides,
      },
    ],
  ]);

const entry = (group: Partial<EventGroup>): TimelineGroupEntry =>
  ({
    runId: 'run-1',
    timelineKey: 'run-1:1',
    group: group as EventGroup,
    active: false,
    runEndTimeMs: 100,
  }) as TimelineGroupEntry;

describe('toGutterCell', () => {
  it('names a workflow header by its id and type', () => {
    const row = {
      kind: 'workflow-header',
      key: 'wf:header',
      workflowKey: 'wf',
      depth: 1,
      ancestorRunKeys: [],
      rowIndex: 0,
    } as TimelineLayoutRow;

    expect(toGutterCell(row, { workflows: summary() })).toMatchObject({
      kind: 'workflow',
      label: 'OrderWorkflow',
      detail: 'order-123',
      depth: 1,
    });
  });

  it('leaves the type off when it is unknown', () => {
    const row = {
      kind: 'workflow-header',
      key: 'wf:header',
      workflowKey: 'wf',
      depth: 0,
      ancestorRunKeys: [],
      rowIndex: 0,
    } as TimelineLayoutRow;

    expect(
      toGutterCell(row, { workflows: summary({ workflowType: '' }) }),
    ).toMatchObject({ label: 'order-123', detail: undefined });
  });

  it('carries the incoming edge so the row can fold its own subtree', () => {
    const row = {
      kind: 'workflow-header',
      key: 'wf:header',
      workflowKey: 'wf',
      depth: 1,
      ancestorRunKeys: [],
      rowIndex: 0,
    } as TimelineLayoutRow;

    const cell = toGutterCell(row, {
      workflows: summary({ incomingEdgeKey: 'edge:1', expanded: false }),
    });

    expect(cell).toMatchObject({ toggleEdgeKey: 'edge:1', expanded: false });
  });

  it('lets a run row fold by its run key', () => {
    const row = {
      kind: 'frame-header',
      key: 'wf:run-1:frame-header',
      workflowKey: 'wf',
      runKey: 'wf:run:run-1',
      runId: 'run-1',
      depth: 0,
      ancestorRunKeys: [],
      rowIndex: 0,
    } as TimelineLayoutRow;

    const cell = toGutterCell(row, { workflows: summary({ runCount: 3 }) });

    expect(cell).toMatchObject({
      kind: 'run',
      toggleRunKey: 'wf:run:run-1',
      expanded: true,
    });
    // A run folds by run, never by a child edge.
    expect(cell?.toggleEdgeKey).toBeUndefined();
  });

  it('marks a folded run collapsed', () => {
    const row = {
      kind: 'frame-header',
      key: 'wf:run-1:frame-header',
      workflowKey: 'wf',
      runKey: 'wf:run:run-1',
      runId: 'run-1',
      depth: 0,
      ancestorRunKeys: [],
      rowIndex: 0,
    } as TimelineLayoutRow;

    expect(
      toGutterCell(row, {
        workflows: summary({ runCount: 3 }),
        collapsedRunKeys: new Set(['wf:run:run-1']),
      }),
    ).toMatchObject({ expanded: false });
  });

  it('hides the run row of a single-run workflow', () => {
    const row = {
      kind: 'frame-header',
      key: 'wf:run-1:frame-header',
      workflowKey: 'wf',
      runKey: 'wf:run:run-1',
      runId: 'run-1',
      depth: 0,
      ancestorRunKeys: [],
      rowIndex: 0,
    } as TimelineLayoutRow;

    expect(toGutterCell(row, { workflows: summary() })).toBeNull();
  });

  it('numbers the run rows of a workflow that restarted', () => {
    const row = {
      kind: 'frame-header',
      key: 'wf:run-2:frame-header',
      workflowKey: 'wf',
      runKey: 'wf:run:run-2',
      runId: 'run-2',
      depth: 0,
      ancestorRunKeys: [],
      rowIndex: 0,
    } as TimelineLayoutRow;

    const cell = toGutterCell(row, {
      workflows: summary({ runCount: 3 }),
      runOrdinals: new Map([['wf:run:run-2', { index: 2, total: 3 }]]),
    });

    expect(cell).toMatchObject({
      kind: 'run',
      label: 'Run 2 of 3',
      detail: 'run-2',
    });
  });

  it('indents an event under its workflow', () => {
    const row = {
      kind: 'group',
      key: 'group:1',
      entry: entry({ displayName: 'ChargeCard' }),
      workflowKey: 'wf',
      runKey: 'wf:run:run-1',
      depth: 1,
      ancestorRunKeys: [],
      rowIndex: 0,
    } as TimelineLayoutRow;

    expect(toGutterCell(row, { workflows: summary() })).toMatchObject({
      kind: 'event',
      label: 'ChargeCard',
      depth: 2,
    });
  });

  it('indents an event one level further when its workflow shows run rows', () => {
    const row = {
      kind: 'group',
      key: 'group:1',
      entry: entry({ displayName: 'ChargeCard' }),
      workflowKey: 'wf',
      runKey: 'wf:run:run-1',
      depth: 1,
      ancestorRunKeys: [],
      rowIndex: 0,
    } as TimelineLayoutRow;

    expect(
      toGutterCell(row, { workflows: summary({ runCount: 3 }) }),
    ).toMatchObject({ depth: 3 });
  });

  it('puts the toggle on the event that started a child workflow', () => {
    const childEdge = {
      key: 'edge:child',
      expansion: 'collapsed',
    } as TimelineChildEdge;
    const row = {
      kind: 'group',
      key: 'group:1',
      entry: entry({ displayName: 'StartChild' }),
      workflowKey: 'wf',
      runKey: 'wf:run:run-1',
      depth: 1,
      ancestorRunKeys: [],
      rowIndex: 0,
      childEdge,
    } as TimelineLayoutRow;

    expect(toGutterCell(row, { workflows: summary() })).toMatchObject({
      toggleEdgeKey: 'edge:child',
      expanded: false,
    });
  });

  it('falls back through the group name fields', () => {
    const row = {
      kind: 'group',
      key: 'group:1',
      entry: entry({ name: 'FallbackName' }),
      workflowKey: 'wf',
      runKey: 'wf:run:run-1',
      depth: 0,
      ancestorRunKeys: [],
      rowIndex: 0,
    } as TimelineLayoutRow;

    expect(toGutterCell(row, { workflows: summary() })?.label).toBe(
      'FallbackName',
    );
  });

  it('draws nothing for a spacing row', () => {
    const row = {
      kind: 'workflow-spacing',
      key: 'spacing',
      workflowKey: 'wf',
      depth: 0,
      ancestorRunKeys: [],
      rowIndex: 0,
    } as TimelineLayoutRow;

    expect(toGutterCell(row, { workflows: summary() })).toBeNull();
  });

  it('draws nothing for a workflow it has no summary for', () => {
    const row = {
      kind: 'workflow-header',
      key: 'missing:header',
      workflowKey: 'missing',
      depth: 0,
      ancestorRunKeys: [],
      rowIndex: 0,
    } as TimelineLayoutRow;

    expect(toGutterCell(row, { workflows: summary() })).toBeNull();
  });
});

const node = (
  key: string,
  runs: Pick<TimelineRun, 'runId' | 'startTimeMs'>[],
): TimelineWorkflowNode =>
  ({
    key,
    namespace: 'default',
    workflowId: key,
    firstRunId: runs[0]?.runId ?? '',
    workflow: {
      id: key,
      name: `${key}Type`,
      status: 'Completed',
    } as WorkflowExecution,
    runs: runs as TimelineRun[],
    childrenByGroupKey: new Map(),
    depth: 0,
  }) as TimelineWorkflowNode;

describe('gutterWorkflowSummaries', () => {
  it('reads identity and expansion off the tree', () => {
    const summaries = gutterWorkflowSummaries(
      [node('a', [{ runId: 'r1', startTimeMs: 0 }])],
      new Map([['a', { key: 'edge:a', expansion: 'collapsed' as const }]]),
    );

    expect(summaries.get('a')).toEqual({
      namespace: 'default',
      workflowId: 'a',
      workflowType: 'aType',
      status: 'Completed',
      runCount: 1,
      incomingEdgeKey: 'edge:a',
      expanded: false,
    });
  });

  it('treats a workflow with no incoming edge as expanded', () => {
    const summaries = gutterWorkflowSummaries(
      [node('root', [{ runId: 'r1', startTimeMs: 0 }])],
      new Map(),
    );

    expect(summaries.get('root')).toMatchObject({
      expanded: true,
      incomingEdgeKey: undefined,
    });
  });
});

describe('gutterAncestorRunLevels', () => {
  const withChild = (
    parent: TimelineWorkflowNode,
    child: TimelineWorkflowNode,
  ): TimelineWorkflowNode => {
    parent.childrenByGroupKey.set(`${child.key}:start`, {
      key: `edge:${child.key}`,
      load: { state: 'loaded', node: child },
    } as unknown as TimelineChildEdge);
    return parent;
  };

  it('lifts everything under a workflow that ran more than once', () => {
    const grandchild = node('grandchild', [{ runId: 'g1', startTimeMs: 0 }]);
    const child = withChild(
      node('child', [{ runId: 'c1', startTimeMs: 0 }]),
      grandchild,
    );
    const root = withChild(
      node('root', [
        { runId: 'r1', startTimeMs: 0 },
        { runId: 'r2', startTimeMs: 10 },
        { runId: 'r3', startTimeMs: 20 },
      ]),
      child,
    );

    const levels = gutterAncestorRunLevels(root);

    expect(levels.get('root')).toBe(0);
    // The root's run rows sit between it and the child it started.
    expect(levels.get('child')).toBe(1);
    // A single-run child adds nothing of its own, but passes the root's on.
    expect(levels.get('grandchild')).toBe(1);
  });

  it('accumulates one level per multi-run ancestor', () => {
    const grandchild = node('grandchild', [{ runId: 'g1', startTimeMs: 0 }]);
    const child = withChild(
      node('child', [
        { runId: 'c1', startTimeMs: 0 },
        { runId: 'c2', startTimeMs: 10 },
      ]),
      grandchild,
    );
    const root = withChild(
      node('root', [
        { runId: 'r1', startTimeMs: 0 },
        { runId: 'r2', startTimeMs: 10 },
      ]),
      child,
    );

    expect(gutterAncestorRunLevels(root).get('grandchild')).toBe(2);
  });

  it('adds nothing when no ancestor restarted', () => {
    const child = node('child', [{ runId: 'c1', startTimeMs: 0 }]);
    const root = withChild(
      node('root', [{ runId: 'r1', startTimeMs: 0 }]),
      child,
    );

    expect(gutterAncestorRunLevels(root).get('child')).toBe(0);
  });
});

describe('toGutterCell under a multi-run ancestor', () => {
  // A child workflow (depth 1) started from a root that ran three times. The
  // row that started it sits at 0 + 2 (under the root's run row), so the
  // child's own events must land one level below that, at 3.
  const workflows = new Map([...summary({ runCount: 3 }).entries()]).set(
    'child',
    {
      namespace: 'default',
      workflowId: 'child-1',
      workflowType: 'ChildWorkflow',
      status: 'Completed',
      runCount: 1,
      expanded: true,
    },
  );
  const ancestorRunLevels = new Map([
    ['wf', 0],
    ['child', 1],
  ]);

  it('nests the child workflow events under the row that started them', () => {
    const startedFrom = toGutterCell(
      {
        kind: 'group',
        key: 'wf:start-child',
        entry: entry({ displayName: 'ChildWorkflow' }),
        workflowKey: 'wf',
        runKey: 'wf:run:run-1',
        depth: 0,
        ancestorRunKeys: [],
        rowIndex: 0,
      } as TimelineLayoutRow,
      { workflows, ancestorRunLevels },
    );
    const childEvent = toGutterCell(
      {
        kind: 'group',
        key: 'child:activity',
        entry: entry({ displayName: 'chargeCard' }),
        workflowKey: 'child',
        runKey: 'child:run:c1',
        depth: 1,
        ancestorRunKeys: [],
        rowIndex: 1,
      } as TimelineLayoutRow,
      { workflows, ancestorRunLevels },
    );

    expect(startedFrom?.depth).toBe(2);
    expect(childEvent?.depth).toBe(3);
  });

  it('hangs a child placeholder one level under the row that started it', () => {
    const placeholder = toGutterCell(
      {
        kind: 'child-state',
        key: 'edge:child:state',
        edge: {
          key: 'edge:child',
          expansion: 'expanded',
          reference: { workflowId: 'child-1' },
        } as TimelineChildEdge,
        workflowKey: 'wf',
        runKey: 'wf:run:run-1',
        runId: 'run-1',
        depth: 1,
        ancestorRunKeys: [],
        rowIndex: 1,
      } as TimelineLayoutRow,
      { workflows, ancestorRunLevels },
    );

    // The row that started the child sits at 2 (see above).
    expect(placeholder?.depth).toBe(3);
  });
});

describe('gutterRunOrdinals', () => {
  it('numbers runs in start order', () => {
    const ordinals = gutterRunOrdinals(
      [
        node('a', [
          { runId: 'second', startTimeMs: 50 },
          { runId: 'first', startTimeMs: 10 },
        ]),
      ],
      (workflowKey, runId) => `${workflowKey}:${runId}`,
    );

    expect(ordinals.get('a:first')).toEqual({ index: 1, total: 2 });
    expect(ordinals.get('a:second')).toEqual({ index: 2, total: 2 });
  });
});

describe('gutterTreeLines', () => {
  it('marks a root row as having no elbow', () => {
    expect(gutterTreeLines([0])).toEqual([
      { guides: [], elbowLevel: null, lastChild: true, childCount: 0 },
    ]);
  });

  it('hangs each child off the level above it', () => {
    const lines = gutterTreeLines([0, 1, 1]);

    expect(lines[1]).toMatchObject({ elbowLevel: 0, lastChild: false });
    expect(lines[2]).toMatchObject({ elbowLevel: 0, lastChild: true });
  });

  it('keeps an ancestor vertical running while it still has children below', () => {
    //  0
    //  └ 1        <- has a later sibling at level 1, so level 0..1 continue
    //    └ 2
    //  └ 1
    const lines = gutterTreeLines([0, 1, 2, 1]);

    // Rail 0 joins the depth-1 rows, and one of them still follows.
    expect(lines[2].guides).toEqual([0]);
    expect(lines[3]).toMatchObject({ guides: [], lastChild: true });
  });

  it('stops an ancestor vertical once its subtree ends', () => {
    //  0
    //  └ 1
    //    └ 2      <- last of everything: nothing continues
    const lines = gutterTreeLines([0, 1, 2]);

    expect(lines[2]).toEqual({
      guides: [],
      elbowLevel: 1,
      lastChild: true,
      childCount: 0,
    });
  });

  it('does not treat a deeper row as a sibling of a shallower one', () => {
    const lines = gutterTreeLines([1, 2, 1]);

    expect(lines[0].lastChild).toBe(false);
    expect(lines[1].lastChild).toBe(true);
    expect(lines[2].lastChild).toBe(true);
  });

  it('handles an empty list', () => {
    expect(gutterTreeLines([])).toEqual([]);
  });
});

describe('gutterTreeLines child counts', () => {
  it('counts only direct children', () => {
    //  0
    //  ├ 1
    //  │ └ 2
    //  └ 1
    const lines = gutterTreeLines([0, 1, 2, 1]);

    expect(lines[0].childCount).toBe(2);
    expect(lines[1].childCount).toBe(1);
    expect(lines[2].childCount).toBe(0);
  });

  it('stops counting when the subtree ends', () => {
    const lines = gutterTreeLines([0, 1, 1, 0, 1]);

    expect(lines[0].childCount).toBe(2);
    expect(lines[3].childCount).toBe(1);
  });

  it('gives a leaf no children', () => {
    expect(gutterTreeLines([0, 1])[1].childCount).toBe(0);
  });
});

describe('child workflow event rows', () => {
  const childGroupRow = (group: Partial<EventGroup>): TimelineLayoutRow =>
    ({
      kind: 'group',
      key: 'group:child',
      entry: entry(group),
      workflowKey: 'wf',
      runKey: 'wf:run:run-1',
      depth: 0,
      ancestorRunKeys: [],
      rowIndex: 0,
    }) as TimelineLayoutRow;

  it('names the child by its type with the id trailing', () => {
    const row = childGroupRow({
      displayName: 'ShipmentWorkflow',
      childWorkflow: { workflowId: 'shipment-order-1', runId: 'r' },
    } as Partial<EventGroup>);

    expect(toGutterCell(row, { workflows: summary() })).toMatchObject({
      label: 'ShipmentWorkflow',
      detail: 'shipment-order-1',
    });
  });

  it('leaves a plain activity row alone', () => {
    const row = childGroupRow({ displayName: 'validateOrder' });

    expect(toGutterCell(row, { workflows: summary() })).toMatchObject({
      label: 'validateOrder',
      detail: undefined,
    });
  });
});

describe('gutterSubtreeRange', () => {
  it('covers a row and everything nested under it', () => {
    //  0
    //  ├ 1
    //  │ └ 2
    //  └ 1
    expect(gutterSubtreeRange([0, 1, 2, 1], 1)).toEqual({ start: 1, end: 3 });
  });

  it('stops at the next row of the same depth', () => {
    expect(gutterSubtreeRange([0, 1, 1, 1], 1)).toEqual({ start: 1, end: 2 });
  });

  it('covers everything from the root', () => {
    expect(gutterSubtreeRange([0, 1, 2, 1], 0)).toEqual({ start: 0, end: 4 });
  });

  it('gives a leaf just itself', () => {
    expect(gutterSubtreeRange([0, 1, 2, 1], 2)).toEqual({ start: 2, end: 3 });
  });

  it('does not run past a dedent', () => {
    expect(gutterSubtreeRange([0, 1, 2, 0], 1)).toEqual({ start: 1, end: 3 });
  });

  it('returns nothing for an index outside the list', () => {
    expect(gutterSubtreeRange([0, 1], 5)).toBeNull();
    expect(gutterSubtreeRange([], 0)).toBeNull();
  });
});

describe('gutterTreeLines rail continuity', () => {
  it('keeps an ancestor rail unbroken through deeper rows', () => {
    //  0
    //  ├ 1        <- has a later sibling, so rail 0 must run through its subtree
    //  │ ├ 2
    //  │ │ └ 3
    //  │ └ 2
    //  └ 1
    const lines = gutterTreeLines([0, 1, 2, 3, 2, 1]);

    expect(lines[2].guides).toContain(0);
    expect(lines[3].guides).toContain(0);
    expect(lines[4].guides).toContain(0);
  });

  it('drops the rail once that generation is done', () => {
    //  0
    //  └ 1        <- last at depth 1, so rail 0 stops
    //    └ 2
    const lines = gutterTreeLines([0, 1, 2]);

    expect(lines[2].guides).not.toContain(0);
  });

  it('never emits a rail at the row own connector position', () => {
    const lines = gutterTreeLines([0, 1, 2, 1]);

    for (const [index, line] of lines.entries()) {
      expect(line.guides).not.toContain([0, 1, 2, 1][index] - 1);
    }
  });
});
