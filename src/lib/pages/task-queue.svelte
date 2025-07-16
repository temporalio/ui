<script lang="ts">
  import { page } from '$app/state';

  import WorkerTable from '$lib/components/worker-table.svelte';
  import { getPollers } from '$lib/services/pollers-service';

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
