import type {
  GetWorkflowExecutionHistoryResponse,
  HistoryEvent,
} from '$lib/types/events';
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
  /**
   * Called once per poll iteration when at least one new event was added.
   * Typically increments bufferVersion so Svelte consumers re-render.
   */
  onNewEvents: () => void;
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
 * The loop exits cleanly when `signal` is aborted.
 */
/**
 * Returns the last cursor token when the loop exits (due to abort or error).
 * The caller can save this token and pass it as `startToken` when resuming.
 */
export async function runLivePoll({
  route,
  runId,
  startToken,
  signal,
  onEvent,
  onNewEvents,
  backoffMs = 2000,
  errorBackoffMs = 5000,
}: LivePollOptions): Promise<string> {
  let token: string = startToken;
  while (!signal.aborted) {
    try {
      const response =
        await requestFromAPI<GetWorkflowExecutionHistoryResponse>(route, {
          token: token || undefined,
          request: fetch,
          params: {
            'execution.runId': runId,
            waitNewEvent: 'true',
          },
          options: { signal },
        });
      const events = (response?.history?.events ?? []) as HistoryEvent[];
      let added = 0;
      for (const ev of events) {
        if (onEvent(ev)) added++;
      }
      if (added > 0) onNewEvents();

      if (response?.nextPageToken) {
        token = response.nextPageToken as unknown as string;
      } else {
        token = '';
        if (added === 0) {
          await new Promise((r) => setTimeout(r, backoffMs));
        }
      }
    } catch {
      if (!signal.aborted) {
        await new Promise((r) => setTimeout(r, errorBackoffMs));
      }
    }
  }
  return token;
}
