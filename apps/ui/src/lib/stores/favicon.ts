import { derived, type Readable } from 'svelte/store';

import { workflowRun } from '$lib/stores/workflow-run';
import { getWorkflowStatusFavicon } from '$lib/utilities/get-workflow-status-favicon';

export const statusFavicon: Readable<string | undefined> = derived(
  workflowRun,
  ($workflowRun) => getWorkflowStatusFavicon($workflowRun.workflow?.status),
);
