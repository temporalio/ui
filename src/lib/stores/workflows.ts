import { derived, readable, Writable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { fetchAllWorkflows } from '$lib/services/workflow-service';

import type { StartStopNotifier } from 'svelte/store';

type WorkflowStoreParameters = {
  namespace: string;
  query: string;
};

const previous: WorkflowStoreParameters = {
  namespace: null,
  query: null,
};

const isNewRequest = (
  namespace: string,
  query: string,
  previous: WorkflowStoreParameters,
): boolean => {
  if (query === previous.query && namespace === previous.namespace) {
    return false;
  }

  previous.namespace = namespace;
  previous.query = query;

  return true;
};

const withLoading = async (
  loading: Writable<boolean>,
  fn: () => Promise<void>,
) => {
  updating.set(true);
  await fn();
  loading.set(false);
  setTimeout(() => {
    updating.set(false);
  }, 300);
};

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
    if (isNewRequest(namespace, query, previous)) {
      withLoading(loading, async () => {
        const { workflows } = await fetchAllWorkflows(namespace, { query });
        if (workflows) {
          set(workflows);
        } else {
          setTimeout(() => {
            set(workflows);
          }, 300);
        }
      });
    }
  });
};

export const updating = writable(true);
export const loading = writable(true);
export const workflows = readable<WorkflowExecution[]>([], updateWorkflows);
