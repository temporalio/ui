import type { QualifiedHistoryEvent } from '../../../data/history-events/types';
import {
  type EventKey,
  type ExecutionKey,
  getEventKey,
} from '../../../data/identity-keys';
import type { WorkflowScene } from '../structure/types';

export type MinimapMarker = Readonly<{
  kind: 'execution' | 'failure' | 'retry' | 'continuation' | 'completion';
  timeMs: number;
  label: string;
}>;

export function getMinimapLandmarks(
  scene: WorkflowScene | null,
  events: readonly QualifiedHistoryEvent[],
): Readonly<{ markers: readonly MinimapMarker[] }> {
  const markers: MinimapMarker[] = [];
  const executionKeys = new Set<ExecutionKey>();
  const childExecutions = new Map<EventKey, ExecutionKey>();

  function visit(workflow: WorkflowScene): void {
    for (const execution of workflow.executions) {
      executionKeys.add(execution.execution.executionKey);
      for (const entry of execution.entries) {
        if (entry.kind !== 'child-workflow') continue;
        const firstExecution = entry.workflow.executions[0];
        if (firstExecution) {
          childExecutions.set(
            entry.initiatedEventKey,
            firstExecution.execution.executionKey,
          );
        }
        visit(entry.workflow);
      }
    }
  }

  if (scene) visit(scene);
  const startedExecutions = new Set(
    events
      .filter(
        (event) =>
          event.eventType === 'WorkflowExecutionStarted' &&
          Number.isFinite(event.eventTimeMs),
      )
      .map((event) => event.executionKey),
  );
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
    const timeMs = event.eventTimeMs;
    if (event.eventType === 'WorkflowExecutionStarted') {
      const attempt =
        event.workflowExecutionStartedEventAttributes?.attempt ?? 1;
      markers.push({
        kind: attempt > 1 ? 'retry' : 'execution',
        timeMs,
        label:
          attempt > 1
            ? `Workflow retry · attempt ${attempt}`
            : 'Execution started',
      });
    } else if (event.eventType === 'ChildWorkflowExecutionStarted') {
      const initiatedId =
        event.childWorkflowExecutionStartedEventAttributes?.initiatedEventId;
      const childKey = initiatedId
        ? childExecutions.get(
            getEventKey(event.executionKey, String(initiatedId)),
          )
        : undefined;
      if (!childKey || !startedExecutions.has(childKey)) {
        markers.push({
          kind: 'execution',
          timeMs,
          label: 'Child execution started',
        });
      }
    } else if (
      event.eventType === 'ActivityTaskStarted' &&
      (event.activityTaskStartedEventAttributes?.attempt ?? 1) > 1
    ) {
      markers.push({
        kind: 'retry',
        timeMs,
        label: `Activity retry · attempt ${event.activityTaskStartedEventAttributes?.attempt}`,
      });
    } else if (event.eventType === 'WorkflowExecutionContinuedAsNew') {
      markers.push({ kind: 'continuation', timeMs, label: 'Continued as new' });
    } else if (event.eventType === 'WorkflowExecutionCompleted') {
      markers.push({ kind: 'completion', timeMs, label: 'Workflow completed' });
    } else if (
      event.eventType.endsWith('Failed') ||
      event.eventType.endsWith('TimedOut') ||
      event.eventType === 'WorkflowExecutionTerminated'
    ) {
      markers.push({ kind: 'failure', timeMs, label: event.eventType });
    }
  }

  return { markers };
}
