<script lang="ts">
  import { page } from '$app/stores';

  import { fetchWorkflowCountByExecutionStatus } from '$lib/services/workflow-counts';
  import { workflowFilters } from '$lib/stores/filters';
  import {
    refresh,
    workflowCount,
    workflowsQuery,
  } from '$lib/stores/workflows';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import { decodePayload } from '$lib/utilities/decode-payload';

  import WorkflowCountAll from './workflow-count-all.svelte';
  import WorkflowCountNew from './workflow-count-new.svelte';
  import WorkflowCountStatus from './workflow-count-status.svelte';

  $: namespace = $page.params.namespace;
  let statusGroups: { status: WorkflowStatus; count: number }[] = [];
  let newStatusGroups: { status: WorkflowStatus; count: number }[] = [];
  let refreshInterval: ReturnType<typeof setInterval>;
  const refreshRate = 5000;

  const clearNewCounts = () => {
    newStatusGroups = [];
    $workflowCount.newTotalCount = 0;
    refreshInterval = setInterval(() => fetchNewCounts(), refreshRate);
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
      filters: $workflowFilters,
    });
    $workflowCount.newTotalCount = parseInt(count) - $workflowCount.totalCount;
    newStatusGroups = getStatusAndCountOfGroup(groups);
  };

  const fetchCounts = async () => {
    clearInterval(refreshInterval);
    clearNewCounts();
    const { count, groups } = await fetchWorkflowCountByExecutionStatus({
      namespace,
      filters: $workflowFilters,
    });
    $workflowCount.totalCount = parseInt(count);
    statusGroups = getStatusAndCountOfGroup(groups);
  };

  $: $workflowsQuery, namespace, $refresh, fetchCounts();
</script>

<div class="flex flex-wrap items-center gap-2">
  <WorkflowCountAll count={$workflowCount.totalCount} />
  <WorkflowCountNew count={$workflowCount.newTotalCount} />
  {#each statusGroups as { count, status } (status)}
    <WorkflowCountStatus
      {status}
      {count}
      newCount={newStatusGroups.find((g) => g?.status === status)?.count
        ? newStatusGroups.find((g) => g?.status === status)?.count - count
        : undefined}
    />
  {/each}
</div>
