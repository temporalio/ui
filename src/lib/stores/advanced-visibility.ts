import { derived } from 'svelte/store';

import { page } from '$app/stores';

import {
  advancedVisibilityEnabled,
  advancedVisibilityEnabledWithOrderBy,
} from '$lib/utilities/advanced-visibility-enabled';

import { temporalVersion } from './versions';

export const isCloud = derived(
  [page],
  ([$page]) => $page.data?.settings?.runtimeEnvironment?.isCloud,
);

export const cluster = derived([page], ([$page]) => $page.data?.cluster);

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
