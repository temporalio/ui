import { derived } from 'svelte/store';
import { page } from '$app/stores';

import {
  advancedVisibilityEnabled,
  advancedVisibilityEnabledWithOrderBy,
} from '$lib/utilities/advanced-visibility-enabled';
import { isVersionNewer } from '$lib/utilities/version-check';

import { cluster } from './cluster';
import { temporalVersion } from './versions';

const isCloud = derived(
  [page],
  ([$page]) => $page.data?.settings?.runtimeEnvironment?.isCloud,
);

export const supportsBulkActions = derived(
  [temporalVersion, cluster],
  ([$temporalVersion, $cluster]) =>
    isVersionNewer($temporalVersion, '1.18.0') &&
    advancedVisibilityEnabled($cluster, $temporalVersion),
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
