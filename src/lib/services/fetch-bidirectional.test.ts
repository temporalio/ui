import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  handleError,
  handleUnauthorizedOrForbiddenError,
} from '$lib/utilities/handle-error';
import type { ErrorCallback } from '$lib/utilities/request-from-api';

import { fetchBidirectional, type PauseHandle } from './fetch-bidirectional';
import { createGroupedEventBuffer } from './grouped-event-buffer';

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
  requestFromAPI = vi.mocked(mod.requestFromAPI);
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
  it('retains each event once when cursor pages overlap', async () => {
    const buffer = createGroupedEventBuffer();
    requestFromAPI.mockImplementation((url: string) =>
      Promise.resolve(url === 'asc' ? ascPage([1, 2, 3]) : descPage([3, 2, 1])),
    );

    await fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      onRawPage: (events) => {
        for (const event of events) buffer.ingestHistoryEvent(event);
      },
    });

    expect(buffer.getEventArray().map((event) => event.id)).toEqual([
      '1',
      '2',
      '3',
    ]);
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
    expect(allReceived).toEqual(['1', '2', '3', '4']);
  });
});

describe('fetchBidirectional progress', () => {
  it('reports zero descending bounds until a descending page arrives', async () => {
    const onProgress = vi.fn();
    requestFromAPI.mockImplementation((url: string) =>
      Promise.resolve(url === 'asc' ? ascPage([1, 2, 3]) : emptyPage),
    );

    await fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      onRawPage: () => {},
      onProgress,
    });
    expect(onProgress).toHaveBeenCalledExactlyOnceWith({
      totalEstimated: 0,
      descMinId: 0,
    });
  });

  it('reports descending bounds even when the raw page overlaps', async () => {
    const onProgress = vi.fn();
    requestFromAPI.mockImplementation((url: string) =>
      Promise.resolve(url === 'asc' ? ascPage([1, 2, 3]) : descPage([3, 2, 1])),
    );

    await fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      onRawPage: () => {},
      onProgress,
    });

    expect(onProgress).toHaveBeenLastCalledWith({
      totalEstimated: 3,
      descMinId: 1,
    });
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
  it('delegates request errors to auth handling and rethrows without global reporting', async () => {
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
      status: 403,
      statusCode: 403,
      statusText: 'Request failed',
      response: new Response(),
      message: 'History request failed',
      body: {
        code: 403,
        message: 'History request failed',
        details: [],
      },
    };

    for (const callback of callbacks) {
      await expect(Promise.resolve().then(() => callback(error))).rejects.toBe(
        error,
      );
    }

    expect(handleUnauthorizedOrForbiddenError).toHaveBeenCalledWith(error);
    expect(handleError).not.toHaveBeenCalled();
  });
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

      await fetchBidirectional({
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
      expect(onPause).not.toHaveBeenCalled();
      expect(
        requestFromAPI.mock.calls.filter(([url]) => url === failedDirection),
      ).toHaveLength(1);
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
  });

  it('succeeds when recovery closes the gap without reaching a terminal token', async () => {
    const received: string[] = [];
    const onProgress = vi.fn();
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
        onRawPage: (events) =>
          received.push(...events.map((event) => event.eventId)),
        onProgress,
      }),
    ).resolves.toBeUndefined();
    expect(received.toSorted((a, b) => Number(a) - Number(b))).toEqual(
      Array.from({ length: 10 }, (_, index) => String(index + 1)),
    );
    expect(onProgress).toHaveBeenLastCalledWith({
      totalEstimated: 10,
      descMinId: 9,
    });
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
  });

  it('releases an existing pause on failure so the healthy cursor can finish', async () => {
    const failingPage = deferred<ReturnType<typeof ascPage>>();
    const paused = deferred<void>();
    const onPause = vi.fn(() => paused.resolve());
    const onRawPage = vi.fn();
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
      onRawPage,
      pauseAfterPages: 1,
      onPause,
    });
    await paused.promise;
    failingPage.reject(new Error('ascending failed while descending paused'));

    await expect(done).resolves.toBeUndefined();
    expect(
      onRawPage.mock.calls.flatMap(([events]) =>
        events.map((event: ReturnType<typeof makeEvent>) => event.eventId),
      ),
    ).toEqual(['4', '3', '2', '1']);
    expect(descendingCalls).toBe(2);
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it.each(['onRawPage', 'onProgress', 'onPause'])(
    'propagates %s errors, aborting both requests and suppressing late callbacks',
    async (callback) => {
      const error = new Error('callback failed');
      const latePage = deferred<ReturnType<typeof descPage>>();
      const signals: AbortSignal[] = [];
      requestFromAPI.mockImplementation(
        (url: string, init: { options: { signal: AbortSignal } }) => {
          signals.push(init.options.signal);
          return url === 'asc'
            ? Promise.resolve(ascPage([1, 2], 'a2'))
            : latePage.promise;
        },
      );
      const callbacks = {
        onRawPage: vi.fn(),
        onProgress: vi.fn(),
        onPause: vi.fn(),
      };
      for (const [name, handler] of Object.entries(callbacks)) {
        if (name === callback)
          handler.mockImplementation(() => {
            throw error;
          });
      }

      await expect(
        fetchBidirectional({
          namespace: 'ns',
          workflowId: 'wf',
          runId: 'run',
          pauseAfterPages: 1,
          ...callbacks,
        }),
      ).rejects.toBe(error);
      expect(signals).toHaveLength(2);
      expect(signals.every((signal) => signal.aborted)).toBe(true);
      latePage.resolve(descPage([10, 9]));
      await latePage.promise;
      expect(callbacks.onRawPage).toHaveBeenCalledTimes(1);
      expect(callbacks.onProgress).toHaveBeenCalledTimes(
        callback === 'onRawPage' ? 0 : 1,
      );
      expect(callbacks.onPause).toHaveBeenCalledTimes(
        callback === 'onPause' ? 1 : 0,
      );
      expect(requestFromAPI).toHaveBeenCalledTimes(2);
    },
  );
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
      ).resolves.toBeUndefined();
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
    const onRawPage = vi.fn();
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
        onRawPage,
      }),
    ).resolves.toBeUndefined();
    expect(onRawPage).not.toHaveBeenCalled();
    expect(requestFromAPI).toHaveBeenCalledTimes(2);
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

