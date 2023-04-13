import { derived } from 'svelte/store';

import { isVersionNewer } from '$lib/utilities/version-check';

import { supportsAdvancedVisibility, isCloud } from './advanced-visibility';
import { temporalVersion } from './versions';
import { settings } from './settings';
import { bulkActionsEnabled } from '$lib/utilities/bulk-actions-enabled';

export const supportsBulkActions = derived(
  [temporalVersion, supportsAdvancedVisibility, settings, isCloud],
  ([$temporalVersion, $supportsAdvancedVisibility, $settings, $isCloud]) =>
    ($isCloud ? true : isVersionNewer($temporalVersion, '1.18.0')) &&
    $supportsAdvancedVisibility &&
    bulkActionsEnabled($settings),
);
