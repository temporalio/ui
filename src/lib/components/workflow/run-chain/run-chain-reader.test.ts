import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requestFromAPI } from '$lib/utilities/request-from-api';

import { RunChainReader } from './run-chain-reader';

vi.mock('$lib/utilities/request-from-api', () => ({ requestFromAPI: vi.fn() }));

type Fixture = {
  previous?: string;
  next?: string;
  retry?: string;
  running?: boolean;
  first?: string;
};
let fixtures: Record<string, Fixture>;
let unavailable: string;
let current: string;

function reader() {
  return new RunChainReader('default', 'orders', new AbortController().signal);
}

beforeEach(() => {
  fixtures = { a: { next: 'b' }, b: { previous: 'a', running: true } };
  unavailable = '';
  current = '';
  vi.mocked(requestFromAPI).mockReset();
  vi.mocked(requestFromAPI).mockImplementation(async (url, options) => {
    if (!options?.params)
      return { workflowExecutionInfo: { execution: { runId: current } } };
    const runId = (options.params as Record<string, string>)['execution.runId'];
    if (runId === unavailable) throw new Error('History expired');
    const fixture = fixtures[runId];
    if (!fixture) throw new Error(`Unknown run ${runId}`);
    const first = {
      eventId: '1',
      eventTime: '2026-10-13T12:00:00Z',
      workflowExecutionStartedEventAttributes: {
        continuedExecutionRunId: fixture.previous,
        firstExecutionRunId: fixture.first ?? 'a',
      },
    };
    const last = {
      eventId: '20',
      eventTime: '2026-10-13T12:00:30Z',
      ...(fixture.running
        ? { workflowTaskCompletedEventAttributes: {} }
        : fixture.retry
          ? {
              workflowExecutionFailedEventAttributes: {
                newExecutionRunId: fixture.retry,
              },
            }
          : {
              workflowExecutionContinuedAsNewEventAttributes: {
                newExecutionRunId: fixture.next,
              },
            }),
    };
    return {
      history: {
        events:
          (options?.params as Record<string, string>)?.maximumPageSize ===
          '1000'
            ? [first, last]
            : [String(url).includes('reverse') ? last : first],
      },
    };
  });
});

