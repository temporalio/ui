import type { ExecutionRelation } from './data/execution-graph/types';
import { isTerminalExecutionEvent } from './data/history-events/is-terminal-execution-event';
import type { QualifiedHistoryEvent } from './data/history-events/types';
import type { ExecutionKey } from './data/identity-keys';
import type { ExecutionSceneEntry } from './scene/structure/types';

/** Indexes known execution-ending events for the diagnostic view. */
export function getTerminalEventsByExecution(
  events: readonly QualifiedHistoryEvent[],
): ReadonlyMap<ExecutionKey, QualifiedHistoryEvent> {
  const terminalEvents = new Map<ExecutionKey, QualifiedHistoryEvent>();

  for (const event of events) {
    if (isTerminalExecutionEvent(event.eventType)) {
      terminalEvents.set(event.executionKey, event);
    }
  }

  return terminalEvents;
}

/** Indexes continue-as-new destinations for the diagnostic view. */
export function getNextRunsByExecution(
  relations: readonly ExecutionRelation[],
): ReadonlyMap<ExecutionKey, string> {
  const nextRuns = new Map<ExecutionKey, string>();

  for (const relation of relations) {
    if (relation.kind === 'continue-as-new') {
      nextRuns.set(
        relation.previousExecutionKey,
        relation.nextExecutionIdentity.runId,
      );
    }
  }

  return nextRuns;
}

/** Keeps every child visible while limiting diagnostic event rows. */
export function getVisibleDebugEntries(
  entries: readonly ExecutionSceneEntry[],
): readonly ExecutionSceneEntry[] {
  const visible: ExecutionSceneEntry[] = [];
  let rowCount = 0;

  for (const entry of entries) {
    if (entry.kind === 'row') {
      if (rowCount >= 50) {
        continue;
      }

      rowCount++;
    }

    visible.push(entry);
  }

  return visible;
}
