import { derived } from 'svelte/store';

import { bulkActionsEnabled } from '$lib/utilities/bulk-actions-enabled';
import { isVersionNewer } from '$lib/utilities/version-check';

import { isCloud, supportsAdvancedVisibility } from './advanced-visibility';
import { settings } from './settings';
import { temporalVersion } from './versions';

export const supportsBulkActions = derived(
  [temporalVersion, supportsAdvancedVisibility, settings, isCloud],
  ([$temporalVersion, $supportsAdvancedVisibility, $settings]) =>
    isVersionNewer($temporalVersion, '1.18.0') &&
    $supportsAdvancedVisibility &&
    bulkActionsEnabled($settings),
);
