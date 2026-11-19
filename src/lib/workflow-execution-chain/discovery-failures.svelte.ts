import { SvelteMap } from 'svelte/reactivity';

import type { DiscoveryStep } from './types';

type DiscoveryFailure = {
  step: DiscoveryStep;
  runId: string;
  retry: () => void;
};

const failureKey = (step: DiscoveryStep, runId: string): string =>
  `${step}:${runId}`;

/**
 * Discovery steps that exhausted their retries after load, each with the Run
 * it was fetching and a retry. A step can fail for several Runs at once.
 * Reports a step's failure once until none of its Runs are failing.
 */
export class DiscoveryFailures {
  private readonly _failures = new SvelteMap<string, DiscoveryFailure>();

  constructor(private readonly _onFailure: (step: DiscoveryStep) => void) {}

  has(step: DiscoveryStep): boolean {
    return this._failuresOf(step).length > 0;
  }

  hasRun(step: DiscoveryStep, runId: string): boolean {
    return this._failures.has(failureKey(step, runId));
  }

  runIdOf(step: DiscoveryStep): string | null {
    return this._failuresOf(step)[0]?.runId ?? null;
  }

  fail(step: DiscoveryStep, runId: string, retry: () => void): void {
    const isNewFailure = !this.has(step);
    this._failures.set(failureKey(step, runId), { step, runId, retry });
    if (isNewFailure) {
      this._onFailure(step);
    }
  }

  clear(step: DiscoveryStep): void {
    for (const failure of this._failuresOf(step)) {
      this._failures.delete(failureKey(step, failure.runId));
    }
  }

  retry(step: DiscoveryStep): void {
    for (const failure of this._failuresOf(step)) {
      this.retryRun(step, failure.runId);
    }
  }

  retryRun(step: DiscoveryStep, runId: string): void {
    const key = failureKey(step, runId);
    const failure = this._failures.get(key);
    if (!failure) {
      return;
    }
    this._failures.delete(key);
    failure.retry();
  }

  private _failuresOf(step: DiscoveryStep): DiscoveryFailure[] {
    return [...this._failures.values()].filter(
      (failure) => failure.step === step,
    );
  }
}
