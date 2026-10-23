import { delay } from 'es-toolkit';

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
  idleDelayMs?: number;
  errorRetryDelayMs?: number;
  onCursorChange?: (cursor: string) => void;
  onStatusChange?: (status: ExecutionHistoryPollStatus) => void;
}>;

async function waitForPollDelay(
  delayMs: number,
  signal: AbortSignal,
): Promise<void> {
  try {
    await delay(delayMs, { signal });
  } catch (error) {
    if (!signal.aborted) {
      throw error;
    }
  }
}

/** Long-polls one workflow execution and ingests each response as one batch. */
export async function pollExecutionHistory({
  identity,
  historyEvents,
  signal,
  startCursor = '',
  idleDelayMs = 2000,
  errorRetryDelayMs = 5000,
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
        await waitForPollDelay(idleDelayMs, signal);
      }
    } catch {
      if (!signal.aborted) {
        updateStatus('retrying');
        await waitForPollDelay(errorRetryDelayMs, signal);
      }
    }
  }

  return cursor;
}
