import type { TimelineRun } from '$lib/services/chain-workflow-session';

import {
  getTimelineChildExecution,
  type TimelineChildEdge,
  timelineRunKey,
  type TimelineWorkflowNode,
  workflowGroupKey,
} from './recursive-timeline-model';
import { TimelineVisibilityBitset } from './timeline-interval-index';
import {
  getTimelineGroupEntry,
  type TimelineGroupEntry,
} from './timeline-run-entries';

export type TimelineLayoutRow =
  | {
      kind: 'group';
      key: string;
      entry: TimelineGroupEntry;
      rowIndex: number;
      workflowKey: string;
      runKey: string;
      depth: number;
      ancestorRunKeys: string[];
      childEdge?: TimelineChildEdge;
    }
  | {
      kind: 'child-state';
      key: string;
      edge: TimelineChildEdge;
      workflowKey: string;
      runKey: string;
      runId: string;
      depth: number;
      ancestorRunKeys: string[];
      rowIndex: number;
    }
  | {
      kind: 'frame-header';
      key: string;
      workflowKey: string;
      runKey: string;
      runId: string;
      depth: number;
      ancestorRunKeys: string[];
      rowIndex: number;
    }
  | {
      kind: 'workflow-header';
      key: string;
      workflowKey: string;
      depth: number;
      ancestorRunKeys: string[];
      rowIndex: number;
    }
  | {
      kind: 'workflow-spacing';
      key: string;
      workflowKey: string;
      depth: number;
      ancestorRunKeys: string[];
      rowIndex: number;
    }
  | {
      kind: 'empty-run';
      key: string;
      runId: string;
      rowIndex: number;
      workflowKey: string;
      runKey: string;
      depth: number;
      ancestorRunKeys: string[];
    };

export type TimelineRunSpan = {
  runId: string;
  rowStart: number;
  rowEnd: number;
  key: string;
  workflowKey: string;
  depth: number;
  ancestorRunKeys: string[];
  /**
   * Whether the run opens with a row of its own. A compacted single-run
   * workflow has none, so a run container drawn there would have to put its
   * label on the workflow's row.
   */
  headerRow: boolean;
};

export type TimelineWorkflowSpan = {
  key: string;
  workflowKey: string;
  headerKey: string;
  headerKind: 'synthetic' | 'relationship';
  rowStart: number;
  rowEnd: number;
  depth: number;
  ancestorRunKeys: string[];
};

export type LogicalTimelineLayout = {
  rowCount: number;
  totalRowCount: number;
  rowAt(index: number): TimelineLayoutRow | undefined;
  rows(start: number, end: number): TimelineLayoutRow[];
  indexOfGroup(key: string): number | undefined;
  runSpans(start?: number, end?: number): TimelineRunSpan[];
  workflowSpans(start?: number, end?: number): TimelineWorkflowSpan[];
  chainSpan: { rowStart: number; rowEnd: number } | null;
  pendingGap: {
    insertionIndex: number;
    rowStart: number;
    rowCount: number;
  } | null;
};

export type TimelineContainmentLayout = LogicalTimelineLayout;

export type RecursiveContainmentLayoutInput = {
  root: TimelineWorkflowNode;
  /** null means every group in every participating run is visible. */
  visibleEntries: TimelineGroupEntry[] | null;
  participatingRunKeys: ReadonlySet<string>;
  reverseSort: boolean;
  pendingGroupCount: number;
  descMinId: number;
  /**
   * Drops rows that exist only to reserve canvas space for the workflow
   * frames — the spacing below a nested workflow, and the run header of a
   * workflow that only ever had one run. Views that draw nesting beside the
   * plot instead of around it have nothing to put in them.
   */
  compactStructuralRows?: boolean;
  /**
   * Runs whose body is folded away. The run keeps its header row so it can be
   * unfolded again; everything it contained, nested children included, is
   * left out of the layout entirely.
   */
  collapsedRunKeys?: ReadonlySet<string>;
};

