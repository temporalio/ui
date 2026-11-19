import { isNotFound } from '$lib/utilities/handle-error';

import type { ChainBoundary, ChainRun } from './types';

import { type ChainContext, readStartedEvent } from './chain-context.svelte';

export const WALK_SIZE = 10;

/**
 * The window: the chain's Runs that are loaded and shown in the strip, oldest
 * to newest. It grows at the old end by walking back through each Run's
 * predecessor, and at the new end when the Latest Run hands off.
 */
export class ChainWindow {
  private _runIds = $state.raw<string[]>([]);
  readonly runs = $derived(this._resolveRuns(this._runIds));
  boundary = $state<ChainBoundary>(null);
  walking = $state(false);

  constructor(
    private readonly _context: ChainContext,
    private readonly _onOlderRunAdded: (runId: string) => void,
  ) {}

  seed(latestRunId: string): void {
    this._runIds = [latestRunId];
  }

  loadInitialRuns(): Promise<void> {
    return this._walkBack(WALK_SIZE - 1);
  }

  append(runId: string): void {
    this._runIds = [...this._runIds, runId];
  }

  loadOlder(): Promise<void> {
    if (
      this.walking ||
      this.boundary !== null ||
      this._context.failures.has('walkBack') ||
      this._runIds.length === 0
    ) {
      return Promise.resolve();
    }
    return this._walkBack(WALK_SIZE);
  }

  private _resolveRuns(runIds: string[]): ChainRun[] {
    return runIds.flatMap((runId) => {
      const run = this._context.records.get(runId)?.run;
      return run ? [run] : [];
    });
  }

  private async _walkBack(hops: number): Promise<void> {
    this.walking = true;
    try {
      for (let hop = 0; hop < hops; hop++) {
        const predecessor = readStartedEvent(
          this.runs[0].startedEvent,
        ).continuedExecutionRunId;
        if (!predecessor) {
          this.boundary = 'chainStart';
          return;
        }
        let run: ChainRun;
        try {
          run = await this._context.getOrFetchRun(predecessor);
        } catch (error) {
          if (this._context.disposed) {
            return;
          }
          if (isNotFound(error)) {
            this.boundary = 'retention';
            return;
          }
          const remaining = hops - hop;
          this._context.failures.fail(
            'walkBack',
            () => void this._walkBack(remaining),
          );
          return;
        }
        if (this._context.disposed) {
          return;
        }
        this._runIds = [run.runId, ...this._runIds];
        this._onOlderRunAdded(run.runId);
      }
    } finally {
      if (!this._context.disposed) {
        this.walking = false;
      }
    }
  }
}
