import { derived } from 'svelte/store';

import { advancedVisibilityEnabled } from '$lib/utilities/advanced-visibility-enabled';
import { isVersionNewer } from '$lib/utilities/version-check';

import { cluster } from './cluster';
import { temporalVersion } from './versions';

export const supportsBulkActions = derived(
  [temporalVersion, cluster],
  ([$temporalVersion, $cluster]) =>
    isVersionNewer($temporalVersion, '1.18.0') &&
    advancedVisibilityEnabled($cluster),
);

export const supportsAdvancedVisibility = derived([cluster], ([$cluster]) =>
  advancedVisibilityEnabled($cluster),
);
