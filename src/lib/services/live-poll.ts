import type {
  GetWorkflowExecutionHistoryResponse,
  HistoryEvent,
} from '$lib/types/events';
import { isWorkflowCloseEvent } from '$lib/utilities/is-event-type';
import { requestFromAPI } from '$lib/utilities/request-from-api';

export type LivePollOptions = {
  route: string;
  runId: string;
  startToken: string;
  signal: AbortSignal;
  /**
   * Called for each raw event from the server.
   * Must return true if the event is genuinely new (not a duplicate), false
   * otherwise. Only true returns count toward the `onNewEvents` callback.
   */
  onEvent: (ev: HistoryEvent) => boolean;
  /** Optional hook, called once per poll iteration that added new events. */
  onNewEvents?: () => void;
  onToken?: (token: string) => void;
  /** ms to wait when a long-poll times out with no new events. Default 2000. */
  backoffMs?: number;
  /** ms to wait after a network error before retrying. Default 5000. */
  errorBackoffMs?: number;
};

/**
 * Token-based long-poll loop for streaming new workflow history events.
 *
 * Each iteration sends `waitNewEvent=true` so the server holds the connection
 * open until new events arrive (true long-poll). When the server responds:
 *   - nextPageToken present  → more pages available; follow immediately.
 *   - nextPageToken absent, new events delivered → reset token (frontier);
 *     continue immediately.
 *   - nextPageToken absent, no new events (timeout) → reset token; back off
 *     2 s before retrying so we don't spin on an idle workflow.
 *   - Network error → back off 5 s and retry.
 *
 * The loop exits cleanly when `signal` is aborted or once it receives the
 * workflow's close event.
 */
export async function runLivePoll({
  route,
  runId,
  startToken,
  signal,
  onEvent,
  onNewEvents,
  onToken,
  backoffMs = 2000,
  errorBackoffMs = 5000,
}: LivePollOptions): Promise<void> {
  const wait = (delay: number): Promise<void> => {
    if (signal.aborted) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const finish = () => {
        clearTimeout(timer);
        signal.removeEventListener('abort', finish);
        resolve();
      };
      const timer = setTimeout(finish, delay);
      signal.addEventListener('abort', finish, { once: true });
    });
  };

  let token: string = startToken;
  while (!signal.aborted) {
    let response: GetWorkflowExecutionHistoryResponse | undefined;
    try {
      response = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(
        route,
        {
          token: token || undefined,
          request: fetch,
          params: {
            'execution.runId': runId,
            waitNewEvent: 'true',
          },
          options: { signal },
        },
      );
    } catch {
      if (!signal.aborted) {
        await wait(errorBackoffMs);
      }
      continue;
    }
    const events = response?.history?.events ?? [];
    let added = 0;
    for (const ev of events) {
      if (onEvent(ev)) added++;
    }
    if (added > 0) onNewEvents?.();
    if (isWorkflowCloseEvent(events.at(-1))) break;

    if (response?.nextPageToken) {
      token = String(response.nextPageToken);
      onToken?.(token);
    } else {
      token = '';
      onToken?.(token);
      if (added === 0) {
        await wait(backoffMs);
      }
    }
  }
}
