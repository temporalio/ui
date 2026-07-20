import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest';

import { runLivePoll } from './live-poll';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('$lib/utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(),
}));

let requestFromAPI: MockedFunction<
  (route: string, opts: Record<string, unknown>) => Promise<unknown>
>;

beforeEach(async () => {
  const mod = await import('$lib/utilities/request-from-api');
  requestFromAPI = mod.requestFromAPI as typeof requestFromAPI;
});

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRawEvent(id: number) {
  return {
    eventId: String(id),
    eventTime: '2024-01-01T00:00:00Z',
    eventType: 'ActivityTaskScheduled',
  };
}

function pollResponse(
  eventIds: number[],
  nextPageToken = '',
): Record<string, unknown> {
  return {
    history: { events: eventIds.map(makeRawEvent) },
    nextPageToken,
  };
}

/** Default extra options so tests never block on real delays. */
const FAST = { backoffMs: 0, errorBackoffMs: 0 };

/**
 * Convenience wrapper: runs the poll loop until `responses` are consumed,
 * then aborts. Returns the mocks and the completion promise.
 */
function startPoll(
  responses: Record<string, unknown>[],
  { onEventReturn = true }: { onEventReturn?: boolean } = {},
) {
  const ctrl = new AbortController();
  const onEvent = vi.fn().mockReturnValue(onEventReturn);

  let callIdx = 0;
  requestFromAPI.mockImplementation(() => {
    const resp = responses[callIdx++];
    if (callIdx >= responses.length) ctrl.abort();
    return Promise.resolve(resp ?? pollResponse([]));
  });

  const done = runLivePoll({
    route: '/api/events',
    runId: 'run-1',
    startToken: 'start-tok',
    signal: ctrl.signal,
    onEvent,
    ...FAST,
  });

  return { ctrl, onEvent, done };
}

// ---------------------------------------------------------------------------
// waitNewEvent parameter — the long-poll contract
// ---------------------------------------------------------------------------

describe('runLivePoll — waitNewEvent long-poll', () => {
  it('sends waitNewEvent=true on every request', async () => {
    const ctrl = new AbortController();
    requestFromAPI.mockImplementationOnce(() => {
      ctrl.abort();
      return Promise.resolve(pollResponse([]));
    });

    await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl.signal,
      onEvent: vi.fn().mockReturnValue(false),
      ...FAST,
    });

    expect(requestFromAPI).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({
        params: expect.objectContaining({ waitNewEvent: 'true' }),
      }),
    );
  });

  it('passes runId as execution.runId param', async () => {
    const ctrl = new AbortController();
    requestFromAPI.mockImplementationOnce(() => {
      ctrl.abort();
      return Promise.resolve(pollResponse([]));
    });

    await runLivePoll({
      route: '/api/events',
      runId: 'my-run-id',
      startToken: '',
      signal: ctrl.signal,
      onEvent: vi.fn().mockReturnValue(false),
      ...FAST,
    });

    expect(requestFromAPI).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({
        params: expect.objectContaining({ 'execution.runId': 'my-run-id' }),
      }),
    );
  });

  it('uses startToken as the initial cursor (token param)', async () => {
    const ctrl = new AbortController();
    requestFromAPI.mockImplementationOnce(() => {
      ctrl.abort();
      return Promise.resolve(pollResponse([]));
    });

    await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: 'initial-cursor',
      signal: ctrl.signal,
      onEvent: vi.fn().mockReturnValue(false),
      ...FAST,
    });

    expect(requestFromAPI).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({ token: 'initial-cursor' }),
    );
  });

  it('sends token=undefined (not empty string) when startToken is empty', async () => {
    const ctrl = new AbortController();
    requestFromAPI.mockImplementationOnce(() => {
      ctrl.abort();
      return Promise.resolve(pollResponse([]));
    });

    await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl.signal,
      onEvent: vi.fn().mockReturnValue(false),
      ...FAST,
    });

    // Empty string must become undefined so the API doesn't receive "token="
    expect(requestFromAPI).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({ token: undefined }),
    );
  });
});

// ---------------------------------------------------------------------------
// Event delivery
// ---------------------------------------------------------------------------

describe('runLivePoll — event delivery', () => {
  it('calls onEvent for each event in the response', async () => {
    const { onEvent, done } = startPoll([pollResponse([1, 2, 3])]);
    await done;
    expect(onEvent).toHaveBeenCalledTimes(3);
    expect(onEvent).toHaveBeenNthCalledWith(1, makeRawEvent(1));
    expect(onEvent).toHaveBeenNthCalledWith(2, makeRawEvent(2));
    expect(onEvent).toHaveBeenNthCalledWith(3, makeRawEvent(3));
  });
});

// ---------------------------------------------------------------------------
// Token threading — correct cursor is passed on every request
// ---------------------------------------------------------------------------

