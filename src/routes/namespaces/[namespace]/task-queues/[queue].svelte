<script lang="ts">
  import { page } from '$app/stores';

  import TaskQueueWorkers from '$lib/pages/task-queue-workers.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
</script>

<PageTitle title={`Task Queue | ${$page.params.queue}`} url={$page.url.href} />
<TaskQueueWorkers />
