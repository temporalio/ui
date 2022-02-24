import { convertPayloadToJson } from '$lib/utilities/decode-payload';
import { findAttributesAndKey } from '$lib/utilities/is-event-type';

import type { GetWorkflowExecutionHistoryResponse } from '$types';

export async function getEventAttributes(
  historyEvent: HistoryEvent,
): Promise<EventAttributesWithType> {
  const { key, attributes } = findAttributesAndKey(historyEvent);
  const decodedAttributes = await convertPayloadToJson(attributes);

  return {
    type: key,
    ...decodedAttributes,
  };
}

export const toEventHistory = async (
  response: GetWorkflowExecutionHistoryResponse,
): Promise<HistoryEventWithId[]> => {
  return Promise.all(
    response.history.events.map(
      async (event): Promise<HistoryEventWithId> => ({
        ...event,
        id: String(event.eventId),
        eventType: event.eventType as unknown as EventType,
        attributes: await getEventAttributes(event),
      }),
    ),
  );
};
