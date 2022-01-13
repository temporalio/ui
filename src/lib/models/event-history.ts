import { convertPayloadToJson } from '$lib/utilities/decode-payload';
import type { GetWorkflowExecutionHistoryResponse, HistoryEvent } from '$types';

export async function getEventAttributes(
  historyEvent: HistoryEvent,
): Promise<EventAttribute> {
  const attributeKey = Object.keys(historyEvent).find((key) =>
    key.includes('Attributes'),
  );
  const attributes = await convertPayloadToJson(historyEvent[attributeKey]);

  return {
    type: attributeKey as EventAttributeKeys,
    ...attributes,
  };
}

export const toEventHistory = async (
  response: GetWorkflowExecutionHistoryResponse,
): Promise<HistoryEventWithId[]> => {
  return await Promise.all(
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
