import { derived } from 'svelte/store';
import { page } from '$app/stores';

import { cluster } from './cluster';
import { temporalVersion } from './versions';

import {
  advancedVisibilityEnabled,
  advancedVisibilityEnabledWithOrderBy,
} from '$lib/utilities/advanced-visibility-enabled';

export const isCloud = derived([page], ([$page]) => {
  return $page.data?.settings?.runtimeEnvironment?.isCloud;
});

export const supportsAdvancedVisibility = derived(
  [cluster, temporalVersion, isCloud],
  ([$cluster, $temporalVersion, $isCloud]) =>
    advancedVisibilityEnabled($cluster, $temporalVersion) || $isCloud,
);

export const supportsAdvancedVisibilityWithOrderBy = derived(
  [cluster, isCloud],
  ([$cluster, $isCloud]) =>
    advancedVisibilityEnabledWithOrderBy($cluster) || $isCloud,
);
