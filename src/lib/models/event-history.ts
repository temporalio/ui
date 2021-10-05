import type { GetWorkflowExecutionHistoryResponse } from '$types';

export type HistoryEventWithId = HistoryEvent & { id: string };

export const toEventHistory = (
  response: GetWorkflowExecutionHistoryResponse,
): HistoryEventWithId[] => {
  return response.history.events.map((event) => ({
    ...event,
    id: String(event.eventId),
  }));
};
