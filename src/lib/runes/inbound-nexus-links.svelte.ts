import { isSystemNexusCallerLink } from '$lib/services/system-nexus-caller-link';
import type { WorkflowEvent } from '$lib/types/events';
import {
  isWorkflowExecutionOptionsUpdatedEvent,
  isWorkflowExecutionStartedEvent,
} from '$lib/utilities/is-event-type';

export const getInboundNexusLinkEvents = (history: WorkflowEvent[]) => {
  try {
    const workflowExecutionStartedEvent = $derived(
      history.find((event) => isWorkflowExecutionStartedEvent(event)),
    );
    const workflowExecutionOptionsUpdatedEvents = $derived(
      history.filter((event) => isWorkflowExecutionOptionsUpdatedEvent(event)),
    );
    const matchingEvents: WorkflowEvent[] = $derived(
      [
        workflowExecutionStartedEvent,
        ...workflowExecutionOptionsUpdatedEvents,
      ].filter((event) => event !== undefined),
    );

    return matchingEvents.filter((event) =>
      Boolean(getInboundLinkForEvent(event)),
    );
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
      event?.attributes?.completionCallbacks?.[0]?.links?.[0])
  );
};

/**
 * The inbound link events worth showing, once the ones made by an operation on
 * the system endpoint have been resolved away.
 *
 * Resolution needs the caller's history, so it cannot be synchronous. Events
 * start visible and a system caller removes one when its answer arrives, so a
 * genuine Nexus link is never hidden while it is still being confirmed.
 */
export const getVisibleInboundNexusLinkEvents = (
  history: () => WorkflowEvent[],
) => {
  const events = $derived(getInboundNexusLinkEvents(history()));
  let systemCallerIds = $state<string[]>([]);

  $effect(() => {
    let current = true;

    for (const event of events) {
      const id = event?.id;
      if (!id) continue;

      isSystemNexusCallerLink(getInboundLinkForEvent(event)).then((system) => {
        if (!current || !system) return;
        if (systemCallerIds.includes(id)) return;
        systemCallerIds = [...systemCallerIds, id];
      });
    }

    return () => {
      current = false;
    };
  });

  return {
    get events() {
      return events.filter((event) => !systemCallerIds.includes(event?.id));
    },
  };
};
