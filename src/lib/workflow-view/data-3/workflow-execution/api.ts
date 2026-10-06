import type { GetWorkflowExecutionHistoryResponse } from '$lib/types/events';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import type { WorkflowExecutionIdentity } from './types';
import { compareEventIds } from '../history-events/compare-event-ids';
import { normalizeHistoryEvent } from '../history-events/normalize-history-event';
import { type NormalizedHistoryEvent } from '../history-events/types';
import {
  fetchBidirectionalPages,
  type PageFetcherFn,
} from '../network-utils/fetch-bidirectional-pages';
import { retryableGet } from '../network-utils/retryable-get';

/** Fetches and validates the execution's WorkflowExecutionStarted event. */
export async function fetchStartEvent(
  identity: WorkflowExecutionIdentity,
  signal?: AbortSignal,
): Promise<NormalizedHistoryEvent> {
  const response = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(
    routeForApi('events.ascending', identity),
    {
      request: retryableGet,
      params: {
        'execution.runId': identity.runId,
        waitNewEvent: 'false',
        maximumPageSize: '1',
      },
      notifyOnError: false,
      options: { signal },
    },
  );

  const rawStartEvent = response?.history?.events?.[0];

  if (!rawStartEvent) {
    throw new Error('Execution history discovery is missing its first event');
  }

  const normalizedStartEvent = normalizeHistoryEvent(rawStartEvent);

  if (
    normalizedStartEvent.eventType !== 'WorkflowExecutionStarted' ||
    normalizedStartEvent.eventId !== '1' ||
    !normalizedStartEvent.workflowExecutionStartedEventAttributes
  ) {
    throw new Error(
      'Execution history discovery requires WorkflowExecutionStarted event 1 with start attributes',
    );
  }

  return normalizedStartEvent;
}

/** Fetches the latest recorded event, which may not be terminal. */
export async function fetchLatestEvent(
  identity: WorkflowExecutionIdentity,
  signal?: AbortSignal,
): Promise<NormalizedHistoryEvent> {
  const response = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(
    routeForApi('events.descending', identity),
    {
      request: retryableGet,
      params: {
        'execution.runId': identity.runId,
        waitNewEvent: 'false',
        maximumPageSize: '1',
      },
      notifyOnError: false,
      options: { signal },
    },
  );

  const rawLatestEvent = response?.history?.events?.[0];

  if (!rawLatestEvent) {
    throw new Error('Execution history discovery is missing its latest event');
  }

  return normalizeHistoryEvent(rawLatestEvent);
}

function getHistoryPageFetcher(
  identity: WorkflowExecutionIdentity,
): PageFetcherFn<NormalizedHistoryEvent> {
  return async (direction, token, signal) => {
    const response = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(
      routeForApi(`events.${direction}`, identity),
      {
        token,
        request: retryableGet,
        params: {
          'execution.runId': identity.runId,
          waitNewEvent: 'false',
          maximumPageSize: '1000',
        },
        options: { signal },
        notifyOnError: false,
      },
    );

    if (!response) {
      throw new Error(`Missing ${direction} execution history response`);
    }

    const rawEvents = response?.history?.events ?? [];

    return {
      items: rawEvents.map(normalizeHistoryEvent),
      nextPageToken: response?.nextPageToken ?? null,
    };
  };
}

/** Fetches history from both ends, delivering normalized pages as they arrive. */
export async function fetchHistory(
  identity: WorkflowExecutionIdentity,
  onPage: (items: readonly NormalizedHistoryEvent[]) => void,
  signal?: AbortSignal,
) {
  const pageFetcher = getHistoryPageFetcher(identity);

  return fetchBidirectionalPages({
    fetchPage: pageFetcher,
    compare: (left, right) => compareEventIds(left.eventId, right.eventId),
    onPage,
    signal,
  });
}
