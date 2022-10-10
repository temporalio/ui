import { derived, readable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { fetchAllWorkflows } from '$lib/services/workflow-service';
import { withLoading } from '$lib/utilities/stores/with-loading';
import type { ParsedParameters } from '$lib/utilities/query/to-list-workflow-parameters';
import type { StartStopNotifier } from 'svelte/store';

export const refresh = writable(0);
const namespace = derived([page], ([$page]) => $page.params.namespace);
const query = derived([page], ([$page]) => $page.url.searchParams.get('query'));
const parameters = derived(
  [namespace, query, refresh],
  ([$namespace, $query, $refresh]) => {
    return {
      namespace: $namespace,
      query: $query,
      refresh: $refresh,
    };
  },
);

const setCounts = (count: number, totalCount: number) => {
  workflowCount.set({ count, totalCount });
};

const updateWorkflows: StartStopNotifier<WorkflowExecution[]> = (set) => {
  return parameters.subscribe(({ namespace, query }) => {
    withLoading(loading, updating, async () => {
      const { workflows, count, totalCount, error } = await fetchAllWorkflows(
        namespace,
        {
          query,
        },
      );
      set(workflows);
      setCounts(count, totalCount);
      if (error) {
        workflowError.set(error);
      } else {
        workflowError.set('');
      }
    });
  });
};

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
