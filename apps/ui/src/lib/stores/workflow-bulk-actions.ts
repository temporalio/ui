import { derived } from 'svelte/store';

import { isVersionNewer } from '$lib/utilities/version-check';
import { workflowBulkActionsEnabled } from '$lib/utilities/workflow-bulk-actions-enabled';

import { isCloud, supportsAdvancedVisibility } from './advanced-visibility';
import { settings } from './settings';
import { temporalVersion } from './versions';

export const supportsWorkflowBulkActions = derived(
  [temporalVersion, supportsAdvancedVisibility, settings, isCloud],
  ([$temporalVersion, $supportsAdvancedVisibility, $settings, $isCloud]) =>
    ($isCloud ? true : isVersionNewer($temporalVersion, '1.18.0')) &&
    $supportsAdvancedVisibility &&
    workflowBulkActionsEnabled($settings),
);
