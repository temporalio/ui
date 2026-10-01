import type { TimeRange } from './time-viewport';
import type { QualifiedHistoryEvent } from '../../data/history-events/types';
import type { ExecutionKey } from '../../data/identity-keys';
import type { FlattenedPlotSceneRow } from '../structure/flatten-plot-scene';
import type { WorkflowScene } from '../structure/types';

export function getWorkflowName(
  workflow: WorkflowScene,
  events: readonly QualifiedHistoryEvent[],
): string {
  const executionKeys = new Set(
    workflow.executions.map(({ execution }) => execution.executionKey),
  );

  for (const event of events) {
    if (
      event.eventType !== 'WorkflowExecutionStarted' ||
      !executionKeys.has(event.executionKey)
    ) {
      continue;
    }
    const name =
      event.workflowExecutionStartedEventAttributes?.workflowType?.name;
    if (name) return name;
  }

  const workflowId = workflow.executions[0]?.execution.identity.workflowId;
  if (!workflowId) return 'Workflow';

  for (const event of events) {
    if (event.eventType !== 'StartChildWorkflowExecutionInitiated') continue;

    const attributes =
      event.startChildWorkflowExecutionInitiatedEventAttributes;
    if (attributes?.workflowId !== workflowId) continue;

    const name = attributes.workflowType?.name;
    if (name) return name;
  }

  return 'Workflow';
}

export function getWorkflowTimeRange(
  workflow: WorkflowScene,
  activeExecutionKeys: ReadonlySet<ExecutionKey>,
  now: number,
): TimeRange | null {
  let earliestStartMs = Infinity;
  let latestEndMs = -Infinity;

  for (const { execution, entries } of workflow.executions) {
    for (const entry of entries) {
      if (
        entry.kind !== 'row' ||
        entry.row.kind !== 'workflow' ||
        entry.row.executionKey !== execution.executionKey
      ) {
        continue;
      }

      const { startTimeMs: startMs, endTimeMs } = entry.row;
      if (
        !Number.isFinite(startMs) ||
        !Number.isFinite(endTimeMs) ||
        endTimeMs < startMs
      ) {
        continue;
      }
      const endMs = activeExecutionKeys.has(execution.executionKey)
        ? Math.max(endTimeMs, now)
        : endTimeMs;
      if (!Number.isFinite(endMs)) continue;

      earliestStartMs = Math.min(earliestStartMs, startMs);
      latestEndMs = Math.max(latestEndMs, endMs);
    }
  }

  return earliestStartMs === Infinity
    ? null
    : { startMs: earliestStartMs, endMs: latestEndMs };
}

export function getPlotRowLayout(rows: readonly FlattenedPlotSceneRow[]): {
  rows: readonly { top: number; height: number }[];
  height: number;
} {
  let height = 0;
  const layoutRows = rows.map((row) => {
    const rowHeight = row.kind === 'event' ? 32 : 44;
    const layout = { top: height, height: rowHeight };
    height += rowHeight;
    return layout;
  });

  return { rows: layoutRows, height };
}

export function getVisiblePlotRowRange(
  layoutRows: readonly { top: number; height: number }[],
  start: number,
  end: number,
  overscan: number,
): { firstIndex: number; lastIndex: number } {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return { firstIndex: 0, lastIndex: 0 };
  }

  let low = 0;
  let high = layoutRows.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const row = layoutRows[middle];
    if (row.top + row.height <= start) low = middle + 1;
    else high = middle;
  }
  const firstIndex = low;

  high = layoutRows.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (layoutRows[middle].top < end) low = middle + 1;
    else high = middle;
  }
  const padding = Number.isFinite(overscan)
    ? Math.max(0, Math.floor(overscan))
    : 0;

  return {
    firstIndex: Math.max(0, firstIndex - padding),
    lastIndex: Math.min(layoutRows.length, low + padding),
  };
}
