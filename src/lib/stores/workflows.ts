import { derived, readable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { fetchAllWorkflows } from '$lib/services/workflow-service';
import { withLoading } from '$lib/utilities/stores/with-loading';

import type { StartStopNotifier } from 'svelte/store';
import { publicPath } from '$lib/utilities/get-public-path';

export const refresh = writable(0);
const namespace = derived([page], ([$page]) => $page.params.namespace);
const query = derived([page], ([$page]) => $page.url.searchParams.get('query'));
const path = derived([page], ([$page]) => $page.url.pathname);

const parameters = derived(
  [namespace, query, path, refresh],
  ([$namespace, $query, $path, $refresh]) => {
    return {
      namespace: $namespace,
      query: $query,
      path: $path,
      refresh: $refresh,
    };
  },
);

const setCounts = (_workflowCount: { totalCount: number; count: number }) => {
  workflowCount.set(_workflowCount);
};

const updateWorkflows: StartStopNotifier<WorkflowExecution[]> = (set) => {
  return parameters.subscribe(({ namespace, query, path }) => {
    const isWorkflowsPage =
      path == `${publicPath}/namespaces/${namespace}/workflows`;

    if (isWorkflowsPage) {
      withLoading(loading, updating, async () => {
        const { workflows, error } = await fetchAllWorkflows(namespace, {
          query,
        });
        set(workflows);

        // Add back when 1.19 lands for count
        // const workflowCount = await fetchWorkflowCount(namespace, query);
        // setCounts(workflowCount);
        if (error) {
          workflowError.set(error);
        } else {
          workflowError.set('');
        }
      });
    }
  });
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
