import { afterEach, describe, expect, test, vi } from 'vitest';

import { fetchAllEventsBidirectional } from './events-service';

vi.mock('../utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(),
}));

vi.mock('../utilities/route-for-api', () => ({
  routeForApi: vi
    .fn()
    .mockImplementation((endpoint: string) => `/api/${endpoint}`),
}));

vi.mock('$lib/models/event-history', () => ({
  toEventHistory: vi
    .fn()
    .mockImplementation((events: { eventId: string }[]) =>
      events.map((e) => ({ id: e.eventId, eventId: e.eventId })),
    ),
}));

vi.mock('$lib/stores/events', () => ({
  fullEventHistory: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
}));

vi.mock('$lib/stores/workflow-run', () => ({
  triggerRefresh: vi.fn(),
}));

const { requestFromAPI } = await import('../utilities/request-from-api');
const mockRequest = vi.mocked(requestFromAPI);

type Deferred<T> = { promise: Promise<T>; resolve: (v: T) => void };
function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const makeEvents = (ids: number[]) =>
  ids.map((id) => ({ eventId: String(id) }));

const makePage = (ids: number[], nextToken = '') => ({
  history: { events: makeEvents(ids) },
  nextPageToken: nextToken,
});

const params = { namespace: 'ns', workflowId: 'wf', runId: 'run' };

const sortedIds = (events: { id: string }[]) =>
  events.map((e) => parseInt(e.id)).sort((a, b) => a - b);

afterEach(() => {
  vi.clearAllMocks();
});

