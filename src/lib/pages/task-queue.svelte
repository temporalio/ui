<script lang="ts">
  import { page } from '$app/stores';

  import { getPollers } from '$lib/services/pollers-service';

  import TaskQueueWorkers from './task-queue-workers.svelte';

  $: ({ queue: taskQueue, namespace } = $page.params);
</script>

{#await getPollers({ queue: taskQueue, namespace }) then workers}
  <TaskQueueWorkers {workers} {taskQueue} />
{/await}