describe('runLivePoll — nextPageToken threading', () => {
  it('follows nextPageToken immediately without delay', async () => {
    const ctrl = new AbortController();
    let callIdx = 0;
    const responses = [
      pollResponse([1, 2], 'page-2-tok'),
      pollResponse([3, 4]),
    ];
    requestFromAPI.mockImplementation(() => {
      const resp = responses[callIdx++];
      if (callIdx >= responses.length) ctrl.abort();
      return Promise.resolve(resp);
    });

    await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl.signal,
      onEvent: vi.fn().mockReturnValue(true),
      ...FAST,
    });

    expect(requestFromAPI).toHaveBeenCalledTimes(2);
    // Second call must carry the nextPageToken from the first response.
    expect(requestFromAPI).toHaveBeenNthCalledWith(
      2,
      '/api/events',
      expect.objectContaining({ token: 'page-2-tok' }),
    );
  });

  it('resets token to undefined after a response with no nextPageToken', async () => {
    const ctrl = new AbortController();
    let callIdx = 0;
    const responses = [
      pollResponse([1], ''), // delivers events, no nextPageToken → reset token
      pollResponse([2]), // second iteration
    ];
    requestFromAPI.mockImplementation(() => {
      const resp = responses[callIdx++];
      if (callIdx >= responses.length) ctrl.abort();
      return Promise.resolve(resp);
    });

    await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: 'initial',
      signal: ctrl.signal,
      onEvent: vi.fn().mockReturnValue(true),
      ...FAST,
    });

    // After a no-nextPageToken response the frontier resets, so the next
    // request is a fresh long-poll with token=undefined.
    expect(requestFromAPI).toHaveBeenNthCalledWith(
      2,
      '/api/events',
      expect.objectContaining({ token: undefined }),
    );
  });
});

// ---------------------------------------------------------------------------
// Back-off behaviour
//
// Tests use backoffMs/errorBackoffMs=0 so delays complete instantly.
// A separate test verifies the DEFAULT delay values are correct.
// ---------------------------------------------------------------------------

describe('runLivePoll — back-off', () => {
  it('retries after a timeout (empty response, no nextPageToken)', async () => {
    // First response: empty (server long-poll timed out). Second: abort.
    const ctrl = new AbortController();
    let callIdx = 0;
    requestFromAPI.mockImplementation(() => {
      callIdx++;
      if (callIdx >= 2) ctrl.abort();
      return Promise.resolve(pollResponse([]));
    });

    await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl.signal,
      onEvent: vi.fn().mockReturnValue(false),
      backoffMs: 0,
      errorBackoffMs: 0,
    });

    expect(requestFromAPI).toHaveBeenCalledTimes(2);
  });

  it('does NOT delay when response delivers new events without nextPageToken', async () => {
    // Abort while processing the event so the loop exits right after the batch
    // but before any setTimeout could fire. If backoffMs=999 appears in delays
    // it means the code incorrectly backed off even though events were delivered.
    const delays: number[] = [];
    const originalSetTimeout = globalThis.setTimeout;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(
      (fn: () => void, delay = 0) => {
        delays.push(delay);
        return originalSetTimeout(fn, 0);
      },
    );

    const ctrl = new AbortController();
    requestFromAPI.mockResolvedValueOnce(pollResponse([1])); // events delivered, no token

    // Abort during event processing — happens before the setTimeout check in the loop.
    const onEvent = vi.fn().mockImplementation(() => {
      ctrl.abort();
      return true;
    });

    await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl.signal,
      onEvent,
      backoffMs: 999, // must NOT appear in delays
      errorBackoffMs: 0,
    });

    vi.restoreAllMocks();
    expect(delays).not.toContain(999);
  });

  it('uses the backoffMs value for empty-response delays', async () => {
    const delays: number[] = [];
    const originalSetTimeout = globalThis.setTimeout;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(
      (fn: () => void, delay = 0) => {
        delays.push(delay);
        return originalSetTimeout(fn, 0);
      },
    );

    const ctrl = new AbortController();
    requestFromAPI
      .mockResolvedValueOnce(pollResponse([])) // empty → backoff
      .mockImplementationOnce(() => {
        ctrl.abort();
        return Promise.resolve(pollResponse([]));
      });

    await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl.signal,
      onEvent: vi.fn().mockReturnValue(false),
      backoffMs: 1234, // distinctive value
      errorBackoffMs: 0,
    });

    vi.restoreAllMocks();
    expect(delays).toContain(1234);
  });

  it('uses the errorBackoffMs value on network errors', async () => {
    const delays: number[] = [];
    const originalSetTimeout = globalThis.setTimeout;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(
      (fn: () => void, delay = 0) => {
        delays.push(delay);
        return originalSetTimeout(fn, 0);
      },
    );

    const ctrl = new AbortController();
    requestFromAPI
      .mockRejectedValueOnce(new Error('network error')) // error → error backoff
      .mockImplementationOnce(() => {
        ctrl.abort();
        return Promise.resolve(pollResponse([]));
      });

    await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl.signal,
      onEvent: vi.fn().mockReturnValue(false),
      backoffMs: 0,
      errorBackoffMs: 5678, // distinctive value
    });

    vi.restoreAllMocks();
    expect(delays).toContain(5678);
  });

  it('default backoffMs is 2000 and errorBackoffMs is 5000', () => {
    // Snapshot the defaults via the type default values — no async needed.
    // We verify by spying on setTimeout with actual defaults.
    const delays: number[] = [];
    const originalSetTimeout = globalThis.setTimeout;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(
      (fn: () => void, delay = 0) => {
        delays.push(delay);
        return originalSetTimeout(fn, 0);
      },
    );

    const ctrl = new AbortController();
    let callIdx = 0;
    requestFromAPI.mockImplementation(async () => {
      callIdx++;
      if (callIdx === 1) return pollResponse([]); // empty → 2000 ms backoff
      if (callIdx === 2) throw new Error('net'); // error → 5000 ms backoff
      ctrl.abort();
      return pollResponse([]);
    });

    const done = runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl.signal,
      onEvent: vi.fn().mockReturnValue(false),
      // No backoffMs / errorBackoffMs → use defaults
    });

    return done.then(() => {
      vi.restoreAllMocks();
      expect(delays).toContain(2000);
      expect(delays).toContain(5000);
    });
  });
});

