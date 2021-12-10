import type { GetWorkflowExecutionHistoryResponse, HistoryEvent } from '$types';

export function getEventAttributes(historyEvent: HistoryEvent): EventAttribute {
  const attributeKey = Object.keys(historyEvent).find((key) =>
    key.includes('Attributes'),
  );
  return {
    type: attributeKey as EventAttributeKeys,
    ...historyEvent[attributeKey],
  };
}

export const toEventHistory = (
  response: GetWorkflowExecutionHistoryResponse,
): HistoryEventWithId[] => {
  return response.history.events.map(
    (event): HistoryEventWithId => ({
      ...event,
      id: String(event.eventId),
      eventType: event.eventType as unknown as EventType,
      attributes: getEventAttributes(event),
    }),
  );
};
