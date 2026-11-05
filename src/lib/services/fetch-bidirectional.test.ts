import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  handleError,
  handleUnauthorizedOrForbiddenError,
} from '$lib/utilities/handle-error';
import type { ErrorCallback } from '$lib/utilities/request-from-api';

import { fetchBidirectional } from './fetch-bidirectional';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('$lib/utilities/route-for-api', () => ({
  routeForApi: (key: string) => (key === 'events.ascending' ? 'asc' : 'desc'),
}));

vi.mock('$lib/utilities/handle-error', () => ({
  handleError: vi.fn(),
  handleUnauthorizedOrForbiddenError: vi.fn(),
}));

vi.mock('$lib/utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(),
}));

let requestFromAPI: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  const mod = await import('$lib/utilities/request-from-api');
  requestFromAPI = mod.requestFromAPI as ReturnType<typeof vi.fn>;
});

afterEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEvent(id: number) {
  return {
    eventId: String(id),
    eventTime: '2024-01-01T00:00:00.000000000Z',
    eventType: 'WorkflowExecutionCompleted',
    version: '0',
    taskId: String(id * 10),
    links: [],
    workflowExecutionCompletedEventAttributes: { result: null },
  };
}

function ascPage(ids: number[], tok = '') {
  return { history: { events: ids.map(makeEvent) }, nextPageToken: tok };
}

function descPage(ids: number[], tok = '') {
  return { history: { events: ids.map(makeEvent) }, nextPageToken: tok };
}

/** Empty terminal page ends a cursor without affecting the gap. */
const emptyPage = { history: { events: [] }, nextPageToken: '' };

// ---------------------------------------------------------------------------
// onRawPage — event delivery
// ---------------------------------------------------------------------------

describe('fetchBidirectional onRawPage', () => {
  it('delivers all ascending events via onRawPage with isAscending=true', async () => {
    const received: { id: string; asc: boolean }[] = [];
    requestFromAPI.mockImplementation((url: string) => {
      if (url === 'asc') return Promise.resolve(ascPage([1, 2, 3]));
      return Promise.resolve(emptyPage);
    });

    await fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      onRawPage: (evts, isAsc) => {
        for (const e of evts) received.push({ id: e.eventId, asc: isAsc });
      },
    });

    expect(received.every((r) => r.asc)).toBe(true);
    expect(received.map((r) => r.id)).toEqual(['1', '2', '3']);
  });

  it('delivers descending events via onRawPage with isAscending=false', async () => {
    const received: { id: string; asc: boolean }[] = [];
    requestFromAPI.mockImplementation((url: string) => {
      if (url === 'desc') return Promise.resolve(descPage([3, 2, 1]));
      return Promise.resolve(emptyPage);
    });

    await fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      onRawPage: (evts, isAsc) => {
        for (const e of evts) received.push({ id: e.eventId, asc: isAsc });
      },
    });

    const descEvents = received.filter((r) => !r.asc);
    expect(descEvents.length).toBeGreaterThan(0);
    expect(descEvents.every((r) => !r.asc)).toBe(true);
  });

  it('deduplicates events that both cursors return', async () => {
    // Ascending: events 1-3. Descending: events 3-1 (overlap at 3).
    const received: string[] = [];
    let ascCall = 0;
    requestFromAPI.mockImplementation((url: string) => {
      if (url === 'asc') {
        ascCall++;
        if (ascCall === 1) return Promise.resolve(ascPage([1, 2, 3]));
        return Promise.resolve(emptyPage);
      }
      return Promise.resolve(descPage([3, 2, 1]));
    });

    await fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      onRawPage: (evts) => {
        for (const e of evts) received.push(e.eventId);
      },
    });

    // Event 3 should only appear once (deduped by the `seen` set).
    const countOf3 = received.filter((id) => id === '3').length;
    expect(countOf3).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Multi-page ascending fetch
// ---------------------------------------------------------------------------

describe('fetchBidirectional multi-page ascending', () => {
  it('follows ascending nextPageToken across pages', async () => {
    let ascCall = 0;
    const allReceived: string[] = [];
    requestFromAPI.mockImplementation((url: string) => {
      if (url === 'asc') {
        ascCall++;
        if (ascCall === 1) return Promise.resolve(ascPage([1, 2], 'tok1'));
        return Promise.resolve(ascPage([3, 4]));
      }
      return Promise.resolve(emptyPage);
    });

    await fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      onRawPage: (evts) => {
        for (const e of evts) allReceived.push(e.eventId);
      },
    });

    expect(ascCall).toBe(2);
    expect(allReceived).toContain('1');
    expect(allReceived).toContain('4');
  });
});

// ---------------------------------------------------------------------------
// BidirectionalStats shape
// ---------------------------------------------------------------------------