describe('fetchAllEventsBidirectional – overlap prevention', () => {
  test('collects all events when each side covers exactly its half', async () => {
    // 8 events, page size 4. Ascending gets 1-4, descending gets 5-8.
    mockRequest.mockImplementation((route: string) => {
      if (route.includes('ascending'))
        return Promise.resolve(makePage([1, 2, 3, 4]));
      return Promise.resolve(makePage([8, 7, 6, 5]));
    });

    const { events, stats } = await fetchAllEventsBidirectional(params);

    expect(sortedIds(events)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(stats.totalEvents).toBe(8);
    expect(stats.overlap).toBe(0);
    expect(stats.ascPages).toBe(1);
    expect(stats.descPages).toBe(1);
  });

  test('ascending resolves first: overlapping desc page is filtered to zero duplicates', async () => {
    // Both pages cover events 3-4. Since ascending resolves first (ascMaxId=4),
    // descending's filter (id > 4) removes events 3 and 4 from its bucket.
    mockRequest.mockImplementation((route: string) => {
      if (route.includes('ascending'))
        return Promise.resolve(makePage([1, 2, 3, 4]));
      return Promise.resolve(makePage([6, 5, 4, 3]));
    });

    const { events, stats } = await fetchAllEventsBidirectional(params);

    expect(sortedIds(events)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(stats.totalEvents).toBe(6);
    expect(stats.overlap).toBe(0);
  });

  test('descending resolves first: overlapping asc page is filtered to zero duplicates', async () => {
    // Delay ascending so descending processes first (descMinId=3).
    // Ascending's filter (id < 3) then removes events 3 and 4 from its bucket.
    const ascP1 = deferred<ReturnType<typeof makePage>>();

    mockRequest.mockImplementation((route: string) => {
      if (route.includes('ascending')) return ascP1.promise;
      return Promise.resolve(makePage([6, 5, 4, 3]));
    });

    const fetchPromise = fetchAllEventsBidirectional(params);

    // Flush enough microtasks for desc p1 to resolve and update descMinId.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    // Now resolve asc p1. descMinId is already 3, so filter (id < 3) keeps only [1, 2].
    ascP1.resolve(makePage([1, 2, 3, 4]));

    const { events, stats } = await fetchPromise;

    expect(sortedIds(events)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(stats.totalEvents).toBe(6);
    expect(stats.overlap).toBe(0);
  });

  test('multi-page: in-flight page from aborted side is filtered, not discarded', async () => {
    // 9 events, page size 3. After round 1, gap(3) == observedPageSize(3) so winner fires.
    // Ascending wins, aborts descending. But desc p2 may already be in-flight
    // and returns [6,5,4]; the filter (id > ascMaxId=6) trims it to nothing.
    let ascCalls = 0;
    let descCalls = 0;

    mockRequest.mockImplementation((route: string) => {
      if (route.includes('ascending')) {
        ascCalls++;
        if (ascCalls === 1)
          return Promise.resolve(makePage([1, 2, 3], 'asc-token'));
        return Promise.resolve(makePage([4, 5, 6]));
      } else {
        descCalls++;
        if (descCalls === 1)
          return Promise.resolve(makePage([9, 8, 7], 'desc-token'));
        // This page would be in-flight when ascending aborts descending.
        return Promise.resolve(makePage([6, 5, 4]));
      }
    });

    const { events, stats } = await fetchAllEventsBidirectional(params);

    expect(sortedIds(events)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(stats.totalEvents).toBe(9);
    expect(stats.overlap).toBe(0);
  });

  test('no events returned from either direction', async () => {
    mockRequest.mockResolvedValue(makePage([]));

    const { events, stats } = await fetchAllEventsBidirectional(params);

    expect(events).toHaveLength(0);
    expect(stats.totalEvents).toBe(0);
    expect(stats.overlap).toBe(0);
  });
});

describe('fetchAllEventsBidirectional – stats', () => {
  test('ascending wins when it needs fewer pages', async () => {
    let ascCalls = 0;
    let descCalls = 0;

    mockRequest.mockImplementation((route: string) => {
      if (route.includes('ascending')) {
        ascCalls++;
        if (ascCalls === 1)
          return Promise.resolve(makePage([1, 2, 3, 4, 5], 'asc-t'));
        return Promise.resolve(makePage([6]));
      } else {
        descCalls++;
        if (descCalls === 1)
          return Promise.resolve(makePage([10, 9, 8, 7, 6], 'desc-t'));
        if (descCalls === 2)
          return Promise.resolve(makePage([5, 4, 3, 2, 1], 'desc-t2'));
        return Promise.resolve(makePage([]));
      }
    });

    const { stats } = await fetchAllEventsBidirectional(params);

    expect(stats.ascPages).toBeGreaterThan(0);
    expect(stats.winner).not.toBe('descending');
    expect(stats.overlap).toBe(0);
  });

  test('reports eventsPerSecond as a positive integer', async () => {
    mockRequest.mockImplementation((route: string) => {
      if (route.includes('ascending'))
        return Promise.resolve(makePage([1, 2, 3]));
      return Promise.resolve(makePage([6, 5, 4]));
    });

    const { stats } = await fetchAllEventsBidirectional(params);

    expect(stats.eventsPerSecond).toBeGreaterThan(0);
    expect(Number.isInteger(stats.eventsPerSecond)).toBe(true);
  });

  test('onProgress callback fires after each page with cumulative counts', async () => {
    const progress: { ascEvents: number; descEvents: number }[] = [];

    mockRequest.mockImplementation((route: string) => {
      if (route.includes('ascending'))
        return Promise.resolve(makePage([1, 2, 3]));
      return Promise.resolve(makePage([6, 5, 4]));
    });

    await fetchAllEventsBidirectional({
      ...params,
      onProgress: (p) =>
        progress.push({ ascEvents: p.ascEvents, descEvents: p.descEvents }),
    });

    expect(progress.length).toBeGreaterThan(0);
    const last = progress[progress.length - 1];
    expect(last.ascEvents + last.descEvents).toBeGreaterThan(0);
  });
});

describe('fetchAllEventsBidirectional – abort', () => {
  test('external abort stops both loops: no second page is fetched', async () => {
    const ctrl = new AbortController();
    const ascP1 = deferred<ReturnType<typeof makePage>>();
    const descP1 = deferred<ReturnType<typeof makePage>>();

    mockRequest.mockImplementation((route: string) => {
      if (route.includes('ascending')) return ascP1.promise;
      return descP1.promise;
    });

    const fetchPromise = fetchAllEventsBidirectional({
      ...params,
      signal: ctrl.signal,
    });

    // Abort before any page resolves.
    ctrl.abort();

    // Resolve the in-flight pages. The mocked fetch doesn't respect the abort
    // signal, so these still complete — but the while-loop guard should prevent
    // fetching any additional pages.
    ascP1.resolve(makePage([1, 2, 3], 'more-token'));
    descP1.resolve(makePage([6, 5, 4], 'more-token'));

    await fetchPromise;

    // Each direction called requestFromAPI exactly once — no second page.
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });
});