export const getObservedTimelineEdgeKeys = (
  rows: Iterable<TimelineLayoutRow>,
  incomingEdgeByWorkflowKey: ReadonlyMap<string, TimelineChildEdge>,
): Set<string> => {
  const keys = new Set<string>();
  for (const row of rows) {
    const incomingEdge = incomingEdgeByWorkflowKey.get(row.workflowKey);
    if (incomingEdge) keys.add(incomingEdge.key);
    if (row.kind === 'group' && row.childEdge) {
      keys.add(row.childEdge.key);
    }
    if (row.kind === 'child-state') keys.add(row.edge.key);
  }
  return keys;
};

type WithoutRowIndex<Row> = Row extends unknown ? Omit<Row, 'rowIndex'> : never;
type RowWithoutIndex = WithoutRowIndex<TimelineLayoutRow>;
type RowSegment = {
  start: number;
  count: number;
  rowAt(localIndex: number): TimelineLayoutRow | undefined;
};
type GroupRowSegment = RowSegment & {
  run: TimelineRun;
  ordinalStart: number;
  ordinalEnd: number;
  reverse: boolean;
  mask: TimelineVisibilityBitset;
};

const eventId = (entry: TimelineGroupEntry): number =>
  Number(entry.group.initialEvent.id);

const intersects = (
  rowStart: number,
  rowEnd: number,
  start = 0,
  end = Number.POSITIVE_INFINITY,
): boolean => rowEnd > start && rowStart < end;

const isSafetyLimited = (edge: TimelineChildEdge): boolean =>
  edge.load.state === 'truncated' ||
  (edge.load.state === 'loaded' && edge.load.truncation !== undefined);