describe('fetchBidirectional pause', () => {
  it('pauses both cursors at the threshold, resumes once, and lets the winner cancel its sibling', async () => {
    const paused = deferred<void>();
    let resume = () => {};
    const onPause = vi.fn((handle: PauseHandle) => {
      resume = handle.resume;
      paused.resolve();
    });
    const signals: AbortSignal[] = [];
    const received: string[] = [];
    requestFromAPI.mockImplementation(
      (
        url: string,
        init: { token?: string; options: { signal: AbortSignal } },
      ) => {
        signals.push(init.options.signal);
        if (init.token) {
          expect(url).toBe('asc');
          expect(signals[1].aborted).toBe(true);
          return Promise.resolve(ascPage([3, 4], 'a3'));
        }
        return Promise.resolve(
          url === 'asc' ? ascPage([1, 2], 'a2') : descPage([6, 5], 'd2'),
        );
      },
    );
    const done = fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      pauseAfterPages: 1,
      onPause,
      onRawPage: (events) =>
        received.push(...events.map((event) => event.eventId)),
    });
    await paused.promise;
    expect(requestFromAPI).toHaveBeenCalledTimes(2);
    resume();
    await expect(done).resolves.toBeUndefined();
    resume();
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(requestFromAPI).toHaveBeenCalledTimes(3);
    expect(received.toSorted()).toEqual(['1', '2', '3', '4', '5', '6']);
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
    const onProgress = vi.fn();
    const onPause = vi.fn();
    const done = fetchBidirectional({
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'run',
      signal: controller.signal,
      onRawPage,
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
    expect(onProgress).not.toHaveBeenCalled();
    expect(onPause).not.toHaveBeenCalled();
  });
});
