import type { GetWorkflowExecutionHistoryResponse } from '$lib/types/events';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import { retryHistoryPageFetch } from './retry-history-page-fetch';
import { normalizeHistoryEvent } from '../history-events/normalize-history-event';
import type { HistoryEventRepository } from '../history-events/repository';
import { type ExecutionIdentity, getExecutionKey } from '../identity-keys';

/** Options for discovering one execution through its first history event. */
export type DiscoverExecutionHistoryOptions = Readonly<{
  identity: ExecutionIdentity;
  historyEvents: HistoryEventRepository;
  signal: AbortSignal;
}>;

/** Fetches one ascending page and ingests a validated workflow started event. */
export async function discoverExecutionHistory({
  identity,
  historyEvents,
  signal,
}: DiscoverExecutionHistoryOptions): Promise<void> {
  if (signal.aborted) {
    return;
  }

  let response: GetWorkflowExecutionHistoryResponse | undefined;

  try {
    response = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(
      routeForApi('events.ascending', identity),
      {
        request: retryHistoryPageFetch,
        params: {
          'execution.runId': identity.runId,
          waitNewEvent: 'false',
          maximumPageSize: '1',
        },
        notifyOnError: false,
        options: { signal },
      },
    );
  } catch (error) {
    if (signal.aborted) {
      return;
    }

    throw error;
  }

  if (signal.aborted) {
    return;
  }

  const firstEvent = response?.history?.events?.[0];

  if (!firstEvent) {
    throw new Error('Execution history discovery is missing its first event');
  }

  const event = normalizeHistoryEvent(firstEvent);

  if (
    event.eventType !== 'WorkflowExecutionStarted' ||
    event.eventId !== '1' ||
    !event.workflowExecutionStartedEventAttributes
  ) {
    throw new Error(
      'Execution history discovery requires WorkflowExecutionStarted event 1 with start attributes',
    );
  }

  if (signal.aborted) {
    return;
  }

  historyEvents.addEvents(getExecutionKey(identity), [event]);
}
