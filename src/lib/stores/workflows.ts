import { derived, readable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { fetchWorkflowCount } from '$lib/services/workflow-service';
import { withLoading } from '$lib/utilities/stores/with-loading';

import type { StartStopNotifier } from 'svelte/store';
import { supportsAdvancedVisibility } from './bulk-actions';

export const refresh = writable(0);

const namespace = derived([page], ([$page]) => $page.params.namespace);
const searchParams = derived([page], ([$page]) => {
  const query = $page.url.searchParams.get('query');
  const searchView = $page.url.searchParams.get('search');
  return { query, searchView };
});

const parameters = derived(
  [namespace, searchParams, refresh, supportsAdvancedVisibility],
  ([$namespace, $searchParams, $refresh, $supportsAdvancedVisibility]) => {
    return {
      namespace: $namespace,
      searchParams: $searchParams,
      refresh: $refresh,
      supportsAdvancedVisibility: $supportsAdvancedVisibility,
    };
  },
);

const setCounts = (_workflowCount: { totalCount: number; count: number }) => {
  workflowCount.set(_workflowCount);
};

const updateWorkflows: StartStopNotifier<WorkflowExecution[]> = (set) => {
  return parameters.subscribe(
    ({ namespace, searchParams, supportsAdvancedVisibility }) => {
      const { query, searchView } = searchParams;
      if (searchView === 'advanced') {
        withLoading(loading, updating, async () => {
          if (supportsAdvancedVisibility) {
            const workflowCount = await fetchWorkflowCount(namespace, query);
            setCounts(workflowCount);
          }
        });
      }
    },
  );
};

export type ParsedParameters = FilterParameters & { timeRange?: string };
type WorkflowsSearch = {
  parameters: ParsedParameters;
  searchType: 'basic' | 'advanced';
};
export const workflowsSearch = writable<WorkflowsSearch>({
  parameters: {},
  searchType: 'basic',
});

export const updating = writable(true);
export const loading = writable(true);
export const workflowCount = writable({ count: 0, totalCount: 0 });
export const workflowError = writable('');
export const workflows = readable<WorkflowExecution[]>([], updateWorkflows);
export const workflowsQuery = writable<string>('');
