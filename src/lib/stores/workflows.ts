import { derived, writable } from 'svelte/store';

import { page } from '$app/stores';

import type { FilterParameters } from '$lib/types/workflows';
import { minimumVersionRequired } from '$lib/utilities/version-check';

import { isCloud } from './advanced-visibility';
import { temporalVersion } from './versions';

export const refresh = writable(0);
export const hideWorkflowQueryErrors = derived(
  [page],
  ([$page]) => $page.data?.settings?.hideWorkflowQueryErrors,
);

export const disableWorkflowCountsRefresh = derived(
  [page],
  ([$page]) => $page.data?.settings?.refreshWorkflowCountsDisabled,
);

export const canFetchChildWorkflows = derived(
  [isCloud, temporalVersion],
  ([$isCloud, $temporalVersion]) => {
    return $isCloud || minimumVersionRequired('1.23.0', $temporalVersion);
  },
);

const query = derived([page], ([$page]) => $page.url.searchParams.get('query'));
export const queryWithParentWorkflowId = derived(
  [query, canFetchChildWorkflows],
  ([$query, $canFetchChildWorkflows]) => {
    if ($canFetchChildWorkflows && !$query) {
      return 'ParentWorkflowId is NULL';
    }
    return $query;
  },
);

export type ParsedParameters = FilterParameters & { timeRange?: string };
export const workflowsSearchParams = writable<string>('');

export const updating = writable(true);
export const loading = writable(true);
export const workflowCount = writable({
  count: 0,
  newCount: 0,
});
export const workflowError = writable('');
export const workflowsQuery = writable<string>('');