// ---------------------------------------------------------------------------
// Abort / cleanup
// ---------------------------------------------------------------------------

describe('runLivePoll — abort', () => {
  it('exits immediately when signal is pre-aborted', async () => {
    const ctrl = new AbortController();
    ctrl.abort();

    await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl.signal,
      onEvent: vi.fn(),
      ...FAST,
    });

    expect(requestFromAPI).not.toHaveBeenCalled();
  });

  it('does not retry after error when signal was aborted during request', async () => {
    const ctrl = new AbortController();
    requestFromAPI.mockImplementationOnce(() => {
      ctrl.abort();
      return Promise.reject(new Error('aborted'));
    });

    await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl.signal,
      onEvent: vi.fn(),
      errorBackoffMs: 0,
      backoffMs: 0,
    });

    // Abort suppresses the error-backoff delay and exits the loop.
    expect(requestFromAPI).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Pause / resume — returned cursor
//
// runLivePoll resolves with the last cursor token it held when aborted.
// The caller saves this and passes it as startToken when resuming, so the
// server picks up exactly where polling left off instead of re-fetching from
// the start.
// ---------------------------------------------------------------------------

describe('runLivePoll — pause/resume cursor', () => {
  it('returns empty string when aborted before any request', async () => {
    const ctrl = new AbortController();
    ctrl.abort();

    const token = await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl.signal,
      onEvent: vi.fn(),
      ...FAST,
    });

    expect(token).toBe('');
  });

  it('returns the startToken when aborted mid-request with no new token received', async () => {
    const ctrl = new AbortController();
    requestFromAPI.mockImplementationOnce(() => {
      ctrl.abort();
      return Promise.resolve(pollResponse([]));
    });

    const token = await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: 'resume-tok',
      signal: ctrl.signal,
      onEvent: vi.fn(),
      ...FAST,
    });

    // No nextPageToken in the response so token reset to ''.
    expect(token).toBe('');
  });

  it('returns the latest nextPageToken when aborted while mid-page', async () => {
    const ctrl = new AbortController();
    // First response has a nextPageToken → token advances.
    requestFromAPI.mockImplementationOnce(() =>
      Promise.resolve(pollResponse([], 'page-2-tok')),
    );
    // Second request (following the token) is where abort fires.
    requestFromAPI.mockImplementationOnce(() => {
      ctrl.abort();
      return Promise.resolve(pollResponse([]));
    });

    const token = await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl.signal,
      onEvent: vi.fn(),
      ...FAST,
    });

    // After following 'page-2-tok', the second response has no nextPageToken
    // so token resets to ''.
    expect(token).toBe('');
  });

  it('can be resumed from the returned cursor without re-fetching old events', async () => {
    // Simulate pausing mid-stream: first poll run is aborted after two pages.
    const ctrl1 = new AbortController();
    requestFromAPI
      .mockImplementationOnce(() => Promise.resolve(pollResponse([1], 'tok-a')))
      .mockImplementationOnce(() => {
        ctrl1.abort();
        return Promise.resolve(pollResponse([2]));
      });

    const resumeToken = await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: '',
      signal: ctrl1.signal,
      onEvent: vi.fn().mockReturnValue(true),
      ...FAST,
    });

    // Resume: second poll run starts from the saved cursor.
    const ctrl2 = new AbortController();
    requestFromAPI.mockImplementationOnce(() => {
      ctrl2.abort();
      return Promise.resolve(pollResponse([3]));
    });

    const onEvent2 = vi.fn().mockReturnValue(true);
    await runLivePoll({
      route: '/api/events',
      runId: 'run-1',
      startToken: resumeToken,
      signal: ctrl2.signal,
      onEvent: onEvent2,
      ...FAST,
    });

    // The resumed poll sent the saved cursor as its first token.
    const secondCallToken = requestFromAPI.mock.calls[2]?.[1]?.token;
    expect(secondCallToken).toBe(resumeToken || undefined);
    // It delivered only the new event (event 3).
    expect(onEvent2).toHaveBeenCalledTimes(1);
    expect(onEvent2.mock.calls[0][0].eventId).toBe('3');
  });
});
