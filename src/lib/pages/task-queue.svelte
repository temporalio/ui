<script lang="ts">
  import WorkerTable from '$lib/components/worker-table.svelte';
  import { getPollers } from '$lib/services/pollers-service';

  interface Props {
    queue: string;
    namespace: string;
  }

  const { queue: taskQueue, namespace }: Props = $props();
</script>

{#await getPollers({ queue: taskQueue, namespace }) then workers}
  <section class="flex flex-col gap-4">
    <h1 data-testid="task-queue-name">
      {taskQueue}
    </h1>
    <WorkerTable {workers} />
  </section>
{/await}
