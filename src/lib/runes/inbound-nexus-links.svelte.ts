import { systemNexusCallerOperation } from '$lib/services/system-nexus-caller-link';
import type { EventLink } from '$lib/types';
import type { WorkflowEvent } from '$lib/types/events';
import {
  isWorkflowExecutionOptionsUpdatedEvent,
  isWorkflowExecutionSignaledEvent,
  isWorkflowExecutionStartedEvent,
  isWorkflowExecutionUpdateAcceptedEvent,
} from '$lib/utilities/is-event-type';

const NEXUS_OPERATION_SCHEDULED = 'EVENT_TYPE_NEXUS_OPERATION_SCHEDULED';

const isNexusCallerLink = (link: EventLink): boolean =>
  String(link.workflowEvent?.eventRef?.eventType) === NEXUS_OPERATION_SCHEDULED;

export const getInboundNexusLinkEvents = (history: WorkflowEvent[]) => {
  try {
    return history.filter((event) => {
      if (
        isWorkflowExecutionStartedEvent(event) ||
        isWorkflowExecutionOptionsUpdatedEvent(event)
      ) {
        return Boolean(getInboundLinkForEvent(event));
      }
      if (
        isWorkflowExecutionSignaledEvent(event) ||
        isWorkflowExecutionUpdateAcceptedEvent(event)
      ) {
        const link = getInboundLinkForEvent(event);
        return Boolean(link && (link.callback || isNexusCallerLink(link)));
      }
      return false;
    });
  } catch {
    return [];
  }
};

export const getInboundLinkForEvent = (event: WorkflowEvent) => {
  return (
    event?.links?.[0] ||
    (isWorkflowExecutionOptionsUpdatedEvent(event) &&
      event?.attributes?.attachedCompletionCallbacks?.[0]?.links?.[0]) ||
    (isWorkflowExecutionStartedEvent(event) &&
      event?.attributes?.completionCallbacks?.[0]?.links?.[0]) ||
    (isWorkflowExecutionUpdateAcceptedEvent(event) &&
      event.workflowExecutionUpdateAcceptedEventAttributes?.acceptedRequest
        ?.links?.[0])
  );
};

/**
 * The system Nexus operation behind each inbound link event, by event ID.
 *
 * Only the caller's history knows its endpoint, so this resolves after render
 * and fills in as each caller is read.
 */
export const getSystemNexusCallerOperations = (
  events: () => WorkflowEvent[],
) => {
  let operations = $state<Record<string, string>>({});

  $effect(() => {
    let current = true;

    for (const event of events()) {
      const id = event?.id;
      if (!id) continue;

      systemNexusCallerOperation(getInboundLinkForEvent(event)).then(
        (operation) => {
          if (!current || !operation || operations[id] === operation) return;
          operations = { ...operations, [id]: operation };
        },
      );
    }

    return () => {
      current = false;
    };
  });

  return {
    get: (eventId: string): string | undefined => operations[eventId],
  };
};
