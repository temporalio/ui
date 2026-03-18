import type { Readable } from 'svelte/store';
import { derived, get } from 'svelte/store';

import { BROWSER } from 'esm-env';

import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

import { persistStore } from './persist-store';

export type FeatureFlag = 'serverless-workers';

// Record<string, boolean> is intentional: localStorage can contain arbitrary
// keys from manual edits or future flags. The FeatureFlag union constrains the
// public API while the underlying map stays permissive to avoid parse crashes.
type FeatureFlagMap = Record<string, boolean>;

const STORE_KEY = 'featureFlags';

const defaultFlags: FeatureFlagMap = {};

export const featureFlags = persistStore<FeatureFlagMap>(
  STORE_KEY,
  defaultFlags,
  true,
);

// Listen for raw localStorage changes from OTHER tabs (e.g., devtools edits in
// a different tab). The `storage` event does NOT fire for same-tab changes —
// same-tab devtools edits require a page refresh.
if (BROWSER) {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === STORE_KEY && event.newValue !== null) {
      try {
        const parsed = parseWithBigInt(event.newValue) as FeatureFlagMap;
        featureFlags.set(parsed);
      } catch {
        // Ignore malformed JSON from external edits
      }
    } else if (event.key === STORE_KEY && event.newValue === null) {
      featureFlags.set({});
    }
  });
}

export function isFeatureFlagEnabled(flag: FeatureFlag): Readable<boolean> {
  return derived(featureFlags, ($flags) => !!$flags[flag]);
}

// Uses get() + set() instead of update() because persistStore.update() does
// NOT broadcast via BroadcastChannel and is a no-op outside BROWSER.
export function setFeatureFlag(flag: FeatureFlag, enabled: boolean): void {
  const current = get(featureFlags);
  featureFlags.set({ ...current, [flag]: enabled });
}
