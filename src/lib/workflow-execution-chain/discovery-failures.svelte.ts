import { SvelteMap } from 'svelte/reactivity';

import type { DiscoveryStep } from './types';

type DiscoveryFailure = {
  runId: string;
  retry: () => void;
};

/**
 * Discovery steps that exhausted their retries after load, each with the Run
 * it was fetching and a retry. Reports a step's failure once until it is
 * retried or cleared.
 */
export class DiscoveryFailures {
  private readonly _failures = new SvelteMap<DiscoveryStep, DiscoveryFailure>();

  constructor(private readonly _onFailure: (step: DiscoveryStep) => void) {}

  has(step: DiscoveryStep): boolean {
    return this._failures.has(step);
  }

  runIdOf(step: DiscoveryStep): string | null {
    return this._failures.get(step)?.runId ?? null;
  }

  fail(step: DiscoveryStep, runId: string, retry: () => void): void {
    const isNewFailure = !this._failures.has(step);
    this._failures.set(step, { runId, retry });
    if (isNewFailure) {
      this._onFailure(step);
    }
  }

  clear(step: DiscoveryStep): void {
    this._failures.delete(step);
  }

  retry(step: DiscoveryStep): void {
    const failure = this._failures.get(step);
    if (!failure) {
      return;
    }
    this._failures.delete(step);
    failure.retry();
  }
}
