<script lang="ts">
  import { onDestroy } from 'svelte';

  import { page } from '$app/stores';

  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { workflowStatuses } from '$lib/models/workflow-status';
  import { fetchWorkflowCountByExecutionStatus } from '$lib/services/workflow-counts';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    disableWorkflowCountsRefresh,
    queryWithParentWorkflowId,
    refresh,
    workflowCount,
  } from '$lib/stores/workflows';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type WorkflowStatus,
  } from '$lib/types/workflows';
  import { decodePayload } from '$lib/utilities/decode-payload';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import { combineFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { getExponentialBackoffSeconds } from '$lib/utilities/refresh-rate';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import WorkflowCountStatus from '../workflow-status.svelte';

  export let staticQuery = '';
  $: namespace = $page.params.namespace;
  $: query = staticQuery || $queryWithParentWorkflowId;

  let statusGroups: { status: WorkflowStatus; count: number }[] = [];
  let newStatusGroups: { status: WorkflowStatus; count: number }[] = [];
  let refreshInterval: ReturnType<typeof setInterval>;

  let attempt = 1;
  let loading = false;
  const initialIntervalSeconds = 5;
  const maxAttempts = 100;

  onDestroy(() => {
    clearNewCounts();
  });

  const setBackoffInterval = () => {
    attempt += 1;
    clearInterval(refreshInterval);
    if (attempt <= maxAttempts) {
      const interval =
        getExponentialBackoffSeconds(
          initialIntervalSeconds,
          attempt,
          maxAttempts,
        ) * 1000;
      refreshInterval = setInterval(() => fetchNewCounts(), interval);
    }
  };

  const clearNewCounts = () => {
    clearInterval(refreshInterval);
    newStatusGroups = [];
    $workflowCount.newCount = 0;
    attempt = 1;
    loading = true;
  };

  const getStatusAndCountOfGroup = (groups = []) => {
    return groups
      .map((group) => {
        const status = decodePayload(
          group?.groupValues[0],
        ) as unknown as WorkflowStatus;
        const count = parseInt(group.count);
        return {
          status,
          count,
        };
      })
      .sort((a, b) => {
        return (
          workflowStatuses.indexOf(a.status) -
          workflowStatuses.indexOf(b.status)
        );
      });
  };

  const fetchNewCounts = async () => {
    setBackoffInterval();
    try {
      const { count, groups } = await fetchWorkflowCountByExecutionStatus({
        namespace,
        query,
      });
      $workflowCount.newCount = parseInt(count) - $workflowCount.count;
      newStatusGroups = getStatusAndCountOfGroup(groups);
    } catch (e) {
      console.error('Fetching workflow counts failed: ', e?.message);
    } finally {
      loading = false;
    }
  };

  const fetchCounts = async () => {
    clearNewCounts();
    if (!$disableWorkflowCountsRefresh) {
      const interval =
        getExponentialBackoffSeconds(
          initialIntervalSeconds,
          attempt,
          maxAttempts,
        ) * 1000;
      refreshInterval = setInterval(() => fetchNewCounts(), interval);
    }
    try {
      const { count, groups } = await fetchWorkflowCountByExecutionStatus({
        namespace,
        query,
      });
      $workflowCount.count = parseInt(count);
      statusGroups = getStatusAndCountOfGroup(groups);
    } catch (e) {
      console.error('Fetching workflow counts failed: ', e?.message);
    } finally {
      loading = false;
    }
  };

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
        url: $page.url,
        parameter: 'query',
        value: searchQuery,
        clearParameters: [currentPageKey],
      });
    }
  };

  $: query, namespace, $refresh, fetchCounts();
</script>

<div class="flex min-h-[24px] flex-wrap items-center gap-2">
  {#each statusGroups as { count, status } (status)}
    {#if !loading}
      <button on:click={() => onStatusClick(status)}>
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
