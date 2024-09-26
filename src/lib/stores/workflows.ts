import type { StartStopNotifier } from 'svelte/store';
import { derived, get, readable, writable } from 'svelte/store';

import { page } from '$app/stores';

import { translate } from '$lib/i18n/translate';
import { fetchWorkflowCount } from '$lib/services/workflow-counts';
import { fetchAllWorkflows } from '$lib/services/workflow-service';
import type { FilterParameters, WorkflowExecution } from '$lib/types/workflows';
import { withLoading } from '$lib/utilities/stores/with-loading';
import { minimumVersionRequired } from '$lib/utilities/version-check';

import { isCloud, supportsAdvancedVisibility } from './advanced-visibility';
import { groupByCountEnabled } from './capability-enablement';
import { showChildWorkflows } from './filters';
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

const namespace = derived([page], ([$page]) => $page.params.namespace);
const parameters = derived(
  [
    namespace,
    queryWithParentWorkflowId,
    refresh,
    supportsAdvancedVisibility,
    hideWorkflowQueryErrors,
  ],
  ([
    $namespace,
    $queryWithParentWorkflowId,
    $refresh,
    $supportsAdvancedVisibility,
    $hideWorkflowQueryErrors,
  ]) => {
    return {
      namespace: $namespace,
      query: $queryWithParentWorkflowId,
      refresh: $refresh,
      supportsAdvancedVisibility: $supportsAdvancedVisibility,
      hideWorkflowQueryErrors: $hideWorkflowQueryErrors,
    };
  },
);

const setCounts = (_workflowCount: { count: number }) => {
  workflowCount.set({ ..._workflowCount, newCount: 0 });
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

        if (supportsAdvancedVisibility && !get(groupByCountEnabled)) {
          const workflowCount = await fetchWorkflowCount(namespace, query);
          setCounts(workflowCount);
        }

        if (error) {
          if (hideWorkflowQueryErrors) {
            workflowError.set(translate('workflows.workflows-error-querying'));
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
export const workflowCount = writable({
  count: 0,
  newCount: 0,
});
export const workflowError = writable('');
export const workflows = readable<WorkflowExecution[]>([], updateWorkflows);
export const workflowsQuery = writable<string>('');
