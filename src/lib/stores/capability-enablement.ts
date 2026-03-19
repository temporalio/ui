import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';

import { page } from '$app/stores';

import type { Capabilities } from '$lib/types';
import { minimumVersionRequired } from '$lib/utilities/version-check';

import { getFlagStore } from './feature-flags';
import { temporalVersion } from './versions';

const LOCAL_OVERRIDE_CAPABILITIES = new Set<keyof Capabilities>([
  'serverlessDeployments',
]);

export function isCapabilityEnabled(
  key: keyof Capabilities,
): Readable<boolean> {
  if (!LOCAL_OVERRIDE_CAPABILITIES.has(key)) {
    return derived(page, ($page) =>
      Boolean($page.data?.systemInfo?.capabilities?.[key]),
    );
  }

  const localStore = getFlagStore(String(key));
  return derived([page, localStore], ([$page, $local]) => {
    const serverValue = $page.data?.systemInfo?.capabilities?.[key];
    return serverValue ?? $local;
  });
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
