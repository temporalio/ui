<script lang="ts">
  import { page } from '$app/stores';

  import TaskQueueWorkers from '$lib/pages/task-queue-workers.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  const queue = $page.params.queue;
</script>

<PageTitle title={`Task Queue | ${queue}`} url={$page.url.href} />
<TaskQueueWorkers />
