<script lang="ts">
  import { onDestroy } from 'svelte';

  import { page } from '$app/stores';

  import Link from '$lib/holocene/link.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { workflowStatuses } from '$lib/models/workflow-status';
  import { fetchWorkflowCountByExecutionStatus } from '$lib/services/workflow-counts';
  import {
    queryWithParentWorkflowId,
    refresh,
    workflowCount,
  } from '$lib/stores/workflows';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import { decodePayload } from '$lib/utilities/decode-payload';
  import { getExponentialBackoffSeconds } from '$lib/utilities/refresh-rate';

  import WorkflowCountStatus from './workflow-count-status.svelte';

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
    const interval =
      getExponentialBackoffSeconds(
        initialIntervalSeconds,
        attempt,
        maxAttempts,
      ) * 1000;
    refreshInterval = setInterval(() => fetchNewCounts(), interval);
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

  $: query, namespace, $refresh, fetchCounts();
</script>

<div class="flex min-h-[24px] flex-wrap items-center gap-2">
  {#each statusGroups as { count, status } (status)}
    {#if !loading}
      <Link
        href={`/namespaces/${namespace}/workflows?query=%60ExecutionStatus%60%3D"${status}"`}
        role="button"
      >
        <WorkflowCountStatus
          {status}
          {count}
          newCount={newStatusGroups.find((g) => g.status === status)
            ? newStatusGroups.find((g) => g.status === status).count - count
            : 0}
        />
      </Link>
    {:else}
      <Skeleton class="h-6 w-24 rounded" />
    {/if}
  {/each}
</div>
