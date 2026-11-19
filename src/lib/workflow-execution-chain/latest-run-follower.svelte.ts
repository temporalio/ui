import { isWorkflowOpen } from '$lib/models/workflow-status';
import type { HistoryEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';
import { readSuccessorRunId } from '$lib/utilities/get-workflow-relationships';

import type { ChainLifecycle, ChainRun } from './types';

import type { ChainContext } from './chain-context.svelte';

export const REFRESH_INTERVAL_MS = 10_000;

type LatestRunFollowerCallbacks = {
  handedOff: (runId: string) => void;
  workflowUpdated: (runId: string, workflow: WorkflowExecution) => void;
  closeEventOf: (runId: string) => HistoryEvent | null | undefined;
};

/**
 * Follows the chain forward from its Latest Run: re-describes it while it's
 * open, and when it closes either hands off to its successor or marks the
 * chain closed.
 */
export class LatestRunFollower {
  latestRunId = $state<string | null>(null);
  lifecycle = $state<ChainLifecycle>('following');
  pendingSuccessorRunId = $state<string | null>(null);

  private _refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly _context: ChainContext,
    private readonly _callbacks: LatestRunFollowerCallbacks,
  ) {}

  start(latestRun: ChainRun): void {
    this.latestRunId = latestRun.runId;
    const isOpen = isWorkflowOpen(latestRun.workflow);
    this.lifecycle = isOpen ? 'following' : 'closed';
    if (isOpen) {
      this._scheduleRefresh();
    }
  }

  handleClose(runId: string, closeEvent: HistoryEvent): void {
    const record = this._context.records.get(runId);
    if (
      this._context.disposed ||
      !record ||
      runId !== this.latestRunId ||
      record.follow.closeHandled
    ) {
      return;
    }
    record.follow.closeHandled = true;
    this._stopRefresh();
    this._context.failures.clear('refresh');
    this._context.failures.clear('closeEvent');

    if (record.run && isWorkflowOpen(record.run.workflow)) {
      void this._finalDescribe(runId);
    }

    const successorRunId = readSuccessorRunId(closeEvent);
    if (!successorRunId) {
      this.lifecycle = 'closed';
      this._context.emit({ type: 'closed' });
      return;
    }
    void this._handOff(successorRunId);
  }

  dispose(): void {
    this._stopRefresh();
  }

  private async _handOff(successorRunId: string): Promise<void> {
    this.pendingSuccessorRunId = successorRunId;
    let run: ChainRun;
    try {
      run = await this._context.refreshRun(successorRunId);
    } catch {
      if (this._context.disposed) {
        return;
      }
      this.pendingSuccessorRunId = null;
      this._context.failures.fail(
        'handOff',
        successorRunId,
        () => void this._handOff(successorRunId),
      );
      return;
    }
    if (this._context.disposed) {
      return;
    }
    this.pendingSuccessorRunId = null;
    this.latestRunId = run.runId;
    this.lifecycle = 'following';
    this._callbacks.handedOff(run.runId);
    this._context.emit({ type: 'handOff', runId: run.runId });
    if (isWorkflowOpen(run.workflow)) {
      this._scheduleRefresh();
    }
    const knownCloseEvent = this._callbacks.closeEventOf(run.runId);
    if (knownCloseEvent) {
      this.handleClose(run.runId, knownCloseEvent);
    }
  }

  private async _finalDescribe(runId: string): Promise<void> {
    let workflow: WorkflowExecution;
    try {
      workflow = await this._context.describe(runId);
    } catch {
      if (this._context.disposed) {
        return;
      }
      this._context.failures.fail(
        'finalDescribe',
        runId,
        () => void this._finalDescribe(runId),
      );
      return;
    }
    if (this._context.disposed) {
      return;
    }
    this._applyWorkflow(runId, workflow);
  }

  private _scheduleRefresh(): void {
    this._stopRefresh();
    const runId = this.latestRunId;
    if (!runId) {
      return;
    }
    this._refreshTimer = setTimeout(
      () => void this._refresh(runId),
      REFRESH_INTERVAL_MS,
    );
  }

  private _stopRefresh(): void {
    if (this._refreshTimer === null) {
      return;
    }
    clearTimeout(this._refreshTimer);
    this._refreshTimer = null;
  }

  private async _refresh(runId: string): Promise<void> {
    this._refreshTimer = null;
    let workflow: WorkflowExecution;
    try {
      workflow = await this._context.describe(runId);
    } catch {
      if (this._context.disposed || !this._isOpenLatest(runId)) {
        return;
      }
      this._context.failures.fail(
        'refresh',
        runId,
        () => void this._refresh(runId),
      );
      return;
    }
    if (this._context.disposed || !this._isOpenLatest(runId)) {
      return;
    }
    this._applyWorkflow(runId, workflow);
    if (isWorkflowOpen(workflow)) {
      this._scheduleRefresh();
      return;
    }
    void this._fetchCloseEvent(runId);
  }

  private async _fetchCloseEvent(runId: string): Promise<void> {
    let closeEvent: HistoryEvent;
    try {
      closeEvent = await this._context.fetchCloseEvent(runId);
    } catch {
      if (this._context.disposed || !this._isOpenLatest(runId)) {
        return;
      }
      this._context.failures.fail(
        'closeEvent',
        runId,
        () => void this._fetchCloseEvent(runId),
      );
      return;
    }
    if (this._context.disposed) {
      return;
    }
    this.handleClose(runId, closeEvent);
  }

  private _isOpenLatest(runId: string): boolean {
    return (
      runId === this.latestRunId &&
      !this._context.records.get(runId)?.follow.closeHandled
    );
  }

  private _applyWorkflow(runId: string, workflow: WorkflowExecution): void {
    const record = this._context.records.get(runId);
    if (!record) {
      return;
    }
    if (record.run) {
      record.run = { ...record.run, workflow };
    }
    this._callbacks.workflowUpdated(runId, workflow);
  }
}
