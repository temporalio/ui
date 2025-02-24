<script lang="ts">
  import { page } from '$app/stores';

  import WorkerTable from '$lib/components/worker-table.svelte';
  import { getPollers } from '$lib/services/pollers-service';

  $: ({ queue: taskQueue, namespace } = $page.params);
</script>

{#await getPollers({ queue: taskQueue, namespace }) then workers}
  <section class="flex flex-col gap-4">
    <h2 data-testid="task-queue-name">
      {taskQueue}
    </h2>
    <WorkerTable {workers} />
  </section>
{/await}
