import { describe, expect, it } from 'vitest';

import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { TimelineRun } from '$lib/services/chain-workflow-session';
import type { WorkflowExecution } from '$lib/types/workflows';

import {
  type TimelineChildEdge,
  timelineRunKey,
  type TimelineWorkflowNode,
} from './recursive-timeline-model';
import {
  getObservedTimelineEdgeKeys,
  getRecursiveTimelineContainmentLayout,
  type TimelineContainmentLayout,
} from './timeline-containment-layout';
import type { TimelineGroupEntry } from './timeline-run-entries';

const entry = (runId: string, id: number): TimelineGroupEntry => ({
  runId,
  timelineKey: `${runId}:${id}`,
  group: {
    id: String(id),
    initialEvent: { id: String(id) },
  } as EventGroup,
  active: runId === 'active',
  runEndTimeMs: 100,
});

const run = (
  runId: string,
  startTimeMs: number,
  active = false,
): TimelineRun => ({
  runId,
  startTimeMs,
  endTimeMs: startTimeMs + 10,
  status: active ? 'Running' : 'Completed',
  active,
  groups: [],
});

const allRows = (layout: TimelineContainmentLayout) =>
  layout.rows(0, layout.rowCount);

describe('getRecursiveTimelineContainmentLayout', () => {
  it('preserves closed-run metadata for unfiltered child rows', () => {
    const relationship = entry('retained', 1);
    delete (relationship as Partial<TimelineGroupEntry>).active;
    delete (relationship as Partial<TimelineGroupEntry>).runEndTimeMs;
    const retainedRun = {
      ...run('retained', 10, false),
      groups: [relationship],
    };
    const root = {
      key: 'root',
      namespace: 'default',
      workflowId: 'root',
      firstRunId: 'retained',
      workflow: { id: 'root' } as WorkflowExecution,
      runs: [retainedRun],
      childrenByGroupKey: new Map(),
      depth: 0,
    } as TimelineWorkflowNode;

    const row = getRecursiveTimelineContainmentLayout({
      root,
      visibleEntries: null,
      participatingRunKeys: new Set([timelineRunKey('root', 'retained')]),
      reverseSort: false,
      pendingGroupCount: 0,
      descMinId: 0,
    })
      .rows(0, 3)
      .find((candidate) => candidate.kind === 'group');

    expect(row).toMatchObject({
      kind: 'group',
      entry: { active: false, runEndTimeMs: 20 },
    });
  });

  it('addresses a large run without materializing its complete row list', () => {
    const entries = Array.from({ length: 100_000 }, (_, index) =>
      entry('large-run', index + 1),
    );
    const root = {
      key: 'root',
      namespace: 'default',
      workflowId: 'root',
      firstRunId: 'large-run',
      workflow: { id: 'root' } as WorkflowExecution,
      runs: [{ ...run('large-run', 0), groups: entries }],
      childrenByGroupKey: new Map(),
      depth: 0,
    } as TimelineWorkflowNode;
    const layout = getRecursiveTimelineContainmentLayout({
      root,
      visibleEntries: null,
      participatingRunKeys: new Set([timelineRunKey('root', 'large-run')]),
      reverseSort: false,
      pendingGroupCount: 0,
      descMinId: 0,
    });

    expect(layout.rowCount).toBe(100_002);
    expect(layout.rows(50_000, 50_008)).toHaveLength(8);
    expect(layout.rowAt(100_001)).toMatchObject({
      kind: 'group',
      entry: { timelineKey: 'large-run:100000' },
    });
    expect(layout.indexOfGroup('large-run:75000')).toBe(75_001);
  });

  it('places consecutive run spans on one shared boundary', () => {
    const firstEntry = entry('first', 1);
    const secondEntry = entry('second', 2);
    const root = {
      key: 'root',
      namespace: 'default',
      workflowId: 'root',
      firstRunId: 'first',
      workflow: { id: 'root' } as WorkflowExecution,
      runs: [
        { ...run('first', 0), groups: [firstEntry] },
        { ...run('second', 20), groups: [secondEntry] },
      ],
      childrenByGroupKey: new Map(),
      depth: 0,
    } as TimelineWorkflowNode;

    const layout = getRecursiveTimelineContainmentLayout({
      root,
      visibleEntries: [firstEntry, secondEntry],
      participatingRunKeys: new Set([
        timelineRunKey('root', 'first'),
        timelineRunKey('root', 'second'),
      ]),
      reverseSort: false,
      pendingGroupCount: 0,
      descMinId: 0,
    });

    const spans = layout.runSpans();
    expect(spans[0].rowEnd).toBe(spans[1].rowStart);
  });

  it('flattens child and grandchild blocks while enclosing them in ancestor spans', () => {
    const rootRelationship = entry('root-run', 1);
    const rootAction = entry('root-run', 2);
    const childAction = entry('child-run', 1);
    const childNode: TimelineWorkflowNode = {
      key: 'child',
      namespace: 'default',
      workflowId: 'child',
      firstRunId: 'child-run',
      workflow: { id: 'child' } as WorkflowExecution,
      runs: [
        {
          ...run('child-run', 2),
          groups: [childAction],
        },
      ],
      childrenByGroupKey: new Map(),
      depth: 1,
    };
    const edge: TimelineChildEdge = {
      key: 'root-edge',
      parentGroupKey: rootRelationship.timelineKey,
      reference: {
        namespace: 'default',
        workflowId: 'child',
        runId: 'child-run',
      },
      expansion: 'expanded',
      load: { state: 'loaded', node: childNode },
      depth: 1,
      lastVisibleAt: 0,
    };
    const root: TimelineWorkflowNode = {
      key: 'root',
      namespace: 'default',
      workflowId: 'root',
      firstRunId: 'root-run',
      workflow: { id: 'root' } as WorkflowExecution,
      runs: [
        {
          ...run('root-run', 0),
          groups: [rootRelationship, rootAction],
        },
      ],
      childrenByGroupKey: new Map([[rootRelationship.timelineKey, edge]]),
      depth: 0,
    };

    const layout = getRecursiveTimelineContainmentLayout({
      root,
      visibleEntries: [rootRelationship, rootAction, childAction],
      participatingRunKeys: new Set([
        timelineRunKey('root', 'root-run'),
        timelineRunKey('child', 'child-run'),
      ]),
      reverseSort: false,
      pendingGroupCount: 0,
      descMinId: 0,
    });

    const rows = allRows(layout);
    expect(rows.map((row) => row.key)).toEqual([
      expect.stringContaining('workflow-header'),
      expect.stringContaining('frame-header'),
      'root-edge',
      expect.stringContaining('frame-header'),
      expect.stringContaining('child'),
      expect.stringContaining('workflow-spacing-after'),
      expect.stringContaining('workflow-spacing-after-padding'),
      expect.stringContaining('root'),
    ]);
    expect(layout.runSpans()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: timelineRunKey('root', 'root-run'),
          rowStart: 1,
          rowEnd: 8,
        }),
        expect.objectContaining({
          key: timelineRunKey('child', 'child-run'),
          rowStart: 3,
          rowEnd: 5,
        }),
      ]),
    );
    const childSpan = layout
      .workflowSpans()
      .find((span) => span.workflowKey === 'child');
    const trailingSpacing = rows.find((row) =>
      row.key.endsWith('workflow-spacing-after'),
    );
    const trailingPadding = rows.find((row) =>
      row.key.endsWith('workflow-spacing-after-padding'),
    );
    const followingParentRow = rows.find(
      (row) =>
        row.kind === 'group' &&
        row.entry.timelineKey === rootAction.timelineKey,
    );
    expect(childSpan).toMatchObject({
      rowStart: 2,
      headerKey: 'root-edge',
      headerKind: 'relationship',
    });
    edge.expansion = 'collapsed';
    const collapsedLayout = getRecursiveTimelineContainmentLayout({
      root,
      visibleEntries: [rootRelationship, rootAction, childAction],
      participatingRunKeys: new Set([
        timelineRunKey('root', 'root-run'),
        timelineRunKey('child', 'child-run'),
      ]),
      reverseSort: false,
      pendingGroupCount: 0,
      descMinId: 0,
    });
    expect(
      collapsedLayout.rows(0, collapsedLayout.rowCount).find((row) => {
        return row.key === 'root-edge';
      })?.rowIndex,
    ).toBe(childSpan?.rowStart);
    expect(trailingSpacing?.rowIndex).toBe(childSpan?.rowEnd);
    expect(trailingPadding?.rowIndex).toBe(
      (trailingSpacing?.rowIndex ?? 0) + 1,
    );
    expect(followingParentRow?.rowIndex).toBe(
      (trailingPadding?.rowIndex ?? 0) + 1,
    );
    const visibleChildRow = rows.find(
      (row) =>
        row.kind === 'group' &&
        row.entry.timelineKey === childAction.timelineKey,
    );
    expect(
      getObservedTimelineEdgeKeys(
        visibleChildRow ? [visibleChildRow] : [],
        new Map([['child', edge]]),
      ),
    ).toEqual(new Set(['root-edge']));
  });

  it('omits a relationship row when its event is filtered out', () => {
    const relationship = entry('root-run', 1);
    const edge = {
      key: 'stable-edge',
      parentGroupKey: relationship.timelineKey,
      reference: { namespace: 'default', workflowId: 'child', runId: 'run' },
      expansion: 'expanded',
      load: { state: 'idle' },
      depth: 1,
      lastVisibleAt: 0,
    } as TimelineChildEdge;
    const root = {
      key: 'root',
      namespace: 'default',
      workflowId: 'root',
      firstRunId: 'root-run',
      workflow: { id: 'root' } as WorkflowExecution,
      runs: [{ ...run('root-run', 0), groups: [relationship] }],
      childrenByGroupKey: new Map([[relationship.timelineKey, edge]]),
      depth: 0,
    } as TimelineWorkflowNode;
    const input = {
      root,
      participatingRunKeys: new Set([timelineRunKey('root', 'root-run')]),
      reverseSort: false,
      pendingGroupCount: 0,
      descMinId: 0,
    };

    const shown = getRecursiveTimelineContainmentLayout({
      ...input,
      visibleEntries: [relationship],
    });
    const filtered = getRecursiveTimelineContainmentLayout({
      ...input,
      visibleEntries: [],
    });

    expect(
      allRows(shown).find((row) => row.key === 'stable-edge'),
    ).toMatchObject({
      kind: 'group',
      key: 'stable-edge',
    });
    expect(allRows(filtered).some((row) => row.key === 'stable-edge')).toBe(
      false,
    );
  });

  it('keeps the relationship layout stable while an expanded child loads', () => {
    const relationship = entry('root-run', 1);
    const edge = {
      key: 'loading-edge',
      parentGroupKey: relationship.timelineKey,
      reference: {
        namespace: 'default',
        workflowId: 'child',
        runId: 'child-run',
      },
      expansion: 'expanded',
      load: { state: 'idle' },
      depth: 1,
      lastVisibleAt: 0,
    } as TimelineChildEdge;
    const root = {
      key: 'root',
      namespace: 'default',
      workflowId: 'root',
      firstRunId: 'root-run',
      workflow: { id: 'root' } as WorkflowExecution,
      runs: [{ ...run('root-run', 0), groups: [relationship] }],
      childrenByGroupKey: new Map([[relationship.timelineKey, edge]]),
      depth: 0,
    } as TimelineWorkflowNode;
    const input = {
      root,
      visibleEntries: [relationship],
      participatingRunKeys: new Set([timelineRunKey('root', 'root-run')]),
      reverseSort: true,
      pendingGroupCount: 0,
      descMinId: 0,
    };
    const idleRows = allRows(getRecursiveTimelineContainmentLayout(input));

    edge.load = { state: 'loading', requestKey: 'child-request' };
    const loadingRows = allRows(getRecursiveTimelineContainmentLayout(input));

    expect(loadingRows.map((row) => row.key)).toEqual(
      idleRows.map((row) => row.key),
    );
    expect(loadingRows.some((row) => row.kind === 'child-state')).toBe(false);
  });

  it.each([
    {
      name: 'before loading',
      load: {
        state: 'truncated',
        truncation: { reason: 'node-limit' },
      } as TimelineChildEdge['load'],
    },
    {
      name: 'after a partial load',
      load: {
        state: 'loaded',
        node: {
          key: 'child',
          namespace: 'default',
          workflowId: 'child',
          firstRunId: 'child-run',
          workflow: { id: 'child' } as WorkflowExecution,
          runs: [
            {
              ...run('child-run', 2),
              groups: [entry('child-run', 1)],
            },
          ],
          childrenByGroupKey: new Map(),
          depth: 1,
        },
        truncation: { reason: 'event-limit' },
      } as TimelineChildEdge['load'],
    },
  ])(
    'leaves a safety-limited child collapsed $name without a state row',
    ({ load }) => {
      const relationship = entry('root-run', 1);
      const edge = {
        key: 'limited-edge',
        parentGroupKey: relationship.timelineKey,
        reference: {
          namespace: 'default',
          workflowId: 'child',
          runId: 'child-run',
        },
        expansion: 'expanded',
        load,
        depth: 1,
        lastVisibleAt: 0,
      } as TimelineChildEdge;
      const root = {
        key: 'root',
        namespace: 'default',
        workflowId: 'root',
        firstRunId: 'root-run',
        workflow: { id: 'root' } as WorkflowExecution,
        runs: [{ ...run('root-run', 0), groups: [relationship] }],
        childrenByGroupKey: new Map([[relationship.timelineKey, edge]]),
        depth: 0,
      } as TimelineWorkflowNode;

      const rows = allRows(
        getRecursiveTimelineContainmentLayout({
          root,
          visibleEntries: [relationship],
          participatingRunKeys: new Set([
            timelineRunKey('root', 'root-run'),
            timelineRunKey('child', 'child-run'),
          ]),
          reverseSort: false,
          pendingGroupCount: 0,
          descMinId: 0,
        }),
      );
      const relationshipRow = rows.find(
        (row) => row.kind === 'group' && row.key === edge.key,
      );

      expect(relationshipRow).toMatchObject({
        kind: 'group',
        entry: { timelineKey: relationship.timelineKey },
      });
      expect(relationshipRow).toHaveProperty('childEdge', undefined);
      expect(rows.some((row) => row.kind === 'child-state')).toBe(false);
      expect(rows.some((row) => row.workflowKey === 'child')).toBe(false);
    },
  );
});

