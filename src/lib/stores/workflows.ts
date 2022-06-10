import { derived, readable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { fetchAllWorkflows } from '$lib/services/workflow-service';
import { withLoading } from '$lib/utilities/stores/with-loading';
import type { ParsedParameters } from '$lib/utilities/query/to-list-workflow-parameters';
import type { StartStopNotifier } from 'svelte/store';

const namespace = derived([page], ([$page]) => $page.params.namespace);
const query = derived([page], ([$page]) => $page.url.searchParams.get('query'));
const parameters = derived([namespace, query], ([$namespace, $query]) => {
  return {
    namespace: $namespace,
    query: $query,
  };
});

const updateWorkflows: StartStopNotifier<WorkflowExecution[]> = (set) => {
  return parameters.subscribe(({ namespace, query }) => {
    withLoading(loading, updating, async () => {
      const { workflows } = await fetchAllWorkflows(namespace, { query });
      set(workflows);
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
export const workflows = readable<WorkflowExecution[]>([], updateWorkflows);
