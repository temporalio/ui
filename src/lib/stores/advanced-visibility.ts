import { derived } from 'svelte/store';

import {
  advancedVisibilityEnabled,
  advancedVisibilityEnabledWithOrderBy,
} from '$lib/utilities/advanced-visibility-enabled';

import { cluster } from './cluster';
import { temporalVersion } from './versions';

export const isCloud = derived([], () => false);

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
