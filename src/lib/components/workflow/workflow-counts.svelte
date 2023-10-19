<script lang="ts">
  import { onDestroy } from 'svelte';

  import { page } from '$app/stores';

  import { fetchWorkflowCountByExecutionStatus } from '$lib/services/workflow-counts';
  import {
    loading,
    refresh,
    updating,
    workflowCount,
  } from '$lib/stores/workflows';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import { decodePayload } from '$lib/utilities/decode-payload';

  import WorkflowCountAll from './workflow-count-all.svelte';
  import WorkflowCountStatus from './workflow-count-status.svelte';

  $: namespace = $page.params.namespace;
  $: query = $page.url.searchParams.get('query');

  let statusGroups: { status: WorkflowStatus; count: number }[] = [];
  let newStatusGroups: { status: WorkflowStatus; count: number }[] = [];
  let refreshInterval: ReturnType<typeof setInterval>;
  const refreshRate = 5000;

  onDestroy(() => {
    clearNewCounts();
  });

  const clearNewCounts = () => {
    clearInterval(refreshInterval);
    newStatusGroups = [];
    $workflowCount.newTotalCount = 0;
  };

  const getStatusAndCountOfGroup = (groups = []) => {
    return groups.map((group) => {
      const status = decodePayload(
        group?.groupValues[0],
      ) as unknown as WorkflowStatus;
      const count = parseInt(group.count);
      return {
        status,
        count,
      };
    });
  };

  const fetchNewCounts = async () => {
    const { count, groups } = await fetchWorkflowCountByExecutionStatus({
      namespace,
      query,
    });
    $workflowCount.newTotalCount = parseInt(count) - $workflowCount.totalCount;
    newStatusGroups = getStatusAndCountOfGroup(groups);
  };

  const fetchCounts = async () => {
    clearNewCounts();
    refreshInterval = setInterval(() => fetchNewCounts(), refreshRate);
    const { count, groups } = await fetchWorkflowCountByExecutionStatus({
      namespace,
      query,
    });
    $workflowCount.totalCount = parseInt(count);
    statusGroups = groups.map((group) => {
      const status = decodePayload(
        group?.groupValues[0],
      ) as unknown as WorkflowStatus;
      const count = parseInt(group.count);
      return {
        status,
        count,
      };
    });
  };

  $: query, namespace, $refresh, fetchCounts();
</script>

<div class="flex h-6 flex-wrap items-center gap-2">
  {#if !$loading && !$updating}
    <WorkflowCountAll count={$workflowCount.totalCount} />
    {#each statusGroups as { count, status } (status)}
      <WorkflowCountStatus
        {status}
        {count}
        newCount={newStatusGroups.find((g) => g.status === status)
          ? newStatusGroups.find((g) => g.status === status).count - count
          : 0}
      />
    {/each}
  {/if}
</div>
