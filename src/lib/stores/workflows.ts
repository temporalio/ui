import type { StartStopNotifier } from 'svelte/store';
import { derived, readable, writable } from 'svelte/store';

import { page } from '$app/stores';

import { translate } from '$lib/i18n/translate';
import {
  fetchAllWorkflows,
  fetchWorkflowCount,
} from '$lib/services/workflow-service';
import type { FilterParameters, WorkflowExecution } from '$lib/types/workflows';
import { withLoading } from '$lib/utilities/stores/with-loading';

import { supportsAdvancedVisibility } from './advanced-visibility';

export const refresh = writable(0);
export const hideWorkflowQueryErrors = derived(
  [page],
  ([$page]) => $page.data?.settings?.hideWorkflowQueryErrors,
);

const namespace = derived([page], ([$page]) => $page.params.namespace);
const query = derived([page], ([$page]) => $page.url.searchParams.get('query'));
const parameters = derived(
  [
    namespace,
    query,
    refresh,
    supportsAdvancedVisibility,
    hideWorkflowQueryErrors,
  ],
  ([
    $namespace,
    $query,
    $refresh,
    $supportsAdvancedVisibility,
    $hideWorkflowQueryErrors,
  ]) => {
    return {
      namespace: $namespace,
      query: $query,
      refresh: $refresh,
      supportsAdvancedVisibility: $supportsAdvancedVisibility,
      hideWorkflowQueryErrors: $hideWorkflowQueryErrors,
    };
  },
);

const setCounts = (_workflowCount: { totalCount: number; count: number }) => {
  workflowCount.set(_workflowCount);
};

const updateWorkflows: StartStopNotifier<WorkflowExecution[]> = (set) => {
  return parameters.subscribe(
    ({
      namespace,
      query,
      supportsAdvancedVisibility,
      hideWorkflowQueryErrors,
    }) => {
      withLoading(loading, updating, async () => {
        const { workflows, error } = await fetchAllWorkflows(namespace, {
          query,
        });
        set(workflows);

        if (supportsAdvancedVisibility) {
          const workflowCount = await fetchWorkflowCount(namespace, query);
          setCounts(workflowCount);
        }

        if (error) {
          if (hideWorkflowQueryErrors) {
            workflowError.set(
              translate('workflows', 'workflows-error-querying'),
            );
          } else {
            workflowError.set(error);
          }
        } else {
          workflowError.set('');
        }
      });
    },
  );
};

export type ParsedParameters = FilterParameters & { timeRange?: string };
export const workflowsSearchParams = writable<string>('');

export const updating = writable(true);
export const loading = writable(true);
export const workflowCount = writable({ count: 0, totalCount: 0 });
export const workflowError = writable('');
export const workflows = readable<WorkflowExecution[]>([], updateWorkflows);
export const workflowsQuery = writable<string>('');