describe('fetchBidirectional stats', () => {
  it('returns winner=ascending when ascending completes in fewer pages', async () => {
    requestFromAPI.mockImplementation((url: string) => {
      if (url === 'asc') return Promise.resolve(ascPage([1, 2, 3]));
      return Promise.resolve(emptyPage);
    });

    const stats = await fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      onRawPage: () => {},
    });

    expect(stats.totalEvents).toBe(3);
    expect(typeof stats.durationMs).toBe('number');
    expect(['ascending', 'descending', 'tie']).toContain(stats.winner);
  });

  it('counts overlap when both cursors return the same events', async () => {
    requestFromAPI.mockImplementation((url: string) => {
      if (url === 'asc') return Promise.resolve(ascPage([1, 2, 3]));
      return Promise.resolve(descPage([3, 2, 1]));
    });

    const stats = await fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      onRawPage: () => {},
    });

    expect(stats.overlap).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Abort
// ---------------------------------------------------------------------------

function deferred<T>() {
  let resolve: (value: T) => void = () => {
    throw new Error('Deferred promise is not initialized.');
  };
  let reject: (error: Error) => void = () => {
    throw new Error('Deferred promise is not initialized.');
  };
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe('fetchBidirectional request error policy', () => {
  it.each([401, 403, 503])(
    'delegates status %i to auth handling and rethrows without global reporting',
    async (statusCode) => {
      const callbacks: ErrorCallback[] = [];
      requestFromAPI.mockImplementation(
        (
          _url: string,
          init: { handleError: ErrorCallback; notifyOnError?: boolean },
        ) => {
          expect(init.notifyOnError).not.toBe(false);
          callbacks.push(init.handleError);
          return Promise.resolve(emptyPage);
        },
      );
      await fetchBidirectional({
        namespace: 'ns',
        workflowId: 'wf',
        runId: 'run',
        onRawPage: vi.fn(),
      });
      expect(callbacks).toHaveLength(2);
      const error = {
        status: statusCode,
        statusCode,
        statusText: 'Request failed',
        response: new Response(),
        message: 'History request failed',
        body: {
          code: statusCode,
          message: 'History request failed',
          details: [],
        },
      };

      for (const callback of callbacks) {
        await expect(
          Promise.resolve().then(() => callback(error)),
        ).rejects.toBe(error);
      }
      expect(handleUnauthorizedOrForbiddenError).toHaveBeenCalledTimes(2);
      expect(handleUnauthorizedOrForbiddenError).toHaveBeenCalledWith(error);
      expect(handleError).not.toHaveBeenCalled();
    },
  );
});

describe('fetchBidirectional failure recovery', () => {
  it.each(['asc', 'desc'])(
    'drains the healthy cursor when %s fails',
    async (failedDirection) => {
      const received: string[] = [];
      let healthyCalls = 0;
      requestFromAPI.mockImplementation((url: string) => {
        if (url === failedDirection)
          return Promise.reject(new Error('page failed'));
        healthyCalls++;
        const ids =
          failedDirection === 'asc'
            ? [
                [6, 5],
                [4, 3],
                [2, 1],
              ]
            : [
                [1, 2],
                [3, 4],
                [5, 6],
              ];
        return Promise.resolve(
          ascPage(
            ids[healthyCalls - 1],
            healthyCalls < 3 ? `page-${healthyCalls}` : '',
          ),
        );
      });
      const onPause = vi.fn();

      const stats = await fetchBidirectional({
        namespace: 'ns',
        workflowId: 'wf',
        runId: 'run',
        pauseAfterPages: 2,
        onPause,
        onRawPage: (events) =>
          received.push(...events.map((event) => event.eventId)),
      });

      expect(healthyCalls).toBe(3);
      expect(received.toSorted()).toEqual(['1', '2', '3', '4', '5', '6']);
      expect(stats.totalEvents).toBe(6);
      expect(onPause).not.toHaveBeenCalled();
      expect(
        requestFromAPI.mock.calls.filter(([url]) => url === failedDirection),
      ).toHaveLength(1);
      expect(requestFromAPI).toHaveBeenCalledWith(
        'asc',
        expect.objectContaining({ handleError: expect.any(Function) }),
      );
      expect(requestFromAPI).toHaveBeenCalledWith(
        'desc',
        expect.objectContaining({ handleError: expect.any(Function) }),
      );
    },
  );

  it('rejects after both directions fail with a gap, retaining delivered pages', async () => {
    const error = new Error('ascending failed');
    const received: string[] = [];
    requestFromAPI.mockImplementation(
      (url: string, init: { token?: string }) => {
        if (init.token)
          return Promise.reject(
            url === 'asc' ? error : new Error('descending failed'),
          );
        return Promise.resolve(
          url === 'asc' ? ascPage([1, 2], 'a2') : descPage([10, 9], 'd2'),
        );
      },
    );

    await expect(
      fetchBidirectional({
        namespace: 'ns',
        workflowId: 'wf',
        runId: 'run',
        onRawPage: (events) =>
          received.push(...events.map((event) => event.eventId)),
      }),
    ).rejects.toBe(error);

    expect(received).toEqual(['1', '2', '10', '9']);
    expect(requestFromAPI).toHaveBeenCalledTimes(4);
  });

  it('succeeds when recovery closes the gap without reaching a terminal token', async () => {
    requestFromAPI.mockImplementation(
      (url: string, init: { token?: string }) => {
        if (url === 'desc') {
          return init.token
            ? Promise.reject(new Error('descending failed'))
            : Promise.resolve(descPage([10, 9], 'd2'));
        }
        const firstId = init.token ? Number(init.token) : 1;
        return Promise.resolve(
          ascPage([firstId, firstId + 1], String(firstId + 2)),
        );
      },
    );

    await expect(
      fetchBidirectional({
        namespace: 'ns',
        workflowId: 'wf',
        runId: 'run',
        onRawPage: vi.fn(),
      }),
    ).resolves.toMatchObject({ totalEvents: 10, ascPages: 4, descPages: 1 });
  });

  it('preserves NetworkError failures', async () => {
    const error = {
      statusCode: 503,
      statusText: 'Unavailable',
      response: new Response(),
      message: 'history unavailable',
    };
    requestFromAPI.mockRejectedValue(error);

    await expect(
      fetchBidirectional({
        namespace: 'ns',
        workflowId: 'wf',
        runId: 'run',
        onRawPage: vi.fn(),
      }),
    ).rejects.toBe(error);
  });

  it('normalizes other failures to Error', async () => {
    requestFromAPI.mockRejectedValue({ message: 'invalid history' });

    await expect(
      fetchBidirectional({
        namespace: 'ns',
        workflowId: 'wf',
        runId: 'run',
        onRawPage: vi.fn(),
      }),
    ).rejects.toThrow('invalid history');
  });

  it('rejects when the chosen winner fails after cancelling its sibling', async () => {
    const error = new Error('winning page failed');
    let descendingSignal: AbortSignal | undefined;
    requestFromAPI.mockImplementation(
      (
        url: string,
        init: { token?: string; options: { signal: AbortSignal } },
      ) => {
        if (url === 'desc') {
          descendingSignal = init.options.signal;
          return Promise.resolve(descPage([5, 4], 'd2'));
        }
        if (init.token) {
          expect(descendingSignal?.aborted).toBe(true);
          return Promise.reject(error);
        }
        return Promise.resolve(ascPage([1, 2], 'a2'));
      },
    );

    await expect(
      fetchBidirectional({
        namespace: 'ns',
        workflowId: 'wf',
        runId: 'run',
        onRawPage: vi.fn(),
      }),
    ).rejects.toBe(error);
    expect(requestFromAPI).toHaveBeenCalledTimes(3);
  });

  it('releases an existing pause on failure so the healthy cursor can finish', async () => {
    const failingPage = deferred<ReturnType<typeof ascPage>>();
    const paused = deferred<void>();
    const onPause = vi.fn(() => paused.resolve());
    let descendingCalls = 0;
    requestFromAPI.mockImplementation((url: string) => {
      if (url === 'asc') return failingPage.promise;
      descendingCalls++;
      return Promise.resolve(
        descendingCalls === 1 ? descPage([4, 3], 'd2') : descPage([2, 1]),
      );
    });

    const done = fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      onRawPage: vi.fn(),
      pauseAfterPages: 1,
      onPause,
    });
    await paused.promise;
    failingPage.reject(new Error('ascending failed while descending paused'));

    await expect(done).resolves.toMatchObject({ totalEvents: 4 });
    expect(descendingCalls).toBe(2);
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('does not swallow unexpected page callback errors', async () => {
    const error = new Error('ingestion failed');
    const latePage = deferred<ReturnType<typeof descPage>>();
    requestFromAPI.mockImplementation((url: string) =>
      url === 'asc' ? Promise.resolve(ascPage([1, 2], 'a2')) : latePage.promise,
    );
    const onRawPage = vi.fn(() => {
      throw error;
    });
    const onProgress = vi.fn();

    await expect(
      fetchBidirectional({
        namespace: 'ns',
        workflowId: 'wf',
        runId: 'run',
        onRawPage,
        onProgress,
      }),
    ).rejects.toBe(error);
    latePage.resolve(descPage([10, 9]));
    await latePage.promise;
    expect(onRawPage).toHaveBeenCalledTimes(1);
    expect(onProgress).not.toHaveBeenCalled();
  });
});

describe('fetchBidirectional empty pages', () => {
  it.each(['asc', 'desc'])(
    'follows an empty %s page continuation before establishing completion',
    async (direction) => {
      const received: string[] = [];
      requestFromAPI.mockImplementation(
        (url: string, init: { token?: string }) => {
          if (url !== direction)
            return Promise.reject(new Error('other direction failed'));
          return Promise.resolve(
            init.token ? ascPage([1]) : ascPage([], 'next'),
          );
        },
      );

      await expect(
        fetchBidirectional({
          namespace: 'ns',
          workflowId: 'wf',
          runId: 'run',
          onRawPage: (events) =>
            received.push(...events.map((event) => event.eventId)),
        }),
      ).resolves.toMatchObject({ totalEvents: 1 });
      expect(received).toEqual(['1']);
      expect(requestFromAPI).toHaveBeenCalledWith(
        direction,
        expect.objectContaining({ token: 'next' }),
      );
    },
  );

  it('rejects if the continuation after an empty page fails before coverage', async () => {
    const error = new Error('continuation failed');
    requestFromAPI.mockImplementation(
      (url: string, init: { token?: string }) => {
        if (url === 'desc' || init.token) return Promise.reject(error);
        return Promise.resolve(ascPage([], 'next'));
      },
    );

    await expect(
      fetchBidirectional({
        namespace: 'ns',
        workflowId: 'wf',
        runId: 'run',
        onRawPage: vi.fn(),
      }),
    ).rejects.toBe(error);
    expect(requestFromAPI).toHaveBeenCalledWith(
      'asc',
      expect.objectContaining({ token: 'next' }),
    );
  });

  it('accepts an empty terminal page as completed pagination', async () => {
    requestFromAPI.mockImplementation((url: string) =>
      url === 'asc'
        ? Promise.resolve(emptyPage)
        : Promise.reject(new Error('descending failed')),
    );
    await expect(
      fetchBidirectional({
        namespace: 'ns',
        workflowId: 'wf',
        runId: 'run',
        onRawPage: vi.fn(),
      }),
    ).resolves.toMatchObject({ totalEvents: 0 });
  });

  it('does not treat a missing response as completed pagination', async () => {
    requestFromAPI.mockResolvedValue(undefined);
    await expect(
      fetchBidirectional({
        namespace: 'ns',
        workflowId: 'wf',
        runId: 'run',
        onRawPage: vi.fn(),
      }),
    ).rejects.toThrow('Missing workflow history response.');
  });
});

describe('fetchBidirectional abort', () => {
  it('exits cleanly when signal is pre-aborted', async () => {
    const ctrl = new AbortController();
    ctrl.abort();

    const onRawPage = vi.fn();
    await fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      signal: ctrl.signal,
      onRawPage,
    });

    expect(onRawPage).not.toHaveBeenCalled();
  });

  it('settles an externally aborted paused fetch without resume', async () => {
    const controller = new AbortController();
    const paused = deferred<void>();
    requestFromAPI.mockImplementation((url: string) =>
      Promise.resolve(
        url === 'asc' ? ascPage([1, 2], 'a2') : descPage([10, 9], 'd2'),
      ),
    );
    const onRawPage = vi.fn();
    const done = fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      signal: controller.signal,
      onRawPage,
      pauseAfterPages: 1,
      onPause: () => paused.resolve(),
    });
    await paused.promise;
    controller.abort();
    await done;
    expect(requestFromAPI).toHaveBeenCalledTimes(2);
    expect(onRawPage).toHaveBeenCalledTimes(2);
  });

  it('suppresses every callback from responses delivered after external abort', async () => {
    const controller = new AbortController();
    const ascending = deferred<ReturnType<typeof ascPage>>();
    const descending = deferred<ReturnType<typeof descPage>>();
    const started = deferred<void>();
    const signals: AbortSignal[] = [];
    requestFromAPI.mockImplementation(
      (url: string, init: { options: { signal: AbortSignal } }) => {
        signals.push(init.options.signal);
        if (signals.length === 2) started.resolve();
        return url === 'asc' ? ascending.promise : descending.promise;
      },
    );
    const onRawPage = vi.fn();
    const onFirstDescPage = vi.fn();
    const onProgress = vi.fn();
    const onPause = vi.fn();
    const done = fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      signal: controller.signal,
      onRawPage,
      onFirstDescPage,
      onProgress,
      onPause,
      pauseAfterPages: 1,
    });
    await started.promise;
    controller.abort();
    ascending.resolve(ascPage([1, 2]));
    descending.resolve(descPage([10, 9]));
    await done;

    expect(signals.every((signal) => signal.aborted)).toBe(true);
    expect(onRawPage).not.toHaveBeenCalled();
    expect(onFirstDescPage).not.toHaveBeenCalled();
    expect(onProgress).not.toHaveBeenCalled();
    expect(onPause).not.toHaveBeenCalled();
  });
});
