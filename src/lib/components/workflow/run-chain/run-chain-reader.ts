import type {
  GetWorkflowExecutionHistoryResponse,
  HistoryEvent,
} from '$lib/types/events';
import type { WorkflowExecutionAPIResponse } from '$lib/types/workflows';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import { type ChainRun, type LiveRunState, summarizeRun } from './run-chain';
import { type RunSummary, RunSummaryAccumulator } from './run-chain-summary';

export type RunHistory = {
  events: HistoryEvent[];
  nextPageToken: string;
  pollToken: string;
  hasMore: boolean;
};

/** Independent of the single-run event buffer: browsing a chain never replaces it. */
export class RunChainReader {
  runs: ChainRun[] = [];
  histories = new Map<string, RunHistory>();
  summaries = new Map<string, RunSummary>();
  private scans = new Map<
    string,
    { accumulator: RunSummaryAccumulator; token: string; pollToken: string }
  >();
  private retainedRuns: Set<string> | undefined;
  hasEarlier = false;
  get hasLater() {
    return !!this.runs.at(-1)?.nextRunId;
  }

  constructor(
    private namespace: string,
    private workflowId: string,
    private signal: AbortSignal,
    private request = fetch,
  ) {}

  private async page(
    runId: string,
    sort: 'ascending' | 'descending',
    size: number,
    token?: string,
  ) {
    const response = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(
      routeForApi(`events.${sort}`, {
        namespace: this.namespace,
        workflowId: this.workflowId,
      }),
      {
        params: {
          'execution.runId': runId,
          maximumPageSize: String(size),
          waitNewEvent: 'false',
        },
        token,
        options: { signal: this.signal },
        request: this.request,
        notifyOnError: false,
      },
    );
    return {
      events: response?.history?.events ?? [],
      token: String(response?.nextPageToken ?? ''),
    };
  }

  async readRun(runId: string): Promise<ChainRun> {
    const [first, last] = await Promise.all([
      this.page(runId, 'ascending', 1),
      this.page(runId, 'descending', 1),
    ]);
    if (!first.events[0] || !last.events[0])
      throw new Error(
        'Run history is unavailable. It may have passed its retention period.',
      );
    return summarizeRun(runId, first.events[0], last.events[0]);
  }

  async readLive(run: ChainRun): Promise<LiveRunState> {
    const response = await requestFromAPI<WorkflowExecutionAPIResponse>(
      routeForApi('workflow', {
        namespace: this.namespace,
        workflowId: this.workflowId,
      }),
      {
        params: { 'execution.runId': run.runId },
        options: { signal: this.signal },
        request: this.request,
        notifyOnError: false,
      },
    );
    if (response?.workflowExecutionInfo?.execution?.runId !== run.runId)
      throw new Error('Live activity state does not match the selected run.');
    return {
      runId: run.runId,
      fetchedAt: Date.now(),
      pendingActivities: response.pendingActivities ?? [],
    };
  }

  private async readLatest(anchor: ChainRun): Promise<ChainRun | undefined> {
    try {
      const response = await requestFromAPI<WorkflowExecutionAPIResponse>(
        routeForApi('workflow', {
          namespace: this.namespace,
          workflowId: this.workflowId,
        }),
        {
          options: { signal: this.signal },
          request: this.request,
          notifyOnError: false,
        },
      );
      const runId = response?.workflowExecutionInfo?.execution?.runId;
      if (!runId || runId === anchor.runId) return;
      const latest = await this.readRun(runId);
      return latest.firstRunId && latest.firstRunId === anchor.firstRunId
        ? latest
        : undefined;
    } catch (error) {
      if (this.signal.aborted) throw error;
      return;
    }
  }

  async initialize(runId: string) {
    const anchor = await this.readRun(runId);
    const latest = anchor.nextRunId ? await this.readLatest(anchor) : undefined;
    this.runs = [latest ?? anchor];
    this.hasEarlier = !!this.runs[0].previousRunId;
    if (this.runs[0].nextRunId) await this.refresh();
  }

  private async readOverview(runId: string): Promise<ChainRun> {
    const page = await this.page(runId, 'ascending', 1000);
    const first = page.events[0];
    const last = page.events.at(-1);
    if (!first || !last) throw new Error('Run history is unavailable.');
    let run = summarizeRun(runId, first, last);
    if (run.status === 'Running' && page.token) {
      const tail = (await this.page(runId, 'descending', 1)).events[0];
      if (!tail) throw new Error('Run history is unavailable.');
      run = summarizeRun(runId, first, tail);
    }
    this.recordSummary(run, page.events, page.token, '');
    return run;
  }

