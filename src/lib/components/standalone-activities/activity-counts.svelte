<script lang="ts">
  import { onDestroy } from 'svelte';

  import { page } from '$app/state';

  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { fetchActivityCountByStatus } from '$lib/services/activity-counts';
  import { activityCount, activityRefresh } from '$lib/stores/activities';
  import { activityFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
  import {
    type ActivityStatus,
    getActivityStatusAndCountOfGroup,
  } from '$lib/utilities/get-activity-status-and-count';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import { combineFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { getExponentialBackoff } from '$lib/utilities/refresh-rate';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import WorkflowCountStatus from '../workflow-status.svelte';

  type Props = {
    staticQuery?: string;
    refreshTime?: Date;
  };
  let { staticQuery = '', refreshTime = $bindable() }: Props = $props();

  const queryParam = $derived(page.url.searchParams.get('query'));
  const namespace = $derived(page.params.namespace);
  const query = $derived(staticQuery || queryParam);
  const perPage = $derived(page.url.searchParams.get('per-page'));

  let statusGroups: { status: ActivityStatus; count: number }[] = $state([]);
  let newStatusGroups: { status: ActivityStatus; count: number }[] = $state([]);
  let refreshInterval: ReturnType<typeof setTimeout>;

  let attempt = $state(1);
  let loading = $state(false);

  const initialIntervalSeconds = 60;
  const maxAttempts = 20;

  const onStatusClick = (status: ActivityStatus) => {
    const statusExists = $activityFilters.some(
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
      $activityFilters = [...$activityFilters, filter];
      const searchQuery = toListWorkflowQueryFromFilters(
        combineFilters($activityFilters),
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
    $activityCount.newCount = 0;
    attempt = 1;
  };

  const fetchInitialCounts = async () => {
    loading = true;
    try {
      const { count, groups } = await fetchActivityCountByStatus({
        namespace,
        query,
      }).catch((_e) => {
        return { count: '0', groups: [] };
      });
      $activityCount.count = parseInt(count);
      statusGroups = getActivityStatusAndCountOfGroup(groups);
    } finally {
      refreshTime = new Date();
      loading = false;
    }
  };

  const fetchNewCounts = async () => {
    try {
      const { count, groups } = await fetchActivityCountByStatus({
        namespace,
        query,
      }).catch((_e) => {
        return { count: '0', groups: [] };
      });
      $activityCount.newCount = parseInt(count) - $activityCount.count;
      newStatusGroups = getActivityStatusAndCountOfGroup(groups);
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
      if (attempt <= maxAttempts) {
        scheduleNext();
      }
    }, intervalSeconds);
  };

  const scheduleFirst = async () => {
    clearNewCounts();
    await fetchInitialCounts();
    scheduleNext();
  };

  $effect(() => {
    namespace;
    query;
    perPage;
    $activityRefresh;

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
          test-id="activity-status-{status}"
        />
      </button>
    {:else}
      <Skeleton class="h-6 w-24 rounded-sm" />
    {/if}
  {/each}
</div>