describe('compactStructuralRows', () => {
  const buildTree = () => {
    const childRun = {
      ...run('child-run', 20),
      groups: [entry('child-run', 5)],
    };
    const child = {
      key: 'child',
      namespace: 'default',
      workflowId: 'child',
      firstRunId: 'child-run',
      workflow: { id: 'child' } as WorkflowExecution,
      runs: [childRun],
      childrenByGroupKey: new Map(),
      depth: 1,
    } as TimelineWorkflowNode;
    const edge = {
      key: 'edge:child',
      parentGroupKey: 'root-run:1',
      reference: {
        namespace: 'default',
        workflowId: 'child',
        runId: 'child-run',
      },
      expansion: 'expanded',
      load: { state: 'loaded', node: child },
      depth: 1,
      lastVisibleAt: 0,
    } as TimelineChildEdge;
    const root = {
      key: 'root',
      namespace: 'default',
      workflowId: 'root',
      firstRunId: 'root-run',
      workflow: { id: 'root' } as WorkflowExecution,
      runs: [{ ...run('root-run', 0), groups: [entry('root-run', 1)] }],
      childrenByGroupKey: new Map([[edge.parentGroupKey, edge]]),
      depth: 0,
    } as TimelineWorkflowNode;
    return {
      root,
      participating: new Set([
        timelineRunKey('root', 'root-run'),
        timelineRunKey('child', 'child-run'),
      ]),
    };
  };

  const layoutFor = (compactStructuralRows: boolean) => {
    const { root, participating } = buildTree();
    return getRecursiveTimelineContainmentLayout({
      root,
      visibleEntries: null,
      participatingRunKeys: participating,
      reverseSort: false,
      pendingGroupCount: 0,
      descMinId: 0,
      compactStructuralRows,
    });
  };

  it('keeps frame and spacing rows by default', () => {
    const kinds = allRows(layoutFor(false)).map((row) => row.kind);

    expect(kinds).toContain('frame-header');
    expect(kinds).toContain('workflow-spacing');
  });

  it('drops the spacing and single-run header rows when compacting', () => {
    const kinds = allRows(layoutFor(true)).map((row) => row.kind);

    expect(kinds).not.toContain('workflow-spacing');
    expect(kinds).not.toContain('frame-header');
  });

  it('keeps every group row when compacting', () => {
    const groups = (compact: boolean) =>
      allRows(layoutFor(compact)).filter((row) => row.kind === 'group').length;

    expect(groups(true)).toBe(groups(false));
  });

  it('emits fewer rows overall when compacting', () => {
    expect(layoutFor(true).rowCount).toBeLessThan(layoutFor(false).rowCount);
  });
});
