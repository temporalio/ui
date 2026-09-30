import type { QualifiedHistoryEvent } from '../../data/history-events/types';
import type { EventKey, ExecutionKey } from '../../data/identity-keys';
import type { WorkflowScene } from '../structure/types';

export type MinimapSpan = Readonly<{
  kind: 'root' | 'child';
  startMs: number;
  endMs: number;
}>;

export type MinimapMarker = Readonly<{
  kind: 'child' | 'failure' | 'completion';
  timeMs: number;
}>;

export function getMinimapLandmarks(
  scene: WorkflowScene | null,
  events: readonly QualifiedHistoryEvent[],
): Readonly<{
  spans: readonly MinimapSpan[];
  markers: readonly MinimapMarker[];
}> {
  const spans: MinimapSpan[] = [];
  const markers: MinimapMarker[] = [];
  const executionKeys = new Set<ExecutionKey>();
  const initiatedEventKeys = new Set<EventKey>();

  function visit(workflow: WorkflowScene, kind: MinimapSpan['kind']): void {
    for (const execution of workflow.executions) {
      executionKeys.add(execution.execution.executionKey);
      for (const entry of execution.entries) {
        if (entry.kind === 'child-workflow') {
          initiatedEventKeys.add(entry.initiatedEventKey);
          visit(entry.workflow, 'child');
          continue;
        }

        const row = entry.row;
        if (
          row.kind === 'workflow' &&
          Number.isFinite(row.startTimeMs) &&
          Number.isFinite(row.endTimeMs) &&
          row.endTimeMs >= row.startTimeMs
        ) {
          spans.push({ kind, startMs: row.startTimeMs, endMs: row.endTimeMs });
        }
      }
    }
  }

  if (scene) visit(scene, 'root');

  const seenEvents = new Set<EventKey>();
  for (const event of events) {
    if (
      !executionKeys.has(event.executionKey) ||
      !Number.isFinite(event.eventTimeMs) ||
      seenEvents.has(event.eventKey)
    ) {
      continue;
    }
    seenEvents.add(event.eventKey);

    if (
      event.eventType === 'StartChildWorkflowExecutionInitiated' &&
      initiatedEventKeys.has(event.eventKey)
    ) {
      markers.push({ kind: 'child', timeMs: event.eventTimeMs });
    } else if (event.eventType === 'WorkflowExecutionCompleted') {
      markers.push({ kind: 'completion', timeMs: event.eventTimeMs });
    } else if (
      event.eventType === 'WorkflowExecutionFailed' ||
      event.eventType === 'WorkflowExecutionTimedOut' ||
      event.eventType === 'WorkflowExecutionTerminated' ||
      event.eventType === 'WorkflowExecutionCanceled'
    ) {
      markers.push({ kind: 'failure', timeMs: event.eventTimeMs });
    }
  }

  return { spans, markers };
}
