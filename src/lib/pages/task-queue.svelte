<script lang="ts">
  import { page } from '$app/state';

  import WorkerInfo from '$lib/components/task-queue/worker-info.svelte';
  import WorkerTable from '$lib/components/worker-table.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { getPollers } from '$lib/services/pollers-service';
  import { listWorkers } from '$lib/services/worker-service';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  const { queue: taskQueue, namespace } = $derived(page.params);
</script>

{#await getPollers({ queue: taskQueue, namespace }) then workers}
  <section class="flex flex-col gap-4">
    <h1 data-testid="task-queue-name">
      {taskQueue}
    </h1>
    <WorkerTable {workers} />
  </section>
{/await}

{#await listWorkers({ queue: taskQueue, namespace })}
  <Skeleton />
{:then response}
  {#each response?.workersInfo as worker}
    <WorkerInfo {worker} />
  {/each}
  <div class="flex flex-col gap-2">
    <h3 class="text-lg font-medium">List Workers Response</h3>
    <CodeBlock content={stringifyWithBigInt(response)} copyable={false} />
  </div>
{:catch error}
  <p class="text-red-600">Error loading workers: {error.message}</p>
{/await}
