import type { EventLink } from '$lib/types/events';

import { routeForEventHistory, routeForEventHistoryEvent } from './route-for';

export const getEventLinkHref = (link: EventLink): string => {
  if (link.workflowEvent?.eventRef?.eventId) {
    return routeForEventHistoryEvent({
      namespace: link.workflowEvent.namespace,
      workflow: link.workflowEvent.workflowId,
      run: link.workflowEvent.runId,
      eventId: link.workflowEvent.eventRef.eventId,
    });
  } else if (
    link.workflowEvent?.eventRef?.eventType ===
    'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED'
  ) {
    return routeForEventHistoryEvent({
      namespace: link.workflowEvent.namespace,
      workflow: link.workflowEvent.workflowId,
      run: link.workflowEvent.runId,
      eventId: '1',
    });
  } else if (link.workflowEvent?.requestIdRef?.requestId) {
    return routeForEventHistoryEvent({
      namespace: link.workflowEvent.namespace,
      workflow: link.workflowEvent.workflowId,
      run: link.workflowEvent.runId,
      requestId: link.workflowEvent?.requestIdRef?.requestId,
    });
  } else {
    return routeForEventHistory({
      namespace: link.workflowEvent.namespace,
      workflow: link.workflowEvent.workflowId,
      run: link.workflowEvent.runId,
    });
  }
};