describe('RunChainReader', () => {
  it('evicts unselected histories and rejects late responses for an evicted run', async () => {
    const chain = reader();
    await chain.initialize('a');
    const [a, b] = chain.runs;
    await chain.readHistory(a);
    chain.retainHistories(['b']);
    expect(chain.histories.has('a')).toBe(false);
    await chain.readHistory(a);
    expect(chain.histories.has('a')).toBe(false);
    await chain.readHistory(b);
    expect([...chain.histories.keys()]).toEqual(['b']);
  });

  it('caches completed summaries without retaining their full histories', async () => {
    const chain = reader();
    const run = await chain.readRun('a');
    vi.mocked(requestFromAPI).mockResolvedValueOnce({
      history: {
        events: [
          { eventId: '20', workflowExecutionCompletedEventAttributes: {} },
        ],
      },
    });
    await chain.readSummary(run);
    const requests = vi.mocked(requestFromAPI).mock.calls.length;
    await chain.readSummary(run);
    expect(vi.mocked(requestFromAPI).mock.calls).toHaveLength(requests);
    expect(chain.histories.size).toBe(0);
    expect(chain.summaries.get('a')?.complete).toBe(true);
  });
  it('reads live state for the exact run and rejects a mismatched response', async () => {
    const chain = reader();
    const run = await chain.readRun('b');
    vi.mocked(requestFromAPI).mockResolvedValueOnce({
      workflowExecutionInfo: { execution: { runId: 'b' } },
      pendingActivities: [{ activityId: 'a', attempt: 3 }],
    });
    expect(await chain.readLive(run)).toMatchObject({
      runId: 'b',
      pendingActivities: [{ attempt: 3 }],
    });
    expect(vi.mocked(requestFromAPI).mock.calls.at(-1)?.[1]?.params).toEqual({
      'execution.runId': 'b',
    });
    vi.mocked(requestFromAPI).mockResolvedValueOnce({
      workflowExecutionInfo: { execution: { runId: 'different' } },
    });
    await expect(chain.readLive(run)).rejects.toThrow('does not match');
  });
  it('discovers the live successor when opening a historical run', async () => {
    const chain = reader();
    await chain.initialize('a');
    expect(chain.runs.map((run) => run.runId)).toEqual(['a', 'b']);
    expect(chain.runs.at(-1)?.status).toBe('Running');
  });

  it('jumps to the latest run of the same chain instead of walking forward', async () => {
    fixtures.b = { previous: 'a', next: 'c' };
    fixtures.c = { previous: 'b', running: true };
    current = 'c';
    const chain = reader();
    await chain.initialize('a');
    expect(chain.runs.map((run) => run.runId)).toEqual(['c']);
    expect(chain.hasEarlier).toBe(true);
    const opened = vi
      .mocked(requestFromAPI)
      .mock.calls.map(
        ([, options]) =>
          (options?.params as Record<string, string> | undefined)?.[
            'execution.runId'
          ],
      );
    expect(opened).not.toContain('b');
    await chain.loadEarlier();
    expect(chain.runs.map((run) => run.runId)).toEqual(['a', 'b', 'c']);
  });

  it('walks forward when the latest run belongs to a different chain', async () => {
    fixtures.b = { previous: 'a', next: 'c' };
    fixtures.c = { previous: 'b', running: true };
    fixtures.other = { running: true, first: 'other' };
    current = 'other';
    const chain = reader();
    await chain.initialize('a');
    expect(chain.runs.map((run) => run.runId)).toEqual(['a', 'b', 'c']);
  });

  it('follows rollover without duplicating closed runs', async () => {
    const chain = reader();
    await chain.initialize('a');
    fixtures.b = { previous: 'a', next: 'c' };
    fixtures.c = { previous: 'b', running: true };
    await chain.refresh();
    await chain.refresh();
    expect(chain.runs.map((run) => run.runId)).toEqual(['a', 'b', 'c']);
  });

  it('loads predecessors but stops at a retry boundary', async () => {
    fixtures.a.previous = 'retry-source';
    fixtures['retry-source'] = { retry: 'a' };
    const chain = reader();
    await chain.initialize('b');
    await chain.loadEarlier();
    expect(chain.runs.map((run) => run.runId)).toEqual(['a', 'b']);
    expect(chain.hasEarlier).toBe(false);
  });

  it('keeps available runs when an older history has expired and allows retry', async () => {
    unavailable = 'a';
    const chain = reader();
    await chain.initialize('b');
    await expect(chain.loadEarlier()).rejects.toThrow('History expired');
    expect(chain.runs.map((run) => run.runId)).toEqual(['b']);
    unavailable = '';
    await chain.loadEarlier();
    expect(chain.runs.map((run) => run.runId)).toEqual(['a', 'b']);
  });

  it('bounds forward discovery and resumes from the last loaded run', async () => {
    fixtures.b = { previous: 'a', next: 'c' };
    fixtures.c = { previous: 'b', running: true };
    const chain = reader();
    chain.runs = [await chain.readRun('a')];
    await chain.refresh(1);
    expect(chain.hasLater).toBe(true);
    await chain.refresh(1);
    expect(chain.runs.map((run) => run.runId)).toEqual(['a', 'b', 'c']);
    expect(chain.hasLater).toBe(false);
  });

  it('preserves pagination cursors and deduplicates live history events', async () => {
    const chain = reader();
    await chain.initialize('b');
    vi.mocked(requestFromAPI)
      .mockResolvedValueOnce({
        history: { events: [{ eventId: '1' }] },
        nextPageToken: 'page2',
      })
      .mockResolvedValueOnce({
        history: { events: [{ eventId: '2' }] },
        nextPageToken: 'tail',
      })
      .mockResolvedValueOnce({ history: { events: [] } })
      .mockResolvedValueOnce({
        history: { events: [{ eventId: '2' }, { eventId: '3' }] },
        nextPageToken: 'newtail',
      });
    const run = chain.runs[0];
    await chain.readHistory(run);
    await chain.readHistory(run);
    await chain.readHistory(run);
    const history = await chain.readHistory(run);
    expect(history.events.map((event) => event.eventId)).toEqual([
      '1',
      '2',
      '3',
    ]);
    expect(vi.mocked(requestFromAPI).mock.calls.at(-1)?.[1]?.token).toBe(
      'tail',
    );
  });

  it('passes cancellation to every network request', async () => {
    const controller = new AbortController();
    const chain = new RunChainReader('default', 'orders', controller.signal);
    await chain.initialize('b');
    expect(
      vi
        .mocked(requestFromAPI)
        .mock.calls.every(
          ([, options]) => options?.options?.signal === controller.signal,
        ),
    ).toBe(true);
  });

  it('keeps the next-run boundary visible when a successor cannot be fetched', async () => {
    const chain = reader();
    chain.runs = [await chain.readRun('a')];
    unavailable = 'b';
    await expect(chain.refresh()).rejects.toThrow('History expired');
    expect(chain.runs.map((run) => run.runId)).toEqual(['a']);
    expect(chain.hasLater).toBe(true);
  });

  it('rejects a successor that belongs to a different chain', async () => {
    fixtures.b.previous = 'unrelated';
    const chain = reader();
    await expect(chain.initialize('a')).rejects.toThrow('does not link back');
    expect(chain.runs.map((run) => run.runId)).toEqual(['a']);
  });
});
