import type { Load } from '@sveltejs/kit';

import { getGroupForEvent } from '$lib/models/group-events';

export const loadEventDetails: Load = async function ({ params, stuff }) {
  const { eventId } = params;
  const { events, eventGroups } = stuff;

  const event: HistoryEventWithId = events.find(
    (event: HistoryEventWithId) => event.id === eventId,
  );

  const eventGroup: CompactEventGroup = getGroupForEvent(event, eventGroups);

  if (!event) {
    return { status: 404 };
  }

  return {
    props: { event, eventGroup },
  };
};
