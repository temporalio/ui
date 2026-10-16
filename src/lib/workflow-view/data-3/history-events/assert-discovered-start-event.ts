import type { DiscoveredStartEvent, NormalizedHistoryEvent } from './types';

/** Validates and narrows a start event to the metadata required for discovery. */
export function assertDiscoveredStartEvent(
  event: NormalizedHistoryEvent,
): asserts event is DiscoveredStartEvent {
  if (
    event.eventType !== 'WorkflowExecutionStarted' ||
    event.eventId !== '1' ||
    !event.workflowExecutionStartedEventAttributes?.firstExecutionRunId
  ) {
    throw new Error(
      'Workflow execution discovery requires a start event with its first execution run ID',
    );
  }
}
