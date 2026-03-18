import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';

import { page } from '$app/stores';

import type { Capabilities } from '$lib/types';
import { minimumVersionRequired } from '$lib/utilities/version-check';

import type { FeatureFlag } from './feature-flags';
import { featureFlags } from './feature-flags';
import { temporalVersion } from './versions';

const CAPABILITY_FLAG_MAP: Partial<Record<keyof Capabilities, FeatureFlag>> = {
  serverlessWorkers: 'serverless-workers',
};

function withLocalFallback(
  capabilityKey: keyof Capabilities,
  flagKey: FeatureFlag,
): Readable<boolean> {
  return derived([page, featureFlags], ([$page, $featureFlags]) => {
    const serverValue = $page.data?.systemInfo?.capabilities?.[capabilityKey];
    if (serverValue !== undefined && serverValue !== null) {
      return Boolean(serverValue);
    }
    return Boolean($featureFlags[flagKey]);
  });
}

export function isCapabilityEnabled(
  key: keyof Capabilities,
): Readable<boolean> {
  const flagKey = CAPABILITY_FLAG_MAP[key];
  if (flagKey) {
    return withLocalFallback(key, flagKey);
  }
  return derived(page, ($page) =>
    Boolean($page.data?.systemInfo?.capabilities?.[key]),
  );
}

export const prefixSearchEnabled = derived(
  [page, temporalVersion],
  ([$page, $temporalVersion]) => {
    const serverVersionEnabled = minimumVersionRequired(
      '1.23.0',
      $temporalVersion,
    );
    const capabilitiesEnabled = Boolean(
      $page.data?.systemInfo?.capabilities?.prefixSearch,
    );
    return serverVersionEnabled || capabilitiesEnabled;
  },
);