/** Prefix-addressable containment without allocating a row object per group. */
export function getRecursiveTimelineContainmentLayout({
  root,
  visibleEntries,
  participatingRunKeys,
  reverseSort,
  pendingGroupCount,
  descMinId,
  compactStructuralRows = false,
  collapsedRunKeys,
}: RecursiveContainmentLayoutInput): TimelineContainmentLayout {
  const runById = new Map<string, TimelineRun>();
  const collectRuns = (node: TimelineWorkflowNode): void => {
    for (const run of node.runs) runById.set(run.runId, run);
    for (const edge of node.childrenByGroupKey.values()) {
      if (edge.load.state === 'loaded' && !edge.load.truncation) {
        collectRuns(edge.load.node);
      }
    }
  };
  collectRuns(root);

  const visibilityByRunId = new Map<string, TimelineVisibilityBitset>();
  const exceptionalEntryByGroup = new Map<
    TimelineGroupEntry['group'],
    TimelineGroupEntry
  >();
  let hasLegacyEntries = false;
  for (const entry of visibleEntries ?? []) {
    const run = runById.get(entry.runId);
    const ordinal = entry.ordinal;
    const source = ordinal === undefined ? undefined : run?.groups[ordinal];
    if (!run || ordinal === undefined || source?.group !== entry.group) {
      exceptionalEntryByGroup.set(entry.group, entry);
      hasLegacyEntries = true;
      continue;
    }
    let mask = visibilityByRunId.get(entry.runId);
    if (!mask) {
      mask = new TimelineVisibilityBitset(run.groups.length);
      visibilityByRunId.set(entry.runId, mask);
    }
    mask.set(ordinal);
    if (source !== entry) exceptionalEntryByGroup.set(entry.group, entry);
  }
  const segments: RowSegment[] = [];
  const groupSegments: GroupRowSegment[] = [];
  const allRunSpans: TimelineRunSpan[] = [];
  const allWorkflowSpans: TimelineWorkflowSpan[] = [];
  let logicalRowIndex = 0;
  let physicalRowIndex = 0;
  let pendingGap: LogicalTimelineLayout['pendingGap'] = null;

  const appendRow = (row: RowWithoutIndex): void => {
    const start = logicalRowIndex;
    const rowIndex = physicalRowIndex;
    segments.push({
      start,
      count: 1,
      rowAt: (localIndex) =>
        localIndex === 0
          ? ({ ...row, rowIndex } as TimelineLayoutRow)
          : undefined,
    });
    logicalRowIndex += 1;
    physicalRowIndex += 1;
  };

  const appendState = ({
    edge,
    node,
    run,
    runKey,
    ancestorRunKeys,
  }: {
    edge: TimelineChildEdge;
    node: TimelineWorkflowNode;
    run: TimelineRun;
    runKey: string;
    ancestorRunKeys: string[];
  }): void => {
    appendRow({
      kind: 'child-state',
      key: `${edge.key}:state`,
      edge,
      workflowKey: node.key,
      runKey,
      runId: run.runId,
      depth: edge.depth,
      ancestorRunKeys,
    });
  };

  const visitWorkflow = (
    node: TimelineWorkflowNode,
    ancestorRunKeys: string[],
    relationshipHeader?: { key: string; rowIndex: number },
  ): void => {
    const workflowStart = relationshipHeader?.rowIndex ?? physicalRowIndex;
    const headerKey = relationshipHeader?.key ?? `${node.key}:workflow-header`;
    const participatingRuns = node.runs
      .filter((run) =>
        participatingRunKeys.has(timelineRunKey(node.key, run.runId)),
      )
      .sort((a, b) => {
        const ordered =
          a.startTimeMs - b.startTimeMs || a.runId.localeCompare(b.runId);
        return reverseSort ? -ordered : ordered;
      });

    if (participatingRuns.length > 0 && !relationshipHeader) {
      appendRow({
        kind: 'workflow-header',
        key: headerKey,
        workflowKey: node.key,
        depth: node.depth,
        ancestorRunKeys,
      });
    }

    for (const run of participatingRuns) {
      const runKey = timelineRunKey(node.key, run.runId);
      const owners = [...ancestorRunKeys, runKey];
      const runStart = physicalRowIndex;
      const skipRunHeader =
        compactStructuralRows && participatingRuns.length <= 1;
      if (!skipRunHeader) {
        appendRow({
          kind: 'frame-header',
          key: `${runKey}:frame-header`,
          workflowKey: node.key,
          runKey,
          runId: run.runId,
          depth: node.depth,
          ancestorRunKeys,
        });
      }

      // A collapsed run keeps its header and drops its body, so the canvas and
      // the tree stay in step over which rows exist. Without a header there is
      // nothing to unfold it again, so such a run is never collapsed.
      if (!skipRunHeader && collapsedRunKeys?.has(runKey)) {
        allRunSpans.push({
          key: runKey,
          workflowKey: node.key,
          runId: run.runId,
          depth: node.depth,
          ancestorRunKeys,
          rowStart: runStart,
          rowEnd: physicalRowIndex,
          headerRow: true,
        });
        continue;
      }

      const mask =
        visibilityByRunId.get(run.runId) ??
        (visibleEntries === null
          ? TimelineVisibilityBitset.all(run.groups.length)
          : new TimelineVisibilityBitset(run.groups.length));
      if (hasLegacyEntries) {
        for (let ordinal = 0; ordinal < run.groups.length; ordinal += 1) {
          if (exceptionalEntryByGroup.has(run.groups[ordinal].group)) {
            mask.set(ordinal);
          }
        }
      }

      const visibleEntryAt = (
        ordinal: number,
        edge?: TimelineChildEdge,
      ): TimelineGroupEntry | undefined => {
        if (!mask.has(ordinal)) return undefined;
        const timelineGroup = run.groups[ordinal];
        const entry =
          exceptionalEntryByGroup.get(timelineGroup.group) ?? timelineGroup;
        return getTimelineGroupEntry(
          entry,
          run,
          getTimelineChildExecution(edge),
        );
      };

      let appended = false;
      let gapInserted = false;
      const runPendingCount =
        node === root && run.active ? pendingGroupCount : 0;
      const hasCursorGap = runPendingCount > 0 && descMinId > 0;
      let rangeStart = 0;
      let rangeEnd = run.groups.length;

      const appendRange = (ordinalStart: number, ordinalEnd: number): void => {
        const firstRank = mask.rank(ordinalStart);
        const endRank = mask.rank(ordinalEnd);
        const count = endRank - firstRank;
        if (count <= 0) return;
        const start = logicalRowIndex;
        const rowStart = physicalRowIndex;
        const segment: GroupRowSegment = {
          start,
          count,
          run,
          ordinalStart,
          ordinalEnd,
          reverse: reverseSort,
          mask,
          rowAt: (localIndex) => {
            if (localIndex < 0 || localIndex >= count) return undefined;
            const rank = reverseSort
              ? endRank - 1 - localIndex
              : firstRank + localIndex;
            const ordinal = mask.select(rank);
            if (
              ordinal === undefined ||
              ordinal < ordinalStart ||
              ordinal >= ordinalEnd
            ) {
              return undefined;
            }
            const timelineGroup = run.groups[ordinal];
            const edge = node.childrenByGroupKey.get(timelineGroup.timelineKey);
            const entry = visibleEntryAt(ordinal, edge);
            if (!entry) return undefined;
            return {
              kind: 'group',
              key:
                edge?.key ??
                workflowGroupKey({
                  executionKey: node.key,
                  runId: run.runId,
                  timelineKey: entry.timelineKey,
                }),
              entry,
              workflowKey: node.key,
              runKey,
              depth: node.depth,
              ancestorRunKeys: owners,
              childEdge: edge && !isSafetyLimited(edge) ? edge : undefined,
              rowIndex: rowStart + localIndex,
            };
          },
        };
        segments.push(segment);
        groupSegments.push(segment);
        logicalRowIndex += count;
        physicalRowIndex += count;
        appended = true;
      };

      const flushBefore = (ordinal: number): void => {
        if (reverseSort) {
          appendRange(ordinal + 1, rangeEnd);
          rangeEnd = ordinal + 1;
        } else {
          appendRange(rangeStart, ordinal);
          rangeStart = ordinal;
        }
      };
      const skipCurrent = (ordinal: number): void => {
        if (reverseSort) rangeEnd = ordinal;
        else rangeStart = ordinal + 1;
      };

      const start = reverseSort ? run.groups.length - 1 : 0;
      const stop = reverseSort ? -1 : run.groups.length;
      const step = reverseSort ? -1 : 1;
      if (node.childrenByGroupKey.size === 0 && !hasCursorGap) {
        appendRange(0, run.groups.length);
      } else {
        for (let ordinal = start; ordinal !== stop; ordinal += step) {
          const timelineGroup = run.groups[ordinal];
          const edge = node.childrenByGroupKey.get(timelineGroup.timelineKey);
          const entry = visibleEntryAt(ordinal, edge);

          if (entry && hasCursorGap && !gapInserted) {
            const highCursor = eventId(entry) >= descMinId;
            if (reverseSort ? !highCursor : highCursor) {
              flushBefore(ordinal);
              pendingGap = {
                insertionIndex: logicalRowIndex,
                rowStart: physicalRowIndex,
                rowCount: runPendingCount,
              };
              physicalRowIndex += runPendingCount;
              gapInserted = true;
            }
          }

          if (!edge) continue;
          flushBefore(ordinal);
          const loadedChild =
            edge.expansion === 'expanded' &&
            edge.load.state === 'loaded' &&
            !edge.load.truncation
              ? edge.load
              : undefined;
          const relationshipRowIndex = entry ? physicalRowIndex : undefined;
          if (entry) appendRange(ordinal, ordinal + 1);
          if (loadedChild) {
            appended = true;
            visitWorkflow(
              loadedChild.node,
              owners,
              relationshipRowIndex === undefined
                ? undefined
                : { key: edge.key, rowIndex: relationshipRowIndex },
            );
          } else if (
            !isSafetyLimited(edge) &&
            edge.expansion !== 'collapsed' &&
            edge.load.state !== 'idle' &&
            edge.load.state !== 'loading'
          ) {
            appendState({ edge, node, run, runKey, ancestorRunKeys: owners });
            appended = true;
          }
          skipCurrent(ordinal);
        }
      }

      if (node.childrenByGroupKey.size > 0 || hasCursorGap) {
        if (reverseSort) appendRange(0, rangeEnd);
        else appendRange(rangeStart, run.groups.length);
      }

      if (runPendingCount > 0 && !gapInserted) {
        pendingGap = {
          insertionIndex: logicalRowIndex,
          rowStart: physicalRowIndex,
          rowCount: runPendingCount,
        };
        physicalRowIndex += runPendingCount;
      }
      if (!appended && runPendingCount === 0) {
        appendRow({
          kind: 'empty-run',
          key: `${node.key}:empty-run:${run.runId}`,
          runId: run.runId,
          workflowKey: node.key,
          runKey,
          depth: node.depth,
          ancestorRunKeys,
        });
      }
      allRunSpans.push({
        key: runKey,
        workflowKey: node.key,
        runId: run.runId,
        depth: node.depth,
        ancestorRunKeys,
        rowStart: runStart,
        rowEnd: physicalRowIndex,
        headerRow: !skipRunHeader,
      });
    }

    if (participatingRuns.length) {
      allWorkflowSpans.push({
        key: `${node.key}:workflow-span`,
        workflowKey: node.key,
        headerKey,
        headerKind: relationshipHeader ? 'relationship' : 'synthetic',
        depth: node.depth,
        ancestorRunKeys,
        rowStart: workflowStart,
        rowEnd: physicalRowIndex,
      });
      if (node.depth > 0 && !compactStructuralRows) {
        for (const suffix of ['after', 'after-padding']) {
          appendRow({
            kind: 'workflow-spacing',
            key: `${node.key}:workflow-spacing-${suffix}`,
            workflowKey: node.key,
            depth: node.depth,
            ancestorRunKeys,
          });
        }
      }
    }
  };

  visitWorkflow(root, []);

  const rowAt = (index: number): TimelineLayoutRow | undefined => {
    if (index < 0 || index >= logicalRowIndex) return undefined;
    let low = 0;
    let high = segments.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      const segment = segments[middle];
      if (index < segment.start) high = middle;
      else if (index >= segment.start + segment.count) low = middle + 1;
      else return segment.rowAt(index - segment.start);
    }
    return undefined;
  };

  const indexOfGroup = (key: string): number | undefined => {
    for (const segment of groupSegments) {
      for (
        let ordinal = segment.ordinalStart;
        ordinal < segment.ordinalEnd;
        ordinal += 1
      ) {
        const timelineGroup = segment.run.groups[ordinal];
        if (timelineGroup.timelineKey !== key || !segment.mask.has(ordinal)) {
          continue;
        }
        const firstRank = segment.mask.rank(segment.ordinalStart);
        const endRank = segment.mask.rank(segment.ordinalEnd);
        const ordinalRank = segment.mask.rank(ordinal);
        return (
          segment.start +
          (segment.reverse
            ? endRank - ordinalRank - 1
            : ordinalRank - firstRank)
        );
      }
    }
    return undefined;
  };

  const chainSpan =
    allWorkflowSpans.find((span) => span.workflowKey === root.key) ?? null;
  return {
    rowCount: logicalRowIndex,
    totalRowCount: physicalRowIndex,
    rowAt,
    rows: (start, end) => {
      const result: TimelineLayoutRow[] = [];
      for (
        let index = Math.max(0, start);
        index < Math.min(logicalRowIndex, end);
        index += 1
      ) {
        const row = rowAt(index);
        if (row) result.push(row);
      }
      return result;
    },
    indexOfGroup,
    runSpans: (start, end) =>
      allRunSpans.filter((span) =>
        intersects(span.rowStart, span.rowEnd, start, end),
      ),
    workflowSpans: (start, end) =>
      allWorkflowSpans.filter((span) =>
        intersects(span.rowStart, span.rowEnd, start, end),
      ),
    chainSpan,
    pendingGap,
  };
}
