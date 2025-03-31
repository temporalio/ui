import { redirect } from '@sveltejs/kit';

import { fetchRawEvents } from '$lib/services/events-service';
import type { HistoryEvent } from '$lib/types/events.js';
import {
  routeForEventHistory,
  routeForEventHistoryEvent,
} from '$lib/utilities/route-for.js';

const findEventFromType = (history: HistoryEvent[], type) => {
  const event = history?.find((e) => e?.eventType === type);
  return event?.eventId;
};

export const load = async ({ params }) => {
  const { namespace, workflow, run, type } = params;
  const workflowRoute = routeForEventHistory({ namespace, workflow, run });
  let events: HistoryEvent[] = [];
  try {
    events = await fetchRawEvents({
      namespace,
      workflowId: workflow,
      runId: run,
    });
  } catch (error) {
    redirect(302, workflowRoute);
  }

  const eventId = findEventFromType(events, type);
  if (eventId) {
    const eventRoute = routeForEventHistoryEvent({
      namespace,
      workflow,
      run,
      eventId,
    });
    redirect(302, eventRoute);
  } else {
    redirect(302, workflowRoute);
  }
};
