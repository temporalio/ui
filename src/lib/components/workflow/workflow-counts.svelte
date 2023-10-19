<script lang="ts">
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

  const fetchCounts = async () => {
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

<div
  class="flex flex-wrap items-center gap-2"
  class:invisible={$loading || $updating}
>
  <WorkflowCountAll count={$workflowCount.totalCount} />
  {#each statusGroups as { count, status } (status)}
    <WorkflowCountStatus {status} {count} />
  {/each}
</div>
