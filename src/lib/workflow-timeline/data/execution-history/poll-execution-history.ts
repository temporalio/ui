import type { GetWorkflowExecutionHistoryResponse } from '$lib/types/events';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import { normalizeHistoryEvent } from '../history-events/normalize-history-event';
import type { HistoryEventRepository } from '../history-events/repository';
import { type ExecutionIdentity, getExecutionKey } from '../identity-keys';

/** Active status reported by an execution history poll loop. */
export type ExecutionHistoryPollStatus = 'polling' | 'retrying';

/** Options for polling one workflow execution into a history event repository. */
export type PollExecutionHistoryOptions = Readonly<{
  identity: ExecutionIdentity;
  historyEvents: HistoryEventRepository;
  signal: AbortSignal;
  startCursor?: string;
  idleBackoffMs?: number;
  errorBackoffMs?: number;
  onCursorChange?: (cursor: string) => void;
  onStatusChange?: (status: ExecutionHistoryPollStatus) => void;
}>;

function waitForRetry(delayMs: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const complete = () => {
      clearTimeout(timeout);
      signal.removeEventListener('abort', complete);
      resolve();
    };
    const timeout = setTimeout(complete, delayMs);

    signal.addEventListener('abort', complete, { once: true });
  });
}

/** Long-polls one workflow execution and ingests each response as one batch. */
export async function pollExecutionHistory({
  identity,
  historyEvents,
  signal,
  startCursor = '',
  idleBackoffMs = 2000,
  errorBackoffMs = 5000,
  onCursorChange,
  onStatusChange,
}: PollExecutionHistoryOptions): Promise<string> {
  const executionKey = getExecutionKey(identity);
  const route = routeForApi('events.ascending', identity);
  let cursor = startCursor;
  let status: ExecutionHistoryPollStatus = 'polling';

  const updateStatus = (nextStatus: ExecutionHistoryPollStatus) => {
    if (status === nextStatus) {
      return;
    }

    status = nextStatus;
    onStatusChange?.(status);
  };

  onStatusChange?.(status);

  while (!signal.aborted) {
    try {
      const response =
        await requestFromAPI<GetWorkflowExecutionHistoryResponse>(route, {
          token: cursor || undefined,
          request: fetch,
          params: {
            'execution.runId': identity.runId,
            waitNewEvent: 'true',
          },
          options: { signal },
        });
      if (signal.aborted) {
        break;
      }

      const events = response?.history?.events ?? [];
      const addedEvents = historyEvents.addEvents(
        executionKey,
        events.map(normalizeHistoryEvent),
      );
      if (signal.aborted) {
        break;
      }

      const nextCursor = response?.nextPageToken
        ? String(response.nextPageToken)
        : '';

      if (cursor !== nextCursor) {
        cursor = nextCursor;
        onCursorChange?.(cursor);
      }

      updateStatus('polling');

      if (!nextCursor && addedEvents.length === 0) {
        await waitForRetry(idleBackoffMs, signal);
      }
    } catch {
      if (!signal.aborted) {
        updateStatus('retrying');
        await waitForRetry(errorBackoffMs, signal);
      }
    }
  }

  return cursor;
}
