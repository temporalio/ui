import { derived, writable } from 'svelte/store';

import { page } from '$app/stores';

import type { FilterParameters } from '$lib/types/workflows';
import { minimumVersionRequired } from '$lib/utilities/version-check';

import { isCloud } from './advanced-visibility';
import { showChildWorkflows } from './filters';
import { temporalVersion } from './versions';

export const refresh = writable(0);
export const hideWorkflowQueryErrors = derived(
  [page],
  ([$page]) => $page.data?.settings?.hideWorkflowQueryErrors,
);

export const canFetchChildWorkflows = derived(
  [isCloud, temporalVersion],
  ([$isCloud, $temporalVersion]) => {
    return $isCloud || minimumVersionRequired('1.23', $temporalVersion);
  },
);

const query = derived([page], ([$page]) => $page.url.searchParams.get('query'));
export const queryWithParentWorkflowId = derived(
  [query, canFetchChildWorkflows, showChildWorkflows],
  ([$query, $canFetchChildWorkflows, $showChildWorkflows]) => {
    if ($canFetchChildWorkflows && !$showChildWorkflows) {
      if ($query) {
        return `ParentWorkflowId is NULL AND ${$query}`;
      }
      return 'ParentWorkflowId is NULL';
    }
    return $query;
  },
);

export type ParsedParameters = FilterParameters & { timeRange?: string };
export const workflowsSearchParams = writable<string>('');

export const updating = writable(false);
export const loading = writable(false);
export const workflowCount = writable({
  count: 0,
  newCount: 0,
});
export const workflowError = writable('');
export const workflows = derived(page, ($page) => $page.data?.workflows ?? []);
export const workflowsQuery = writable<string>('');
