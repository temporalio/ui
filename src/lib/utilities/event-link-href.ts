import type { EventLink, EventType } from '$lib/types';

import { routeForEventHistoryEvent, routeForTimeline } from './route-for';

export const getEventLinkHref = (link: EventLink): string => {
  if (link.workflowEvent?.eventRef?.eventId) {
    return routeForEventHistoryEvent({
      namespace: link.workflowEvent.namespace,
      workflow: link.workflowEvent.workflowId,
      run: link.workflowEvent.runId,
      eventId: String(link.workflowEvent.eventRef.eventId),
    });
  } else if (
    link.workflowEvent?.eventRef?.eventType ===
    ('EVENT_TYPE_WORKFLOW_EXECUTION_STARTED' as unknown as EventType)
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
    return routeForTimeline({
      namespace: link.workflowEvent.namespace,
      workflow: link.workflowEvent.workflowId,
      run: link.workflowEvent.runId,
    });
  }
};
