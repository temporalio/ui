<script lang="ts">
  import { page } from '$app/state';

  import WorkerInfo from '$lib/components/task-queue/worker-info.svelte';
  import WorkerTable from '$lib/components/worker-table.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { getPollers } from '$lib/services/pollers-service';
  import { listWorkersForTaskQueue } from '$lib/services/worker-service';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { namespace } = $derived(page.params);
  const taskQueue = $derived($workflowRun.workflow.taskQueue);
</script>

<section class="flex flex-col gap-4">
  {#await listWorkersForTaskQueue({ queue: taskQueue, namespace })}
    <Skeleton />
  {:then response}
    {#if !response?.workersInfo}
      {#await getPollers({ queue: taskQueue, namespace }) then workers}
        <WorkerTable {workers} />
      {/await}
    {:else}
      {#each response.workersInfo as worker}
        <WorkerInfo {worker} />
      {/each}
    {/if}
  {:catch error}
    <p class="text-red-600">Error loading workers: {error.message}</p>
  {/await}
</section>
