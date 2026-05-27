<script lang="ts">
  import { type Readable, type Writable } from 'svelte/store';

  import { page } from '$app/state';

  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { createCountPoller } from '$lib/runes/count-poller.svelte';
  import { fetchWorkflowCountByExecutionStatus } from '$lib/services/workflow-counts';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    disableWorkflowCountsRefresh,
    workflowCount,
    refresh as workflowRefresh,
  } from '$lib/stores/workflows';
  import {
    type CountWorkflowExecutionsResponse,
    SEARCH_ATTRIBUTE_TYPE,
    type WorkflowStatus,
  } from '$lib/types/workflows';
  import type { ActivityStatus } from '$lib/utilities/get-activity-status-and-count';
  import { getStatusAndCountOfGroup } from '$lib/utilities/get-group-status-and-count';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import {
    combineFilters,
    createFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import WorkflowCountStatus from './workflow-status.svelte';

  type Status = WorkflowStatus | ActivityStatus;
  type StatusCount = { status: Status; count: number };

  interface Props {
    staticQuery?: string;
    refreshTime?: Date;
    countStore?: Writable<{ count: number; newCount: number }>;
    refresh?: Writable<number>;
    filters?: Writable<SearchAttributeFilter[]>;
    fetchCounts?: (opts: {
      namespace: string;
      query: string;
    }) => Promise<CountWorkflowExecutionsResponse>;
    getStatusAndCount?: (
      groups: CountWorkflowExecutionsResponse['groups'],
    ) => StatusCount[];
    'data-testid'?: string;
    disableRefresh?: Readable<boolean>;
  }

  let {
    staticQuery = '',
    refreshTime = $bindable(),
    countStore = workflowCount,
    refresh = workflowRefresh,
    filters = workflowFilters,
    fetchCounts = fetchWorkflowCountByExecutionStatus,
    getStatusAndCount = getStatusAndCountOfGroup,
    'data-testid': testId = 'workflow-status',
    disableRefresh = disableWorkflowCountsRefresh,
  }: Props = $props();

  const queryParam = $derived(page.url.searchParams.get('query'));
  const namespace = $derived(page.params.namespace ?? '');
  const query = $derived(staticQuery || queryParam || '');
  const perPage = $derived(page.url.searchParams.get('per-page'));

  let statusGroups: StatusCount[] = $state([]);
  let newStatusGroups: StatusCount[] = $state([]);

  const allStatusGroups = $derived(
    newStatusGroups.length > statusGroups.length
      ? [
          ...statusGroups,
          ...newStatusGroups
            .filter((g) => !statusGroups.some((s) => s.status === g.status))
            .map((g) => ({ status: g.status, count: 0 })),
        ]
      : statusGroups,
  );

  const countPoller = createCountPoller({
    getStore: () => countStore,
    fetch: () => fetchCounts({ namespace, query }),
    transform: (response) => parseInt(response.count, 10),
    disabled: () => $disableRefresh,
    onInitialFetch(_count, response) {
      statusGroups = getStatusAndCount(response.groups);
    },
    onPollFetch(_newCount, response) {
      newStatusGroups = getStatusAndCount(response.groups);
    },
    onReset() {
      newStatusGroups = [];
    },
    watch() {
      void namespace;
      void query;
      void perPage;
      void $refresh;
    },
  });

  $effect(function propagateRefreshTimeChange() {
    refreshTime = countPoller.refreshTime;
  });

  const onStatusClick = (status: Status) => {
    const statusExists = $filters.some(
      (filter) =>
        filter.attribute === 'ExecutionStatus' && filter.value === status,
    );

    if (!statusExists && status) {
      const filter = createFilter({
        attribute: 'ExecutionStatus',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
        value: status,
        conditional: '=',
      });
      $filters = [...$filters, filter];
      const searchQuery = toListWorkflowQueryFromFilters(
        combineFilters($filters),
      );
      updateQueryParameters({
        url: page.url,
        parameter: 'query',
        value: searchQuery,
        clearParameters: [currentPageKey],
      });
    }
  };
</script>

<div class="flex min-h-[24px] flex-wrap items-center gap-2 pt-1.5">
  {#each allStatusGroups as { count, status } (status)}
    {#if !countPoller.loading}
      {@const group = newStatusGroups.find((g) => g.status === status)}
      <button onclick={() => onStatusClick(status)}>
        <WorkflowCountStatus
          {status}
          {count}
          newCount={group ? group.count - count : 0}
          test-id="{testId}-{status}"
        />
      </button>
    {:else}
      <Skeleton class="h-6 w-24 rounded-sm" />
    {/if}
  {/each}
</div>
