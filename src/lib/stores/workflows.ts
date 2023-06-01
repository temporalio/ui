import { derived, readable, writable } from 'svelte/store';
import { page } from '$app/stores';

import {
  fetchAllWorkflows,
  fetchWorkflowCount,
} from '$lib/services/workflow-service';
import { withLoading } from '$lib/utilities/stores/with-loading';

import { supportsAdvancedVisibility } from './advanced-visibility';
import type { StartStopNotifier } from 'svelte/store';
import type { FilterParameters, WorkflowExecution } from '$lib/types/workflows';
import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
import { toListWorkflowFiltersFromRelativeTime } from '$lib/utilities/query/to-list-workflow-filters-from-relative-time';

export const refresh = writable(0);

const namespace = derived([page], ([$page]) => $page.params.namespace);
const searchQuery = derived([page], ([$page]) =>
  $page.url.searchParams.get('query'),
);
const earliestRelativeDuration = derived([page], ([$page]) =>
  $page.url.searchParams.get('earliestTime'),
);
const latestRelativeDuration = derived([page], ([$page]) =>
  $page.url.searchParams.get('latestTime'),
);

const query = derived(
  [searchQuery, earliestRelativeDuration, latestRelativeDuration],
  ([$searchQuery, $earliestRelativeDuration, $latestRelativeDuration]) => {
    if ($latestRelativeDuration || $earliestRelativeDuration) {
      const filters = toListWorkflowFiltersFromRelativeTime(
        $latestRelativeDuration || $earliestRelativeDuration,
      );
      return toListWorkflowQueryFromFilters(filters, []);
    } else {
      return $searchQuery;
    }
  },
);

const parameters = derived(
  [
    namespace,
    query,
    earliestRelativeDuration,
    latestRelativeDuration,
    refresh,
    supportsAdvancedVisibility,
  ],
  ([
    $namespace,
    $query,
    $earliestRelativeDuration,
    $latestRelativeDuration,
    $refresh,
    $supportsAdvancedVisibility,
  ]) => {
    return {
      namespace: $namespace,
      query: $query,
      earliestRelativeDuration: $earliestRelativeDuration,
      latestRelativeDuration: $latestRelativeDuration,
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
    ({ namespace, query, supportsAdvancedVisibility }) => {
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
          workflowError.set(error);
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
