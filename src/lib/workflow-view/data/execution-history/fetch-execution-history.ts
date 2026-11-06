import type {
  GetWorkflowExecutionHistoryResponse,
  HistoryEvent,
} from '$lib/types/events';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import { retryHistoryPageFetch } from './retry-history-page-fetch';
import type {
  ExecutionHistoryLoadProgress,
  ExecutionHistoryLoadStats,
} from './types';
import { compareEventIds, type ExecutionIdentity } from '../identity-keys';

type Direction = 'ascending' | 'descending';

/** Options for fetching one execution's history from both ends. */
export type FetchExecutionHistoryOptions = Readonly<{
  identity: ExecutionIdentity;
  signal?: AbortSignal;
  onPage: (events: readonly HistoryEvent[]) => number;
  onProgress?: (progress: ExecutionHistoryLoadProgress) => void;
}>;

/** Fetches complete history pages from both ends, rejecting on request or ingestion failure. */
export async function fetchExecutionHistory({
  identity,
  signal,
  onPage,
  onProgress,
}: FetchExecutionHistoryOptions): Promise<ExecutionHistoryLoadStats> {
  if (signal?.aborted) {
    throw new DOMException('Execution history load aborted', 'AbortError');
  }

  const startedAt = performance.now();
  const ascendingController = new AbortController();
  const descendingController = new AbortController();
  const abortBoth = () => {
    ascendingController.abort();
    descendingController.abort();
  };
  signal?.addEventListener('abort', abortBoth, { once: true });

  let ascPages = 0;
  let descPages = 0;
  let eventsAdded = 0;
  let ascendingMaxId: string | null = null;
  let descendingMinId: string | null = null;

  async function fetchDirection(
    direction: Direction,
    controller: AbortController,
    otherController: AbortController,
  ): Promise<void> {
    const route = routeForApi(`events.${direction}`, identity);
    let token = '';

    while (!controller.signal.aborted) {
      let response: GetWorkflowExecutionHistoryResponse | undefined;

      try {
        response = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(
          route,
          {
            token: token || undefined,
            request: retryHistoryPageFetch,
            params: {
              'execution.runId': identity.runId,
              waitNewEvent: 'false',
              maximumPageSize: '1000',
            },
            options: { signal: controller.signal },
            notifyOnError: false,
          },
        );
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        throw error;
      }

      if (controller.signal.aborted) {
        return;
      }

      if (!response) {
        throw new Error(`Missing ${direction} execution history response`);
      }

      const events = response.history?.events ?? [];
      eventsAdded += onPage(events);

      const lastEvent = events.at(-1);

      if (lastEvent) {
        if (direction === 'ascending') {
          if (
            ascendingMaxId === null ||
            compareEventIds(lastEvent.eventId, ascendingMaxId) > 0
          ) {
            ascendingMaxId = lastEvent.eventId;
          }
        } else if (
          descendingMinId === null ||
          compareEventIds(lastEvent.eventId, descendingMinId) < 0
        ) {
          descendingMinId = lastEvent.eventId;
        }
      }

      if (direction === 'ascending') {
        ascPages++;
      } else {
        descPages++;
      }

      onProgress?.({
        ascPages,
        descPages,
        eventsAdded,
        elapsedMs: performance.now() - startedAt,
      });

      const nextToken = response.nextPageToken
        ? String(response.nextPageToken)
        : '';

      if (
        !nextToken ||
        (ascendingMaxId !== null &&
          descendingMinId !== null &&
          compareEventIds(ascendingMaxId, descendingMinId) >= 0)
      ) {
        otherController.abort();
        return;
      }

      if (nextToken === token) {
        throw new Error(`Repeated ${direction} execution history page token`);
      }

      token = nextToken;
    }
  }

  try {
    const ascending = fetchDirection(
      'ascending',
      ascendingController,
      descendingController,
    );
    const descending = fetchDirection(
      'descending',
      descendingController,
      ascendingController,
    );

    try {
      await Promise.all([ascending, descending]);
    } catch (error) {
      abortBoth();
      await Promise.allSettled([ascending, descending]);
      throw error;
    }

    if (signal?.aborted) {
      throw new DOMException('Execution history load aborted', 'AbortError');
    }

    return {
      durationMs: performance.now() - startedAt,
      eventsAdded,
      ascPages,
      descPages,
    };
  } finally {
    signal?.removeEventListener('abort', abortBoth);
  }
}
