import { SvelteSet } from 'svelte/reactivity';

import type { CollapseSummary } from '$lib/utilities/history-review-collapse';

import {
  type HistoryReviewRequest,
  type HistoryReviewScores,
  reviewHistory,
  toHistoryReviewErrorMessage,
} from './history-review-service';

export type HistoryReviewStatus = 'idle' | 'loading' | 'done' | 'error';

export class HistoryReviewState {
  private _scores = $state.raw<HistoryReviewScores>({});
  private _status = $state<HistoryReviewStatus>('idle');
  private _errorMessage = $state('');
  private _summary = $state.raw<CollapseSummary | null>(null);
  private _openKeys = new SvelteSet<string>();
  private _requestId = 0;
  private _runKey = '';

  get scores(): HistoryReviewScores {
    return this._scores;
  }

  get status(): HistoryReviewStatus {
    return this._status;
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  get summary(): CollapseSummary | null {
    return this._summary;
  }

  get openKeys(): ReadonlySet<string> {
    return this._openKeys;
  }

  get hasReview(): boolean {
    return this._status === 'done';
  }

  async review(
    request: HistoryReviewRequest,
    review = reviewHistory,
  ): Promise<void> {
    const requestId = ++this._requestId;
    this._status = 'loading';
    this._errorMessage = '';

    try {
      const { scores } = await review(request);
      if (requestId !== this._requestId) return;
      this._scores = scores;
      this._openKeys.clear();
      this._status = 'done';
    } catch (error: unknown) {
      if (requestId !== this._requestId) return;
      this._errorMessage = toHistoryReviewErrorMessage(error);
      this._status = 'error';
    }
  }

  ensureRun(runKey: string): void {
    if (runKey === this._runKey) return;
    this._runKey = runKey;
    this.clear();
  }

  toggleRun(key: string): void {
    if (this._openKeys.has(key)) {
      this._openKeys.delete(key);
    } else {
      this._openKeys.add(key);
    }
  }

  setSummary(summary: CollapseSummary | null): void {
    const current = this._summary;
    if (
      current?.total === summary?.total &&
      current?.routine === summary?.routine &&
      current?.visible === summary?.visible
    ) {
      return;
    }
    this._summary = summary;
  }

  clear(): void {
    this._requestId++;
    this._scores = {};
    this._openKeys.clear();
    this._summary = null;
    this._errorMessage = '';
    this._status = 'idle';
  }
}

export const toHistoryReviewRunKey = ({
  namespace,
  workflowId,
  runId,
}: {
  namespace: string;
  workflowId: string;
  runId: string;
}): string => [namespace, workflowId, runId].join('/');

export const historyReview = new HistoryReviewState();
