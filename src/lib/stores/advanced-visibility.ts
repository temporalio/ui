import { derived } from 'svelte/store';

import { page } from '$app/stores';

import {
  advancedVisibilityEnabled,
  advancedVisibilityEnabledWithOrderBy,
} from '$lib/utilities/advanced-visibility-enabled';

import { cluster } from './cluster';
import { temporalVersion } from './versions';

// FOR TESTING PURPOSES ONLY - DON'T FORGET TO CHANGE THIS BACK
export const isCloud = derived(
  [page],
  ([$page]) => !$page.data?.settings?.runtimeEnvironment?.isCloud,
  // ([$page]) => $page.data?.settings?.runtimeEnvironment?.isCloud,
);

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
