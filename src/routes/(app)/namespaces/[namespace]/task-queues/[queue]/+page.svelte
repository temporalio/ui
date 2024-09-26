<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import TaskQueue from '$lib/pages/task-queue.svelte';

  const queue = $page.params.queue;
</script>

<PageTitle title={`Task Queue | ${queue}`} url={$page.url.href} />
<TaskQueue />
