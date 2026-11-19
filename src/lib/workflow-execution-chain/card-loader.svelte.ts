import type { WorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte';
import type { HistoryEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';
import { isNotFound } from '$lib/utilities/handle-error';
import { toError } from '$lib/utilities/to-error';

import { LoadQueue } from './load-queue';
import type { CardLoad, ChainError, RunLookup } from './types';

import type { ChainContext } from './chain-context.svelte';
import type { RunCard, RunRecord } from './run-record.svelte';

export const BACKGROUND_CARD_LOAD_CONCURRENCY = 1;

/**
 * Loads each Run card's history through its own controller. The foreground
 * Run (the pinned Run, or else the Latest Run) loads at once, outside the
 * queue; every other card waits in a background queue that stays held until
 * the foreground card has something to show.
 */
export class CardLoader {
  readonly controllers = this._createRunLookup((card) => card.controller);
  readonly cardLoads = this._createRunLookup((card) => card.loadState);

  private _latestRunId: string | null = null;
  private _pinnedRunId: string | null = null;
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

  latestRunChanged(runId: string): void {
    this._latestRunId = runId;
    if (this.cardLoadOf(runId).status === 'queued') {
      this._startCardNow(runId);
    }
    this._holdBackgroundLoadsUntilForegroundShows();
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
    this._pinnedRunId = runId;
    const cardLoad = runId ? this.cardLoads.get(runId) : undefined;
    if (runId && cardLoad?.status === 'queued') {
      this._startCardNow(runId);
    }
    this._holdBackgroundLoadsUntilForegroundShows();
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
    const controller = this._controllerFor(record);
    const resumeHistory = record.card.livePollFailed;
    record.card.livePollFailed = false;
    record.card.loadState = { status: 'loading' };
    try {
      await this._context.retry(async () => {
        const run = record.run;
        if (!run) {
          throw new Error('Missing Run for this card.');
        }
        await (resumeHistory
          ? controller.retry(run.workflow)
          : controller.load(run.workflow));
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
    card.livePollFailed = true;
    card.loadState = { status: 'error', error, retryable: !isNotFound(error) };
    this._holdBackgroundLoadsUntilForegroundShows();
  }
}
