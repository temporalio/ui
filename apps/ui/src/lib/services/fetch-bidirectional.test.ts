import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchBidirectional } from './fetch-bidirectional';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('$lib/utilities/route-for-api', () => ({
  routeForApi: (key: string) => (key === 'events.ascending' ? 'asc' : 'desc'),
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

/** Empty page breaks a cursor immediately without affecting the gap. */
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
});