  async loadEarlier(limit = 10) {
    for (let index = 0; index < limit; index++) {
      const first = this.runs[0];
      if (
        !first?.previousRunId ||
        this.runs.some((run) => run.runId === first.previousRunId)
      ) {
        this.hasEarlier = false;
        return;
      }
      const previous = await this.readOverview(first.previousRunId);
      // A previous run can also be a retry or cron execution. Verify the edge.
      if (previous.nextRunId !== first.runId) {
        this.hasEarlier = false;
        return;
      }
      this.runs = [previous, ...this.runs];
    }
    this.hasEarlier = !!this.runs[0]?.previousRunId;
  }

  async refresh(limit = 20) {
    let tail = this.runs.at(-1);
    if (!tail) return;
    if (tail.status === 'Running') {
      tail = await this.readRun(tail.runId);
      this.runs = [...this.runs.slice(0, -1), tail];
    }
    for (let index = 0; index < limit && tail.nextRunId; index++) {
      const nextRunId = tail.nextRunId;
      if (this.runs.some((run) => run.runId === nextRunId))
        throw new Error('The run chain contains a repeated link.');
      const next = await this.readRun(tail.nextRunId);
      if (next.previousRunId !== tail.runId)
        throw new Error('The next run does not link back to this chain.');
      this.runs = [...this.runs, next];
      tail = next;
    }
  }

  async readHistory(run: ChainRun, live?: LiveRunState): Promise<RunHistory> {
    const previous = this.histories.get(run.runId);
    if (
      previous &&
      !previous.hasMore &&
      run.status !== 'Running' &&
      previous.events.at(-1)?.eventId === run.eventCount
    )
      return previous;
    const cursor = previous?.nextPageToken || previous?.pollToken || '';
    const page = await this.page(run.runId, 'ascending', 1000, cursor);
    const events = new Map(
      previous?.events.map((event) => [event.eventId, event]) ?? [],
    );
    for (const event of page.events) events.set(event.eventId, event);
    const history: RunHistory = {
      events: [...events.values()],
      nextPageToken: page.token,
      pollToken: cursor,
      hasMore:
        !!page.token &&
        Number([...events.values()].at(-1)?.eventId ?? 0) <
          Number(run.eventCount),
    };
    if (!this.retainedRuns || this.retainedRuns.has(run.runId))
      this.histories.set(run.runId, history);
    this.recordSummary(run, page.events, page.token, cursor, live);
    return history;
  }

  private recordSummary(
    run: ChainRun,
    events: HistoryEvent[],
    token: string,
    cursor: string,
    live?: LiveRunState,
  ) {
    const cached = this.summaries.get(run.runId);
    if (
      cached?.complete &&
      run.status !== 'Running' &&
      !this.scans.has(run.runId)
    )
      return cached;
    const scan = this.scans.get(run.runId) ?? {
      accumulator: new RunSummaryAccumulator(),
      token: '',
      pollToken: '',
    };
    const lastId = Number(events.at(-1)?.eventId ?? 0);
    // A selected run may re-read an earlier detail page. Do not rewind the
    // overview cursor or allocate a second scan of the same history.
    if (lastId >= scan.accumulator.lastEventId) {
      scan.accumulator.append(events);
      scan.token = token;
      scan.pollToken = cursor;
    }
    this.scans.set(run.runId, scan);
    const complete = scan.accumulator.lastEventId >= Number(run.eventCount);
    const summary = scan.accumulator.snapshot(run, complete, live);
    this.summaries.set(run.runId, summary);
    if (complete && run.status !== 'Running') this.scans.delete(run.runId);
    return summary;
  }

  updateLiveSummary(run: ChainRun, live?: LiveRunState) {
    const scan = this.scans.get(run.runId);
    if (scan)
      this.summaries.set(
        run.runId,
        scan.accumulator.snapshot(
          run,
          scan.accumulator.lastEventId >= Number(run.eventCount),
          live,
        ),
      );
  }

  retainHistories(runIds: string[]) {
    this.retainedRuns = new Set(runIds);
    for (const id of this.histories.keys())
      if (!this.retainedRuns.has(id)) this.histories.delete(id);
  }

  /** Read one bounded page per turn so historical backfill cannot block live polling. */
  async readSummary(run: ChainRun, live?: LiveRunState): Promise<RunSummary> {
    const cached = this.summaries.get(run.runId);
    if (
      cached?.complete &&
      run.status !== 'Running' &&
      !this.scans.has(run.runId)
    )
      return cached;
    const scan = this.scans.get(run.runId) ?? {
      accumulator: new RunSummaryAccumulator(),
      token: '',
      pollToken: '',
    };
    this.scans.set(run.runId, scan);
    const cursor = scan.token || scan.pollToken;
    const page = await this.page(run.runId, 'ascending', 1000, cursor);
    return this.recordSummary(run, page.events, page.token, cursor, live);
  }
}
