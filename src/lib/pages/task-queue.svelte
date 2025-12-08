<script lang="ts">
  import { page } from '$app/state';

  import TaskQueueWorkerInsights from '$lib/components/task-queue/worker-insights.svelte';

  const { queue: taskQueue } = $derived(page.params);
</script>

<section class="flex flex-col gap-4">
  <h1 data-testid="task-queue-title">Task Queue</h1>
  <h2 data-testid="task-queue-name">
    {taskQueue}
  </h2>
  <TaskQueueWorkerInsights />
</section>
