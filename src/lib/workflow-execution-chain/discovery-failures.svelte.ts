import { SvelteMap } from 'svelte/reactivity';

export type DiscoveryStep =
  | 'walkBack'
  | 'handOff'
  | 'refresh'
  | 'finalDescribe';

/**
 * Discovery steps that exhausted their retries after load, each with a retry
 * to run on `retryAll()`. Reports only the first failure of a streak.
 */
export class DiscoveryFailures {
  private readonly _retries = new SvelteMap<DiscoveryStep, () => void>();

  constructor(private readonly _onFirstFailure: () => void) {}

  get hasFailures(): boolean {
    return this._retries.size > 0;
  }

  has(step: DiscoveryStep): boolean {
    return this._retries.has(step);
  }

  fail(step: DiscoveryStep, retry: () => void): void {
    const isFirstFailure = this._retries.size === 0;
    this._retries.set(step, retry);
    if (isFirstFailure) {
      this._onFirstFailure();
    }
  }

  clear(step: DiscoveryStep): void {
    this._retries.delete(step);
  }

  retryAll(): void {
    const retries = [...this._retries.values()];
    this._retries.clear();
    for (const retry of retries) {
      retry();
    }
  }
}
