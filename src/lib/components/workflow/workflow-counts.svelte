<script lang="ts">
  import { onDestroy } from 'svelte';

  import { page } from '$app/state';

  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { fetchWorkflowCountByExecutionStatus } from '$lib/services/workflow-counts';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    disableWorkflowCountsRefresh,
    refresh,
    workflowCount,
  } from '$lib/stores/workflows';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type WorkflowStatus,
  } from '$lib/types/workflows';
  import { getStatusAndCountOfGroup } from '$lib/utilities/get-group-status-and-count';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import { combineFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { getExponentialBackoff } from '$lib/utilities/refresh-rate';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import WorkflowCountStatus from '../workflow-status.svelte';

  type Props = {
    namespace: string;
    staticQuery?: string;
    refreshTime?: Date;
  };
  let {
    namespace,
    staticQuery = '',
    refreshTime = $bindable(),
  }: Props = $props();

  const queryParam = $derived(page.url.searchParams.get('query'));
  const query = $derived(staticQuery || queryParam);
  const perPage = $derived(page.url.searchParams.get('per-page'));

  let statusGroups: { status: WorkflowStatus; count: number }[] = $state([]);
  let newStatusGroups: { status: WorkflowStatus; count: number }[] = $state([]);
  let refreshInterval: ReturnType<typeof setTimeout>;

  let attempt = $state(1);
  let loading = $state(false);

  const initialIntervalSeconds = 60;
  const maxAttempts = 20;

  const onStatusClick = (status) => {
    const statusExists = $workflowFilters.some(
      (filter) =>
        filter.attribute === 'ExecutionStatus' && filter.value === status,
    );

    if (!statusExists) {
      const filter = {
        attribute: 'ExecutionStatus',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
        value: status,
        operator: '',
        conditional: '=',
        parenthesis: '',
      };
      $workflowFilters = [...$workflowFilters, filter];
      const searchQuery = toListWorkflowQueryFromFilters(
        combineFilters($workflowFilters),
      );
      updateQueryParameters({
        url: page.url,
        parameter: 'query',
        value: searchQuery,
        clearParameters: [currentPageKey],
      });
    }
  };

  const clearNewCounts = () => {
    clearTimeout(refreshInterval);
    newStatusGroups = [];
    $workflowCount.newCount = 0;
    attempt = 1;
  };

  const fetchInitialCounts = async () => {
    loading = true;
    try {
      const { count, groups } = await fetchWorkflowCountByExecutionStatus({
        namespace,
        query,
      }).catch((_e) => {
        return { count: '0', groups: [] };
      });
      $workflowCount.count = parseInt(count);
      statusGroups = getStatusAndCountOfGroup(groups);
    } finally {
      refreshTime = new Date();
      loading = false;
    }
  };

  const fetchNewCounts = async () => {
    try {
      const { count, groups } = await fetchWorkflowCountByExecutionStatus({
        namespace,
        query,
      }).catch((_e) => {
        return { count: '0', groups: [] };
      });
      $workflowCount.newCount = parseInt(count) - $workflowCount.count;
      newStatusGroups = getStatusAndCountOfGroup(groups);
    } finally {
      refreshTime = new Date();
      attempt += 1;
    }
  };

  const scheduleNext = () => {
    const intervalSeconds = getExponentialBackoff(
      initialIntervalSeconds,
      attempt,
    );
    refreshInterval = setTimeout(async () => {
      await fetchNewCounts();
      if (!$disableWorkflowCountsRefresh && attempt <= maxAttempts) {
        scheduleNext();
      }
    }, intervalSeconds);
  };

  const scheduleFirst = async () => {
    clearNewCounts();
    await fetchInitialCounts();
    if (!$disableWorkflowCountsRefresh) {
      scheduleNext();
    }
  };

  $effect(() => {
    namespace;
    query;
    perPage;
    $refresh;

    scheduleFirst();
  });

  onDestroy(() => {
    clearNewCounts();
  });
</script>

<div class="flex min-h-[24px] flex-wrap items-center gap-2 pt-1.5">
  {#each statusGroups as { count, status } (status)}
    {#if !loading}
      <button onclick={() => onStatusClick(status)}>
        <WorkflowCountStatus
          {status}
          {count}
          newCount={newStatusGroups.find((g) => g.status === status)
            ? newStatusGroups.find((g) => g.status === status).count - count
            : 0}
          test-id="workflow-status-{status}"
        />
      </button>
    {:else}
      <Skeleton class="h-6 w-24 rounded-sm" />
    {/if}
  {/each}
</div>
