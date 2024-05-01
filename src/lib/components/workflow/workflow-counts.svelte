<script lang="ts">
  import { page } from '$app/stores';

  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { workflowStatuses } from '$lib/models/workflow-status';
  import { workflowCount } from '$lib/stores/workflows';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import { decodePayload } from '$lib/utilities/decode-payload';

  import WorkflowCountStatus from './workflow-count-status.svelte';

  $: groups = $page.data.groups;
  $: count = $page.data.count;

  $workflowCount.count = parseInt(count);
  $: statusGroups = getStatusAndCountOfGroup(groups);

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

  let newStatusGroups: { status: WorkflowStatus; count: number }[] = [];
  let loading = false;
</script>

<div class="flex min-h-[24px] flex-wrap items-center gap-2">
  {#each statusGroups as { count, status } (status)}
    {#if !loading}
      <WorkflowCountStatus
        {status}
        {count}
        newCount={newStatusGroups.find((g) => g.status === status)
          ? newStatusGroups.find((g) => g.status === status).count - count
          : 0}
      />
    {:else}
      <Skeleton class="h-6 w-24 rounded" />
    {/if}
  {/each}
</div>
