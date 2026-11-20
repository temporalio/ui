import { countRunGroups } from '$lib/models/event-history/run-counts';
import type { WorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte';
import type { HistoryEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';
import { isNotFound } from '$lib/utilities/handle-error';
import { toError } from '$lib/utilities/to-error';

import { LoadQueue } from './load-queue';
import type { CardLoad, ChainError, RunCardSummary, RunLookup } from './types';

import type { ChainContext } from './chain-context.svelte';
import type { RunCard, RunRecord } from './run-record.svelte';

const BACKGROUND_CARD_LOAD_CONCURRENCY = 1;
const CLOSED_RUN_HISTORY_LIMIT = 10;

const summarizeHistory = (
  controller: WorkflowHistoryController,
): RunCardSummary => {
  const groups = controller.history.lazyGroupsWithoutWorkflowTasks;
  return {
    counts: countRunGroups(groups),
    barGroups: groups.map(({ category, isPending }) => ({
      category,
      isPending,
    })),
    closeEvent: controller.closeEvent,
    sdkInfo: controller.history.sdkInfo,
  };
};

/**
 * Loads each Run card's history through its own controller. The foreground
 * Run (the pinned Run, or else the Latest Run) loads at once, outside the
 * queue; every other card waits in a background queue that stays held until
 * the foreground card has something to show.
 *
 * Only the `CLOSED_RUN_HISTORY_LIMIT` most recently pinned closed Runs, or
 * else those nearest the Latest Run, keep their history, besides the pinned
 * and Latest Runs. The rest keep a summary and load their history again if
 * pinned.
 */
export class CardLoader {
  readonly controllers = this._createRunLookup((card) => card.controller);
  readonly cardLoads = this._createRunLookup((card) => card.loadState);
  readonly summaries = this._createRunLookup((card) => card.summary);

  private _latestRunId: string | null = null;
  private _pinnedRunId: string | null = null;
  private _recentlyUsedRunIds: string[] = [];
  private readonly _backgroundQueue = new LoadQueue({
    concurrency: BACKGROUND_CARD_LOAD_CONCURRENCY,
    start: (runId) => this._loadCard(runId),
  });

  constructor(
    private readonly _context: ChainContext,
    private readonly _onClose: (
      runId: string,
      closeEvent: HistoryEvent,
    ) => void,
  ) {}

  private get _foregroundRunId(): string | null {
    return this._pinnedRunId ?? this._latestRunId;
  }

  cardLoadOf(runId: string): CardLoad {
    return this.cardLoads.get(runId) ?? { status: 'queued' };
  }

  closeEventOf(runId: string): HistoryEvent | null | undefined {
    const card = this._context.records.get(runId)?.card;
    return card?.controller?.closeEvent ?? card?.summary?.closeEvent;
  }

  sdkInfoOf(runId: string): RunCardSummary['sdkInfo'] | undefined {
    const card = this._context.records.get(runId)?.card;
    return card?.controller?.history.sdkInfo ?? card?.summary?.sdkInfo;
  }

  latestRunChanged(runId: string): void {
    const previousLatestRunId = this._latestRunId;
    this._latestRunId = runId;
    if (this.cardLoadOf(runId).status === 'queued') {
      this._startCardNow(runId);
    }
    this._holdBackgroundLoadsUntilForegroundShows();
    if (previousLatestRunId) {
      this._markUsed(previousLatestRunId);
    }
    this._releaseLeastRecentlyUsedHistories();
  }

  enqueue(runId: string): void {
    const card = this._context.records.recordFor(runId).card;
    if (card.loadState) {
      return;
    }
    card.loadState = { status: 'queued' };
    if (runId === this._pinnedRunId) {
      this._startCardNow(runId);
      return;
    }
    this._backgroundQueue.push(runId);
  }

  prioritizeRun(runId: string | null): void {
    const previousPinnedRunId = this._pinnedRunId;
    this._pinnedRunId = runId;
    const card = runId ? this._context.records.get(runId)?.card : undefined;
    const isReleased = card?.summary !== undefined && !card.controller;
    if (runId && (card?.loadState?.status === 'queued' || isReleased)) {
      this._startCardNow(runId);
    }
    this._holdBackgroundLoadsUntilForegroundShows();
    if (previousPinnedRunId) {
      this._markUsed(previousPinnedRunId);
    }
    this._releaseLeastRecentlyUsedHistories();
  }

  retryCard(runId: string): void {
    const card = this._context.records.get(runId)?.card;
    if (
      !card ||
      card.loadState?.status !== 'error' ||
      !card.loadState.retryable
    ) {
      return;
    }
    card.loadState = { status: 'queued' };
    if (runId === this._latestRunId || runId === this._foregroundRunId) {
      this._startCardNow(runId);
      return;
    }
    this._backgroundQueue.prioritize(runId);
  }

  updateWorkflow(runId: string, workflow: WorkflowExecution): void {
    this._context.records.get(runId)?.card.controller?.updateWorkflow(workflow);
  }

  dispose(): void {
    this._backgroundQueue.dispose();
    for (const record of this._context.records.values()) {
      record.card.controller?.dispose();
    }
  }

  private _createRunLookup<T>(
    read: (card: RunCard) => T | undefined,
  ): RunLookup<T> {
    const get = (runId: string): T | undefined => {
      const record = this._context.records.get(runId);
      return record ? read(record.card) : undefined;
    };
    return { get, has: (runId) => get(runId) !== undefined };
  }

  private _holdBackgroundLoadsUntilForegroundShows(): void {
    const runId = this._foregroundRunId;
    const card = runId ? this._context.records.get(runId)?.card : undefined;
    const status = card?.loadState?.status;
    if (
      card &&
      (card.firstEventSeen || status === 'loaded' || status === 'error')
    ) {
      this._backgroundQueue.release();
      return;
    }
    this._backgroundQueue.hold();
  }

  private _startCardNow(runId: string): void {
    this._backgroundQueue.remove(runId);
    void this._loadCard(runId);
  }

  private async _loadCard(runId: string): Promise<void> {
    if (this._context.disposed) {
      return;
    }
    const record = this._context.records.recordFor(runId);
    let historyStarted = record.card.controller !== undefined;
    const controller = this._controllerFor(record);
    record.card.loadState = { status: 'loading' };
    try {
      await this._context.retry(async () => {
        const run = record.run;
        if (!run) {
          throw new Error('Missing Run for this card.');
        }
        const loading = historyStarted
          ? controller.retry(run.workflow)
          : controller.load(run.workflow);
        historyStarted = true;
        await loading;
        if (controller.error) {
          throw controller.error;
        }
      });
    } catch (error) {
      if (this._context.disposed) {
        return;
      }
      record.card.loadState = {
        status: 'error',
        error: toError(error),
        retryable: !isNotFound(error),
      };
      this._holdBackgroundLoadsUntilForegroundShows();
      return;
    }
    if (this._context.disposed) {
      return;
    }
    record.card.loadState = { status: 'loaded' };
    this._holdBackgroundLoadsUntilForegroundShows();
    this._markLoaded(runId);
    this._releaseLeastRecentlyUsedHistories();
  }

  /**
   * Cards load from the Latest Run backwards, so a load counts as the least
   * recent use: otherwise the Runs nearest the Latest would be released
   * first. Being pinned or Latest is what makes a Run recently used.
   */
  private _markLoaded(runId: string): void {
    if (this._recentlyUsedRunIds.includes(runId)) {
      return;
    }
    this._recentlyUsedRunIds = [runId, ...this._recentlyUsedRunIds];
  }

  private _markUsed(runId: string): void {
    this._recentlyUsedRunIds = [
      ...this._recentlyUsedRunIds.filter((usedRunId) => usedRunId !== runId),
      runId,
    ];
  }

  private _releaseLeastRecentlyUsedHistories(): void {
    const releasable = this._recentlyUsedRunIds.filter((runId) =>
      this._canReleaseHistory(runId),
    );
    for (const runId of releasable.slice(0, -CLOSED_RUN_HISTORY_LIMIT)) {
      this._releaseHistory(runId);
    }
  }

  private _canReleaseHistory(runId: string): boolean {
    if (runId === this._pinnedRunId || runId === this._latestRunId) {
      return false;
    }
    const controller = this._context.records.get(runId)?.card.controller;
    return controller?.phase.kind === 'complete';
  }

  private _releaseHistory(runId: string): void {
    const card = this._context.records.recordFor(runId).card;
    const controller = card.controller;
    if (!controller) {
      return;
    }
    card.summary = summarizeHistory(controller);
    card.controller = undefined;
    controller.dispose();
    this._recentlyUsedRunIds = this._recentlyUsedRunIds.filter(
      (usedRunId) => usedRunId !== runId,
    );
  }

  private _controllerFor(record: RunRecord): WorkflowHistoryController {
    if (record.card.controller) {
      return record.card.controller;
    }
    const { runId } = record;
    const { namespace, workflowId } = this._context.identity;
    const controller = this._context.client.createController(
      { namespace, workflowId, runId },
      {
        onClose: (closeEvent) => this._onClose(runId, closeEvent),
        onFirstEvent: () => this._handleFirstEvent(runId),
        onLivePollError: (error) => this._handleLivePollError(runId, error),
      },
    );
    record.card.controller = controller;
    return controller;
  }

  private _handleFirstEvent(runId: string): void {
    if (this._context.disposed) {
      return;
    }
    this._context.records.recordFor(runId).card.firstEventSeen = true;
    this._holdBackgroundLoadsUntilForegroundShows();
  }

  private _handleLivePollError(runId: string, error: ChainError): void {
    const card = this._context.records.get(runId)?.card;
    if (this._context.disposed || card?.loadState?.status !== 'loaded') {
      return;
    }
    card.loadState = { status: 'error', error, retryable: !isNotFound(error) };
    this._holdBackgroundLoadsUntilForegroundShows();
  }
}
