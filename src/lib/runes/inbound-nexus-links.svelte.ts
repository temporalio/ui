import type { WorkflowEvent } from '$lib/types/events';
import {
  isWorkflowExecutionOptionsUpdatedEvent,
  isWorkflowExecutionStartedEvent,
} from '$lib/utilities/is-event-type';

export const getInboundNexusLinkEvents = (history: WorkflowEvent[]) => {
  const workflowExecutionStartedEvent = $derived(
    history.find((event) => isWorkflowExecutionStartedEvent(event)),
  );
  const workflowExecutionOptionsUpdatedEvents = $derived(
    history.filter((event) => isWorkflowExecutionOptionsUpdatedEvent(event)),
  );
  const matchingEvents = $derived([
    workflowExecutionStartedEvent,
    ...workflowExecutionOptionsUpdatedEvents,
  ]);

  return matchingEvents.filter(getInboundLinkForEvent);
};

export const getInboundLinkForEvent = (event: WorkflowEvent) => {
  return (
    event?.links?.[0] ||
    (isWorkflowExecutionOptionsUpdatedEvent(event) &&
      event?.attributes?.attachedCompletionCallbacks?.[0]?.links?.[0]) ||
    (isWorkflowExecutionStartedEvent(event) &&
      event?.attributes?.completionCallbacks?.[0]?.links?.[0])
  );
};
